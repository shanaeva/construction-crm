import { useEffect, useState, type SubmitEvent } from "react";
import { supabase } from "../lib/supabaseClient";

type Props = {
  objectId: string;
  authorId: string;
  canCreate: boolean;
  onCreated: () => void;
};

type ExecutorOption = {
  id: string;
  full_name: string;
};

export const CreateTaskForm = ({
  objectId,
  authorId,
  canCreate,
  onCreated,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [executorId, setExecutorId] = useState("");
  const [executors, setExecutors] = useState<ExecutorOption[]>([]);
  const [isLoadingExecutors, setIsLoadingExecutors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isOpen || !canCreate) {
      return;
    }

    const getExecutors = async () => {
      setIsLoadingExecutors(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("role", "executor")
        .order("full_name");

      if (error) {
        console.error("Executors error:", error.message);
        setErrorMessage("Could not load the executor list.");
      } else {
        setExecutors(data);
      }

      setIsLoadingExecutors(false);
    };

    void getExecutors();
  }, [canCreate, isOpen]);

  const resetAndClose = () => {
    setTitle("");
    setDescription("");
    setExecutorId("");
    setErrorMessage("");
    setIsOpen(false);
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setErrorMessage("Title is required.");
      return;
    }

    if (!canCreate) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const { error } = await supabase.from("tasks").insert({
      title: trimmedTitle,
      description: description.trim() || null,
      object_id: objectId,
      executor_id: executorId || null,
      author_id: authorId,
      status: "new",
    });

    if (error) {
      console.error("Create task error:", error.message);
      setErrorMessage("Could not create the task. Please try again.");
      setIsSubmitting(false);
      return;
    }

    await onCreated();
    resetAndClose();
    setIsSubmitting(false);
  };

  if (!canCreate) {
    return null;
  }

  return (
    <div className="contents">
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-xl bg-[#52775c] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#42654c] focus:outline-none focus:ring-4 focus:ring-[#c9ddcc]"
        >
          Create task
        </button>
      )}

      {isOpen && (
        <form
          className="mb-5 w-full basis-full space-y-4 rounded-2xl border border-[#dce3dc] bg-white p-5 shadow-[0_12px_30px_rgba(38,53,65,0.04)]"
          onSubmit={(event) => void handleSubmit(event)}
        >
          <div>
            <label
              htmlFor="task-title"
              className="mb-1.5 block text-sm font-medium"
            >
              Title <span aria-hidden="true">*</span>
            </label>
            <input
              id="task-title"
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="block w-full rounded-xl border border-[#cfd9d1] bg-[#fbfcfa] px-3.5 py-3 text-sm outline-none focus:border-[#52775c] focus:ring-4 focus:ring-[#dceade]"
              placeholder="Enter a task title"
            />
          </div>

          <div>
            <label
              htmlFor="task-description"
              className="mb-1.5 block text-sm font-medium"
            >
              Description{" "}
              <span className="font-normal text-[#65737c]">(optional)</span>
            </label>
            <textarea
              id="task-description"
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="block w-full rounded-xl border border-[#cfd9d1] bg-[#fbfcfa] px-3.5 py-3 text-sm outline-none focus:border-[#52775c] focus:ring-4 focus:ring-[#dceade]"
              placeholder="Add details for the executor"
            />
          </div>

          <div>
            <label
              htmlFor="task-executor"
              className="mb-1.5 block text-sm font-medium"
            >
              Executor{" "}
              <span className="font-normal text-[#65737c]">(optional)</span>
            </label>
            <div className="relative">
              <select
                id="task-executor"
                value={executorId}
                onChange={(event) => setExecutorId(event.target.value)}
                disabled={isLoadingExecutors}
                className="block w-full appearance-none rounded-xl border border-[#cfd9d1] bg-[#fbfcfa] py-3 pl-3.5 pr-10 text-sm text-[#263541] outline-none transition focus:border-[#52775c] focus:ring-4 focus:ring-[#dceade] disabled:opacity-60"
              >
                <option value="" className="bg-white text-[#65737c]">
                  {isLoadingExecutors ? "Loading executors…" : "Unassigned"}
                </option>
                {executors.map((executor) => (
                  <option
                    key={executor.id}
                    value={executor.id}
                    className="bg-white text-[#263541]"
                  >
                    {executor.full_name}
                  </option>
                ))}
              </select>
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="none"
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#65737c]"
              >
                <path
                  d="m5 7.5 5 5 5-5"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.7"
                />
              </svg>
            </div>
          </div>

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
              disabled={isSubmitting || isLoadingExecutors}
              className="rounded-xl bg-[#52775c] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#42654c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Creating…" : "Save task"}
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={resetAndClose}
              className="rounded-xl border border-[#cfd9d1] bg-white px-4 py-2.5 text-sm font-semibold text-[#42654c] disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
