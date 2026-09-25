import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { t as authMiddleware } from "./middleware-Bwsq9YNt.mjs";
import { i as getSql } from "./db-D6L-vCpY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/findings-D4uAgm2g.js
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
var listFindings_createServerFn_handler = createServerRpc({
	id: "408b3a7f68ec7f7184a42b0474d5bb414c0f28e3c27d8e3cf068ef81169db843",
	name: "listFindings",
	filename: "src/lib/temple/findings.ts"
}, (opts) => listFindings.__executeServer(opts));
var listFindings = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listFindings_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await ensureFindings(sql);
	return sql`
      select id, target, source, title, severity, status, tactic, detail, next_step, created_at
      from findings
      where user_id = ${context.userId}
      order by created_at desc
      limit 40
    `;
});
var addFinding_createServerFn_handler = createServerRpc({
	id: "d26b84e62c0f314a310fa0c739bc25077df3eb3fd601b2a3d5e2143d63ec205a",
	name: "addFinding",
	filename: "src/lib/temple/findings.ts"
}, (opts) => addFinding.__executeServer(opts));
var addFinding = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(addFinding_createServerFn_handler, async ({ context, data }) => {
	const title = data.title.trim();
	if (!title) return {
		ok: false,
		error: "Title required"
	};
	await recordFinding(await getSql(), context.userId, {
		source: data.source || "note",
		target: data.target || "",
		content: `${title}\n${data.detail.trim()}`
	});
	return { ok: true };
});
var setFindingStatus_createServerFn_handler = createServerRpc({
	id: "163ac33f055b88d815fde9586700d25b1a8d66c2c3f8bbfe04ba132ebcd5d576",
	name: "setFindingStatus",
	filename: "src/lib/temple/findings.ts"
}, (opts) => setFindingStatus.__executeServer(opts));
var setFindingStatus = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(setFindingStatus_createServerFn_handler, async ({ context, data }) => {
	const status = [
		"open",
		"accepted",
		"closed"
	].includes(data.status) ? data.status : "open";
	const sql = await getSql();
	await ensureFindings(sql);
	await sql`
      update findings set status = ${status}
      where id = ${data.id} and user_id = ${context.userId}
    `;
	return { ok: true };
});
//#endregion
export { addFinding_createServerFn_handler, listFindings_createServerFn_handler, setFindingStatus_createServerFn_handler };
