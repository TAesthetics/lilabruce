import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/brand-Q_2EG5dj.js
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function Wordmark({ className, to = "/" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to,
		className: cn("font-sans text-[15px] font-bold tracking-[0.16em] text-primary uppercase", className),
		children: [
			"TEMPLE",
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-cyan",
				children: "//"
			}),
			"WIRED"
		]
	});
}
//#endregion
export { cn as n, Wordmark as t };
