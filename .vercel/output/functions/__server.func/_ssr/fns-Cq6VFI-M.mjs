import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { t as authMiddleware } from "./middleware-Bwsq9YNt.mjs";
import { i as getSql } from "./db-D6L-vCpY.mjs";
import { c as logPrayer, d as readProfile, f as saveHistory, i as KALI_TOOLS, n as CREDIT_COSTS, o as ensureProfile, r as FREE_TOOLS } from "./db-BAhP72_9.mjs";
import { n as SYSTEM_CORE, r as TOOL_DEFS, t as AGENT_DEFS } from "./prompts-BAh9MRPe.mjs";
import { i as recordFinding, n as ensureFindings } from "./findings-DDK5oQeC.mjs";
import { lookup } from "node:dns/promises";
import net from "node:net";
import tls from "node:tls";
//#region node_modules/.nitro/vite/services/ssr/assets/fns-Cq6VFI-M.js
var PORTS = [
	22,
	25,
	53,
	80,
	110,
	143,
	443,
	445,
	993,
	995,
	1433,
	3306,
	3389,
	5432,
	6379,
	8080,
	8443,
	9200
];
var LIVE_TOOLS = /* @__PURE__ */ new Set([
	"portscan",
	"vulnscan",
	"webapp",
	"osint"
]);
function isLiveTool(tool) {
	return LIVE_TOOLS.has(tool);
}
function blockedAddress(address) {
	const a = address.toLowerCase();
	if (a === "169.254.169.254" || a.startsWith("169.254.")) return true;
	if (a === "::1" || a === "0.0.0.0" || a === "::") return false;
	if (a.startsWith("fe80:") || a.startsWith("fd00:ec2")) return true;
	return false;
}
function hostOf(target) {
	return (target.trim().replace(/^[a-z]+:\/\//i, "").split("/")[0]?.split("?")[0] ?? "").replace(/:\d+$/, "").replace(/^\[|\]$/g, "");
}
async function assertReachable(host) {
	if (!host || host.length > 253) throw new Error("Bad target");
	if (host === "localhost") return;
	const records = await lookup(host, {
		all: true,
		verbatim: true
	});
	if (records.length === 0) throw new Error("Target did not resolve");
	if (records.some((r) => blockedAddress(r.address))) throw new Error("That address is blocked");
}
function probePort(host, port) {
	return new Promise((resolve) => {
		const socket = net.connect({
			host,
			port
		});
		const timer = setTimeout(() => {
			socket.destroy();
			resolve("filtered");
		}, 1200);
		socket.once("connect", () => {
			clearTimeout(timer);
			socket.destroy();
			resolve("open");
		});
		socket.once("error", (err) => {
			clearTimeout(timer);
			resolve(err.code === "ECONNREFUSED" ? "closed" : "filtered");
		});
	});
}
async function scanPorts(host) {
	const open = [];
	for (let i = 0; i < PORTS.length; i += 6) {
		const batch = PORTS.slice(i, i + 6);
		const results = await Promise.all(batch.map(async (port) => [port, await probePort(host, port)]));
		for (const [port, state] of results) if (state === "open") open.push(port);
	}
	return open;
}
async function tcpScan(host) {
	const open = await scanPorts(host);
	return [
		`TCP connect scan of ${host}`,
		`Open: ${open.length ? open.join(", ") : "none"}`,
		`Checked: ${PORTS.join(", ")}`,
		"Method: TCP connect. No payloads."
	].join("\n");
}
var HIGH_PORTS = /* @__PURE__ */ new Set([
	23,
	445,
	1433,
	3306,
	3389,
	5432,
	5900,
	6379,
	9200
]);
function portNote(port) {
	if (HIGH_PORTS.has(port)) return {
		severity: "high",
		note: "This service is reachable. Restrict who can connect, and confirm it should be exposed."
	};
	if (port === 22 || port === 21) return {
		severity: "medium",
		note: "Remote access is reachable. Prefer keys over passwords and limit the source addresses."
	};
	if (port === 80) return {
		severity: "info",
		note: "HTTP is open. Serve the app on HTTPS and set the security headers."
	};
	if (port === 443 || port === 8443) return {
		severity: "info",
		note: "TLS is reachable. Check the certificate date and the response headers."
	};
	return {
		severity: "medium",
		note: "A service answered. Confirm it is in scope and not a forgotten listener."
	};
}
async function collectExposure(target) {
	const host = hostOf(target);
	await assertReachable(host);
	const [dns, openPorts, http, cert] = await Promise.all([
		dnsProbe(host).catch((err) => `DNS failed: ${err.message}`),
		scanPorts(host),
		httpProbe(host),
		tlsProbe(host)
	]);
	const open = openPorts.map((port) => ({
		port,
		...portNote(port)
	}));
	return {
		host,
		text: [
			dns,
			`Open ports: ${openPorts.length ? openPorts.join(", ") : "none"}`,
			http,
			cert
		].join("\n\n"),
		open
	};
}
async function httpProbe(host) {
	const lines = [];
	for (const scheme of ["https", "http"]) {
		const ctrl = new AbortController();
		const timer = setTimeout(() => ctrl.abort(), 5e3);
		try {
			const res = await fetch(`${scheme}://${host}/`, {
				method: "GET",
				redirect: "manual",
				signal: ctrl.signal,
				headers: { "user-agent": "TEMPLE-WIRED-lab/1.0" }
			});
			const headers = [
				"server",
				"x-powered-by",
				"strict-transport-security",
				"content-security-policy",
				"x-frame-options",
				"set-cookie"
			].map((name) => {
				const value = res.headers.get(name);
				return value ? `${name}: ${value.slice(0, 180)}` : null;
			}).filter(Boolean);
			lines.push(`${scheme.toUpperCase()} ${res.status} ${res.headers.get("location") ?? ""}`.trim());
			lines.push(...headers.map((h) => `  ${h}`));
		} catch (err) {
			lines.push(`${scheme.toUpperCase()} failed: ${err instanceof Error ? err.message : "error"}`);
		} finally {
			clearTimeout(timer);
		}
	}
	return lines.join("\n");
}
function tlsProbe(host) {
	return new Promise((resolve) => {
		const socket = tls.connect({
			host,
			port: 443,
			servername: host,
			rejectUnauthorized: false,
			timeout: 5e3
		}, () => {
			const cert = socket.getPeerCertificate();
			const proto = socket.getProtocol() ?? "unknown";
			socket.end();
			resolve([
				`TLS ${proto}`,
				cert.subject ? `Subject: ${cert.subject.CN ?? JSON.stringify(cert.subject)}` : "No certificate",
				cert.issuer ? `Issuer: ${cert.issuer.O ?? cert.issuer.CN ?? ""}` : "",
				cert.valid_to ? `Valid to: ${cert.valid_to}` : "",
				socket.authorized ? "Chain trusted" : `Chain note: ${socket.authorizationError || "not verified"}`
			].filter(Boolean).join("\n"));
		});
		socket.setTimeout(5e3, () => {
			socket.destroy();
			resolve("TLS 443 did not complete");
		});
		socket.once("error", (err) => resolve(`TLS failed: ${err.message}`));
	});
}
async function dnsProbe(host) {
	const records = await lookup(host, {
		all: true,
		verbatim: true
	});
	return [`DNS ${host}`, ...records.map((r) => `${r.family === 6 ? "AAAA" : "A"} ${r.address}`)].join("\n");
}
/** Real collection. No shells, no credentials, no exploit payloads. */
async function collectLive(tool, target) {
	const host = hostOf(target);
	await assertReachable(host);
	if (tool === "portscan") return tcpProbeSafe(host);
	if (tool === "osint") return dnsProbe(host);
	if (tool === "webapp") return httpProbe(host);
	if (tool === "vulnscan") return `${await tlsProbe(host)}\n\n${await httpProbe(host)}`;
	return "";
}
async function tcpProbeSafe(host) {
	return tcpScan(host);
}
function modelConfigured() {
	return Boolean(process.env.VENICE_API_KEY);
}
async function chatComplete(apiKey, model, system, prompt) {
	const res = await fetch("https://api.venice.ai/api/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model,
			messages: [{
				role: "system",
				content: system || "You are a senior purple-team operator writing for an authorized engagement. Output is technical, structured, and actionable. Prefer exact commands, concrete techniques, and clear prioritization. State assumptions briefly when data is missing. This is defensive simulation and authorized testing only — never claim you executed live exploitation against a real system."
			}, {
				role: "user",
				content: prompt
			}],
			temperature: .4,
			max_tokens: 1600,
			venice_parameters: { include_venice_system_prompt: false }
		})
	});
	if (!res.ok) {
		const t = await res.text();
		return {
			ok: false,
			error: `Model ${res.status}: ${t.slice(0, 180)}`
		};
	}
	const content = (await res.json()).choices?.[0]?.message?.content?.trim() ?? "";
	if (!content) return {
		ok: false,
		error: "The model returned an empty response."
	};
	return {
		ok: true,
		content,
		provider: "venice"
	};
}
async function callFather(prompt, system) {
	const key = process.env.VENICE_API_KEY;
	const model = process.env.VENICE_MODEL || "llama-3.3-70b";
	if (!key) return {
		ok: false,
		error: "The model is not available."
	};
	return chatComplete(key, model, system, prompt);
}
var AGENTS = [
	"recon",
	"exploit",
	"detection",
	"hardening"
];
function asAgent(name) {
	return AGENTS.includes(name) ? name : null;
}
async function spendCredits(sql, userId, cost) {
	const profile = await readProfile(sql, userId);
	if (profile.pro) return {
		ok: true,
		credits: profile.credits,
		pro: true
	};
	if (profile.credits < cost) return {
		ok: false,
		error: `Insufficient credits (${profile.credits}). Buy more in the Shop.`
	};
	await sql`update profiles set credits = credits - ${cost} where user_id = ${userId}`;
	return {
		ok: true,
		credits: profile.credits - cost,
		pro: false
	};
}
function todayUtc() {
	return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
/** Twenty prompts a day are free in alpha. After that, the monthly payment is required. */
async function authorizePrompt(sql, userId, _cost) {
	const profile = await readProfile(sql, userId);
	const used = profile.promptsToday;
	if (profile.pro || used < 20) return {
		ok: true,
		bill: false,
		used,
		credits: profile.credits
	};
	return {
		ok: false,
		error: "20 prompts used today. €15 per month to continue."
	};
}
async function commitPrompt(sql, userId, used, cost, bill) {
	await sql`
    update profiles
    set prompt_day = ${todayUtc()}, prompts_today = ${used + 1}
    where user_id = ${userId}
  `;
	if (!bill) return (await readProfile(sql, userId)).credits;
	const spent = await spendCredits(sql, userId, cost);
	return spent.ok ? spent.credits : 0;
}
async function currentEngagementId(sql, userId) {
	return (await sql`
    select current_engagement_id from loop_state where user_id = ${userId}
  `)[0]?.current_engagement_id ?? null;
}
var getSnapshot_createServerFn_handler = createServerRpc({
	id: "0ab1718336bd1cfb54e269a02833ac96abe0c0295080a0153ed6973d2f5c96f7",
	name: "getSnapshot",
	filename: "src/lib/temple/fns.ts"
}, (opts) => getSnapshot.__executeServer(opts));
var getSnapshot = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getSnapshot_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await ensureProfile(sql, context.userId);
	const profile = await readProfile(sql, context.userId);
	const loop = (await sql`
      select running, current_phase, cycle, target, current_engagement_id,
             stats_cycles, stats_vulns, stats_exploits, stats_detections
      from loop_state where user_id = ${context.userId}
    `)[0] ?? {
		running: false,
		current_phase: "idle",
		cycle: 0,
		target: "localhost",
		current_engagement_id: null,
		stats_cycles: 0,
		stats_vulns: 0,
		stats_exploits: 0,
		stats_detections: 0
	};
	const engagements = await sql`
      select id, name, client, scope, notes, status, created_at, updated_at
      from engagements where user_id = ${context.userId}
      order by updated_at desc
    `;
	const engagement = engagements.find((e) => e.id === loop.current_engagement_id) ?? null;
	const prayers = (await sql`
      select event, agent, message, created_at
      from prayers where user_id = ${context.userId}
      order by id desc limit 80
    `).slice().reverse().map((p) => ({
		ts: p.created_at,
		event: p.event,
		agent: p.agent,
		message: p.message
	}));
	const resultRows = await sql`
      select kind, target, content, created_at
      from agent_results where user_id = ${context.userId}
    `;
	const results = {
		recon: null,
		exploit: null,
		detection: null,
		hardening: null
	};
	for (const r of resultRows) results[r.kind] = {
		target: r.target,
		content: r.content,
		created_at: r.created_at
	};
	const agents = {
		recon: "idle",
		exploit: "idle",
		detection: "idle",
		hardening: "idle"
	};
	const phase = loop.current_phase;
	for (const name of AGENTS) if (phase === name) agents[name] = "running";
	else if (results[name]) agents[name] = "complete";
	const father = modelConfigured() ? "online" : "offline";
	return {
		profile,
		loop: {
			...loop,
			running: Boolean(loop.running),
			cycle: Number(loop.cycle),
			stats_cycles: Number(loop.stats_cycles),
			stats_vulns: Number(loop.stats_vulns),
			stats_exploits: Number(loop.stats_exploits),
			stats_detections: Number(loop.stats_detections)
		},
		agents,
		engagement,
		engagements,
		prayers,
		results,
		father
	};
});
var createEngagement_createServerFn_handler = createServerRpc({
	id: "a05b0c6e412f026a9bbc5163e7a2bbba888a98d9a91ce14d7355d4066eb7759b",
	name: "createEngagement",
	filename: "src/lib/temple/fns.ts"
}, (opts) => createEngagement.__executeServer(opts));
var createEngagement = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createEngagement_createServerFn_handler, async ({ context, data }) => {
	const name = data.name.trim();
	if (name.length < 2) return {
		ok: false,
		error: "Name required (≥2)"
	};
	const sql = await getSql();
	await ensureProfile(sql, context.userId);
	const id = crypto.randomUUID();
	await sql`
      insert into engagements (id, user_id, name, client, scope, notes)
      values (
        ${id},
        ${context.userId},
        ${name},
        ${data.client.trim()},
        ${data.scope.trim()},
        ${data.notes.trim()}
      )
    `;
	await sql`
      update loop_state set current_engagement_id = ${id}, updated_at = now()
      where user_id = ${context.userId}
    `;
	return {
		ok: true,
		id,
		name
	};
});
var selectEngagement_createServerFn_handler = createServerRpc({
	id: "52d017363af97f5487cfa81ee628fb55414cfc557c4b246ad26219a83db8e8db",
	name: "selectEngagement",
	filename: "src/lib/temple/fns.ts"
}, (opts) => selectEngagement.__executeServer(opts));
var selectEngagement = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(selectEngagement_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await ensureProfile(sql, context.userId);
	if (!data.id) {
		await sql`
        update loop_state set current_engagement_id = null, updated_at = now()
        where user_id = ${context.userId}
      `;
		return { ok: true };
	}
	if (!(await sql`
      select id from engagements where id = ${data.id} and user_id = ${context.userId}
    `)[0]) return {
		ok: false,
		error: "Not found"
	};
	await sql`
      update loop_state set current_engagement_id = ${data.id}, updated_at = now()
      where user_id = ${context.userId}
    `;
	return { ok: true };
});
var setTarget_createServerFn_handler = createServerRpc({
	id: "db52e5a4d8e8ece4a663f9a6294fb07025d5ae2b3cbeafe5df104cddf4f3963a",
	name: "setTarget",
	filename: "src/lib/temple/fns.ts"
}, (opts) => setTarget.__executeServer(opts));
var setTarget = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(setTarget_createServerFn_handler, async ({ context, data }) => {
	const target = data.target.trim() || "localhost";
	const sql = await getSql();
	await ensureProfile(sql, context.userId);
	await sql`
      update loop_state set target = ${target}, updated_at = now()
      where user_id = ${context.userId}
    `;
	return {
		ok: true,
		target
	};
});
var setLoopRunning_createServerFn_handler = createServerRpc({
	id: "4f18915235c1047f47e68557725cc0cf1fbb6e8f6c12d9e239b6d9471681a388",
	name: "setLoopRunning",
	filename: "src/lib/temple/fns.ts"
}, (opts) => setLoopRunning.__executeServer(opts));
var setLoopRunning = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(setLoopRunning_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await ensureProfile(sql, context.userId);
	const target = data.target?.trim();
	if (data.running) {
		await sql`
        update loop_state
        set running = true,
            current_phase = 'idle',
            target = coalesce(${target ?? null}, target),
            updated_at = now()
        where user_id = ${context.userId}
      `;
		await logPrayer(sql, context.userId, "invoke", "purple-loop", `start → ${target || "target"}`);
	} else {
		await sql`
        update loop_state
        set running = false, current_phase = 'idle', updated_at = now()
        where user_id = ${context.userId}
      `;
		await logPrayer(sql, context.userId, "shutdown", "purple-loop", "stopped");
	}
	return { ok: true };
});
var runAgent_createServerFn_handler = createServerRpc({
	id: "6bba4bd4e25c6757f4b0eed3f65f566402edf51c0f498d6639750990d004b7ee",
	name: "runAgent",
	filename: "src/lib/temple/fns.ts"
}, (opts) => runAgent.__executeServer(opts));
var runAgent = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(runAgent_createServerFn_handler, async ({ context, data }) => {
	const name = asAgent(data.name);
	if (!name) return {
		ok: false,
		error: "Unknown agent"
	};
	const target = data.target.trim() || "localhost";
	const sql = await getSql();
	await ensureProfile(sql, context.userId);
	const gate = await authorizePrompt(sql, context.userId, CREDIT_COSTS.agent);
	if (!gate.ok) return gate;
	await sql`
      update loop_state set current_phase = ${name}, updated_at = now()
      where user_id = ${context.userId}
    `;
	await logPrayer(sql, context.userId, "invoke", `${name}-agent`, `${name} → ${target}`);
	const def = AGENT_DEFS[name];
	const result = await callFather(def.prompt(target), def.system);
	if (!result.ok) {
		await logPrayer(sql, context.userId, "error", `${name}-agent`, result.error);
		await sql`
        update loop_state set current_phase = ${name + "_error"}, updated_at = now()
        where user_id = ${context.userId}
      `;
		return {
			ok: false,
			error: result.error,
			credits: gate.credits
		};
	}
	const credits = await commitPrompt(sql, context.userId, gate.used, CREDIT_COSTS.agent, gate.bill);
	await sql`
      insert into agent_results (user_id, kind, target, content, created_at)
      values (${context.userId}, ${name}, ${target}, ${result.content}, now())
      on conflict (user_id, kind) do update
        set target = excluded.target, content = excluded.content, created_at = excluded.created_at
    `;
	const engId = await currentEngagementId(sql, context.userId);
	await saveHistory(sql, context.userId, engId, name, target, result.content);
	await recordFinding(sql, context.userId, {
		source: name,
		target,
		content: result.content
	});
	await logPrayer(sql, context.userId, "response", `${name}-agent`, "done");
	if (name === "recon") await sql`update loop_state set stats_vulns = stats_vulns + 1 where user_id = ${context.userId}`;
	if (name === "exploit") await sql`update loop_state set stats_exploits = stats_exploits + 1 where user_id = ${context.userId}`;
	if (name === "detection") await sql`update loop_state set stats_detections = stats_detections + 1 where user_id = ${context.userId}`;
	await sql`
      update loop_state set current_phase = ${name + "_complete"}, updated_at = now()
      where user_id = ${context.userId}
    `;
	return {
		ok: true,
		content: result.content,
		provider: result.provider,
		credits
	};
});
var sealCycle_createServerFn_handler = createServerRpc({
	id: "6df0d11bc6db498d5bb3db024e15606ca6161c5b34727c5915cf58d635cb2497",
	name: "sealCycle",
	filename: "src/lib/temple/fns.ts"
}, (opts) => sealCycle.__executeServer(opts));
var sealCycle = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(sealCycle_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await ensureProfile(sql, context.userId);
	await sql`
      update loop_state
      set cycle = cycle + 1,
          stats_cycles = stats_cycles + 1,
          current_phase = 'idle',
          updated_at = now()
      where user_id = ${context.userId}
    `;
	const rows = await sql`
      select cycle from loop_state where user_id = ${context.userId}
    `;
	const cycle = Number(rows[0]?.cycle ?? 0);
	await logPrayer(sql, context.userId, "cycle_end", "purple-loop", `Cycle #${cycle} sealed`);
	return {
		ok: true,
		cycle
	};
});
var runTool_createServerFn_handler = createServerRpc({
	id: "cf6410a5f0ed9e758392705de1252fd4d9898542cce871918fbb8f6bb80b2021",
	name: "runTool",
	filename: "src/lib/temple/fns.ts"
}, (opts) => runTool.__executeServer(opts));
var runTool = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(runTool_createServerFn_handler, async ({ context, data }) => {
	const def = TOOL_DEFS[data.tool];
	if (!def) return {
		ok: false,
		error: "Unknown tool"
	};
	const sql = await getSql();
	await ensureProfile(sql, context.userId);
	if (!FREE_TOOLS.includes(data.tool) && !KALI_TOOLS.includes(data.tool)) return {
		ok: false,
		error: "Unknown tool"
	};
	const gate = await authorizePrompt(sql, context.userId, CREDIT_COSTS.tool);
	if (!gate.ok) return gate;
	const target = data.target.trim() || "localhost";
	await ensureFindings(sql);
	let evidence = "";
	if (isLiveTool(data.tool)) {
		const recent = await sql`
        select count(*)::int as n from findings
        where user_id = ${context.userId}
          and source = ${data.tool}
          and created_at > now() - interval '1 hour'
      `;
		if (Number(recent[0]?.n ?? 0) >= 15) return {
			ok: false,
			error: "Live check limit for this hour. Wait, or use the Termux script on the phone."
		};
		if ((await sql`
        select id from findings where user_id = ${context.userId} and source = 'scope' limit 1
      `).length === 0) {
			if (!data.authorized) return {
				ok: false,
				error: "Confirm scope before a live check."
			};
			await recordFinding(sql, context.userId, {
				source: "scope",
				target,
				title: "Scope confirmed",
				severity: "info",
				content: `Operator confirmed authorization for ${target}.`
			});
		}
		try {
			evidence = await collectLive(data.tool, target);
		} catch (err) {
			return {
				ok: false,
				error: err instanceof Error ? err.message : "Live check failed"
			};
		}
	}
	await logPrayer(sql, context.userId, "invoke", `tool-${data.tool}`, `${data.tool} → ${target}`);
	const result = await callFather(evidence ? `${def.prompt(target)}\n\nLIVE EVIDENCE from the lab runner. Treat it as ground truth. Do not invent open ports or headers.\n\n${evidence}` : def.prompt(target), def.system);
	const content = result.ok ? `${evidence ? evidence + "\n\n" : ""}${result.content}` : evidence;
	if (!content) {
		await logPrayer(sql, context.userId, "error", `tool-${data.tool}`, result.ok ? "empty" : result.error);
		return {
			ok: false,
			error: result.ok ? "Empty result" : result.error,
			credits: gate.credits
		};
	}
	const credits = await commitPrompt(sql, context.userId, gate.used, CREDIT_COSTS.tool, gate.bill);
	await logPrayer(sql, context.userId, "response", `tool-${data.tool}`, "done");
	const engId = await currentEngagementId(sql, context.userId);
	await saveHistory(sql, context.userId, engId, "tool-" + data.tool, target, content);
	await recordFinding(sql, context.userId, {
		source: data.tool,
		target,
		content
	});
	return {
		ok: true,
		content,
		provider: evidence ? "wire" : result.ok ? result.provider : "wire",
		credits
	};
});
var runExposure_createServerFn_handler = createServerRpc({
	id: "db22e31c339a35d94c91f0da31d991682cba98aa073aa21268a97d7d8d513ff7",
	name: "runExposure",
	filename: "src/lib/temple/fns.ts"
}, (opts) => runExposure.__executeServer(opts));
var runExposure = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(runExposure_createServerFn_handler, async ({ context, data }) => {
	if (!data.authorized) return {
		ok: false,
		error: "Confirm scope before a live check."
	};
	const target = data.target.trim() || "localhost";
	const sql = await getSql();
	await ensureProfile(sql, context.userId);
	await ensureFindings(sql);
	let exposure;
	try {
		exposure = await collectExposure(target);
	} catch (err) {
		return {
			ok: false,
			error: err instanceof Error ? err.message : "Exposure check failed"
		};
	}
	if ((await sql`
      select id from findings where user_id = ${context.userId} and source = 'scope' limit 1
    `).length === 0) await recordFinding(sql, context.userId, {
		source: "scope",
		target,
		title: "Scope confirmed",
		severity: "info",
		content: `Operator confirmed authorization for ${target}.`
	});
	await recordFinding(sql, context.userId, {
		source: "portscan",
		target,
		title: `Exposure of ${exposure.host}`,
		severity: exposure.open.some((p) => p.severity === "high") ? "high" : "info",
		content: exposure.text
	});
	for (const port of exposure.open) await recordFinding(sql, context.userId, {
		source: "portscan",
		target,
		title: `Port ${port.port} open on ${exposure.host}`,
		severity: port.severity,
		content: `Port ${port.port} answered on ${exposure.host}.\n${port.note}`
	});
	const engId = await currentEngagementId(sql, context.userId);
	await saveHistory(sql, context.userId, engId, "exposure", target, exposure.text);
	return {
		ok: true,
		content: exposure.text,
		open: exposure.open.length
	};
});
var askFather_createServerFn_handler = createServerRpc({
	id: "13406f0250a9ece1d8ac1415b603d60077440f991aa0e717b742bfb497960887",
	name: "askFather",
	filename: "src/lib/temple/fns.ts"
}, (opts) => askFather.__executeServer(opts));
var askFather = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(askFather_createServerFn_handler, async ({ context, data }) => {
	const prompt = data.prompt.trim();
	if (!prompt) return {
		ok: false,
		error: "Empty prompt"
	};
	const sql = await getSql();
	await ensureProfile(sql, context.userId);
	const gate = await authorizePrompt(sql, context.userId, CREDIT_COSTS.ask);
	if (!gate.ok) return gate;
	await logPrayer(sql, context.userId, "invoke", "terminal", prompt.slice(0, 80));
	const result = await callFather(prompt, SYSTEM_CORE);
	if (!result.ok) {
		await logPrayer(sql, context.userId, "error", "terminal", result.error);
		return {
			ok: false,
			error: result.error,
			credits: gate.credits
		};
	}
	const credits = await commitPrompt(sql, context.userId, gate.used, CREDIT_COSTS.ask, gate.bill);
	await logPrayer(sql, context.userId, "response", "terminal", "done");
	return {
		ok: true,
		content: result.content,
		provider: result.provider,
		credits
	};
});
var generateReport_createServerFn_handler = createServerRpc({
	id: "9b69c3df150d91018d16599c72c54a05ac07d93db8947d32f2f8696191c03ace",
	name: "generateReport",
	filename: "src/lib/temple/fns.ts"
}, (opts) => generateReport.__executeServer(opts));
var generateReport = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(generateReport_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await ensureProfile(sql, context.userId);
	await ensureFindings(sql);
	const gate = await authorizePrompt(sql, context.userId, CREDIT_COSTS.report);
	if (!gate.ok) return gate;
	const engId = await currentEngagementId(sql, context.userId);
	const eng = (engId ? await sql`
          select id, name, client, scope, notes, status, created_at, updated_at
          from engagements where id = ${engId} and user_id = ${context.userId}
        ` : [])[0] ?? null;
	const results = await sql`
      select kind, content from agent_results where user_id = ${context.userId}
    `;
	const byKind = {};
	for (const r of results) byKind[r.kind] = r.content.slice(0, 1500);
	const target = data.target.trim() || eng?.scope || "unknown";
	const findings = await sql`
      select title, severity, status, next_step from findings
      where user_id = ${context.userId}
      order by created_at desc
      limit 12
    `;
	const findingBlock = findings.length ? findings.map((f, i) => `${i + 1}. [${f.severity}/${f.status}] ${f.title} — ${f.next_step}`).join("\n") : "(none yet)";
	const prompt = `Write a client-facing purple-team report from the following engagement data.

ENGAGEMENT:
${eng ? `Name: ${eng.name}\nClient: ${eng.client || "—"}\nScope: ${eng.scope || "—"}\nNotes: ${eng.notes || "—"}` : "Ad-hoc (no engagement record)"}

PRIMARY TARGET: ${target}

OPEN FINDINGS:
${findingBlock}

AGENT OUTPUTS:
### Recon
${byKind.recon || "(none)"}

### Exploit
${byKind.exploit || "(none)"}

### Detection
${byKind.detection || "(none)"}

### Hardening
${byKind.hardening || "(none)"}

OUTPUT FORMAT (Markdown only):

# Purple Team Report — ${eng?.name || target}

## Executive Summary
5–8 lines. Risk in plain language. What matters.

## Scope
What was assessed. Assumptions if data incomplete.

## Findings
Numbered, prioritized. Each: title, severity (High/Med/Low), evidence/rationale, impact.

## Attack Paths
Plausible paths demonstrated or strongly supported. Short.

## Detection Gaps
Where monitoring fails or is weak.

## Recommendations
### Immediate
### Short-term
### Structural
Each item: action + why.

## MITRE ATT&CK (selected)
Technique ID — name — relevance.

## Next Steps
3 concrete follow-ups.

Rules: No filler. No legal boilerplate. If evidence is thin, say so. Prefer precision over length.`;
	await logPrayer(sql, context.userId, "invoke", "report", `report → ${target}`);
	const result = await callFather(prompt, SYSTEM_CORE + " You write concise client-facing security reports. Every sentence earns its place.");
	if (!result.ok) {
		await logPrayer(sql, context.userId, "error", "report", result.error);
		return {
			ok: false,
			error: result.error,
			credits: gate.credits
		};
	}
	const credits = await commitPrompt(sql, context.userId, gate.used, CREDIT_COSTS.report, gate.bill);
	await logPrayer(sql, context.userId, "response", "report", "done");
	await saveHistory(sql, context.userId, engId, "report", target, result.content);
	return {
		ok: true,
		content: result.content,
		credits
	};
});
var sendFeedback_createServerFn_handler = createServerRpc({
	id: "376804450d9024cd2684e14883c36b4b3cd17af753b6750046c13b1cee476694",
	name: "sendFeedback",
	filename: "src/lib/temple/fns.ts"
}, (opts) => sendFeedback.__executeServer(opts));
var sendFeedback = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(sendFeedback_createServerFn_handler, async ({ context, data }) => {
	const message = data.message.trim();
	if (message.length < 5) return {
		ok: false,
		error: "Message too short (min 5)"
	};
	if (message.length > 4e3) return {
		ok: false,
		error: "Message too long"
	};
	const sql = await getSql();
	await ensureProfile(sql, context.userId);
	const id = crypto.randomUUID();
	const rating = data.rating && data.rating >= 1 && data.rating <= 5 ? data.rating : null;
	await sql`
      insert into feedback (id, user_id, rating, category, message)
      values (${id}, ${context.userId}, ${rating}, ${data.category.slice(0, 40)}, ${message})
    `;
	await logPrayer(sql, context.userId, "response", "feedback", "feedback sent");
	return { ok: true };
});
var clearPrayers_createServerFn_handler = createServerRpc({
	id: "6488ef2feb25cbcfc0442acb4b82ab09f8b5e38d5a25a3eee883825ce76e321c",
	name: "clearPrayers",
	filename: "src/lib/temple/fns.ts"
}, (opts) => clearPrayers.__executeServer(opts));
var clearPrayers = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(clearPrayers_createServerFn_handler, async ({ context }) => {
	await (await getSql())`delete from prayers where user_id = ${context.userId}`;
	return { ok: true };
});
var deleteAccountData_createServerFn_handler = createServerRpc({
	id: "b60238764126e4d38eb7a1feeecce2bcf3573c78a9410d9747bc6fcce7aa0b94",
	name: "deleteAccountData",
	filename: "src/lib/temple/fns.ts"
}, (opts) => deleteAccountData.__executeServer(opts));
var deleteAccountData = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(deleteAccountData_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await sql`delete from history where user_id = ${context.userId}`;
	await sql`delete from prayers where user_id = ${context.userId}`;
	await sql`delete from agent_results where user_id = ${context.userId}`;
	await sql`delete from engagements where user_id = ${context.userId}`;
	await sql`delete from loop_state where user_id = ${context.userId}`;
	await sql`delete from feedback where user_id = ${context.userId}`;
	await sql`delete from purchases where user_id = ${context.userId}`;
	await sql`delete from profiles where user_id = ${context.userId}`;
	return { ok: true };
});
//#endregion
export { askFather_createServerFn_handler, clearPrayers_createServerFn_handler, createEngagement_createServerFn_handler, deleteAccountData_createServerFn_handler, generateReport_createServerFn_handler, getSnapshot_createServerFn_handler, runAgent_createServerFn_handler, runExposure_createServerFn_handler, runTool_createServerFn_handler, sealCycle_createServerFn_handler, selectEngagement_createServerFn_handler, sendFeedback_createServerFn_handler, setLoopRunning_createServerFn_handler, setTarget_createServerFn_handler };
