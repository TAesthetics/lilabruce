import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { authClient } from "@/lib/auth/client";
import { Wordmark } from "@/components/temple/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ResetSearch = { token?: string; error?: string };

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>): ResetSearch => ({
    token: typeof search.token === "string" ? search.token : undefined,
    error: typeof search.error === "string" ? search.error : undefined,
  }),
  component: ResetPage,
});

function ResetPage() {
  const { token, error: tokenError } = Route.useSearch();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(tokenError ? "This reset link is not valid." : "");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) {
      setError("Missing reset token.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await authClient.resetPassword({ newPassword: password, token });
      if (res.error) throw new Error(res.error.message || "Could not reset the password");
      await navigate({ to: "/login" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset the password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 py-8">
      <Link to="/">
        <Wordmark />
      </Link>
      <h1 className="mt-10 font-sans text-2xl font-semibold tracking-tight">New password</h1>
      <p className="mt-2 text-[13px] text-muted">At least 8 characters. Stored only as a hash.</p>
      <form className="mt-6 flex flex-col gap-3" onSubmit={(e) => void onSubmit(e)}>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit" variant="solid" disabled={busy || !token}>
          {busy ? "Saving…" : "Save password"}
        </Button>
      </form>
    </main>
  );
}
