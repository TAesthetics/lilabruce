import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AuthGate } from "@/components/temple/auth-gate";
import { Clock } from "@/components/temple/clock";
import { TempleShell } from "@/components/temple/shell";
import { ShopGrid } from "@/components/temple/shop-grid";
import { getSnapshot } from "@/lib/temple/fns";
import { confirmStripeSession, getPayConfig } from "@/lib/iap/checkout";
import { detectStorePlatform } from "@/lib/iap/platform";
import { nativeRestore } from "@/lib/iap/native";
import { listPurchases, verifyNativePurchase } from "@/lib/iap/verify";
import { Button } from "@/components/ui/button";
import { getProduct } from "@/lib/temple/catalog";

type ShopSearch = { status?: "success" | "cancel"; session_id?: string };

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    status: search.status === "success" || search.status === "cancel" ? search.status : undefined,
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  component: () => (
    <AuthGate>
      <ShopPage />
    </AuthGate>
  ),
});

function ShopPage() {
  const { status, session_id } = useSearch({ from: "/shop" });
  const [paidNote, setPaidNote] = useState("");
  const platform = useMemo(() => detectStorePlatform(), []);
  const snap = useQuery({ queryKey: ["temple"], queryFn: () => getSnapshot() });
  const pay = useQuery({ queryKey: ["pay-config"], queryFn: () => getPayConfig() });
  const purchases = useQuery({ queryKey: ["purchases"], queryFn: () => listPurchases() });

  useEffect(() => {
    if (!session_id) return;
    let cancel = false;
    void confirmStripeSession({ data: { sessionId: session_id } }).then((res) => {
      if (cancel) return;
      setPaidNote(res.ok ? "Payment received. The month is active." : res.error);
      void snap.refetch();
      void purchases.refetch();
    });
    return () => {
      cancel = true;
    };
  }, [session_id]);

  async function restore() {
    const bag = await nativeRestore();
    for (const item of bag) {
      await verifyNativePurchase({
        data: {
          platform: item.platform,
          productId: item.productId,
          transactionId: item.transactionId,
          receipt: item.receipt,
        },
      });
    }
    await Promise.all([snap.refetch(), purchases.refetch()]);
  }

  const profile = snap.data?.profile;

  return (
    <TempleShell credits={profile?.credits} pro={profile?.pro} right={<Clock />}>
      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        <p className="font-sans text-[11px] tracking-[0.2em] text-cyan uppercase">Subscription</p>
        <h1 className="mt-1 font-sans text-2xl font-semibold tracking-tight">Unlimited Prompts</h1>
        <p className="mt-2 text-[13px] text-muted">
          You have {profile?.promptsLeft ?? 20} free prompts left. Subscribe for €20/month for unlimited access.
        </p>
        {status === "success" ? (
          <p className="mt-3 rounded-sm border border-ok/50 px-3 py-2 text-[13px] text-ok">
            {paidNote || "Checking the Stripe payment…"}
          </p>
        ) : null}
        {status === "cancel" ? (
          <p className="mt-3 rounded-sm border border-border px-3 py-2 text-[13px] text-muted">
            Checkout cancelled. Nothing was billed.
          </p>
        ) : null}

        <div className="mt-6">
          {pay.data ? (
            <ShopGrid
              platform={platform}
              sandbox={pay.data.sandbox}
              stripe={pay.data.stripe}
              ownedKali={Boolean(profile?.entitlements.includes("kali")) || Boolean(profile?.pro)}
              pro={Boolean(profile?.pro)}
              onPurchased={() => {
                void snap.refetch();
                void purchases.refetch();
              }}
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-40 animate-pulse rounded-lg bg-elevated" />
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => void restore()}>
            Restore purchases
          </Button>
          <p className="text-[12px] text-faint">
            Apple requires restore. Google Play restores owned non-consumables automatically.
          </p>
        </div>

        <section className="mt-10">
          <h2 className="font-sans text-sm font-semibold tracking-[0.12em] uppercase">Invoices</h2>
          <div className="mt-3 divide-y divide-border rounded-lg border border-border">
            {(purchases.data ?? []).length === 0 ? (
              <p className="px-4 py-6 text-[13px] text-muted">No purchases yet.</p>
            ) : (
              (purchases.data ?? []).map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3 px-4 py-3 text-[13px]">
                  <div>
                    <p className="text-fg">{getProduct(p.product_id)?.name ?? p.product_id}</p>
                    <p className="text-[11px] text-faint uppercase">
                      {p.platform} · {p.status}
                    </p>
                  </div>
                  <span className="text-cyan tabular-nums">
                    {p.credits_granted ? `+${p.credits_granted}` : "—"}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </TempleShell>
  );
}
