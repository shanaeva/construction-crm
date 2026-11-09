import { useState } from "react";
import type { ConstructionObject, UserProfile } from "../types";
import { CreateObjectForm } from "./CreateObjectForm";

type Props = {
  profile: UserProfile;
  objects: ConstructionObject[];
  errorMessage: string;
  successMessage: string;
  onLogout: () => void;
  onSelectObject: (object: ConstructionObject) => void;
  onRefreshObjects: () => void;
};

export const ObjectsList = ({
  profile,
  objects,
  errorMessage,
  successMessage,
  onLogout,
  onSelectObject,
  onRefreshObjects,
}: Props) => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleObjectCreated = async () => {
    setIsFormOpen(false);
    await onRefreshObjects();
  };

  return (
    <main className="min-h-screen bg-[#f5f7f3] px-4 py-10 text-[#263541] sm:px-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-1 text-sm font-medium tracking-wide text-[#67806c]">
              Construction CRM
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">Objects</h1>
            <p className="mt-2 text-sm text-[#65737c]">
              Signed in as {profile.full_name} ({profile.role})
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {profile.role === "manager" && !isFormOpen && (
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="rounded-xl bg-[#52775c] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#42654c] focus:outline-none focus:ring-4 focus:ring-[#c9ddcc]"
              >
                Create object
              </button>
            )}
            <button
              type="button"
              onClick={() => onLogout()}
              className="rounded-xl border border-[#cfd9d1] bg-white px-4 py-2.5 text-sm font-semibold text-[#42654c] transition hover:bg-[#f5f7f3] focus:outline-none focus:ring-4 focus:ring-[#dceade]"
            >
              Sign out
            </button>
          </div>
        </header>

        {isFormOpen && profile.role === "manager" && (
          <CreateObjectForm
            onCancel={() => setIsFormOpen(false)}
            onCreated={handleObjectCreated}
          />
        )}

        {errorMessage && (
          <p
            role="alert"
            className="mb-5 rounded-xl border border-[#ebcfca] bg-[#fff7f5] px-3.5 py-3 text-sm leading-5 text-[#8c3b32]"
          >
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p
            role="status"
            className="mb-5 rounded-xl border border-[#cfe0d1] bg-[#f2f8f2] px-3.5 py-3 text-sm leading-5 text-[#42654c]"
          >
            {successMessage}
          </p>
        )}

        {objects.length === 0 ? (
          <section className="rounded-2xl border border-[#dce3dc] bg-white p-8 text-center shadow-[0_16px_45px_rgba(38,53,65,0.05)]">
            <h2 className="text-lg font-semibold">No objects yet</h2>
            <p className="mt-2 text-sm text-[#65737c]">
              Objects available to you will appear here.
            </p>
          </section>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {objects.map((object) => (
              <li key={object.id}>
                <button
                  type="button"
                  onClick={() => onSelectObject(object)}
                  className="w-full rounded-2xl border border-[#dce3dc] bg-white p-6 text-left shadow-[0_16px_45px_rgba(38,53,65,0.05)] transition hover:border-[#9cb3a1] focus:outline-none focus:ring-4 focus:ring-[#dceade]"
                >
                  <h2 className="text-lg font-semibold">{object.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#65737c]">
                    {object.address}
                  </p>
                  <span className="mt-4 inline-block text-sm font-semibold text-[#52775c]">
                    View tasks →
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
};
