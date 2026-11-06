import type { ConstructionObject, UserProfile } from "../types";

type Props = {
  profile: UserProfile;
  objects: ConstructionObject[];
  errorMessage: string;
  onLogout: () => void;
  onSelectObject: (object: ConstructionObject) => void;
};

export const ObjectsList = ({
  profile,
  objects,
  errorMessage,
  onLogout,
  onSelectObject,
}: Props) => {
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
          <button
            type="button"
            onClick={() => void onLogout()}
            className="rounded-xl border border-[#cfd9d1] bg-white px-4 py-2.5 text-sm font-semibold text-[#42654c] transition hover:bg-[#f5f7f3] focus:outline-none focus:ring-4 focus:ring-[#dceade]"
          >
            Sign out
          </button>
        </header>

        {errorMessage && (
          <p
            role="alert"
            className="mb-5 rounded-xl border border-[#ebcfca] bg-[#fff7f5] px-3.5 py-3 text-sm leading-5 text-[#8c3b32]"
          >
            {errorMessage}
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
