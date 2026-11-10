-- Functions used by RLS policies, task status transitions, and RLS enforcement.

BEGIN;

CREATE FUNCTION public.current_user_is_manager()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND role = 'manager'
  );
$function$;

CREATE FUNCTION public.has_tasks_for_object(target_object_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.tasks
    WHERE tasks.object_id = target_object_id
      AND tasks.executor_id = (SELECT auth.uid())
  );
$function$;

CREATE FUNCTION public.prevent_direct_task_status_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO ''
AS $function$
BEGIN
  IF pg_catalog.current_setting(
    'app.allow_task_status_update',
    true
  ) IS DISTINCT FROM 'on' THEN
    RAISE EXCEPTION 'Task status can only be changed through change_task_status()';
  END IF;

  RETURN NEW;
END;
$function$;

CREATE FUNCTION public.change_task_status(
  p_task_id uuid,
  p_to_status text,
  p_comment text DEFAULT NULL::text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_user_id uuid;
  v_user_role text;
  v_current_status text;
  v_executor_id uuid;
  v_valid_transition boolean := false;
BEGIN
  v_user_id := (SELECT auth.uid());

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT role
  INTO v_user_role
  FROM public.profiles
  WHERE id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  SELECT status, executor_id
  INTO v_current_status, v_executor_id
  FROM public.tasks
  WHERE id = p_task_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Task not found';
  END IF;

  IF v_user_role = 'manager' THEN
    IF v_current_status = 'under_review'
       AND p_to_status IN ('accepted', 'revision') THEN
      v_valid_transition := true;
    END IF;
  ELSIF v_user_role = 'executor'
        AND v_executor_id = v_user_id THEN
    IF (v_current_status = 'new'
        AND p_to_status = 'in_progress')
       OR
       (v_current_status = 'in_progress'
        AND p_to_status = 'under_review')
       OR
       (v_current_status = 'revision'
        AND p_to_status = 'in_progress') THEN
      v_valid_transition := true;
    END IF;
  END IF;

  IF NOT v_valid_transition THEN
    RAISE EXCEPTION 'Status transition is not allowed';
  END IF;

  IF p_to_status = 'revision'
     AND NULLIF(pg_catalog.btrim(p_comment), '') IS NULL THEN
    RAISE EXCEPTION 'Comment is required for revision';
  END IF;

  PERFORM pg_catalog.set_config(
    'app.allow_task_status_update',
    'on',
    true
  );

  UPDATE public.tasks
  SET status = p_to_status
  WHERE id = p_task_id;

  PERFORM pg_catalog.set_config(
    'app.allow_task_status_update',
    'off',
    true
  );

  INSERT INTO public.task_status_history (
    task_id,
    changed_by,
    from_status,
    to_status,
    comment
  )
  VALUES (
    p_task_id,
    v_user_id,
    v_current_status,
    p_to_status,
    NULLIF(pg_catalog.btrim(p_comment), '')
  );
END;
$function$;

CREATE FUNCTION public.rls_auto_enable()
RETURNS event_trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
  tbl name;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table', 'partitioned table')
  LOOP
    IF cmd.schema_name IS NOT NULL
       AND cmd.schema_name = 'public'
       AND cmd.schema_name NOT IN ('pg_catalog', 'information_schema')
       AND cmd.schema_name NOT LIKE 'pg_toast%'
       AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        SELECT c.relname
        INTO tbl
        FROM pg_catalog.pg_class AS c
        WHERE c.oid = cmd.objid;

        EXECUTE format(
          'ALTER TABLE IF EXISTS %I.%I ENABLE ROW LEVEL SECURITY',
          cmd.schema_name,
          tbl
        );
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
    ELSE
      RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)',
        cmd.object_identity,
        cmd.schema_name;
    END IF;
  END LOOP;
END;
$function$;

REVOKE ALL ON FUNCTION public.current_user_is_manager() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_tasks_for_object(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.change_task_status(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_is_manager() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_tasks_for_object(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.change_task_status(uuid, text, text) TO authenticated;

COMMIT;
