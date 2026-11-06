import type { UserProfile } from "../types";

type Props = {
  profile: UserProfile;
  onLogout: () => void;
};

export const Profile = ({ profile, onLogout }: Props) => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7f3] px-4 py-10 text-[#263541] sm:px-6">
      <section
        aria-labelledby="profile-title"
        className="w-full max-w-md rounded-2xl border border-[#dce3dc] bg-white p-6 shadow-[0_16px_45px_rgba(38,53,65,0.08)] sm:p-8"
      >
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium tracking-wide text-[#67806c]">
            Construction CRM
          </p>
          <h1
            id="profile-title"
            className="text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            Welcome, {profile.full_name}
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#65737c]">
            Your role: <span className="font-medium capitalize">{profile.role}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => void onLogout()}
          className="w-full rounded-xl border border-[#cfd9d1] bg-white px-4 py-3 text-sm font-semibold text-[#42654c] transition hover:bg-[#f5f7f3] focus:outline-none focus:ring-4 focus:ring-[#dceade]"
        >
          Sign out
        </button>
      </section>
    </main>
  );
};
