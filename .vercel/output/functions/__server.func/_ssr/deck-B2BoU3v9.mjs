import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as cn } from "./brand-Q_2EG5dj.mjs";
import { C as FileText, T as Crosshair, b as Mail, d as Send, f as Search, l as Shield, m as Plus, p as Radio, u as Settings } from "../_libs/lucide-react.mjs";
import { n as TempleShell, r as UserButton, t as AuthGate } from "./shell-DBfeorn-.mjs";
import { _ as setTarget, a as clearPrayers, c as generateReport, d as runExposure, f as runTool, g as setLoopRunning, h as sendFeedback, i as askFather, l as getSnapshot, m as selectEngagement, n as Dialog, o as createEngagement, p as sealCycle, r as DialogContent, t as Clock, u as runAgent } from "./fns-CJ_Q5Cng.mjs";
import { t as Button } from "./button-BUJZhIkX.mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { i as KALI_TOOLS, r as FREE_TOOLS } from "./db-BAhP72_9.mjs";
import { r as TOOL_DEFS } from "./prompts-BAh9MRPe.mjs";
import { a as setFindingStatus, r as listFindings, t as addFinding } from "./findings-CXQjqeK4.mjs";
import { t as Input } from "./input-Djc-Iak1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/deck-B2BoU3v9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var AGENT_META = [
	{
		id: "recon",
		name: "Recon",
		icon: Search
	},
	{
		id: "exploit",
		name: "Exploit",
		icon: Crosshair
	},
	{
		id: "detection",
		name: "Detect",
		icon: Radio
	},
	{
		id: "hardening",
		name: "Harden",
		icon: Shield
	}
];
function DeckPage() {
	const snap = useQuery({
		queryKey: ["temple"],
		queryFn: () => getSnapshot(),
		refetchInterval: 4e3
	});
	const data = snap.data;
	const findings = useQuery({
		queryKey: ["findings"],
		queryFn: () => listFindings()
	});
	const [target, setTargetLocal] = (0, import_react.useState)("localhost");
	const [tab, setTab] = (0, import_react.useState)("recon");
	const [result, setResult] = (0, import_react.useState)("");
	const [lines, setLines] = (0, import_react.useState)([]);
	const [cmd, setCmd] = (0, import_react.useState)("");
	const [history, setHistory] = (0, import_react.useState)([]);
	const [histIdx, setHistIdx] = (0, import_react.useState)(-1);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [loopOn, setLoopOn] = (0, import_react.useState)(false);
	const [engOpen, setEngOpen] = (0, import_react.useState)(false);
	const [settingsOpen, setSettingsOpen] = (0, import_react.useState)(false);
	const [fbOpen, setFbOpen] = (0, import_react.useState)(false);
	const [mobilePane, setMobilePane] = (0, import_react.useState)("ops");
	const [authorized, setAuthorized] = (0, import_react.useState)(false);
	const loopRef = (0, import_react.useRef)(false);
	const targetRef = (0, import_react.useRef)(target);
	const termRef = (0, import_react.useRef)(null);
	const booted = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		targetRef.current = target;
	}, [target]);
	(0, import_react.useEffect)(() => {
		loopRef.current = loopOn;
	}, [loopOn]);
	(0, import_react.useEffect)(() => {
		if (data?.loop.target && data.loop.target !== target) setTargetLocal(data.loop.target);
	}, [data?.loop.target]);
	(0, import_react.useEffect)(() => {
		if (data?.loop.running) setLoopOn(true);
	}, [data?.loop.running]);
	(0, import_react.useEffect)(() => {
		termRef.current?.scrollTo({ top: termRef.current.scrollHeight });
	}, [lines]);
	(0, import_react.useEffect)(() => {
		setAuthorized(window.localStorage.getItem("temple-authorized") === "1");
	}, []);
	(0, import_react.useEffect)(() => {
		if (booted.current) return;
		booted.current = true;
		print("info", "Purple-team chat. Ask about the target, or type /help.");
	}, []);
	function print(cls, text) {
		setLines((prev) => [...prev.slice(-340), {
			cls,
			text
		}]);
	}
	async function refresh() {
		await Promise.all([snap.refetch(), findings.refetch()]);
	}
	function allowRun() {
		if (authorized) return true;
		print("err", "Confirm this is an authorized engagement before running a task.");
		setMobilePane("ops");
		return false;
	}
	async function doAgent(name, override) {
		if (!allowRun()) return;
		if (busy) {
			print("err", "busy");
			return;
		}
		const t = override || targetRef.current;
		setBusy(true);
		print("cmd", `${name} → ${t}`);
		try {
			const res = await runAgent({ data: {
				name,
				target: t
			} });
			if (!res.ok) print("err", res.error);
			else {
				print("success", `${name} ok`);
				setTab(name);
				setMobilePane("out");
				setResult(res.content);
			}
		} catch (e) {
			print("err", e instanceof Error ? e.message : "failed");
		} finally {
			setBusy(false);
			await refresh();
		}
	}
	(0, import_react.useEffect)(() => {
		if (!loopOn) return;
		let cancelled = false;
		const phases = [
			"recon",
			"exploit",
			"detection",
			"hardening"
		];
		(async () => {
			while (!cancelled && loopRef.current) {
				for (const name of phases) {
					if (cancelled || !loopRef.current) return;
					await doAgent(name);
				}
				if (cancelled || !loopRef.current) return;
				await sealCycle();
				await refresh();
				await new Promise((r) => setTimeout(r, 12e3));
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [loopOn]);
	async function startLoop() {
		print("cmd", `▶ ${target}`);
		await setLoopRunning({ data: {
			running: true,
			target
		} });
		setLoopOn(true);
		await refresh();
	}
	async function stopLoop() {
		print("cmd", "■");
		setLoopOn(false);
		await setLoopRunning({ data: { running: false } });
		await refresh();
	}
	async function doTool(tool) {
		if (!allowRun() || busy) return;
		setBusy(true);
		print("cmd", `${tool} → ${target}`);
		try {
			const res = await runTool({ data: {
				tool,
				target,
				authorized: true
			} });
			if (!res.ok) print("err", res.error);
			else {
				const bits = res.content.split("\n");
				print("father", bits.slice(0, 6).join("\n"));
				if (bits.length > 6) print("info", "Saved to the board.");
				setResult(res.content);
				setMobilePane("out");
			}
		} catch (e) {
			print("err", e instanceof Error ? e.message : "failed");
		} finally {
			setBusy(false);
			await refresh();
		}
	}
	async function doExposure() {
		if (!allowRun() || busy) return;
		setBusy(true);
		print("cmd", `exposure → ${target}`);
		try {
			const res = await runExposure({ data: {
				target,
				authorized: true
			} });
			if (!res.ok) print("err", res.error);
			else {
				print("success", `${res.open} open ports. Saved on the board.`);
				setResult(res.content);
				setMobilePane("out");
			}
		} catch (e) {
			print("err", e instanceof Error ? e.message : "failed");
		} finally {
			setBusy(false);
			await refresh();
		}
	}
	async function doReport() {
		if (!allowRun() || busy) return;
		setBusy(true);
		print("cmd", "◈ Report…");
		try {
			const res = await generateReport({ data: { target } });
			if (!res.ok) print("err", res.error);
			else {
				print("success", "Report ready");
				setTab("report");
				setResult(res.content);
				setMobilePane("out");
			}
		} finally {
			setBusy(false);
			await refresh();
		}
	}
	async function exec(raw) {
		const parts = raw.split(/\s+/);
		const c = (parts[0] || "").toLowerCase();
		const arg = parts.slice(1).join(" ");
		if ([
			"/help",
			"help",
			"?"
		].includes(c)) {
			print("info", "/target <host>  /loop start|stop  /report  /eng  /shop");
			print("info", "/recon /exploit /detect /harden  /key  /clear");
			return;
		}
		if ([
			"/clear",
			"clear",
			"cls"
		].includes(c)) {
			setLines([]);
			return;
		}
		if (c === "/key") return setSettingsOpen(true);
		if (c === "/eng") return setEngOpen(true);
		if (c === "/shop") {
			window.location.href = "/shop";
			return;
		}
		if (c === "/report") return doReport();
		if (c === "/target") {
			if (!arg) {
				print("info", target);
				return;
			}
			setTargetLocal(arg);
			await setTarget({ data: { target: arg } });
			print("success", "→ " + arg);
			return;
		}
		if (c === "/loop") {
			if (arg === "start") return startLoop();
			if (arg === "stop") return stopLoop();
			print("err", "start | stop");
			return;
		}
		if (["/recon", "recon"].includes(c)) return doAgent("recon", arg);
		if (["/exploit", "exploit"].includes(c)) return doAgent("exploit", arg);
		if (["/detect", "detect"].includes(c)) return doAgent("detection", arg);
		if (["/harden", "harden"].includes(c)) return doAgent("hardening", arg);
		print("cmd", raw);
		setBusy(true);
		try {
			const res = await askFather({ data: { prompt: `Target: ${targetRef.current}\n\nOperator: ${raw}` } });
			if (!res.ok) print("err", res.error);
			else print("father", res.content);
		} catch (e) {
			print("err", e instanceof Error ? e.message : "failed");
		} finally {
			setBusy(false);
			await refresh();
		}
	}
	function onTermKey(e) {
		if (e.key === "ArrowUp") {
			e.preventDefault();
			setHistory((h) => {
				const next = histIdx < 0 ? h.length - 1 : Math.max(0, histIdx - 1);
				setHistIdx(next);
				setCmd(h[next] ?? "");
				return h;
			});
		} else if (e.key === "ArrowDown") {
			e.preventDefault();
			setHistory((h) => {
				if (histIdx < 0) return h;
				const next = histIdx + 1;
				if (next >= h.length) {
					setHistIdx(-1);
					setCmd("");
				} else {
					setHistIdx(next);
					setCmd(h[next] ?? "");
				}
				return h;
			});
		}
	}
	const tools = [...FREE_TOOLS, ...KALI_TOOLS];
	const shownResult = tab === "report" ? result : result || data?.results[tab]?.content || "Select engagement → run agents/tools → generate REPORT.";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TempleShell, {
		credits: data?.profile.credits,
		pro: data?.profile.pro,
		right: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-1.5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, {
					label: "Model",
					on: data?.father === "online"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "grid size-9 place-items-center rounded-sm border border-border text-muted hover:border-primary hover:text-primary",
					onClick: () => setFbOpen(true),
					"aria-label": "Feedback",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-4" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "grid size-9 place-items-center rounded-sm border border-border text-muted hover:border-primary hover:text-primary",
					onClick: () => setSettingsOpen(true),
					"aria-label": "Settings",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-4" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "hidden lg:inline-flex",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
				})
			]
		}),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-1 border-b border-border px-3 py-2 md:hidden",
				children: [
					"chat",
					"ops",
					"out"
				].map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setMobilePane(p),
					className: cn("h-9 flex-1 rounded-sm border font-sans text-[10px] tracking-[0.14em] uppercase", mobilePane === p ? "border-primary text-primary" : "border-border text-muted"),
					children: p === "ops" ? "Tasks" : p === "chat" ? "Chat" : "Board"
				}, p))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto grid w-full max-w-[1400px] flex-1 grid-cols-1 gap-2.5 p-2.5 md:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)_minmax(260px,0.9fr)] md:overflow-hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
						title: "Chat",
						meta: data?.profile.pro ? "included" : `${data?.profile.promptsLeft ?? 20} of 20 left`,
						className: cn("min-h-[70dvh] md:min-h-0", mobilePane !== "chat" && "hidden md:flex"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								ref: termRef,
								className: "min-h-0 flex-1 space-y-2 overflow-y-auto bg-bg px-3 py-3",
								children: lines.map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: cn("max-w-[92%] rounded-md px-3 py-2 text-[13px] leading-relaxed whitespace-pre-wrap", l.cls === "cmd" && "ml-auto bg-elevated text-fg", l.cls === "father" && "border border-border bg-surface text-fg", l.cls === "err" && "border border-danger/40 text-danger", (l.cls === "info" || l.cls === "success") && "text-[12px] text-muted"),
									children: [
										l.cls === "cmd" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mb-1 block font-sans text-[10px] tracking-[0.12em] text-faint uppercase",
											children: "You"
										}) : null,
										l.cls === "father" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mb-1 block font-sans text-[10px] tracking-[0.12em] text-faint uppercase",
											children: "Assistant"
										}) : null,
										l.text
									]
								}, i))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								className: "flex items-end gap-2 border-t border-border bg-elevated px-3 py-2",
								onSubmit: (e) => {
									e.preventDefault();
									const v = cmd.trim();
									if (!v || busy) return;
									setHistory((h) => [...h, v]);
									setHistIdx(-1);
									setCmd("");
									exec(v);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									value: cmd,
									onChange: (e) => setCmd(e.target.value),
									onKeyDown: (e) => {
										if (e.key === "Enter" && !e.shiftKey) {
											e.preventDefault();
											e.currentTarget.form?.requestSubmit();
										} else onTermKey(e);
									},
									rows: 2,
									className: "min-h-11 min-w-0 flex-1 resize-none bg-transparent font-sans text-[14px] text-fg outline-none placeholder:text-faint",
									placeholder: "Ask about recon, detection, or this target",
									autoCapitalize: "sentences",
									spellCheck: true
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "submit",
									variant: "solid",
									size: "sm",
									disabled: busy || !cmd.trim(),
									"aria-label": "Send",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-3.5" }), "Send"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "border-t border-border px-3 py-2 text-[11px] text-faint",
								children: [
									20,
									" prompts a day are free in alpha. After that, €15 per month.",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/shop",
										className: "text-fg underline-offset-2 hover:underline",
										children: "Pay"
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cn("flex min-h-0 flex-col gap-2.5", mobilePane !== "ops" && "hidden md:flex"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "flex flex-col gap-3 md:hidden",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "mb-1 block font-sans text-[10px] tracking-[0.14em] text-faint uppercase",
										children: "Target"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: target,
										onChange: (e) => setTargetLocal(e.target.value),
										onBlur: () => void setTarget({ data: { target } }),
										spellCheck: false,
										placeholder: "host or scope"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[12px] text-muted",
										children: data?.profile.pro ? "Pro includes prompts." : `${data?.profile.promptsLeft ?? 20} of 20 free prompts left today.`
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-[12px] text-muted",
										children: [
											"Port, web, OSINT, and vuln run a real connect, DNS, HTTP, or TLS check and save it. On a phone with Termux, use",
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
												className: "text-fg underline-offset-2 hover:underline",
												href: "/lab/termux-wire.sh",
												children: "the lab script"
											}),
											"."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "flex items-start gap-2 text-[13px] text-muted",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "checkbox",
											className: "mt-1",
											checked: authorized,
											onChange: (e) => {
												setAuthorized(e.target.checked);
												window.localStorage.setItem("temple-authorized", e.target.checked ? "1" : "0");
												if (e.target.checked) addFinding({ data: {
													source: "scope",
													target,
													title: "Scope confirmed",
													detail: `Operator confirmed authorization for ${target}.`
												} }).then(() => findings.refetch());
											}
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "I am authorized to assess this target. Tasks stay blocked until this is on." })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
										className: "grid grid-cols-2 gap-1.5 text-[11px] text-muted",
										children: [
											["scope", "1 Scope"],
											["recon", "2 Recon"],
											["exploit", "3 Attack path"],
											["detection", "4 Detect"],
											["hardening", "5 Harden"],
											["report", "6 Report"]
										].map(([id, label]) => {
											const done = (findings.data ?? []).some((f) => f.source === id || id === "scope" && authorized);
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
												className: done ? "text-ok" : "text-faint",
												children: [
													done ? "✓" : "○",
													" ",
													label
												]
											}, id);
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										disabled: busy,
										onClick: () => void doExposure(),
										className: "h-12 rounded-md border border-primary bg-surface px-3 text-left font-sans text-sm font-semibold text-primary disabled:text-faint",
										children: busy ? "Checking…" : "Check exposure"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "grid grid-cols-2 gap-2",
										children: AGENT_META.map((a) => {
											const Icon = a.icon;
											const st = data?.agents[a.id] ?? "idle";
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												disabled: busy,
												onClick: () => void doAgent(a.id),
												className: "flex min-h-24 flex-col items-start justify-between rounded-md border border-border bg-surface p-3 text-left active:scale-[0.98]",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
													className: "size-5 text-primary",
													strokeWidth: 1.6
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "block font-sans text-sm font-semibold",
													children: a.name
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-[11px] text-muted uppercase",
													children: busy ? "working" : st
												})] })]
											}, a.id);
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex gap-2 overflow-x-auto pb-1",
										children: tools.map((id) => {
											return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												disabled: busy,
												onClick: () => void doTool(id),
												className: "h-11 shrink-0 rounded-sm border border-border px-3 font-sans text-[11px] tracking-[0.08em] text-muted uppercase disabled:text-faint",
												children: TOOL_DEFS[id]?.label ?? id
											}, id);
										})
									}),
									result ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => setMobilePane("out"),
										className: "rounded-md border border-border bg-surface p-3 text-left",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "line-clamp-5 text-[13px] leading-relaxed text-muted",
											children: result
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mt-2 block font-sans text-[11px] tracking-[0.12em] text-primary uppercase",
											children: "Open result"
										})]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[13px] text-muted",
										children: "Choose a task. The assistant writes an authorized plan for this target."
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
								title: "Engagement",
								className: "hidden md:flex",
								action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "grid size-8 place-items-center rounded-sm border border-border text-muted hover:border-primary hover:text-primary",
									onClick: () => setEngOpen(true),
									"aria-label": "New engagement",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" })
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-2 px-3 pt-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										className: "h-11 min-w-0 flex-1 rounded-sm border border-border bg-bg px-2 font-mono text-[12px] text-fg outline-none focus:border-primary",
										value: data?.loop.current_engagement_id ?? "",
										onChange: (e) => void selectEngagement({ data: { id: e.target.value } }).then(refresh),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "— none —"
										}), (data?.engagements ?? []).map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: e.id,
											children: e.client ? `${e.name} · ${e.client}` : e.name
										}, e.id))]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "ghost",
										size: "sm",
										onClick: () => void doReport(),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-3.5" }), "Report"]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "px-3 pt-2 pb-3 text-[12px] text-muted",
									children: data?.engagement ? [data.engagement.client && `Client: ${data.engagement.client}`, data.engagement.scope && `Scope: ${data.engagement.scope}`].filter(Boolean).join(" · ") || data.engagement.name : "Select or create an engagement (client / job)."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
								title: "Status",
								className: "hidden md:flex",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-2 p-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
												label: "Loop",
												value: loopOn || data?.loop.running ? "RUNNING" : "IDLE",
												live: loopOn
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
												label: "Phase",
												value: !data?.loop.current_phase || data.loop.current_phase === "idle" ? "—" : data.loop.current_phase.replace("_complete", " ✓").toUpperCase()
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
												label: "Cycle",
												value: String(data?.loop.cycle ?? 0)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
												label: "Vulns",
												value: String(data?.loop.stats_vulns ?? 0)
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "block px-3 text-[10px] tracking-[0.12em] text-faint uppercase",
										children: "Target"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "px-3 pb-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: target,
											onChange: (e) => setTargetLocal(e.target.value),
											onBlur: () => void setTarget({ data: { target } }),
											spellCheck: false
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-2 px-3 pb-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "primary",
											onClick: () => void startLoop(),
											disabled: loopOn,
											children: "Start loop"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "danger",
											onClick: () => void stopLoop(),
											children: "Stop"
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
								title: "Agents",
								className: "hidden md:flex",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-2 gap-2 p-3",
									children: AGENT_META.map((a) => {
										const st = data?.agents[a.id] ?? "idle";
										const Icon = a.icon;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => void doAgent(a.id),
											className: cn("flex flex-col items-center gap-1.5 rounded-sm border bg-bg px-2 py-3 transition-colors", st === "running" && "border-cyan text-cyan", st === "complete" && "border-ok", st === "error" && "border-danger", st === "idle" && "border-border hover:border-primary"),
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
													className: "size-5",
													strokeWidth: 1.6
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-sans text-[11px] tracking-[0.12em] uppercase",
													children: a.name
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-[10px] text-muted uppercase",
													children: st
												})
											]
										}, a.id);
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
								title: "Tools",
								className: "hidden md:flex",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-3 gap-1.5 p-3",
									children: tools.map((id) => {
										return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => void doTool(id),
											className: "h-10 rounded-sm border border-border font-sans text-[9px] tracking-[0.08em] text-muted uppercase hover:border-cyan hover:text-cyan",
											title: TOOL_DEFS[id]?.label,
											children: TOOL_DEFS[id]?.label ?? id
										}, id);
									})
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cn("flex min-h-0 flex-col gap-2.5", mobilePane !== "out" && "hidden md:flex"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
								title: "Board",
								meta: `${(findings.data ?? []).filter((f) => f.status === "open").length} open`,
								action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "sm",
									onClick: () => {
										const rows = findings.data ?? [];
										const text = [
											`# Board — ${target}`,
											"",
											...rows.map((f, i) => `${i + 1}. [${f.severity}/${f.status}] ${f.title}\n${f.tactic} · ${f.target}\nNext: ${f.next_step}`)
										].join("\n");
										navigator.clipboard?.writeText(text);
										print("success", "Board copied");
									},
									children: "Copy"
								}),
								className: "min-h-[220px] flex-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "min-h-0 flex-1 space-y-2 overflow-auto bg-bg p-2",
									children: (findings.data ?? []).filter((f) => f.source !== "scope").length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "px-1 text-[12px] text-faint",
										children: "Confirm scope, then run a task. Each result lands here as a finding with a next step."
									}) : (findings.data ?? []).filter((f) => f.source !== "scope").map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
										className: "rounded-sm border border-border bg-surface p-2.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-start justify-between gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-[13px] text-fg",
													children: f.title
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: cn("shrink-0 font-sans text-[9px] tracking-[0.12em] uppercase", f.severity === "critical" || f.severity === "high" ? "text-danger" : "text-muted"),
													children: f.severity
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "mt-1 text-[11px] text-faint",
												children: [
													f.tactic,
													" · ",
													f.status
												]
											}),
											f.next_step ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-[12px] text-muted",
												children: f.next_step
											}) : null,
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "mt-2 flex gap-1",
												children: [
													"open",
													"accepted",
													"closed"
												].map((status) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													onClick: () => void setFindingStatus({ data: {
														id: f.id,
														status
													} }).then(() => findings.refetch()),
													className: cn("h-7 rounded-sm border px-2 font-sans text-[9px] tracking-[0.08em] uppercase", f.status === status ? "border-primary text-primary" : "border-border text-faint"),
													children: status
												}, status))
											})
										]
									}, f.id))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
								title: "Results",
								className: "hidden min-h-[180px] md:flex md:flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-wrap gap-1 border-b border-border px-2 py-2",
									children: [
										"recon",
										"exploit",
										"detection",
										"hardening",
										"report"
									].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => {
											setTab(t);
											if (t !== "report") setResult(data?.results[t]?.content ?? "");
										},
										className: cn("rounded-sm border px-2 py-1 font-sans text-[9px] tracking-[0.1em] uppercase", tab === t ? "border-primary text-primary" : "border-transparent text-muted"),
										children: t === "detection" ? "detect" : t === "hardening" ? "harden" : t
									}, t))
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
									className: "min-h-0 flex-1 overflow-auto bg-bg p-3 font-mono text-[12px] leading-relaxed whitespace-pre-wrap text-muted",
									children: shownResult
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
								title: "Log",
								action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "sm",
									onClick: () => void clearPrayers().then(refresh),
									children: "Clr"
								}),
								className: "h-48 md:h-auto md:flex-none md:min-h-[160px]",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "min-h-0 flex-1 overflow-auto bg-bg px-3 py-2 text-[11px] leading-relaxed",
									children: (data?.prayers ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-faint",
										children: "No activity yet."
									}) : (data?.prayers ?? []).map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: cn("mb-1 break-all", p.event === "invoke" && "text-primary", p.event === "error" && "text-danger", p.event === "response" && "text-cyan", p.event !== "invoke" && p.event !== "error" && p.event !== "response" && "text-muted"),
										children: [
											"[",
											new Date(p.ts).toLocaleTimeString("en-GB", { hour12: false }),
											"] ",
											p.agent,
											": ",
											p.message
										]
									}, i))
								})
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EngagementDialog, {
				open: engOpen,
				onOpenChange: setEngOpen,
				onCreated: refresh,
				onTarget: setTargetLocal
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsDialog, {
				open: settingsOpen,
				onOpenChange: setSettingsOpen
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeedbackDialog, {
				open: fbOpen,
				onOpenChange: setFbOpen
			})
		]
	});
}
function Panel({ title, meta, action, className, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: cn("glow-line flex min-h-0 flex-col overflow-hidden rounded-md border border-border bg-surface", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex h-10 shrink-0 items-center justify-between border-b border-border bg-primary/10 px-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-sans text-[11px] font-semibold tracking-[0.16em] text-primary uppercase",
				children: title
			}), action ?? (meta ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[10px] text-muted",
				children: meta
			}) : null)]
		}), children]
	});
}
function Stat({ label, value, live }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("rounded-sm border border-border border-l-2 bg-bg px-2.5 py-2", live ? "border-l-ok" : "border-l-primary"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[9px] tracking-[0.12em] text-faint uppercase",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "font-sans text-[16px] text-primary tabular-nums",
			children: value
		})]
	});
}
function StatusPill({ label, on }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("hidden rounded-sm border px-2 py-0.5 font-sans text-[9px] tracking-[0.12em] uppercase sm:inline", on ? "live-pill border-ok text-ok" : "border-border text-muted"),
		children: label
	});
}
function EngagementDialog({ open, onOpenChange, onCreated, onTarget }) {
	const [name, setName] = (0, import_react.useState)("");
	const [client, setClient] = (0, import_react.useState)("");
	const [scope, setScope] = (0, import_react.useState)("");
	const [notes, setNotes] = (0, import_react.useState)("");
	const [err, setErr] = (0, import_react.useState)("");
	async function submit(e) {
		e.preventDefault();
		const res = await createEngagement({ data: {
			name,
			client,
			scope,
			notes
		} });
		if (!res.ok) {
			setErr(res.error);
			return;
		}
		if (scope) onTarget(scope.split(/[,\s]+/)[0] || scope);
		setName("");
		setClient("");
		setScope("");
		setNotes("");
		onOpenChange(false);
		onCreated();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
			title: "New engagement",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-2",
				onSubmit: submit,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "block text-[10px] tracking-[0.12em] text-faint uppercase",
						children: "Name"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: name,
						onChange: (e) => setName(e.target.value),
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "block text-[10px] tracking-[0.12em] text-faint uppercase",
						children: "Client"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: client,
						onChange: (e) => setClient(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "block text-[10px] tracking-[0.12em] text-faint uppercase",
						children: "Scope / targets"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: scope,
						onChange: (e) => setScope(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "block text-[10px] tracking-[0.12em] text-faint uppercase",
						children: "Notes"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: notes,
						onChange: (e) => setNotes(e.target.value)
					}),
					err ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-danger",
						children: err
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						variant: "solid",
						className: "w-full",
						children: "Create"
					})
				]
			})
		})
	});
}
function SettingsDialog({ open, onOpenChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
			title: "Model",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[13px] leading-relaxed text-muted",
				children: "Twenty prompts each day are free in this alpha, including the Kali tools. After that, €15 per month. The model key stays on the server."
			})
		})
	});
}
function FeedbackDialog({ open, onOpenChange }) {
	const [rating, setRating] = (0, import_react.useState)(null);
	const [category, setCategory] = (0, import_react.useState)("general");
	const [message, setMessage] = (0, import_react.useState)("");
	const [msg, setMsg] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			title: "Alpha feedback",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-[13px] text-muted",
					children: "Bugs, UX, missing features, agent quality."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-3 flex gap-2",
					children: [
						1,
						2,
						3,
						4,
						5
					].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setRating(n),
						className: cn("h-10 flex-1 rounded-sm border font-sans", rating === n ? "border-primary text-primary" : "border-border text-muted"),
						children: n
					}, n))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					className: "mb-3 h-11 w-full rounded-sm border border-border bg-bg px-2 font-mono text-[13px]",
					value: category,
					onChange: (e) => setCategory(e.target.value),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "bug",
							children: "Bug"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "ux",
							children: "UX / UI"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "agent",
							children: "Agent quality"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "feature",
							children: "Feature request"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "report",
							children: "Report quality"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "general",
							children: "General"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					className: "mb-3 min-h-24 w-full rounded-sm border border-border bg-bg p-3 font-mono text-[13px] outline-none focus:border-primary",
					value: message,
					onChange: (e) => setMessage(e.target.value),
					placeholder: "What broke / what you need…"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "solid",
					className: "w-full",
					onClick: async () => {
						const res = await sendFeedback({ data: {
							message,
							category,
							rating
						} });
						if (!res.ok) setMsg(res.error);
						else {
							setMsg("Received. Thanks.");
							setMessage("");
							setTimeout(() => onOpenChange(false), 700);
						}
					},
					children: "Send"
				}),
				msg ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-[12px] text-ok",
					children: msg
				}) : null
			]
		})
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthGate, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeckPage, {}) });
//#endregion
export { SplitComponent as component };
