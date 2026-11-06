import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type {
  ConstructionObject,
  ConstructionTask,
  UserProfile,
} from "../types";
import { CreateTaskForm } from "./CreateTaskForm";

type Props = {
  object: ConstructionObject;
  profile: UserProfile;
  onBack: () => void;
  onLogout: () => void;
};

export const ObjectDetails = ({ object, profile, onBack, onLogout }: Props) => {
  const [tasks, setTasks] = useState<ConstructionTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  useEffect(() => {
    let isCurrent = true;

    const getObjectTasks = async () => {
      setIsLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("tasks")
        .select("id, title, description, status")
        .eq("object_id", object.id);

      if (!isCurrent) {
        return;
      }

      if (error) {
        console.error("Object tasks error:", error.message);
        setErrorMessage("Could not load tasks for this object.");
      } else {
        setTasks(data);
      }

      setIsLoading(false);
    };

    getObjectTasks();

    return () => {
      isCurrent = false;
    };
  }, [object.id]);

  const refreshTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("id, title, description, status")
      .eq("object_id", object.id);

    if (error) {
      console.error("Refresh tasks error:", error.message);
      setErrorMessage("Task created, but the task list could not be refreshed.");
    } else {
      setTasks(data);
      setErrorMessage("");
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f7f3] px-4 py-10 text-[#263541] sm:px-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-1 text-sm font-medium tracking-wide text-[#67806c]">
              Construction CRM
            </p>
            <p className="text-sm text-[#65737c]">
              Signed in as {profile.full_name} ({profile.role})
            </p>
          </div>
          <button
            type="button"
            onClick={() => void onLogout()}
            className="rounded-xl border border-[#cfd9d1] bg-white px-4 py-2.5 text-sm font-semibold text-[#42654c] transition hover:bg-[#f5f7f3] focus:outline-none focus:ring-4 focus:ring-[#dceade]"
          >
            Sign out
          </button>
        </header>

        <button
          type="button"
          onClick={onBack}
          className="mb-5 text-sm font-semibold text-[#52775c] hover:text-[#42654c] focus:outline-none focus:underline"
        >
          ← All objects
        </button>

        <section className="mb-6 rounded-2xl border border-[#dce3dc] bg-white p-6 shadow-[0_16px_45px_rgba(38,53,65,0.05)] sm:p-8">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {object.name}
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#65737c]">
            {object.address}
          </p>
        </section>

        <section aria-labelledby="tasks-title">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 id="tasks-title" className="text-xl font-semibold">
              Tasks
            </h2>
            <CreateTaskForm
              objectId={object.id}
              authorId={profile.id}
              canCreate={profile.role === "manager"}
              onCreated={refreshTasks}
            />
          </div>

          {errorMessage && (
            <p
              role="alert"
              className="rounded-xl border border-[#ebcfca] bg-[#fff7f5] px-3.5 py-3 text-sm leading-5 text-[#8c3b32]"
            >
              {errorMessage}
            </p>
          )}

          {isLoading ? (
            <p role="status" className="text-sm text-[#65737c]">
              Loading tasks…
            </p>
          ) : !errorMessage && tasks.length === 0 ? (
            <div className="rounded-2xl border border-[#dce3dc] bg-white p-6 text-sm text-[#65737c]">
              No tasks for this object yet.
            </div>
          ) : (
            <ul className="space-y-3">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="rounded-2xl border border-[#dce3dc] bg-white p-5 shadow-[0_12px_30px_rgba(38,53,65,0.04)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h3 className="font-semibold">{task.title}</h3>
                    <span className="rounded-full bg-[#edf3ed] px-3 py-1 text-xs font-semibold capitalize text-[#42654c]">
                      {task.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#65737c]">
                    {task.description}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};
