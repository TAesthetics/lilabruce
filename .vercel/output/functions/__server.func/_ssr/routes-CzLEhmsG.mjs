import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as Wordmark } from "./brand-Q_2EG5dj.mjs";
import { T as Crosshair, c as ShoppingBag, f as Search, l as Shield, p as Radio, s as Smartphone } from "../_libs/lucide-react.mjs";
import { t as Button } from "./button-BUJZhIkX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CzLEhmsG.js
var import_jsx_runtime = require_jsx_runtime();
var AGENTS = [
	{
		icon: Search,
		name: "Recon",
		copy: "Surface, OSINT, and an attack map."
	},
	{
		icon: Crosshair,
		name: "Exploit",
		copy: "Likely paths, proof steps, and post-access notes."
	},
	{
		icon: Radio,
		name: "Detect",
		copy: "SIEM, EDR, and time-to-detect."
	},
	{
		icon: Shield,
		name: "Harden",
		copy: "Controls that raise the bar."
	}
];
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative z-10 min-h-dvh bg-bg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center justify-between px-5 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/shop",
						className: "hidden h-10 items-center gap-2 rounded-sm border border-border px-3 font-sans text-[11px] tracking-[0.12em] text-muted uppercase sm:inline-flex hover:border-primary hover:text-primary",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { className: "size-3.5" }), "Shop"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/login",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "primary",
							size: "sm",
							children: "Sign in"
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mx-auto flex max-w-3xl flex-col items-center px-5 pt-10 pb-16 text-center sm:pt-20",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-sans text-[11px] tracking-[0.28em] text-cyan uppercase",
						children: "Purple-team platform"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "mt-3 font-sans text-[clamp(2.4rem,8vw,4.6rem)] leading-[0.95] font-bold tracking-[-0.03em] text-fg",
						children: [
							"Purple team.",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-primary",
								children: "On your phone."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-5 max-w-lg text-[15px] leading-relaxed text-muted",
						children: "TEMPLE // WIRED is the Android app for authorized purple-team work. Pick a target, run Recon, Exploit, Detect, or Harden, then ask the assistant to refine the plan."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex flex-col gap-3 sm:flex-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "/temple-wired.apk",
							download: "temple-wired.apk",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "solid",
								className: "min-w-44",
								children: "Download APK"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/deck",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "primary",
								className: "min-w-44",
								children: "Start a task"
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex flex-wrap items-center justify-center gap-2 text-[10px] tracking-[0.14em] text-faint uppercase",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-sm border border-border px-2 py-1",
								children: "App Store IAP"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-sm border border-border px-2 py-1",
								children: "Google Play Billing"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-sm border border-border px-2 py-1",
								children: "Stripe web"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "mx-auto grid max-w-5xl gap-3 px-5 pb-16 sm:grid-cols-2 lg:grid-cols-4",
				children: AGENTS.map((a) => {
					const Icon = a.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "glow-line rounded-lg border border-border bg-surface p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								className: "size-5 text-primary",
								strokeWidth: 1.6
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-3 font-sans text-sm font-semibold tracking-[0.12em] uppercase",
								children: a.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-[13px] text-muted",
								children: a.copy
							})
						]
					}, a.name);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "mx-auto mb-16 max-w-5xl px-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glow-line flex flex-col gap-6 rounded-xl border border-border bg-surface p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "max-w-md",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-2 inline-flex items-center gap-2 text-cyan",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-sans text-[11px] tracking-[0.16em] uppercase",
									children: "Android"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-sans text-xl font-semibold tracking-tight",
								children: "Android app"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-[13px] leading-relaxed text-muted",
								children: "Download the APK and install it on your phone. Allow installs from this source, then open TEMPLE WIRED."
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-col gap-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "/temple-wired.apk",
							download: "temple-wired.apk",
							className: "inline-flex h-12 items-center justify-center rounded-sm border border-fg bg-fg px-5 font-sans text-[11px] font-semibold tracking-[0.12em] text-bg uppercase",
							children: "Download APK"
						})
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "border-t border-border px-5 py-8 text-center text-[11px] text-faint",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap justify-center gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/privacy",
							className: "hover:text-cyan",
							children: "Privacy"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/terms",
							className: "hover:text-cyan",
							children: "Terms"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/shop",
							className: "hover:text-cyan",
							children: "Shop"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/reel",
							className: "hover:text-cyan",
							children: "Reel"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Authorized testing only." })
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3",
					children: "Authorized security testing. Commercial terms apply."
				})]
			})
		]
	});
}
//#endregion
export { Home as component };
