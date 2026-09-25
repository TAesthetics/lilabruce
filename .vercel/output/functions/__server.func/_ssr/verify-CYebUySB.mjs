import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { t as authMiddleware } from "./middleware-Bwsq9YNt.mjs";
import { i as getSql } from "./db-D6L-vCpY.mjs";
import { c as logPrayer, o as ensureProfile, s as getProduct } from "./db-BAhP72_9.mjs";
import { t as fulfillPurchase } from "./grants-CBAuo8s-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/verify-CYebUySB.js
async function verifyAppleReceipt(receipt, nativeId) {
	const secret = process.env.APPLE_SHARED_SECRET;
	if (!secret) return false;
	for (const url of ["https://buy.itunes.apple.com/verifyReceipt", "https://sandbox.itunes.apple.com/verifyReceipt"]) {
		const res = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				"receipt-data": receipt,
				password: secret,
				"exclude-old-transactions": true
			})
		});
		if (!res.ok) continue;
		const body = await res.json();
		if (body.status === 0) {
			if ([...body.latest_receipt_info ?? [], ...body.receipt?.in_app ?? []].some((i) => i.product_id === nativeId)) return true;
		}
		if (body.status === 21007) continue;
	}
	return false;
}
async function verifyGoogleToken(token, nativeId) {
	const access = process.env.GOOGLE_PLAY_ACCESS_TOKEN;
	const pkg = process.env.GOOGLE_PLAY_PACKAGE || "app.templewired.console";
	if (!access) return false;
	const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(pkg)}/purchases/products/${encodeURIComponent(nativeId)}/tokens/${encodeURIComponent(token)}`;
	const res = await fetch(url, { headers: { Authorization: `Bearer ${access}` } });
	if (!res.ok) return false;
	return (await res.json()).purchaseState === 0;
}
var verifyNativePurchase_createServerFn_handler = createServerRpc({
	id: "41629611f23361740a9dc19c9f6a3832ed8386e4fc06d74966fda02409c0d720",
	name: "verifyNativePurchase",
	filename: "src/lib/iap/verify.ts"
}, (opts) => verifyNativePurchase.__executeServer(opts));
var verifyNativePurchase = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(verifyNativePurchase_createServerFn_handler, async ({ context, data }) => {
	const product = getProduct(data.productId);
	if (!product) return {
		ok: false,
		error: "Unknown product"
	};
	const nativeId = data.platform === "ios" ? product.appleProductId : product.googleProductId;
	let valid = false;
	if (data.platform === "ios") valid = await verifyAppleReceipt(data.receipt, nativeId);
	else valid = await verifyGoogleToken(data.receipt, nativeId);
	if (!valid) return {
		ok: false,
		error: data.platform === "ios" ? "Apple could not verify this receipt. Check App Store Connect shared secret." : "Google Play could not verify this purchase token."
	};
	const sql = await getSql();
	await ensureProfile(sql, context.userId);
	const result = await fulfillPurchase(sql, context.userId, product.id, data.platform, data.transactionId);
	if (!result.ok) return result;
	await logPrayer(sql, context.userId, "response", "shop", `${data.platform} grant ${product.name}`);
	return {
		ok: true,
		credits: result.credits,
		productId: product.id
	};
});
var listPurchases_createServerFn_handler = createServerRpc({
	id: "edb6023939a44512250aae60e0c566e1455d7a51d3fa706722119f0692462075",
	name: "listPurchases",
	filename: "src/lib/iap/verify.ts"
}, (opts) => listPurchases.__executeServer(opts));
var listPurchases = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listPurchases_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await ensureProfile(sql, context.userId);
	return sql`
      select id, product_id, platform, status, credits_granted, created_at
      from purchases where user_id = ${context.userId}
      order by created_at desc limit 40
    `;
});
//#endregion
export { listPurchases_createServerFn_handler, verifyNativePurchase_createServerFn_handler };
