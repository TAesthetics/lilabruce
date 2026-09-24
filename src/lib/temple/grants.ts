import type { Sql } from "@/lib/db";
import { getProduct, type ProductId } from "./catalog";
import { parseEntitlements } from "./db";

export async function fulfillPurchase(
  sql: Sql,
  userId: string,
  productId: string,
  platform: string,
  storeTxnId: string,
): Promise<{ ok: true; credits: number } | { ok: false; error: string }> {
  const product = getProduct(productId);
  if (!product) return { ok: false, error: "Unknown product" };

  const existing = await sql<{ id: string; status: string }>`
    select id, status from purchases where store_txn_id = ${storeTxnId} limit 1
  `;
  if (existing[0]?.status === "completed") {
    const row = await sql<{ credits: number }>`
      select credits from profiles where user_id = ${userId}
    `;
    return { ok: true, credits: Number(row[0]?.credits ?? 0) };
  }

  const id = crypto.randomUUID();
  await sql`
    insert into purchases (id, user_id, product_id, platform, store_txn_id, status, credits_granted)
    values (${id}, ${userId}, ${productId}, ${platform}, ${storeTxnId}, 'completed', ${product.credits})
  `;

  if (product.credits > 0) {
    await sql`
      update profiles set credits = credits + ${product.credits} where user_id = ${userId}
    `;
  }

  if (product.entitlement === "pro") {
    const days = product.period === "year" ? 365 : 31;
    const rows = await sql<{ pro_until: string | null }>`
      select pro_until from profiles where user_id = ${userId}
    `;
    const current = rows[0]?.pro_until ? Date.parse(rows[0].pro_until) : 0;
    const base = Number.isFinite(current) && current > Date.now() ? current : Date.now();
    const until = new Date(base + days * 86_400_000).toISOString();
    await sql`update profiles set pro_until = ${until} where user_id = ${userId}`;
  }

  if (product.entitlement === "kali") {
    const rows = await sql<{ entitlements: unknown }>`
      select entitlements from profiles where user_id = ${userId}
    `;
    const current = parseEntitlements(rows[0]?.entitlements);
    if (!current.includes("kali")) {
      const next = JSON.stringify([...current, "kali"]);
      await sql`update profiles set entitlements = ${next}::jsonb where user_id = ${userId}`;
    }
  }

  const row = await sql<{ credits: number }>`
    select credits from profiles where user_id = ${userId}
  `;
  return { ok: true, credits: Number(row[0]?.credits ?? 0) };
}

export function assertProductId(id: string): ProductId {
  const p = getProduct(id);
  if (!p) throw new Error("Unknown product");
  return p.id;
}
