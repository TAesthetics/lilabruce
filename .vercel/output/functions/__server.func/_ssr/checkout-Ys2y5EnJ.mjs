import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { t as authMiddleware } from "./middleware-CpNJlhqp.mjs";
import { i as getSql, t as dbSource } from "./db-D6L-vCpY.mjs";
import { a as billedByStripe, c as logPrayer, o as ensureProfile, s as getProduct, t as CATALOG } from "./db-BAhP72_9.mjs";
import { t as fulfillPurchase } from "./grants-CBAuo8s-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/checkout-Ys2y5EnJ.js
function stripeConfigured() {
	return Boolean(process.env.STRIPE_SECRET_KEY);
}
function sandboxAllowed() {
	return !process.env.STRIPE_SECRET_KEY && dbSource === "pglite";
}
var getPayConfig_createServerFn_handler = createServerRpc({
	id: "5d66e64354c53df9e16bc9a77bc003018baae21d1f6032b5290e7c197aae070e",
	name: "getPayConfig",
	filename: "src/lib/iap/checkout.ts"
}, (opts) => getPayConfig.__executeServer(opts));
var getPayConfig = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getPayConfig_createServerFn_handler, async () => {
	return {
		stripe: stripeConfigured(),
		sandbox: sandboxAllowed(),
		stripeMinimumUsd: 15,
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
			googleProductId: p.googleProductId
		}))
	};
});
var createStripeCheckout_createServerFn_handler = createServerRpc({
	id: "a1547e1cca6efdcfce967cb6c05dc1a8e9a64c0c5e2a4a3bf9938031506037c8",
	name: "createStripeCheckout",
	filename: "src/lib/iap/checkout.ts"
}, (opts) => createStripeCheckout.__executeServer(opts));
var createStripeCheckout = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createStripeCheckout_createServerFn_handler, async ({ context, data }) => {
	const product = getProduct(data.productId);
	if (!product) return {
		ok: false,
		error: "Unknown product"
	};
	let origin;
	try {
		const u = new URL(data.origin);
		if (u.protocol !== "https:" && u.protocol !== "http:") return {
			ok: false,
			error: "Invalid origin"
		};
		origin = u.origin;
	} catch {
		return {
			ok: false,
			error: "Invalid origin"
		};
	}
	const key = process.env.STRIPE_SECRET_KEY;
	if (!key) return {
		ok: false,
		error: "Stripe checkout is not live in this alpha yet."
	};
	const sql = await getSql();
	await ensureProfile(sql, context.userId);
	const Stripe = (await import("../_libs/stripe.mjs").then((n) => n.t)).default;
	const session = await new Stripe(key).checkout.sessions.create({
		mode: product.type === "subscription" ? "subscription" : "payment",
		line_items: [{
			quantity: 1,
			price_data: {
				currency: product.currency ?? "eur",
				unit_amount: Math.round(product.priceUsd * 100),
				product_data: {
					name: `TEMPLE // WIRED — ${product.name}`,
					description: product.blurb
				},
				...product.type === "subscription" ? { recurring: { interval: product.period === "year" ? "year" : "month" } } : {}
			}
		}],
		success_url: `${origin}/shop?status=success&session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${origin}/shop?status=cancel`,
		client_reference_id: context.userId,
		metadata: {
			userId: context.userId,
			productId: product.id
		},
		...product.type === "subscription" ? { subscription_data: { metadata: {
			userId: context.userId,
			productId: product.id
		} } } : {}
	});
	if (!session.url) return {
		ok: false,
		error: "Stripe did not return a checkout URL"
	};
	return {
		ok: true,
		mode: "stripe",
		url: session.url
	};
});
var confirmStripeSession_createServerFn_handler = createServerRpc({
	id: "978783467bf5494824dc095dba74d72bd0ab850758bfd282593568b15b20f220",
	name: "confirmStripeSession",
	filename: "src/lib/iap/checkout.ts"
}, (opts) => confirmStripeSession.__executeServer(opts));
var confirmStripeSession = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(confirmStripeSession_createServerFn_handler, async ({ context, data }) => {
	const sessionId = data.sessionId.trim();
	if (!sessionId.startsWith("cs_")) return {
		ok: false,
		error: "Invalid checkout session"
	};
	const key = process.env.STRIPE_SECRET_KEY;
	if (!key) return {
		ok: false,
		error: "Stripe checkout is not live in this alpha yet."
	};
	const Stripe = (await import("../_libs/stripe.mjs").then((n) => n.t)).default;
	const session = await new Stripe(key).checkout.sessions.retrieve(sessionId);
	const userId = session.metadata?.userId || session.client_reference_id;
	const productId = session.metadata?.productId;
	if (userId !== context.userId || !productId) return {
		ok: false,
		error: "This payment does not belong to you."
	};
	if (session.payment_status !== "paid" && session.status !== "complete") return {
		ok: false,
		error: "Stripe has not marked this payment as paid."
	};
	const sql = await getSql();
	await ensureProfile(sql, context.userId);
	const result = await fulfillPurchase(sql, context.userId, productId, "stripe", session.id);
	if (!result.ok) return result;
	await logPrayer(sql, context.userId, "response", "shop", `stripe ${productId}`);
	return {
		ok: true,
		productId
	};
});
var confirmSandboxPurchase_createServerFn_handler = createServerRpc({
	id: "9309504245d17396a3dfe737cf128f138b4f99714d9ad75ee43640bbee01eb17",
	name: "confirmSandboxPurchase",
	filename: "src/lib/iap/checkout.ts"
}, (opts) => confirmSandboxPurchase.__executeServer(opts));
var confirmSandboxPurchase = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(confirmSandboxPurchase_createServerFn_handler, async ({ context, data }) => {
	const product = getProduct(data.productId);
	if (!product) return {
		ok: false,
		error: "Unknown product"
	};
	if (!sandboxAllowed() || billedByStripe(product)) return {
		ok: false,
		error: "This amount is billed through Stripe."
	};
	const sql = await getSql();
	await ensureProfile(sql, context.userId);
	const txn = `sandbox_${context.userId}_${product.id}_${crypto.randomUUID()}`;
	const result = await fulfillPurchase(sql, context.userId, product.id, "sandbox", txn);
	if (!result.ok) return result;
	await logPrayer(sql, context.userId, "response", "shop", `sandbox grant ${product.name}`);
	return {
		ok: true,
		credits: result.credits,
		productId: product.id
	};
});
//#endregion
export { confirmSandboxPurchase_createServerFn_handler, confirmStripeSession_createServerFn_handler, createStripeCheckout_createServerFn_handler, getPayConfig_createServerFn_handler };
