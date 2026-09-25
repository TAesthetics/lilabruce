import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as DialogPortal, i as DialogOverlay, n as DialogClose, o as DialogTitle, r as DialogContent$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { n as cn } from "./brand-Q_2EG5dj.mjs";
import { t as X } from "../_libs/lucide-react.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
import { t as authMiddleware } from "./middleware-CpNJlhqp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/fns-CJ_Q5Cng.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Clock() {
	const [now, setNow] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		const tick = () => setNow(formatNow());
		tick();
		const id = window.setInterval(tick, 1e3);
		return () => window.clearInterval(id);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "hidden font-sans text-[12px] tracking-[0.1em] text-cyan tabular-nums sm:inline",
		children: now
	});
}
function formatNow() {
	return (/* @__PURE__ */ new Date()).toLocaleTimeString("en-GB", { hour12: false });
}
var Dialog = Dialog$1;
function DialogContent({ className, children, title, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-50 bg-bg/80 data-[state=open]:animate-in data-[state=closed]:animate-out" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
		className: cn("fixed top-1/2 left-1/2 z-50 w-[min(92vw,440px)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-primary bg-surface shadow-[0_0_48px_color-mix(in_oklab,var(--color-primary)_28%,transparent)] outline-none", className),
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between border-b border-border px-4 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
				className: "font-sans text-[12px] font-semibold tracking-[0.14em] text-primary uppercase",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
				className: "grid size-9 place-items-center rounded-sm border border-border text-muted hover:border-primary hover:text-primary",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "p-4",
			children
		})]
	})] });
}
/** Twenty prompts a day are free in alpha. After that, the monthly payment is required. */
var getSnapshot = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("0ab1718336bd1cfb54e269a02833ac96abe0c0295080a0153ed6973d2f5c96f7"));
var createEngagement = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("a05b0c6e412f026a9bbc5163e7a2bbba888a98d9a91ce14d7355d4066eb7759b"));
var selectEngagement = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("52d017363af97f5487cfa81ee628fb55414cfc557c4b246ad26219a83db8e8db"));
var setTarget = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("db52e5a4d8e8ece4a663f9a6294fb07025d5ae2b3cbeafe5df104cddf4f3963a"));
var setLoopRunning = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("4f18915235c1047f47e68557725cc0cf1fbb6e8f6c12d9e239b6d9471681a388"));
var runAgent = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("6bba4bd4e25c6757f4b0eed3f65f566402edf51c0f498d6639750990d004b7ee"));
var sealCycle = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("6df0d11bc6db498d5bb3db024e15606ca6161c5b34727c5915cf58d635cb2497"));
var runTool = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("cf6410a5f0ed9e758392705de1252fd4d9898542cce871918fbb8f6bb80b2021"));
var runExposure = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("db22e31c339a35d94c91f0da31d991682cba98aa073aa21268a97d7d8d513ff7"));
var askFather = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("13406f0250a9ece1d8ac1415b603d60077440f991aa0e717b742bfb497960887"));
var generateReport = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("9b69c3df150d91018d16599c72c54a05ac07d93db8947d32f2f8696191c03ace"));
var sendFeedback = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("376804450d9024cd2684e14883c36b4b3cd17af753b6750046c13b1cee476694"));
var clearPrayers = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("6488ef2feb25cbcfc0442acb4b82ab09f8b5e38d5a25a3eee883825ce76e321c"));
var deleteAccountData = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("b60238764126e4d38eb7a1feeecce2bcf3573c78a9410d9747bc6fcce7aa0b94"));
//#endregion
export { setTarget as _, clearPrayers as a, generateReport as c, runExposure as d, runTool as f, setLoopRunning as g, sendFeedback as h, askFather as i, getSnapshot as l, selectEngagement as m, Dialog as n, createEngagement as o, sealCycle as p, DialogContent as r, deleteAccountData as s, Clock as t, runAgent as u };
