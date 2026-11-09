BEGIN;

GRANT UPDATE (title, description, object_id, executor_id)
ON TABLE public.tasks
TO authenticated;

CREATE POLICY "managers_update_tasks"
ON public.tasks
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'manager'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'manager'
  )
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

COMMIT;
