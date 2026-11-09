import { useState, type FormEvent } from "react";
import { supabase } from "../lib/supabaseClient";
import type { TaskDetails, UserProfile } from "../types";

type Props = {
  task: TaskDetails;
  profile: UserProfile;
  onStatusChanged: () => Promise<void>;
};

type TaskStatusValue = "in_progress" | "under_review" | "accepted" | "revision";

type StatusAction = {
  label: string;
  toStatus: TaskStatusValue;
  requiresComment?: boolean;
};

const getAvailableActions = (
  task: TaskDetails,
  profile: UserProfile,
): StatusAction[] => {
  if (profile.role === "manager" && task.status === "under_review") {
    return [
      { label: "Accept", toStatus: "accepted" },
      {
        label: "Request revision",
        toStatus: "revision",
        requiresComment: true,
      },
    ];
  }

  if (profile.role === "executor" && task.executor_id === profile.id) {
    if (task.status === "new") {
      return [{ label: "Start task", toStatus: "in_progress" }];
    }

    if (task.status === "in_progress") {
      return [{ label: "Submit for review", toStatus: "under_review" }];
    }

    if (task.status === "revision") {
      return [{ label: "Resume work", toStatus: "in_progress" }];
    }
  }

  return [];
};

export const TaskActions = ({ task, profile, onStatusChanged }: Props) => {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isRevisionFormOpen, setIsRevisionFormOpen] = useState(false);
  const [revisionComment, setRevisionComment] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const availableActions = getAvailableActions(task, profile);

  const changeTaskStatus = async (
    toStatus: TaskStatusValue,
    comment?: string,
  ) => {
    if (isUpdatingStatus) {
      return;
    }

    setIsUpdatingStatus(true);
    setErrorMessage("");

    const { error } = await supabase.rpc("change_task_status", {
      p_task_id: task.id,
      p_to_status: toStatus,
      p_comment: comment ?? null,
    });

    if (error) {
      console.error("Change task status error:", error.message);
      setErrorMessage(`Could not change the task status: ${error.message}`);
      setIsUpdatingStatus(false);
      return;
    }

    setIsRevisionFormOpen(false);
    setRevisionComment("");
    await onStatusChanged();
    setIsUpdatingStatus(false);
  };

  const handleRevisionSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const comment = revisionComment.trim();

    if (!comment) {
      setErrorMessage("A comment is required when requesting a revision.");
      return;
    }

    void changeTaskStatus("revision", comment);
  };

  return (
    <section className="mb-6 rounded-2xl border border-[#dce3dc] bg-white p-6 shadow-[0_12px_30px_rgba(38,53,65,0.04)]">
      <h2 className="text-lg font-semibold">Available actions</h2>
      {availableActions.length > 0 ? (
        <>
          <div className="mt-4 flex flex-wrap gap-3">
            {availableActions.map((action) => (
              <button
                key={action.label}
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => {
                  if (action.requiresComment) {
                    setIsRevisionFormOpen(true);
                    setErrorMessage("");
                  } else {
                    void changeTaskStatus(action.toStatus);
                  }
                }}
                className="rounded-xl bg-[#52775c] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#42654c] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUpdatingStatus ? "Updating…" : action.label}
              </button>
            ))}
          </div>
          {isRevisionFormOpen && (
            <form className="mt-4 space-y-3" onSubmit={handleRevisionSubmit}>
              <label
                htmlFor="revision-comment"
                className="block text-sm font-medium"
              >
                Comment required for revision
              </label>
              <textarea
                id="revision-comment"
                required
                rows={3}
                value={revisionComment}
                onChange={(event) => setRevisionComment(event.target.value)}
                disabled={isUpdatingStatus}
                className="block w-full rounded-xl border border-[#cfd9d1] bg-[#fbfcfa] px-3.5 py-3 text-sm outline-none focus:border-[#52775c] focus:ring-4 focus:ring-[#dceade] disabled:opacity-60"
                placeholder="Explain what needs to be revised"
              />
              <button
                type="submit"
                disabled={isUpdatingStatus || !revisionComment.trim()}
                className="rounded-xl bg-[#52775c] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#42654c] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUpdatingStatus ? "Updating…" : "Send for revision"}
              </button>
            </form>
          )}
        </>
      ) : (
        <p className="mt-2 text-sm text-[#65737c]">
          No actions are available for your role at this status.
        </p>
      )}
      {errorMessage && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-[#ebcfca] bg-[#fff7f5] px-3.5 py-3 text-sm text-[#8c3b32]"
        >
          {errorMessage}
        </p>
      )}
    </section>
  );
};
