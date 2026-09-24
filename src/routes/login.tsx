import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { authClient } from "@/lib/auth/client";
import { latestResetLink } from "@/lib/mail/reset";
import { Wordmark } from "@/components/temple/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

type Mode = "signin" | "signup" | "forgot";

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [resetLink, setResetLink] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setResetLink(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const res = await authClient.signUp.email({
          name: name.trim() || email.trim(),
          email: email.trim(),
          password,
        });
        if (res.error) throw new Error(res.error.message || "Could not create the account");
        await navigate({ to: "/deck" });
        return;
      }
      if (mode === "signin") {
        const res = await authClient.signIn.email({
          email: email.trim(),
          password,
        });
        if (res.error) throw new Error(res.error.message || "Could not sign in");
        await navigate({ to: "/deck" });
        return;
      }
      const res = await authClient.requestPasswordReset({
        email: email.trim(),
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (res.error) throw new Error(res.error.message || "Could not start the reset");
      const preview = await latestResetLink({ data: { email: email.trim() } });
      setInfo("If that account exists, a reset link is ready.");
      setResetLink(preview.link);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 py-8">
      <Link to="/">
        <Wordmark />
      </Link>
      <h1 className="mt-10 font-sans text-2xl font-semibold tracking-tight">
        {mode === "signup" ? "Create account" : mode === "forgot" ? "Reset password" : "Sign in"}
      </h1>
      <p className="mt-2 text-[13px] text-muted">
        Email and password are stored in this app’s database.
      </p>
      <form className="mt-6 flex flex-col gap-3" onSubmit={(e) => void onSubmit(e)}>
        {mode === "signup" ? (
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            autoComplete="name"
            required
          />
        ) : null}
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoComplete="email"
          required
        />
        {mode !== "forgot" ? (
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            minLength={8}
            required
          />
        ) : null}
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {info ? <p className="text-sm text-ok">{info}</p> : null}
        {resetLink ? (
          <a href={resetLink} className="text-sm break-all text-primary underline-offset-2 hover:underline">
            Open reset link
          </a>
        ) : null}
        <Button type="submit" variant="solid" disabled={busy}>
          {busy ? "Working…" : mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Sign in"}
        </Button>
      </form>
      <div className="mt-4 flex flex-col gap-2 text-[13px] text-muted">
        {mode !== "forgot" ? (
          <button type="button" className="text-left hover:text-fg" onClick={() => setMode("forgot")}>
            Forgot password
          </button>
        ) : (
          <button type="button" className="text-left hover:text-fg" onClick={() => setMode("signin")}>
            Back to sign in
          </button>
        )}
        {mode === "signin" ? (
          <button type="button" className="text-left hover:text-fg" onClick={() => setMode("signup")}>
            Create an account
          </button>
        ) : null}
        {mode === "signup" ? (
          <button type="button" className="text-left hover:text-fg" onClick={() => setMode("signin")}>
            Already have an account
          </button>
        ) : null}
      </div>
    </main>
  );
}
