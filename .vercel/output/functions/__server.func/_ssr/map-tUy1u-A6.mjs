import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { r as createServerFn } from "./ssr.mjs";
import { n as TempleShell, t as AuthGate } from "./shell-DBfeorn-.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
import { t as authMiddleware } from "./middleware-CpNJlhqp.mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/map-tUy1u-A6.js
var import_jsx_runtime = require_jsx_runtime();
/** Map for the signed-in operator, built from saved findings. */
var getUserMap = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("a4976606cf29bdc42219c4905214060cb3704c5d2f121378703c483264486fee"));
function MapPage() {
	const data = useQuery({
		queryKey: ["netmap"],
		queryFn: () => getUserMap()
	}).data;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TempleShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-3xl px-4 py-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-sans text-[11px] tracking-[0.2em] text-cyan uppercase",
				children: "From saved findings"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-1 font-sans text-2xl font-semibold tracking-tight",
				children: "Network map"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-[13px] text-muted",
				children: data ? `${data.attackSurface.exposedServices} hosts · ${data.attackSurface.vulnerableHosts} high risk` : "Loading the map…"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-4 flex flex-col gap-2",
				children: [(data?.nodes ?? []).map((node) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-sm border border-border bg-surface px-3 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[14px] text-fg",
							children: node.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-sans text-[10px] tracking-[0.12em] text-muted uppercase",
							children: node.risk
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-[12px] text-faint",
						children: [
							node.type,
							" · ",
							node.findings.length,
							" findings"
						]
					})]
				}, node.id)), data && data.nodes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "text-[13px] text-muted",
					children: "No findings yet. Run a task, then come back."
				}) : null]
			}),
			(data?.attackSurface.recommendedHardening ?? []).length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 list-disc pl-5 text-[13px] text-muted",
				children: data?.attackSurface.recommendedHardening.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: line }, line))
			}) : null
		]
	}) });
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthGate, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPage, {}) });
//#endregion
export { SplitComponent as component };
