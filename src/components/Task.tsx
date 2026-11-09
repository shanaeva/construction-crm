import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { ConstructionObject, TaskDetails, UserProfile } from "../types";
import { TaskActions } from "./TaskActions";
import { EditTaskForm } from "./EditTaskForm";
import { TaskInformation } from "./TaskInformation";
import { TaskStatusHistory } from "./TaskStatusHistory";

type Props = {
  taskId: string;
  object: ConstructionObject;
  profile: UserProfile;
  onBack: () => void;
  onLogout: () => void;
  onTaskDeleted: () => Promise<void>;
  onTaskMoved: () => Promise<void>;
};

type RelatedProfile = {
  full_name: string;
};

type TaskWithProfiles = Omit<TaskDetails, "authorName" | "executorName"> & {
  author: RelatedProfile | null;
  executor: RelatedProfile | null;
};

export const Task = ({
  taskId,
  object,
  profile,
  onBack,
  onLogout,
  onTaskDeleted,
  onTaskMoved,
}: Props) => {
  const [task, setTask] = useState<TaskDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [isDeletingTask, setIsDeletingTask] = useState(false);
  const [taskMutationError, setTaskMutationError] = useState("");
  const [taskSuccessMessage, setTaskSuccessMessage] = useState("");

  const loadTaskDetails = useCallback(async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select(
        `
            id,
            title,
            description,
            object_id,
            executor_id,
            author_id,
            status,
            created_at,
            author:profiles!tasks_author_id_fkey(full_name),
            executor:profiles!tasks_executor_id_fkey(full_name)
          `,
      )
      .eq("id", taskId)
      .maybeSingle();

    setErrorMessage("");

    if (error || !data) {
      if (error) {
        console.error("Task details error:", error.message);
      }
      setErrorMessage(
        "Task not found or you do not have permission to view it.",
      );
      setTask(null);

      setIsLoading(false);
      return;
    }

    const taskData = data as unknown as TaskWithProfiles;
    setTask({
      id: taskData.id,
      title: taskData.title,
      description: taskData.description,
      object_id: taskData.object_id,
      executor_id: taskData.executor_id,
      author_id: taskData.author_id,
      status: taskData.status,
      created_at: taskData.created_at,
      authorName:
        taskData.author?.full_name ??
        (taskData.author_id === profile.id
          ? profile.full_name
          : "Profile unavailable"),
      executorName: taskData.executor_id
        ? (taskData.executor?.full_name ??
          (taskData.executor_id === profile.id
            ? profile.full_name
            : "Profile unavailable"))
        : null,
    });

    setIsLoading(false);
  }, [profile.full_name, profile.id, taskId]);

  useEffect(() => {
    Promise.resolve().then(() => loadTaskDetails());
  }, [loadTaskDetails]);

  const handleStatusChanged = async () => {
    await loadTaskDetails();
    setHistoryRefreshKey((key) => key + 1);
  };

  const handleDeleteTask = async () => {
    if (!task || !window.confirm(`Delete task "${task.title}"?`)) {
      return;
    }

    setIsDeletingTask(true);
    setTaskMutationError("");

    const { data, error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", task.id)
      .select("id")
      .maybeSingle();

    if (error || !data) {
      console.error("Delete task error:", error?.message ?? "No row returned");
      setTaskMutationError(
        error
          ? "Could not delete the task. Please try again."
          : "The task was not deleted. Check your manager permissions or whether it still exists.",
      );
      setIsDeletingTask(false);
      return;
    }

    await onTaskDeleted();
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
          ← Back to {object.name}
        </button>

        {isLoading ? (
          <p role="status" className="text-sm text-[#65737c]">
            Loading task…
          </p>
        ) : errorMessage ? (
          <p
            role="alert"
            className="rounded-xl border border-[#ebcfca] bg-[#fff7f5] px-3.5 py-3 text-sm leading-5 text-[#8c3b32]"
          >
            {errorMessage}
          </p>
        ) : task ? (
          <>
            {taskSuccessMessage && (
              <p
                role="status"
                className="mb-5 rounded-xl border border-[#cfe0d1] bg-[#f2f8f2] px-3.5 py-3 text-sm text-[#42654c]"
              >
                {taskSuccessMessage}
              </p>
            )}
            {taskMutationError && (
              <p
                role="alert"
                className="mb-5 rounded-xl border border-[#ebcfca] bg-[#fff7f5] px-3.5 py-3 text-sm text-[#8c3b32]"
              >
                {taskMutationError}
              </p>
            )}
            {profile.role === "manager" && (
              <div className="mb-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingTask((isEditing) => !isEditing)}
                  disabled={isDeletingTask}
                  className="rounded-xl border border-[#cfd9d1] bg-white px-3.5 py-2 text-sm font-semibold text-[#42654c] disabled:opacity-60"
                >
                  {isEditingTask ? "Cancel editing" : "Edit task"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteTask()}
                  disabled={isDeletingTask}
                  className="rounded-xl border border-[#ebcfca] bg-white px-3.5 py-2 text-sm font-semibold text-[#8c3b32] disabled:opacity-60"
                >
                  {isDeletingTask ? "Deleting…" : "Delete task"}
                </button>
              </div>
            )}
            {isEditingTask ? (
              <EditTaskForm
                task={task}
                onCancel={() => setIsEditingTask(false)}
                onUpdated={(updatedObjectId) => {
                  setIsEditingTask(false);

                  if (updatedObjectId !== object.id) {
                    onTaskMoved();
                    return;
                  }
                  setTaskSuccessMessage("Task updated successfully.");
                  loadTaskDetails();
                }}
              />
            ) : (
              <>
                <TaskInformation task={task} object={object} />
                <TaskActions
                  task={task}
                  profile={profile}
                  onStatusChanged={handleStatusChanged}
                />
                <TaskStatusHistory
                  taskId={taskId}
                  profile={profile}
                  refreshKey={historyRefreshKey}
                />
              </>
            )}
          </>
        ) : null}
      </div>
    </main>
  );
};
