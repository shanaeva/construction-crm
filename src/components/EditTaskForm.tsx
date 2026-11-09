import { useEffect, useState, type SubmitEvent } from "react";
import { supabase } from "../lib/supabaseClient";
import type { ConstructionObject, TaskDetails } from "../types";

type Props = {
  task: TaskDetails;
  onCancel: () => void;
  onUpdated: (objectId: string) => void;
};

type ExecutorOption = {
  id: string;
  full_name: string;
};

export const EditTaskForm = ({ task, onCancel, onUpdated }: Props) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [objectId, setObjectId] = useState(task.object_id);
  const [executorId, setExecutorId] = useState(task.executor_id ?? "");
  const [objects, setObjects] = useState<ConstructionObject[]>([]);
  const [executors, setExecutors] = useState<ExecutorOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isCurrent = true;

    const loadOptions = async () => {
      const [objectsResult, executorsResult] = await Promise.all([
        supabase
          .from("objects")
          .select("id, name, address, created_at")
          .order("name"),
        supabase
          .from("profiles")
          .select("id, full_name")
          .eq("role", "executor")
          .order("full_name"),
      ]);

      if (!isCurrent) {
        return;
      }

      if (objectsResult.error || executorsResult.error) {
        console.error(
          "Edit task options error:",
          objectsResult.error?.message ?? executorsResult.error?.message,
        );
        setErrorMessage("Could not load objects or executors.");
      } else {
        setObjects(objectsResult.data);
        setExecutors(executorsResult.data);
      }

      setIsLoadingOptions(false);
    };

    loadOptions();
    return () => {
      isCurrent = false;
    };
  }, []);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setErrorMessage("Title is required.");
      return;
    }

    if (!objectId) {
      setErrorMessage("Select an object for this task.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("tasks")
      .update({
        title: trimmedTitle,
        description: description.trim() || null,
        object_id: objectId,
        executor_id: executorId || null,
      })
      .eq("id", task.id)
      .select("id, object_id")
      .maybeSingle();

    if (error || !data) {
      console.error("Update task error:", error?.message ?? "No row returned");
      setErrorMessage(
        error
          ? "Could not update the task. Please try again."
          : "The task was not updated. It may have been deleted or you may not have permission.",
      );
      setIsSaving(false);
      return;
    }

    onUpdated(data.object_id);
  };

  return (
    <form
      className="space-y-4 rounded-2xl border border-[#dce3dc] bg-white p-5 shadow-[0_12px_30px_rgba(38,53,65,0.04)]"
      onSubmit={(event) => void handleSubmit(event)}
    >
      <div>
        <label
          htmlFor="edit-task-title"
          className="mb-1.5 block text-sm font-medium"
        >
          Title <span aria-hidden="true">*</span>
        </label>
        <input
          id="edit-task-title"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          disabled={isSaving}
          className="block w-full rounded-xl border border-[#cfd9d1] bg-[#fbfcfa] px-3.5 py-3 text-sm outline-none focus:border-[#52775c] focus:ring-4 focus:ring-[#dceade] disabled:opacity-60"
        />
      </div>

      <div>
        <label
          htmlFor="edit-task-description"
          className="mb-1.5 block text-sm font-medium"
        >
          Description{" "}
          <span className="font-normal text-[#65737c]">(optional)</span>
        </label>
        <textarea
          id="edit-task-description"
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={isSaving}
          className="block w-full rounded-xl border border-[#cfd9d1] bg-[#fbfcfa] px-3.5 py-3 text-sm outline-none focus:border-[#52775c] focus:ring-4 focus:ring-[#dceade] disabled:opacity-60"
        />
      </div>

      <div>
        <label
          htmlFor="edit-task-object"
          className="mb-1.5 block text-sm font-medium"
        >
          Object <span aria-hidden="true">*</span>
        </label>
        <select
          id="edit-task-object"
          required
          value={objectId}
          onChange={(event) => setObjectId(event.target.value)}
          disabled={isLoadingOptions || isSaving}
          className="block w-full rounded-xl border border-[#cfd9d1] bg-[#fbfcfa] px-3.5 py-3 text-sm outline-none focus:border-[#52775c] focus:ring-4 focus:ring-[#dceade] disabled:opacity-60"
        >
          {objects.map((object) => (
            <option key={object.id} value={object.id}>
              {object.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="edit-task-executor"
          className="mb-1.5 block text-sm font-medium"
        >
          Executor{" "}
          <span className="font-normal text-[#65737c]">(optional)</span>
        </label>
        <select
          id="edit-task-executor"
          value={executorId}
          onChange={(event) => setExecutorId(event.target.value)}
          disabled={isLoadingOptions || isSaving}
          className="block w-full rounded-xl border border-[#cfd9d1] bg-[#fbfcfa] px-3.5 py-3 text-sm outline-none focus:border-[#52775c] focus:ring-4 focus:ring-[#dceade] disabled:opacity-60"
        >
          <option value="">Unassigned</option>
          {executors.map((executor) => (
            <option key={executor.id} value={executor.id}>
              {executor.full_name}
            </option>
          ))}
        </select>
      </div>

      {isLoadingOptions && (
        <p role="status" className="text-sm text-[#65737c]">
          Loading objects and executors…
        </p>
      )}

      {errorMessage && (
        <p
          role="alert"
          className="rounded-xl border border-[#ebcfca] bg-[#fff7f5] px-3.5 py-3 text-sm text-[#8c3b32]"
        >
          {errorMessage}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSaving || isLoadingOptions || objects.length === 0}
          className="rounded-xl bg-[#52775c] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#42654c] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="rounded-xl border border-[#cfd9d1] bg-white px-4 py-2.5 text-sm font-semibold text-[#42654c] disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
