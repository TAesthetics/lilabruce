import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as Wordmark } from "./brand-Q_2EG5dj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/privacy-BGkUFEXA.js
var import_jsx_runtime = require_jsx_runtime();
function Privacy() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative z-10 mx-auto min-h-dvh max-w-2xl px-5 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-8 font-sans text-3xl font-semibold",
				children: "Privacy Policy"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-[13px] text-muted",
				children: "Last updated 31 August 2026"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 space-y-4 text-[14px] leading-relaxed text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "TEMPLE // WIRED is a purple-team console. We collect the minimum needed to run the workspace, engagements, and purchases." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-sans text-base font-semibold text-fg",
						children: "What we store"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "list-disc space-y-1 pl-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Account identity from Google, X, or email (name, email, user id)." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Engagements, agent output, and feedback you submit." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Purchase records (product, platform, transaction id, credits granted)." })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-sans text-base font-semibold text-fg",
						children: "Payments"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Web payments are processed by Stripe. iOS in-app purchases are processed by Apple. Android in-app purchases are processed by Google Play. We do not receive or store full card numbers. Receipts are verified server-side to grant credits and entitlements." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-sans text-base font-semibold text-fg",
						children: "AI processing"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Agent, tool, report, and chat prompts are sent to the built-in model. The key stays on the server. Do not paste secrets you are not allowed to share with that processor." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-sans text-base font-semibold text-fg",
						children: "Your rights"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "You may export nothing more than what is on screen, and you may delete your workspace data from Account → Delete my data. That control exists to satisfy Apple App Store Guideline 5.1.1(v)." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-sans text-base font-semibold text-fg",
						children: "Contact"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Privacy requests: operator@templewired.app (replace with your support inbox before store submission)." })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-8 text-[12px] text-faint",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "hover:text-cyan",
						children: "Home"
					}),
					" · ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/terms",
						className: "hover:text-cyan",
						children: "Terms"
					})
				]
			})
		]
	});
}
//#endregion
export { Privacy as component };
