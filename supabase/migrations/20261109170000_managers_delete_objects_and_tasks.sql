BEGIN;

GRANT DELETE ON TABLE public.objects TO authenticated;
GRANT DELETE ON TABLE public.tasks TO authenticated;

CREATE POLICY "managers_delete_objects"
ON public.objects
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'manager'
  )
);

CREATE POLICY "managers_delete_tasks"
ON public.tasks
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'manager'
  )
);

COMMIT;
