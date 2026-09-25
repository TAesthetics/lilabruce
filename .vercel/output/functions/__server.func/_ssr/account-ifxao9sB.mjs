import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { r as signOut } from "./client-DUtYoQbQ.mjs";
import { i as useCurrentUser, n as TempleShell, r as UserButton, t as AuthGate } from "./shell-DBfeorn-.mjs";
import { l as getSnapshot, n as Dialog, r as DialogContent, s as deleteAccountData, t as Clock } from "./fns-CUwx76VH.mjs";
import { t as Button } from "./button-BUJZhIkX.mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/account-ifxao9sB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AccountPage() {
	const user = useCurrentUser();
	const snap = useQuery({
		queryKey: ["temple"],
		queryFn: () => getSnapshot()
	});
	const [confirmDelete, setConfirmDelete] = (0, import_react.useState)(false);
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	const profile = snap.data?.profile;
	async function wipe() {
		await deleteAccountData();
		setConfirmDelete(false);
		setSigningOut(true);
		try {
			await signOut("/");
		} catch {
			setSigningOut(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TempleShell, {
		credits: profile?.credits,
		pro: profile?.pro,
		right: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {}),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto w-full max-w-xl px-4 py-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-sans text-[11px] tracking-[0.2em] text-cyan uppercase",
					children: "Workspace"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-sans text-2xl font-semibold tracking-tight",
					children: "Account"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-6 rounded-lg border border-border bg-surface p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-sans text-sm font-semibold",
								children: user?.displayName ?? "Guest"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[12px] text-muted",
								children: user?.primaryEmail
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "mt-4 grid grid-cols-2 gap-3 text-[13px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-sm border border-border bg-bg px-3 py-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-[10px] tracking-[0.12em] text-faint uppercase",
									children: "Credits"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "font-sans text-lg text-cyan tabular-nums",
									children: profile?.credits ?? "—"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-sm border border-border bg-bg px-3 py-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-[10px] tracking-[0.12em] text-faint uppercase",
									children: "Pro"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "font-sans text-lg",
									children: profile?.pro ? "Active" : "Off"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/shop",
							className: "mt-3 inline-block",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "primary",
								size: "sm",
								children: "Open shop"
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-4 rounded-lg border border-border bg-surface p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-sans text-[12px] font-semibold tracking-[0.14em] text-primary uppercase",
							children: "Model"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-[13px] text-muted",
							children: "The model is built into the server. The key is not shown and cannot be changed here."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-[12px] text-faint",
							children: profile?.pro ? "Pro includes prompts." : `${profile?.promptsLeft ?? 20} of 20 free prompts left today. After that, €15 per month.`
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-4 rounded-lg border border-danger/40 bg-surface p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-sans text-[12px] font-semibold tracking-[0.14em] text-danger uppercase",
							children: "Delete my data"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-[13px] text-muted",
							children: "Wipes engagements, activity, purchases, and this profile, then returns you to the console."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "danger",
							className: "mt-3",
							disabled: signingOut,
							onClick: () => setConfirmDelete(true),
							children: "Delete account data"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-6 text-[12px] text-faint",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/privacy",
							className: "hover:text-cyan",
							children: "Privacy"
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
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: confirmDelete,
			onOpenChange: setConfirmDelete,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
				title: "Delete data",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-4 text-[13px] text-muted",
					children: "This cannot be undone. Credits on this workspace will be removed."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "danger",
						onClick: () => void wipe(),
						disabled: signingOut,
						children: "Confirm delete"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: () => setConfirmDelete(false),
						children: "Keep"
					})]
				})]
			})
		})]
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthGate, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountPage, {}) });
//#endregion
export { SplitComponent as component };
