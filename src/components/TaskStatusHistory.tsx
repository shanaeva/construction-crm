import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { TaskStatusHistoryEntry, UserProfile } from "../types";

type Props = {
  taskId: string;
  profile: UserProfile;
  refreshKey: number;
};

type RelatedProfile = {
  full_name: string;
};

type HistoryRow = Omit<TaskStatusHistoryEntry, "changedByName"> & {
  changed_by_profile: RelatedProfile | null;
};

export const TaskStatusHistory = ({ taskId, profile, refreshKey }: Props) => {
  const [history, setHistory] = useState<TaskStatusHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isCurrent = true;

    const loadHistory = async () => {
      setIsLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("task_status_history")
        .select(
          "task_id, changed_by, from_status, to_status, comment, created_at, changed_by_profile:profiles(full_name)",
        )
        .eq("task_id", taskId)
        .order("created_at", { ascending: true });

      if (!isCurrent) {
        return;
      }

      if (error) {
        console.error("Task status history error:", error.message);
        setErrorMessage("Could not load status history.");
        setIsLoading(false);
        return;
      }

      const rows = data as unknown as HistoryRow[];
      setHistory(
        rows.map((row) => ({
          task_id: row.task_id,
          changed_by: row.changed_by,
          changedByName:
            row.changed_by_profile?.full_name ??
            (row.changed_by === profile.id
              ? profile.full_name
              : "Profile unavailable"),
          from_status: row.from_status,
          to_status: row.to_status,
          comment: row.comment,
          created_at: row.created_at,
        })),
      );
      setIsLoading(false);
    };

    loadHistory();

    return () => {
      isCurrent = false;
    };
  }, [profile.full_name, profile.id, refreshKey, taskId]);

  return (
    <section className="rounded-2xl border border-[#dce3dc] bg-white p-6 shadow-[0_12px_30px_rgba(38,53,65,0.04)]">
      <h2 className="text-lg font-semibold">Status history</h2>
      {errorMessage ? (
        <p role="alert" className="mt-3 text-sm text-[#8c3b32]">
          {errorMessage}
        </p>
      ) : isLoading ? (
        <p role="status" className="mt-3 text-sm text-[#65737c]">
          Loading status history…
        </p>
      ) : history.length === 0 ? (
        <p className="mt-3 text-sm text-[#65737c]">No status history yet.</p>
      ) : (
        <ol className="mt-4 space-y-4">
          {history.map((entry, index) => (
            <li
              key={`${entry.task_id}-${entry.created_at}-${index}`}
              className="border-l-2 border-[#dce3dc] pl-4"
            >
              <p className="text-sm font-medium text-[#34454e]">
                {entry.from_status?.replaceAll("_", " ") ?? "Created"}
                {" → "}
                {entry.to_status.replaceAll("_", " ")}
              </p>
              <p className="mt-1 text-xs text-[#65737c]">
                {entry.changedByName} ·{" "}
                {new Date(entry.created_at).toLocaleString()}
              </p>
              {entry.comment && (
                <p className="mt-2 text-sm leading-6 text-[#65737c]">
                  {entry.comment}
                </p>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
};
