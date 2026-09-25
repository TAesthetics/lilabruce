import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { x as useSearch } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { r as createServerFn } from "./ssr.mjs";
import { n as cn } from "./brand-Q_2EG5dj.mjs";
import { n as TempleShell, t as AuthGate } from "./shell-DBfeorn-.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
import { t as authMiddleware } from "./middleware-Bwsq9YNt.mjs";
import { l as getSnapshot, n as Dialog, r as DialogContent, t as Clock } from "./fns-CUwx76VH.mjs";
import { t as Button } from "./button-BUJZhIkX.mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as billedByStripe, l as nativeProductId, s as getProduct, t as CATALOG } from "./db-BAhP72_9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shop-BkkC4jn8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function capacitor() {
	if (typeof window === "undefined") return void 0;
	return window.Capacitor;
}
function detectStorePlatform() {
	const cap = capacitor();
	if (cap?.isNativePlatform?.()) {
		const p = cap.getPlatform?.();
		if (p === "ios") return "ios";
		if (p === "android") return "android";
	}
	return "web";
}
function payMethodLabel(platform) {
	if (platform === "ios") return "Apple";
	if (platform === "android") return "Google Play";
	return "Stripe";
}
function payMethodBlurb(platform) {
	if (platform === "ios") return "In-app purchases are billed through Apple. Subscriptions renew until cancelled in Settings.";
	if (platform === "android") return "In-app purchases are billed through Google Play. Manage subscriptions in Play Store.";
	return "Alpha includes 20 prompts a day and the lab checks. After that, the month is €15.";
}
function nativeIdFor(productId, platform) {
	const product = CATALOG.find((p) => p.id === productId);
	if (!product) throw new Error("Unknown product");
	return nativeProductId(product, platform);
}
async function purchaseViaDigitalGoods(productId) {
	if (typeof window === "undefined" || !window.getDigitalGoodsService) return null;
	const service = await window.getDigitalGoodsService("https://play.google.com/billing");
	const nativeId = nativeIdFor(productId, "android");
	const details = await service.getDetails([nativeId]);
	if (!details[0]) throw new Error("Google Play product not found");
	const response = await new PaymentRequest([{
		supportedMethods: "https://play.google.com/billing",
		data: { sku: nativeId }
	}], { total: {
		label: "Total",
		amount: {
			currency: details[0].price.currency,
			value: details[0].price.value
		}
	} }).show();
	const data = response.details;
	await response.complete("success");
	const token = data?.purchaseToken;
	if (!token) throw new Error("Google Play returned no purchase token");
	try {
		await service.acknowledge([token]);
	} catch {}
	return {
		platform: "android",
		productId,
		nativeId,
		transactionId: token,
		receipt: token
	};
}
function capacitorIap() {
	if (typeof window === "undefined") return null;
	const cap = window.Capacitor;
	return cap?.Plugins?.InAppPurchase2 ?? cap?.Plugins?.Purchases ?? null;
}
async function nativePurchase(productId) {
	const platform = detectStorePlatform();
	if (platform !== "ios" && platform !== "android") throw new Error("Native billing is only available in the App Store and Play Store builds.");
	const digital = platform === "android" ? await purchaseViaDigitalGoods(productId).catch(() => null) : null;
	if (digital) return digital;
	const plugin = capacitorIap();
	const nativeId = nativeIdFor(productId, platform);
	if (!plugin?.purchaseProduct) throw new Error(platform === "ios" ? "Apple In-App Purchase is available in the App Store build of TEMPLE // WIRED." : "Google Play Billing is available in the Play Store build of TEMPLE // WIRED.");
	const result = await plugin.purchaseProduct({ productId: nativeId });
	const transactionId = result.transactionId || result.transactionIdentifier || result.purchaseToken;
	const receipt = result.receipt || result.purchaseToken || transactionId;
	if (!transactionId || !receipt) throw new Error("Store returned an empty receipt");
	return {
		platform,
		productId,
		nativeId,
		transactionId,
		receipt
	};
}
async function nativeRestore() {
	const platform = detectStorePlatform();
	if (platform !== "ios" && platform !== "android") return [];
	const plugin = capacitorIap();
	if (!plugin?.restorePurchases) return [];
	const bag = await plugin.restorePurchases();
	const out = [];
	for (const p of bag.purchases ?? []) {
		const match = CATALOG.find((c) => c.appleProductId === p.productId || c.googleProductId === p.productId);
		if (!match) continue;
		const transactionId = p.transactionId || p.purchaseToken;
		const receipt = p.receipt || p.purchaseToken || transactionId;
		if (!transactionId || !receipt) continue;
		out.push({
			platform,
			productId: match.id,
			nativeId: p.productId,
			transactionId,
			receipt
		});
	}
	return out;
}
var getPayConfig = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("5d66e64354c53df9e16bc9a77bc003018baae21d1f6032b5290e7c197aae070e"));
var createStripeCheckout = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("a1547e1cca6efdcfce967cb6c05dc1a8e9a64c0c5e2a4a3bf9938031506037c8"));
var confirmStripeSession = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("978783467bf5494824dc095dba74d72bd0ab850758bfd282593568b15b20f220"));
var confirmSandboxPurchase = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("9309504245d17396a3dfe737cf128f138b4f99714d9ad75ee43640bbee01eb17"));
var verifyNativePurchase = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("41629611f23361740a9dc19c9f6a3832ed8386e4fc06d74966fda02409c0d720"));
var listPurchases = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("edb6023939a44512250aae60e0c566e1455d7a51d3fa706722119f0692462075"));
function ShopGrid({ platform, sandbox, stripe, ownedKali, pro, onPurchased }) {
	const [busy, setBusy] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	const [sandboxId, setSandboxId] = (0, import_react.useState)(null);
	const till = payMethodLabel(platform);
	async function buy(productId) {
		setError("");
		setBusy(productId);
		try {
			if (platform === "web") {
				const res = await createStripeCheckout({ data: {
					productId,
					origin: window.location.origin
				} });
				if (!res.ok) throw new Error(res.error);
				if (res.mode === "stripe") {
					window.location.href = res.url;
					return;
				}
				setSandboxId(productId);
				return;
			}
			const receipt = await nativePurchase(productId);
			const verified = await verifyNativePurchase({ data: {
				platform: receipt.platform,
				productId: receipt.productId,
				transactionId: receipt.transactionId,
				receipt: receipt.receipt
			} });
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-4 text-[13px] text-muted",
			children: payMethodBlurb(platform)
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
			children: CATALOG.map((p) => {
				const proOwned = p.entitlement === "pro" && pro && p.period === "month";
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: cn("glow-line flex flex-col rounded-lg border bg-surface p-4", p.highlight ? "border-primary" : "border-border"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-sans text-sm font-semibold tracking-[0.08em] uppercase",
								children: p.name
							}), p.highlight ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-sm border border-primary px-1.5 py-0.5 font-sans text-[9px] tracking-[0.12em] text-primary",
								children: "Featured"
							}) : null]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 flex-1 text-[13px] text-muted",
							children: p.blurb
						}),
						p.credits > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 font-sans text-[11px] tracking-[0.1em] text-cyan tabular-nums",
							children: [
								"+",
								p.credits,
								" CR"
							]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-sans text-[10px] tracking-[0.12em] text-faint uppercase",
							children: platform === "web" && billedByStripe(p) ? "Stripe" : platform === "web" ? "Account" : till
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-sans text-sm font-semibold tabular-nums",
								children: p.priceLabel
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: p.highlight ? "solid" : "primary",
								size: "sm",
								disabled: busy === p.id || proOwned,
								onClick: () => void buy(p.id),
								children: proOwned ? "Owned" : busy === p.id ? "…" : platform === "web" ? "Pay with Stripe" : `Buy · ${till}`
							})]
						})
					]
				}, p.id);
			})
		}),
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 text-sm text-danger",
			children: error
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: Boolean(sandboxId),
			onOpenChange: (o) => !o && setSandboxId(null),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
				title: "Sandbox checkout",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mb-4 text-[13px] text-muted",
					children: [
						"Preview grant for",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-fg",
							children: CATALOG.find((p) => p.id === sandboxId)?.name
						}),
						". No card is charged here. Live web uses Stripe; store binaries use Apple / Google."
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "solid",
						onClick: () => void confirmSandbox(),
						disabled: Boolean(busy),
						children: "Grant"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: () => setSandboxId(null),
						children: "Cancel"
					})]
				})]
			})
		})
	] });
}
function ShopPage() {
	const { status, session_id } = useSearch({ from: "/shop" });
	const [paidNote, setPaidNote] = (0, import_react.useState)("");
	const platform = (0, import_react.useMemo)(() => detectStorePlatform(), []);
	const snap = useQuery({
		queryKey: ["temple"],
		queryFn: () => getSnapshot()
	});
	const pay = useQuery({
		queryKey: ["pay-config"],
		queryFn: () => getPayConfig()
	});
	const purchases = useQuery({
		queryKey: ["purchases"],
		queryFn: () => listPurchases()
	});
	(0, import_react.useEffect)(() => {
		if (!session_id) return;
		let cancel = false;
		confirmStripeSession({ data: { sessionId: session_id } }).then((res) => {
			if (cancel) return;
			setPaidNote(res.ok ? "Payment received. The month is active." : res.error);
			snap.refetch();
			purchases.refetch();
		});
		return () => {
			cancel = true;
		};
	}, [session_id]);
	async function restore() {
		const bag = await nativeRestore();
		for (const item of bag) await verifyNativePurchase({ data: {
			platform: item.platform,
			productId: item.productId,
			transactionId: item.transactionId,
			receipt: item.receipt
		} });
		await Promise.all([snap.refetch(), purchases.refetch()]);
	}
	const profile = snap.data?.profile;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TempleShell, {
		credits: profile?.credits,
		pro: profile?.pro,
		right: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto w-full max-w-5xl px-4 py-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-sans text-[11px] tracking-[0.2em] text-cyan uppercase",
					children: "After 20 prompts"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-sans text-2xl font-semibold tracking-tight",
					children: "Pay"
				}),
				status === "success" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 rounded-sm border border-ok/50 px-3 py-2 text-[13px] text-ok",
					children: paidNote || "Checking the Stripe payment…"
				}) : null,
				status === "cancel" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 rounded-sm border border-border px-3 py-2 text-[13px] text-muted",
					children: "Checkout cancelled. Nothing was billed."
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: pay.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShopGrid, {
						platform,
						sandbox: pay.data.sandbox,
						stripe: pay.data.stripe,
						ownedKali: Boolean(profile?.entitlements.includes("kali")) || Boolean(profile?.pro),
						pro: Boolean(profile?.pro),
						onPurchased: () => {
							snap.refetch();
							purchases.refetch();
						}
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
						children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-40 animate-pulse rounded-lg bg-elevated" }, i))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 flex flex-wrap items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: () => void restore(),
						children: "Restore purchases"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[12px] text-faint",
						children: "Apple requires restore. Google Play restores owned non-consumables automatically."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-10",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-sans text-sm font-semibold tracking-[0.12em] uppercase",
						children: "Invoices"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 divide-y divide-border rounded-lg border border-border",
						children: (purchases.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "px-4 py-6 text-[13px] text-muted",
							children: "No purchases yet."
						}) : (purchases.data ?? []).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3 px-4 py-3 text-[13px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-fg",
								children: getProduct(p.product_id)?.name ?? p.product_id
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-[11px] text-faint uppercase",
								children: [
									p.platform,
									" · ",
									p.status
								]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-cyan tabular-nums",
								children: p.credits_granted ? `+${p.credits_granted}` : "—"
							})]
						}, p.id))
					})]
				})
			]
		})
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthGate, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShopPage, {}) });
//#endregion
export { SplitComponent as component };
