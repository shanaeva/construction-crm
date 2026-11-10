-- Enable row-level security and grant the base Data API privileges.

BEGIN;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_status_history ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON TABLE public.profiles TO authenticated;
GRANT SELECT, INSERT ON TABLE public.objects TO authenticated;
GRANT SELECT, INSERT ON TABLE public.tasks TO authenticated;
GRANT SELECT ON TABLE public.task_status_history TO authenticated;

CREATE POLICY "Users can read own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Managers can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING ((SELECT public.current_user_is_manager()));

CREATE POLICY "Managers can view all objects"
ON public.objects
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
  )
);

CREATE POLICY "Executors can view assigned objects"
ON public.objects
FOR SELECT
TO authenticated
USING (public.has_tasks_for_object(id));

CREATE POLICY "Managers can create objects"
ON public.objects
FOR INSERT
TO authenticated
WITH CHECK ((SELECT public.current_user_is_manager()));

CREATE POLICY "Managers can view all tasks"
ON public.tasks
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
  )
);

CREATE POLICY "Executors can view assigned tasks"
ON public.tasks
FOR SELECT
TO authenticated
USING (executor_id = auth.uid());

CREATE POLICY "Managers can create tasks"
ON public.tasks
FOR INSERT
TO authenticated
WITH CHECK (
  author_id = (SELECT auth.uid())
  AND (SELECT public.current_user_is_manager())
  AND status = 'new'
  AND (
    executor_id IS NULL
    OR EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = tasks.executor_id
        AND profiles.role = 'executor'
    )
  )
);

CREATE POLICY "Managers can view all task history"
ON public.task_status_history
FOR SELECT
TO authenticated
USING ((SELECT public.current_user_is_manager()));

CREATE POLICY "Executors can view assigned task history"
ON public.task_status_history
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.tasks
    WHERE tasks.id = task_status_history.task_id
      AND tasks.executor_id = (SELECT auth.uid())
  )
);

COMMIT;
