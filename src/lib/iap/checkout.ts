import { createServerFn } from "@tanstack/react-start";
import { getSql, dbSource } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { CATALOG, STRIPE_MINIMUM_USD, billedByStripe, getProduct } from "@/lib/temple/catalog";
import { ensureProfile, logPrayer } from "@/lib/temple/db";
import { fulfillPurchase } from "@/lib/temple/grants";

function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

function sandboxAllowed(): boolean {
  return !process.env.STRIPE_SECRET_KEY && dbSource === "pglite";
}

export const getPayConfig = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    return {
      stripe: stripeConfigured(),
      sandbox: sandboxAllowed(),
      stripeMinimumUsd: STRIPE_MINIMUM_USD,
      products: CATALOG.map((p) => ({
        id: p.id,
        name: p.name,
        blurb: p.blurb,
        priceLabel: p.priceLabel,
        priceUsd: p.priceUsd,
        type: p.type,
        credits: p.credits,
        entitlement: p.entitlement ?? null,
        highlight: Boolean(p.highlight),
        appleProductId: p.appleProductId,
        googleProductId: p.googleProductId,
      })),
    };
  });

export const createStripeCheckout = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { productId: string; origin: string }) => input)
  .handler(async ({ context, data }) => {
    const product = getProduct(data.productId);
    if (!product) return { ok: false as const, error: "Unknown product" };

    let origin: string;
    try {
      const u = new URL(data.origin);
      if (u.protocol !== "https:" && u.protocol !== "http:") {
        return { ok: false as const, error: "Invalid origin" };
      }
      origin = u.origin;
    } catch {
      return { ok: false as const, error: "Invalid origin" };
    }

    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      return {
        ok: false as const,
        error: "Stripe checkout is not live in this alpha yet.",
      };
    }

    const sql = await getSql();
    await ensureProfile(sql, context.userId);
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(key);

    const session = await stripe.checkout.sessions.create({
      mode: product.type === "subscription" ? "subscription" : "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: product.currency ?? "eur",
            unit_amount: Math.round(product.priceUsd * 100),
            product_data: {
              name: `TEMPLE // WIRED — ${product.name}`,
              description: product.blurb,
            },
            ...(product.type === "subscription"
              ? { recurring: { interval: product.period === "year" ? "year" : "month" } }
              : {}),
          },
        },
      ],
      success_url: `${origin}/shop?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop?status=cancel`,
      client_reference_id: context.userId,
      metadata: {
        userId: context.userId,
        productId: product.id,
      },
      ...(product.type === "subscription"
        ? {
            subscription_data: {
              metadata: {
                userId: context.userId,
                productId: product.id,
              },
            },
          }
        : {}),
    });

    if (!session.url) return { ok: false as const, error: "Stripe did not return a checkout URL" };
    return { ok: true as const, mode: "stripe" as const, url: session.url };
  });

export const confirmStripeSession = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { sessionId: string }) => input)
  .handler(async ({ context, data }) => {
    const sessionId = data.sessionId.trim();
    if (!sessionId.startsWith("cs_")) {
      return { ok: false as const, error: "Invalid checkout session" };
    }
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return { ok: false as const, error: "Stripe checkout is not live in this alpha yet." };

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(key);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const userId = session.metadata?.userId || session.client_reference_id;
    const productId = session.metadata?.productId;
    if (userId !== context.userId || !productId) {
      return { ok: false as const, error: "This payment does not belong to you." };
    }
    if (session.payment_status !== "paid" && session.status !== "complete") {
      return { ok: false as const, error: "Stripe has not marked this payment as paid." };
    }

    const sql = await getSql();
    await ensureProfile(sql, context.userId);
    const result = await fulfillPurchase(sql, context.userId, productId, "stripe", session.id);
    if (!result.ok) return result;
    await logPrayer(sql, context.userId, "response", "shop", `stripe ${productId}`);
    return { ok: true as const, productId };
  });

export const confirmSandboxPurchase = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { productId: string }) => input)
  .handler(async ({ context, data }) => {
    const product = getProduct(data.productId);
    if (!product) return { ok: false as const, error: "Unknown product" };
    if (!sandboxAllowed() || billedByStripe(product)) {
      return { ok: false as const, error: "This amount is billed through Stripe." };
    }
    const sql = await getSql();
    await ensureProfile(sql, context.userId);
    const txn = `sandbox_${context.userId}_${product.id}_${crypto.randomUUID()}`;
    const result = await fulfillPurchase(sql, context.userId, product.id, "sandbox", txn);
    if (!result.ok) return result;
    await logPrayer(sql, context.userId, "response", "shop", `sandbox grant ${product.name}`);
    return { ok: true as const, credits: result.credits, productId: product.id };
  });
