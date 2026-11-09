CREATE POLICY "managers_update_objects"
ON public.objects
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
);
