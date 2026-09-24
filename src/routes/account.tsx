import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AuthGate } from "@/components/temple/auth-gate";
import { Clock } from "@/components/temple/clock";
import { TempleShell } from "@/components/temple/shell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { signOut } from "@/lib/auth/client";
import { DAILY_FREE_PROMPTS } from "@/lib/temple/catalog";
import { deleteAccountData, getSnapshot } from "@/lib/temple/fns";
import { UserButton } from "@/lib/auth/gates";

export const Route = createFileRoute("/account")({
  component: () => (
    <AuthGate>
      <AccountPage />
    </AuthGate>
  ),
});

function AccountPage() {
  const user = useCurrentUser();
  const snap = useQuery({ queryKey: ["temple"], queryFn: () => getSnapshot() });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const profile = snap.data?.profile;

  async function wipe() {
    await deleteAccountData();
    setConfirmDelete(false);
    setSigningOut(true);
    try {
      await signOut("/");
    } catch {
      setSigningOut(false);
    }
  }

  return (
    <TempleShell credits={profile?.credits} pro={profile?.pro} right={<Clock />}>
      <div className="mx-auto w-full max-w-xl px-4 py-6">
        <p className="font-sans text-[11px] tracking-[0.2em] text-cyan uppercase">Workspace</p>
        <h1 className="mt-1 font-sans text-2xl font-semibold tracking-tight">Account</h1>

        <section className="mt-6 rounded-lg border border-border bg-surface p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-sans text-sm font-semibold">
                {user?.displayName ?? "Guest"}
              </p>
              <p className="text-[12px] text-muted">{user?.primaryEmail}</p>
            </div>
            <UserButton />
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
            <div className="rounded-sm border border-border bg-bg px-3 py-2">
              <dt className="text-[10px] tracking-[0.12em] text-faint uppercase">Credits</dt>
              <dd className="font-sans text-lg text-cyan tabular-nums">{profile?.credits ?? "—"}</dd>
            </div>
            <div className="rounded-sm border border-border bg-bg px-3 py-2">
              <dt className="text-[10px] tracking-[0.12em] text-faint uppercase">Pro</dt>
              <dd className="font-sans text-lg">{profile?.pro ? "Active" : "Off"}</dd>
            </div>
          </dl>
          <Link to="/shop" className="mt-3 inline-block">
            <Button variant="primary" size="sm">
              Open shop
            </Button>
          </Link>
        </section>

        <section className="mt-4 rounded-lg border border-border bg-surface p-4">
          <h2 className="font-sans text-[12px] font-semibold tracking-[0.14em] text-primary uppercase">
            Model
          </h2>
          <p className="mt-2 text-[13px] text-muted">
            xAI is built into the server. The key is not shown and cannot be changed here.
          </p>
          <p className="mt-2 text-[12px] text-faint">
            {profile?.pro
              ? "Pro includes prompts."
              : `${profile?.promptsLeft ?? DAILY_FREE_PROMPTS} of ${DAILY_FREE_PROMPTS} free prompts left today. After that, €15 per month.`}
          </p>
        </section>

        <section className="mt-4 rounded-lg border border-danger/40 bg-surface p-4">
          <h2 className="font-sans text-[12px] font-semibold tracking-[0.14em] text-danger uppercase">
            Delete my data
          </h2>
          <p className="mt-2 text-[13px] text-muted">
            Wipes engagements, activity, purchases, and this profile, then returns you to the console.
          </p>
          <Button
            variant="danger"
            className="mt-3"
            disabled={signingOut}
            onClick={() => setConfirmDelete(true)}
          >
            Delete account data
          </Button>
        </section>

        <p className="mt-6 text-[12px] text-faint">
          <Link to="/privacy" className="hover:text-cyan">
            Privacy
          </Link>
          {" · "}
          <Link to="/terms" className="hover:text-cyan">
            Terms
          </Link>
        </p>
      </div>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent title="Delete data">
          <p className="mb-4 text-[13px] text-muted">
            This cannot be undone. Credits on this workspace will be removed.
          </p>
          <div className="flex gap-2">
            <Button variant="danger" onClick={() => void wipe()} disabled={signingOut}>
              Confirm delete
            </Button>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              Keep
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </TempleShell>
  );
}
