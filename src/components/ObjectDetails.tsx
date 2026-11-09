import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type {
  ConstructionObject,
  ConstructionTask,
  UserProfile,
} from "../types";
import { CreateTaskForm } from "./CreateTaskForm";
import { EditObjectForm } from "./EditObjectForm";
import { Task } from "./Task";

type Props = {
  object: ConstructionObject;
  profile: UserProfile;
  onBack: () => void;
  onLogout: () => void;
  onObjectUpdated: (object: ConstructionObject) => void;
  onObjectDeleted: (objectId: string) => void;
  successMessage: string;
};

export const ObjectDetails = ({
  object,
  profile,
  onBack,
  onLogout,
  onObjectUpdated,
  onObjectDeleted,
  successMessage,
}: Props) => {
  const [tasks, setTasks] = useState<ConstructionTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [taskListSuccessMessage, setTaskListSuccessMessage] = useState("");
  const [isEditingObject, setIsEditingObject] = useState(false);
  const [isDeletingObject, setIsDeletingObject] = useState(false);
  const [objectMutationError, setObjectMutationError] = useState("");

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
      setErrorMessage("Could not refresh the task list. Please try again.");
    } else {
      setTasks(data);
      setErrorMessage("");
    }
  };

  const handleTaskBack = async () => {
    await refreshTasks();
    setSelectedTaskId(null);
  };

  const handleTaskDeleted = async () => {
    await refreshTasks();
    setTaskListSuccessMessage("Task deleted successfully.");
    setSelectedTaskId(null);
  };

  const handleTaskMoved = async () => {
    await refreshTasks();
    setTaskListSuccessMessage("Task updated successfully.");
    setSelectedTaskId(null);
  };

  const handleDeleteObject = async () => {
    if (!window.confirm(`Delete "${object.name}" and all of its tasks?`)) {
      return;
    }

    setIsDeletingObject(true);
    setObjectMutationError("");

    const { data, error } = await supabase
      .from("objects")
      .delete()
      .eq("id", object.id)
      .select("id")
      .maybeSingle();

    if (error || !data) {
      console.error("Delete object error:", error?.message ?? "No row returned");
      setObjectMutationError(
        error
          ? "Could not delete the object. Please try again."
          : "The object was not deleted. Check your manager permissions or whether it still exists.",
      );
      setIsDeletingObject(false);
      return;
    }

    onObjectDeleted(object.id);
  };

  if (selectedTaskId) {
    return (
      <Task
        taskId={selectedTaskId}
        object={object}
        profile={profile}
        onBack={() => handleTaskBack()}
        onLogout={onLogout}
        onTaskDeleted={handleTaskDeleted}
        onTaskMoved={handleTaskMoved}
      />
    );
  }

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
            onClick={() => onLogout()}
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

        {successMessage && (
          <p
            role="status"
            className="mb-5 rounded-xl border border-[#cfe0d1] bg-[#f2f8f2] px-3.5 py-3 text-sm text-[#42654c]"
          >
            {successMessage}
          </p>
        )}

        {objectMutationError && (
          <p
            role="alert"
            className="mb-5 rounded-xl border border-[#ebcfca] bg-[#fff7f5] px-3.5 py-3 text-sm text-[#8c3b32]"
          >
            {objectMutationError}
          </p>
        )}

        {taskListSuccessMessage && (
          <p
            role="status"
            className="mb-5 rounded-xl border border-[#cfe0d1] bg-[#f2f8f2] px-3.5 py-3 text-sm text-[#42654c]"
          >
            {taskListSuccessMessage}
          </p>
        )}

        <section className="mb-6 rounded-2xl border border-[#dce3dc] bg-white p-6 shadow-[0_16px_45px_rgba(38,53,65,0.05)] sm:p-8">
          {isEditingObject ? (
            <EditObjectForm
              object={object}
              onCancel={() => setIsEditingObject(false)}
              onUpdated={(updatedObject) => {
                onObjectUpdated(updatedObject);
                setIsEditingObject(false);
              }}
            />
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    {object.name}
                  </h1>
                  <p className="mt-2 text-sm leading-6 text-[#65737c]">
                    {object.address}
                  </p>
                </div>
                {profile.role === "manager" && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingObject(true)}
                      className="rounded-xl border border-[#cfd9d1] bg-white px-3.5 py-2 text-sm font-semibold text-[#42654c]"
                    >
                      Edit object
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteObject()}
                      disabled={isDeletingObject}
                      className="rounded-xl border border-[#ebcfca] bg-white px-3.5 py-2 text-sm font-semibold text-[#8c3b32] disabled:opacity-60"
                    >
                      {isDeletingObject ? "Deleting…" : "Delete object"}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
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
                <li key={task.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedTaskId(task.id)}
                    className="w-full rounded-2xl border border-[#dce3dc] bg-white p-5 text-left shadow-[0_12px_30px_rgba(38,53,65,0.04)] transition hover:border-[#9cb3a1] focus:outline-none focus:ring-4 focus:ring-[#dceade]"
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
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};
