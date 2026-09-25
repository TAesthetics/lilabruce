import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { t as authMiddleware } from "./middleware-CpNJlhqp.mjs";
import { i as getSql } from "./db-D6L-vCpY.mjs";
import { n as ensureFindings } from "./findings-CXQjqeK4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/map-CFl9ZYxt.js
/**
* Generate hardening recommendations based on map analysis
*/
function generateHardeningRecs(nodes, edges) {
	const recs = [];
	const highRisk = Array.from(nodes.values()).filter((n) => n.risk === "critical" || n.risk === "high").length;
	if (highRisk > 0) recs.push(`Patch ${highRisk} critical/high-risk systems`);
	const exploitPaths = Array.from(edges.values()).filter((e) => e.type === "exploit-path");
	if (exploitPaths.length > 0) recs.push(`Isolate network segments (${exploitPaths.length} lateral paths)`);
	const subnets = Array.from(nodes.values()).filter((n) => n.type === "network");
	if (subnets.length > 0) recs.push(`Implement microsegmentation between ${subnets.length} subnets`);
	return recs;
}
/**
* Helper: Guess node type from string
*/
function guessNodeType(id) {
	if (id.includes("/")) return "network";
	if (id.includes(".")) return "host";
	if (id.includes(":")) return "service";
	if (id.includes("@")) return "user";
	return "external";
}
/**
* Helper: Assess risk from finding description
*/
function assessRisk(content) {
	const lower = content.toLowerCase();
	if (lower.includes("rce") || lower.includes("remote code")) return "critical";
	if (lower.includes("sql") || lower.includes("xss") || lower.includes("auth bypass")) return "high";
	if (lower.includes("weak") || lower.includes("outdated")) return "medium";
	if (lower.includes("info")) return "info";
	return "low";
}
/**
* Helper: Extract lateral movement paths from exploit findings
*/
/** Map for the signed-in operator, built from saved findings. */
var getUserMap_createServerFn_handler = createServerRpc({
	id: "a4976606cf29bdc42219c4905214060cb3704c5d2f121378703c483264486fee",
	name: "getUserMap",
	filename: "src/lib/temple/map.ts"
}, (opts) => getUserMap.__executeServer(opts));
var getUserMap = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getUserMap_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await ensureFindings(sql);
	const findings = await sql`
      select id, target, source as kind, detail as content
      from findings
      where user_id = ${context.userId}
      order by created_at desc
      limit 100
    `;
	const nodes = /* @__PURE__ */ new Map();
	for (const finding of findings) {
		const id = finding.target || "unknown";
		const risk = assessRisk(finding.content);
		const existing = nodes.get(id);
		if (!existing) nodes.set(id, {
			id,
			type: guessNodeType(id),
			label: id,
			risk,
			findings: [finding.id],
			lastSeen: (/* @__PURE__ */ new Date()).toISOString()
		});
		else {
			existing.findings.push(finding.id);
			const rank = {
				critical: 5,
				high: 4,
				medium: 3,
				low: 2,
				info: 1
			};
			if (rank[risk] > rank[existing.risk]) existing.risk = risk;
		}
	}
	return {
		engagementId: context.userId,
		nodes: Array.from(nodes.values()),
		edges: [],
		lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
		attackSurface: {
			exposedServices: nodes.size,
			vulnerableHosts: Array.from(nodes.values()).filter((n) => n.risk === "critical" || n.risk === "high").length,
			lateralPaths: [],
			recommendedHardening: generateHardeningRecs(nodes, /* @__PURE__ */ new Map())
		}
	};
});
//#endregion
export { getUserMap_createServerFn_handler };
