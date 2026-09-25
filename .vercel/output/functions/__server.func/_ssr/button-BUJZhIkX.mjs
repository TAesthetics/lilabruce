import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { n as cn } from "./brand-Q_2EG5dj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/button-BUJZhIkX.js
var import_jsx_runtime = require_jsx_runtime();
var buttonVariants = cva("inline-flex items-center justify-center gap-2 rounded-sm border font-sans text-[11px] font-semibold tracking-[0.12em] uppercase transition-[border-color,background-color,color,box-shadow,transform] duration-150 ease-out disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]", {
	variants: {
		variant: {
			primary: "border-primary bg-transparent text-primary hover:bg-primary hover:text-bg",
			ghost: "border-border bg-elevated text-fg hover:border-primary hover:text-primary",
			danger: "border-danger bg-transparent text-danger hover:bg-danger hover:text-bg",
			cyan: "border-cyan bg-transparent text-cyan hover:bg-cyan hover:text-bg",
			solid: "border-primary bg-primary text-bg hover:brightness-110"
		},
		size: {
			default: "h-11 px-4",
			sm: "h-9 px-3 text-[10px]",
			icon: "size-11 p-0",
			"icon-sm": "size-9 p-0"
		}
	},
	defaultVariants: {
		variant: "ghost",
		size: "default"
	}
});
function Button({ className, variant, size, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
//#endregion
export { Button as t };
