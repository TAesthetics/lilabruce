import { s as getProduct, u as parseEntitlements } from "./db-BAhP72_9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/grants-CBAuo8s-.js
async function fulfillPurchase(sql, userId, productId, platform, storeTxnId) {
	const product = getProduct(productId);
	if (!product) return {
		ok: false,
		error: "Unknown product"
	};
	if ((await sql`
    select id, status from purchases where store_txn_id = ${storeTxnId} limit 1
  `)[0]?.status === "completed") {
		const row = await sql`
      select credits from profiles where user_id = ${userId}
    `;
		return {
			ok: true,
			credits: Number(row[0]?.credits ?? 0)
		};
	}
	await sql`
    insert into purchases (id, user_id, product_id, platform, store_txn_id, status, credits_granted)
    values (${crypto.randomUUID()}, ${userId}, ${productId}, ${platform}, ${storeTxnId}, 'completed', ${product.credits})
  `;
	if (product.credits > 0) await sql`
      update profiles set credits = credits + ${product.credits} where user_id = ${userId}
    `;
	if (product.entitlement === "pro") {
		const days = product.period === "year" ? 365 : 31;
		const rows = await sql`
      select pro_until from profiles where user_id = ${userId}
    `;
		const current = rows[0]?.pro_until ? Date.parse(rows[0].pro_until) : 0;
		await sql`update profiles set pro_until = ${new Date((Number.isFinite(current) && current > Date.now() ? current : Date.now()) + days * 864e5).toISOString()} where user_id = ${userId}`;
	}
	if (product.entitlement === "kali") {
		const rows = await sql`
      select entitlements from profiles where user_id = ${userId}
    `;
		const current = parseEntitlements(rows[0]?.entitlements);
		if (!current.includes("kali")) await sql`update profiles set entitlements = ${JSON.stringify([...current, "kali"])}::jsonb where user_id = ${userId}`;
	}
	const row = await sql`
    select credits from profiles where user_id = ${userId}
  `;
	return {
		ok: true,
		credits: Number(row[0]?.credits ?? 0)
	};
}
//#endregion
export { fulfillPurchase as t };
