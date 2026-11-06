import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import type { UserProfile } from "./types";
import { Profile } from "./components/Profile";

const App = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const getProfile = async (authUserId: string) => {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .eq("id", authUserId)
      .single();

    if (profileError) {
      console.error("Profile error:", profileError.message);
      setErrorMessage(
        "You are signed in, but your profile could not be loaded. Check your profile access and try again.",
      );
      return;
    }
    setUserProfile(profile);
  };

  useEffect(() => {
    const restoreSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Session restore error:", error.message);
        setErrorMessage(
          "Could not restore your session. Please sign in again.",
        );
      } else if (data.session?.user) {
        await getProfile(data.session.user.id);
      }

      setIsInitializing(false);
    };

    restoreSession();
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error.message);
        setErrorMessage(
          "Could not sign in. Check your email and password, then try again.",
        );
        return;
      }

      const authUserId = data.user.id;
      await getProfile(authUserId);

      console.log("Logged in user:", data.user);
    } catch {
      setErrorMessage(
        "Could not sign in. Check your email and password, then try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error.message);
      setErrorMessage("Could not sign out. Please try again.");
      return;
    }

    setUserProfile(null);
    setErrorMessage("");
  };

  if (isInitializing) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f7f3] px-4 text-[#65737c]">
        <p role="status">Restoring your session…</p>
      </main>
    );
  }

  if (userProfile) {
    return <Profile profile={userProfile} onLogout={handleLogout} />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7f3] px-4 py-10 text-[#263541] sm:px-6">
      <section
        aria-labelledby="login-title"
        className="w-full max-w-md rounded-2xl border border-[#dce3dc] bg-white p-6 shadow-[0_16px_45px_rgba(38,53,65,0.08)] sm:p-8"
      >
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium tracking-wide text-[#67806c]">
            Welcome
          </p>
          <h1
            id="login-title"
            className="text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            Construction CRM
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#65737c]">
            Sign in to continue to your projects.
          </p>
        </div>

        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            void handleLogin();
          }}
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-[#34454e]"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="block w-full rounded-xl border border-[#cfd9d1] bg-[#fbfcfa] px-3.5 py-3 text-base outline-none transition placeholder:text-[#98a39b] focus:border-[#52775c] focus:ring-4 focus:ring-[#dceade]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-[#34454e]"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="block w-full rounded-xl border border-[#cfd9d1] bg-[#fbfcfa] px-3.5 py-3 text-base outline-none transition placeholder:text-[#98a39b] focus:border-[#52775c] focus:ring-4 focus:ring-[#dceade]"
              placeholder="Enter your password"
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-[#52775c] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#42654c] focus:outline-none focus:ring-4 focus:ring-[#c9ddcc] disabled:cursor-not-allowed disabled:bg-[#9cb3a1]"
          >
            {isLoading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
};

export default App;
