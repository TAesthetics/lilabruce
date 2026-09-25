import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as useRouter, _ as createRootRoute, g as createFileRoute, h as lazyRouteComponent, l as Scripts, m as Outlet, p as createRouter, u as HeadContent } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { r as createServerFn, s as __exportAll } from "./ssr.mjs";
import { L as string, N as number, P as object, R as union, j as literal } from "../_libs/@better-auth/core+[...].mjs";
import { a as TriangleAlert } from "../_libs/lucide-react.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
import { n as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { i as getSql } from "./db-D6L-vCpY.mjs";
import { o as ensureProfile } from "./db-BAhP72_9.mjs";
import { t as fulfillPurchase } from "./grants-CBAuo8s-.mjs";
import { t as auth } from "./server-Ejb1kaUK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-DiohSlMo.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 bg-bg px-6 text-center text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-danger",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-sans text-lg font-semibold tracking-wide",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md font-mono text-sm break-words text-muted",
				children: error.message || "An unexpected error occurred. Try reloading the page."
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	if (typeof window === "undefined") return () => {};
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	const parentOrigin = resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		if (envelope.data.type === "hello") {
			if (!HelloSchema.safeParse(event.data).success) return;
			announce();
			return;
		}
		if (envelope.data.type === "navigate") {
			const parsed = NavigateSchema.safeParse(event.data);
			if (!parsed.success) return;
			navigate(parsed.data.path);
			queueMicrotask(reportLocation);
			return;
		}
		if (envelope.data.type === "history") {
			const parsed = HistorySchema.safeParse(event.data);
			if (!parsed.success) return;
			if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
			window.history.go(parsed.data.delta);
		}
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var styles_default = "/assets/styles-Bo90dao6.css";
var APP_NAME = "TEMPLE // WIRED";
var fetchSessionUser = createServerFn({ method: "GET" }).handler(createSsrRpc("2c4985e96c199268f7f639534cb5e8e31d6b19d43286bf77416413db60ffde26"));
var Route$12 = createRootRoute({
	beforeLoad: async () => ({ sessionUser: await fetchSessionUser() }),
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "theme-color",
				content: "#0b0c0e"
			},
			{
				name: "description",
				content: "TEMPLE // WIRED — purple-team console. Recon, exploit, detect, harden."
			},
			{
				name: "apple-mobile-web-app-capable",
				content: "yes"
			},
			{
				name: "apple-mobile-web-app-status-bar-style",
				content: "black-translucent"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@500;600;700&display=swap"
			}
		]
	}),
	component: RootDocument
});
function Providers({ children }) {
	const [client] = (0, import_react.useState)(() => new QueryClient({ defaultOptions: { queries: {
		refetchOnWindowFocus: false,
		retry: 1
	} } }));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client,
		children
	});
}
function AndroidChrome() {
	(0, import_react.useEffect)(() => {
		let remove = () => {};
		let cancelled = false;
		(async () => {
			const { Capacitor } = await import("../_libs/capacitor__app+capacitor__core.mjs").then((n) => n.n);
			if (cancelled || !Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") return;
			const { StatusBar, Style } = await import("../_libs/capacitor__status-bar.mjs").then((n) => n.t);
			const { App } = await import("../_libs/capacitor__app+capacitor__core.mjs").then((n) => n.t);
			await StatusBar.setBackgroundColor({ color: "#0b0c0e" }).catch(() => {});
			await StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
			const handle = await App.addListener("backButton", () => {
				if (window.history.length > 1) window.history.back();
				else App.exitApp();
			});
			remove = () => void handle.remove();
		})();
		return () => {
			cancelled = true;
			remove();
		};
	}, []);
	return null;
}
function RootDocument() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		className: "antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", {
			className: "bg-bg text-fg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AndroidChrome, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Providers, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
			]
		})]
	});
}
var $$splitComponentImporter$9 = () => import("./routes-CzLEhmsG.mjs");
var Route$11 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$9, "component") });
var $$splitComponentImporter$8 = () => import("./account-CBS0kD7q.mjs");
var Route$10 = createFileRoute("/account")({ component: lazyRouteComponent($$splitComponentImporter$8, "component") });
var $$splitComponentImporter$7 = () => import("./deck-B2BoU3v9.mjs");
var Route$9 = createFileRoute("/deck")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
var $$splitComponentImporter$6 = () => import("./login-BJYW-3qP.mjs");
var Route$8 = createFileRoute("/login")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
var $$splitComponentImporter$5 = () => import("./map-tUy1u-A6.mjs");
var Route$7 = createFileRoute("/map")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("./privacy-BGkUFEXA.mjs");
var Route$6 = createFileRoute("/privacy")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./reel-1gEoaVkP.mjs");
var Route$5 = createFileRoute("/reel")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./reset-password-DkO_UT1B.mjs");
var Route$4 = createFileRoute("/reset-password")({
	validateSearch: (search) => ({
		token: typeof search.token === "string" ? search.token : void 0,
		error: typeof search.error === "string" ? search.error : void 0
	}),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./shop-fhzMYolS.mjs");
var Route$3 = createFileRoute("/shop")({
	validateSearch: (search) => ({
		status: search.status === "success" || search.status === "cancel" ? search.status : void 0,
		session_id: typeof search.session_id === "string" ? search.session_id : void 0
	}),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./terms-CGXCrEcM.mjs");
var Route$2 = createFileRoute("/terms")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var Route$1 = createFileRoute("/api/auth/$")({ server: { handlers: {
	GET: ({ request }) => auth.handler(request),
	POST: ({ request }) => auth.handler(request)
} } });
async function handleStripeWebhook(rawBody, signature) {
	const key = process.env.STRIPE_SECRET_KEY;
	const secret = process.env.STRIPE_WEBHOOK_SECRET;
	if (!key || !secret) return new Response("Stripe webhook not configured", { status: 501 });
	if (!signature) return new Response("Missing signature", { status: 400 });
	const Stripe = (await import("../_libs/stripe.mjs").then((n) => n.t)).default;
	const stripe = new Stripe(key);
	let event;
	try {
		event = stripe.webhooks.constructEvent(rawBody, signature, secret);
	} catch {
		return new Response("Invalid signature", { status: 400 });
	}
	if (event.type === "checkout.session.completed") {
		const session = event.data.object;
		const userId = session.metadata?.userId || session.client_reference_id;
		const productId = session.metadata?.productId;
		if (userId && productId) {
			const sql = await getSql();
			await ensureProfile(sql, userId);
			await fulfillPurchase(sql, userId, productId, "stripe", session.id);
		}
	}
	if (event.type === "invoice.paid") {
		const invoice = event.data.object;
		if (invoice.billing_reason !== "subscription_cycle") return new Response(JSON.stringify({ received: true }), {
			status: 200,
			headers: { "content-type": "application/json" }
		});
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
		headers: { "content-type": "application/json" }
	});
}
var Route = createFileRoute("/api/stripe/webhook")({ server: { handlers: { POST: async ({ request }) => {
	return handleStripeWebhook(await request.text(), request.headers.get("stripe-signature"));
} } } });
var rootRouteChildren = {
	IndexRoute: Route$11.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$12
	}),
	AccountRoute: Route$10.update({
		id: "/account",
		path: "/account",
		getParentRoute: () => Route$12
	}),
	DeckRoute: Route$9.update({
		id: "/deck",
		path: "/deck",
		getParentRoute: () => Route$12
	}),
	LoginRoute: Route$8.update({
		id: "/login",
		path: "/login",
		getParentRoute: () => Route$12
	}),
	MapRoute: Route$7.update({
		id: "/map",
		path: "/map",
		getParentRoute: () => Route$12
	}),
	PrivacyRoute: Route$6.update({
		id: "/privacy",
		path: "/privacy",
		getParentRoute: () => Route$12
	}),
	ReelRoute: Route$5.update({
		id: "/reel",
		path: "/reel",
		getParentRoute: () => Route$12
	}),
	ResetPasswordRoute: Route$4.update({
		id: "/reset-password",
		path: "/reset-password",
		getParentRoute: () => Route$12
	}),
	ShopRoute: Route$3.update({
		id: "/shop",
		path: "/shop",
		getParentRoute: () => Route$12
	}),
	TermsRoute: Route$2.update({
		id: "/terms",
		path: "/terms",
		getParentRoute: () => Route$12
	}),
	ApiAuthSplatRoute: Route$1.update({
		id: "/api/auth/$",
		path: "/api/auth/$",
		getParentRoute: () => Route$12
	}),
	ApiStripeWebhookRoute: Route.update({
		id: "/api/stripe/webhook",
		path: "/api/stripe/webhook",
		getParentRoute: () => Route$12
	})
};
var routeTree = Route$12._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { Route$4 as n, router_exports as t };
