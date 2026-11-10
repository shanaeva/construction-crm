-- Core CRM tables in foreign-key dependency order.

BEGIN;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name text NOT NULL,
  role text NOT NULL CONSTRAINT profiles_role_check
    CHECK (role = ANY (ARRAY['manager'::text, 'executor'::text])),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.objects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CONSTRAINT tasks_title_not_empty
    CHECK (NULLIF(btrim(title), '') IS NOT NULL),
  description text,
  object_id uuid NOT NULL REFERENCES public.objects (id) ON DELETE CASCADE,
  executor_id uuid REFERENCES public.profiles (id),
  author_id uuid NOT NULL REFERENCES public.profiles (id),
  status text NOT NULL DEFAULT 'new'
    CONSTRAINT tasks_status_check
    CHECK (status = ANY (ARRAY['new'::text, 'in_progress'::text, 'under_review'::text, 'accepted'::text, 'revision'::text])),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.task_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks (id) ON DELETE CASCADE,
  changed_by uuid NOT NULL REFERENCES public.profiles (id),
  from_status text NOT NULL
    CONSTRAINT task_status_history_from_status_check
    CHECK (from_status = ANY (ARRAY['new'::text, 'in_progress'::text, 'under_review'::text, 'accepted'::text, 'revision'::text])),
  to_status text NOT NULL
    CONSTRAINT task_status_history_to_status_check
    CHECK (to_status = ANY (ARRAY['new'::text, 'in_progress'::text, 'under_review'::text, 'accepted'::text, 'revision'::text])),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMIT;
