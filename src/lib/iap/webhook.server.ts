import { getSql } from "@/lib/db";
import { ensureProfile } from "@/lib/temple/db";
import { fulfillPurchase } from "@/lib/temple/grants";

export async function handleStripeWebhook(rawBody: string, signature: string | null) {
  const key = process.env.STRIPE_SECRET_KEY;
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!key || !secret) {
    return new Response("Stripe webhook not configured", { status: 501 });
  }
  if (!signature) return new Response("Missing signature", { status: 400 });

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(key);

  let event: { type: string; data: { object: unknown } };
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as {
      id: string;
      metadata?: { userId?: string; productId?: string };
      client_reference_id?: string | null;
    };
    const userId = session.metadata?.userId || session.client_reference_id;
    const productId = session.metadata?.productId;
    if (userId && productId) {
      const sql = await getSql();
      await ensureProfile(sql, userId);
      await fulfillPurchase(sql, userId, productId, "stripe", session.id);
    }
  }

  if (event.type === "invoice.paid") {
    const invoice = event.data.object as {
      id: string;
      billing_reason?: string | null;
      parent?: { subscription_details?: { metadata?: { userId?: string; productId?: string } } };
    };
    if (invoice.billing_reason !== "subscription_cycle") {
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }
    const meta = invoice.parent?.subscription_details?.metadata;
    const userId = meta?.userId;
    const productId = meta?.productId;
    if (userId && productId) {
      const sql = await getSql();
      await ensureProfile(sql, userId);
      await fulfillPurchase(sql, userId, productId, "stripe", `invoice_${invoice.id}`);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
