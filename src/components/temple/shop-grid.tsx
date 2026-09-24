import { useState } from "react";
import { CATALOG, billedByStripe, type ProductId } from "@/lib/temple/catalog";
import { payMethodBlurb, payMethodLabel, type StorePlatform } from "@/lib/iap/platform";
import { nativePurchase } from "@/lib/iap/native";
import {
  confirmSandboxPurchase,
  createStripeCheckout,
} from "@/lib/iap/checkout";
import { verifyNativePurchase } from "@/lib/iap/verify";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function ShopGrid({
  platform,
  sandbox,
  stripe,
  ownedKali,
  pro,
  onPurchased,
}: {
  platform: StorePlatform;
  sandbox: boolean;
  stripe: boolean;
  ownedKali: boolean;
  pro: boolean;
  onPurchased: () => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [sandboxId, setSandboxId] = useState<ProductId | null>(null);
  const till = payMethodLabel(platform);

  async function buy(productId: ProductId) {
    setError("");
    setBusy(productId);
    try {
      if (platform === "web") {
        const res = await createStripeCheckout({
          data: { productId, origin: window.location.origin },
        });
        if (!res.ok) throw new Error(res.error);
        if (res.mode === "stripe") {
          window.location.href = res.url;
          return;
        }
        setSandboxId(productId);
        return;
      }
      const receipt = await nativePurchase(productId);
      const verified = await verifyNativePurchase({
        data: {
          platform: receipt.platform,
          productId: receipt.productId,
          transactionId: receipt.transactionId,
          receipt: receipt.receipt,
        },
      });
      if (!verified.ok) throw new Error(verified.error);
      onPurchased();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Purchase failed");
    } finally {
      setBusy(null);
    }
  }

  async function confirmSandbox() {
    if (!sandboxId) return;
    setBusy(sandboxId);
    setError("");
    try {
      const res = await confirmSandboxPurchase({ data: { productId: sandboxId } });
      if (!res.ok) throw new Error(res.error);
      setSandboxId(null);
      onPurchased();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Grant failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <p className="mb-4 text-[13px] text-muted">{payMethodBlurb(platform)}</p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CATALOG.map((p) => {
          const kaliOwned = false;
          const proOwned = p.entitlement === "pro" && pro && p.period === "month";
          return (
            <article
              key={p.id}
              className={cn(
                "glow-line flex flex-col rounded-lg border bg-surface p-4",
                p.highlight ? "border-primary" : "border-border",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-sans text-sm font-semibold tracking-[0.08em] uppercase">
                  {p.name}
                </h3>
                {p.highlight ? (
                  <span className="rounded-sm border border-primary px-1.5 py-0.5 font-sans text-[9px] tracking-[0.12em] text-primary">
                    Featured
                  </span>
                ) : null}
              </div>
              <p className="mt-2 flex-1 text-[13px] text-muted">{p.blurb}</p>
              {p.credits > 0 ? (
                <p className="mt-2 font-sans text-[11px] tracking-[0.1em] text-cyan tabular-nums">
                  +{p.credits} CR
                </p>
              ) : null}
              <p className="mt-2 font-sans text-[10px] tracking-[0.12em] text-faint uppercase">
                {platform === "web" && billedByStripe(p)
                  ? "Stripe"
                  : platform === "web"
                    ? "Account"
                    : till}
              </p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="font-sans text-sm font-semibold tabular-nums">{p.priceLabel}</span>
                <Button
                  variant={p.highlight ? "solid" : "primary"}
                  size="sm"
                  disabled={busy === p.id || kaliOwned || proOwned}
                  onClick={() => void buy(p.id)}
                >
                  {kaliOwned || proOwned
                    ? "Owned"
                    : busy === p.id
                      ? "…"
                      : platform === "web"
                        ? "Pay with Stripe"
                        : `Buy · ${till}`}
                </Button>
              </div>
            </article>
          );
        })}
      </div>
      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}

      <Dialog open={Boolean(sandboxId)} onOpenChange={(o) => !o && setSandboxId(null)}>
        <DialogContent title="Sandbox checkout">
          <p className="mb-4 text-[13px] text-muted">
            Preview grant for{" "}
            <span className="text-fg">{CATALOG.find((p) => p.id === sandboxId)?.name}</span>.
            No card is charged here. Live web uses Stripe; store binaries use Apple / Google.
          </p>
          <div className="flex gap-2">
            <Button variant="solid" onClick={() => void confirmSandbox()} disabled={Boolean(busy)}>
              Grant
            </Button>
            <Button variant="ghost" onClick={() => setSandboxId(null)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
