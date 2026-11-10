-- Triggers depend on functions from 20261109141000_create_functions.sql.

BEGIN;

CREATE TRIGGER prevent_direct_task_status_update
BEFORE UPDATE OF status ON public.tasks
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.prevent_direct_task_status_update();

CREATE EVENT TRIGGER ensure_rls
ON ddl_command_end
EXECUTE FUNCTION public.rls_auto_enable();

COMMIT;
