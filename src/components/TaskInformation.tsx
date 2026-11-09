import type { ConstructionObject, TaskDetails } from "../types";

type Props = {
  task: TaskDetails;
  object: ConstructionObject;
};

export const TaskInformation = ({ task, object }: Props) => (
  <section className="mb-6 rounded-2xl border border-[#dce3dc] bg-white p-6 shadow-[0_16px_45px_rgba(38,53,65,0.05)] sm:p-8">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {task.title}
      </h1>
      <span className="rounded-full bg-[#edf3ed] px-3 py-1 text-sm font-semibold capitalize text-[#42654c]">
        {task.status.replaceAll("_", " ")}
      </span>
    </div>

    <dl className="mt-6 grid gap-5 sm:grid-cols-2">
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wide text-[#67806c]">
          Description
        </dt>
        <dd className="mt-1 text-sm leading-6 text-[#34454e]">
          {task.description || "No description provided."}
        </dd>
      </div>
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wide text-[#67806c]">
          Object
        </dt>
        <dd className="mt-1 text-sm leading-6 text-[#34454e]">
          {object.name} · {object.address}
        </dd>
      </div>
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wide text-[#67806c]">
          Executor
        </dt>
        <dd className="mt-1 text-sm leading-6 text-[#34454e]">
          {task.executorName ?? "Unassigned"}
        </dd>
      </div>
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wide text-[#67806c]">
          Author
        </dt>
        <dd className="mt-1 text-sm leading-6 text-[#34454e]">
          {task.authorName}
        </dd>
      </div>
      <div>
        <dt className="text-xs font-semibold uppercase tracking-wide text-[#67806c]">
          Created
        </dt>
        <dd className="mt-1 text-sm leading-6 text-[#34454e]">
          {new Date(task.created_at).toLocaleString()}
        </dd>
      </div>
    </dl>
  </section>
);
