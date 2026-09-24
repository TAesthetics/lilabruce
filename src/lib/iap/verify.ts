import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { getProduct } from "@/lib/temple/catalog";
import { ensureProfile, logPrayer } from "@/lib/temple/db";
import { fulfillPurchase } from "@/lib/temple/grants";

async function verifyAppleReceipt(receipt: string, nativeId: string): Promise<boolean> {
  const secret = process.env.APPLE_SHARED_SECRET;
  if (!secret) return false;
  const endpoints = [
    "https://buy.itunes.apple.com/verifyReceipt",
    "https://sandbox.itunes.apple.com/verifyReceipt",
  ];
  for (const url of endpoints) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ "receipt-data": receipt, password: secret, "exclude-old-transactions": true }),
    });
    if (!res.ok) continue;
    const body = (await res.json()) as {
      status?: number;
      receipt?: { in_app?: { product_id?: string }[] };
      latest_receipt_info?: { product_id?: string }[];
    };
    if (body.status === 0) {
      const items = [
        ...(body.latest_receipt_info ?? []),
        ...(body.receipt?.in_app ?? []),
      ];
      if (items.some((i) => i.product_id === nativeId)) return true;
    }
    if (body.status === 21007) continue;
  }
  return false;
}

async function verifyGoogleToken(token: string, nativeId: string): Promise<boolean> {
  const access = process.env.GOOGLE_PLAY_ACCESS_TOKEN;
  const pkg = process.env.GOOGLE_PLAY_PACKAGE || "app.templewired.console";
  if (!access) return false;
  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(pkg)}/purchases/products/${encodeURIComponent(nativeId)}/tokens/${encodeURIComponent(token)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${access}` } });
  if (!res.ok) return false;
  const body = (await res.json()) as { purchaseState?: number };
  return body.purchaseState === 0;
}

export const verifyNativePurchase = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      platform: "ios" | "android";
      productId: string;
      transactionId: string;
      receipt: string;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const product = getProduct(data.productId);
    if (!product) return { ok: false as const, error: "Unknown product" };
    const nativeId =
      data.platform === "ios" ? product.appleProductId : product.googleProductId;

    let valid = false;
    if (data.platform === "ios") {
      valid = await verifyAppleReceipt(data.receipt, nativeId);
    } else {
      valid = await verifyGoogleToken(data.receipt, nativeId);
    }

    if (!valid) {
      return {
        ok: false as const,
        error:
          data.platform === "ios"
            ? "Apple could not verify this receipt. Check App Store Connect shared secret."
            : "Google Play could not verify this purchase token.",
      };
    }

    const sql = await getSql();
    await ensureProfile(sql, context.userId);
    const result = await fulfillPurchase(
      sql,
      context.userId,
      product.id,
      data.platform,
      data.transactionId,
    );
    if (!result.ok) return result;
    await logPrayer(sql, context.userId, "response", "shop", `${data.platform} grant ${product.name}`);
    return { ok: true as const, credits: result.credits, productId: product.id };
  });

export const listPurchases = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await ensureProfile(sql, context.userId);
    return sql<{
      id: string;
      product_id: string;
      platform: string;
      status: string;
      credits_granted: number;
      created_at: string;
    }>`
      select id, product_id, platform, status, credits_granted, created_at
      from purchases where user_id = ${context.userId}
      order by created_at desc limit 40
    `;
  });
