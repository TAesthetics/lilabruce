import { r as createServerFn } from "./ssr.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
import { t as authMiddleware } from "./middleware-Bwsq9YNt.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/findings-DDK5oQeC.js
var TACTIC = {
	recon: "Reconnaissance",
	exploit: "Initial Access",
	detection: "Detection",
	hardening: "Harden",
	report: "Report",
	ask: "Advisory",
	scope: "Scope",
	note: "Note"
};
function guessSeverity(text) {
	const t = text.toLowerCase();
	if (/\bcritical\b/.test(t)) return "critical";
	if (/\bhigh\b/.test(t)) return "high";
	if (/\bmedium\b|\bmed\b/.test(t)) return "medium";
	if (/\blow\b/.test(t)) return "low";
	return "info";
}
function titleFrom(source, target, content) {
	return (content.split("\n").map((l) => l.replace(/^#+\s*/, "").trim()).find((l) => l.length > 6 && l.length < 96 && !l.startsWith("-")) || `${source} · ${target}`).slice(0, 120);
}
function nextFrom(content) {
	const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
	const idx = lines.findIndex((l) => /next hop|next step|success criteria|recommendations/i.test(l));
	return (idx >= 0 ? lines.slice(idx, idx + 3) : lines.slice(-2)).join(" ").slice(0, 320);
}
async function ensureFindings(sql) {
	await sql`
    create table if not exists findings (
      id text primary key,
      user_id text not null,
      target text not null default '',
      source text not null default 'note',
      title text not null,
      severity text not null default 'info',
      status text not null default 'open',
      tactic text not null default '',
      detail text not null default '',
      next_step text not null default '',
      created_at timestamptz not null default now()
    )
  `;
}
async function recordFinding(sql, userId, input) {
	await ensureFindings(sql);
	const id = crypto.randomUUID();
	const source = input.source.slice(0, 40);
	const detail = input.content.slice(0, 4e3);
	const severity = input.severity || guessSeverity(detail);
	await sql`
    insert into findings (id, user_id, target, source, title, severity, status, tactic, detail, next_step)
    values (
      ${id},
      ${userId},
      ${input.target.slice(0, 200)},
      ${source},
      ${(input.title || titleFrom(source, input.target, detail)).slice(0, 120)},
      ${severity},
      'open',
      ${TACTIC[source] ?? source},
      ${detail},
      ${nextFrom(detail)}
    )
  `;
}
var listFindings = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("408b3a7f68ec7f7184a42b0474d5bb414c0f28e3c27d8e3cf068ef81169db843"));
var addFinding = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("d26b84e62c0f314a310fa0c739bc25077df3eb3fd601b2a3d5e2143d63ec205a"));
var setFindingStatus = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("163ac33f055b88d815fde9586700d25b1a8d66c2c3f8bbfe04ba132ebcd5d576"));
//#endregion
export { setFindingStatus as a, recordFinding as i, ensureFindings as n, listFindings as r, addFinding as t };
