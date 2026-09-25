import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as useNavigate, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as authClient } from "./client-DUtYoQbQ.mjs";
import { t as Wordmark } from "./brand-Q_2EG5dj.mjs";
import { t as Button } from "./button-BUJZhIkX.mjs";
import { t as Input } from "./input-Djc-Iak1.mjs";
import { n as Route$4 } from "./router-DiohSlMo.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reset-password-DkO_UT1B.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ResetPage() {
	const { token, error: tokenError } = Route$4.useSearch();
	const navigate = useNavigate();
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(tokenError ? "This reset link is not valid." : "");
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function onSubmit(e) {
		e.preventDefault();
		if (!token) {
			setError("Missing reset token.");
			return;
		}
		setBusy(true);
		setError("");
		try {
			const res = await authClient.resetPassword({
				newPassword: password,
				token
			});
			if (res.error) throw new Error(res.error.message || "Could not reset the password");
			await navigate({ to: "/login" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not reset the password");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-10 font-sans text-2xl font-semibold tracking-tight",
				children: "New password"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-[13px] text-muted",
				children: "At least 8 characters. Stored only as a hash."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-6 flex flex-col gap-3",
				onSubmit: (e) => void onSubmit(e),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "password",
						value: password,
						onChange: (e) => setPassword(e.target.value),
						placeholder: "New password",
						autoComplete: "new-password",
						minLength: 8,
						required: true
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-danger",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						variant: "solid",
						disabled: busy || !token,
						children: busy ? "Saving…" : "Save password"
					})
				]
			})
		]
	});
}
//#endregion
export { ResetPage as component };
