import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as useNavigate, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as authClient } from "./client-DUtYoQbQ.mjs";
import { t as Wordmark } from "./brand-Q_2EG5dj.mjs";
import { t as Button } from "./button-BUJZhIkX.mjs";
import { t as Input } from "./input-Djc-Iak1.mjs";
import { i as latestResetLink } from "./server-D5BtKRKR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-DR4ESRAC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LoginPage() {
	const navigate = useNavigate();
	const [mode, setMode] = (0, import_react.useState)("signin");
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [info, setInfo] = (0, import_react.useState)("");
	const [resetLink, setResetLink] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function onSubmit(e) {
		e.preventDefault();
		setError("");
		setInfo("");
		setResetLink(null);
		setBusy(true);
		try {
			if (mode === "signup") {
				const res = await authClient.signUp.email({
					name: name.trim() || email.trim(),
					email: email.trim(),
					password
				});
				if (res.error) throw new Error(res.error.message || "Could not create the account");
				await navigate({ to: "/deck" });
				return;
			}
			if (mode === "signin") {
				const res = await authClient.signIn.email({
					email: email.trim(),
					password
				});
				if (res.error) throw new Error(res.error.message || "Could not sign in");
				await navigate({ to: "/deck" });
				return;
			}
			const res = await authClient.requestPasswordReset({
				email: email.trim(),
				redirectTo: `${window.location.origin}/reset-password`
			});
			if (res.error) throw new Error(res.error.message || "Could not start the reset");
			const preview = await latestResetLink({ data: { email: email.trim() } });
			setInfo("If that account exists, a reset link is ready.");
			setResetLink(preview.link);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Something went wrong");
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
				children: mode === "signup" ? "Create account" : mode === "forgot" ? "Reset password" : "Sign in"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-[13px] text-muted",
				children: "Email and password are stored in this app’s database."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-6 flex flex-col gap-3",
				onSubmit: (e) => void onSubmit(e),
				children: [
					mode === "signup" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: name,
						onChange: (e) => setName(e.target.value),
						placeholder: "Name",
						autoComplete: "name",
						required: true
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "email",
						value: email,
						onChange: (e) => setEmail(e.target.value),
						placeholder: "Email",
						autoComplete: "email",
						required: true
					}),
					mode !== "forgot" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "password",
						value: password,
						onChange: (e) => setPassword(e.target.value),
						placeholder: "Password",
						autoComplete: mode === "signup" ? "new-password" : "current-password",
						minLength: 8,
						required: true
					}) : null,
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-danger",
						children: error
					}) : null,
					info ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-ok",
						children: info
					}) : null,
					resetLink ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: resetLink,
						className: "text-sm break-all text-primary underline-offset-2 hover:underline",
						children: "Open reset link"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						variant: "solid",
						disabled: busy,
						children: busy ? "Working…" : mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Sign in"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-col gap-2 text-[13px] text-muted",
				children: [
					mode !== "forgot" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-left hover:text-fg",
						onClick: () => setMode("forgot"),
						children: "Forgot password"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-left hover:text-fg",
						onClick: () => setMode("signin"),
						children: "Back to sign in"
					}),
					mode === "signin" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-left hover:text-fg",
						onClick: () => setMode("signup"),
						children: "Create an account"
					}) : null,
					mode === "signup" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-left hover:text-fg",
						onClick: () => setMode("signin"),
						children: "Already have an account"
					}) : null
				]
			})
		]
	});
}
//#endregion
export { LoginPage as component };
