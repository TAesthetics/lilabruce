//#region node_modules/.nitro/vite/services/ssr/assets/db-BAhP72_9.js
var CATALOG = [{
	id: "month_15",
	name: "Monthly",
	blurb: "€15 per month. After 20 prompts in a day, this keeps the console open.",
	priceUsd: 15,
	priceLabel: "€15 / month",
	type: "subscription",
	credits: 0,
	entitlement: "pro",
	period: "month",
	currency: "eur",
	appleProductId: "temple.month.15",
	googleProductId: "temple.month.15",
	highlight: true
}];
var CREDIT_COSTS = {
	agent: 2,
	tool: 1,
	ask: 1,
	report: 3
};
var FREE_TOOLS = [
	"portscan",
	"vulnscan",
	"webapp",
	"osint",
	"siem"
];
var KALI_TOOLS = [
	"privesc",
	"lateral",
	"evasion",
	"mitre"
];
function billedByStripe(product) {
	return product.priceUsd >= 15;
}
function getProduct(id) {
	return CATALOG.find((p) => p.id === id);
}
function nativeProductId(product, platform) {
	return platform === "ios" ? product.appleProductId : product.googleProductId;
}
var schemaReady = null;
async function ensureTempleColumns(sql) {
	await sql`alter table profiles add column if not exists prompt_day date`;
	await sql`alter table profiles add column if not exists prompts_today integer not null default 0`;
	await sql`alter table profiles add column if not exists paid_day date`;
	await sql`alter table profiles add column if not exists subscription_status text default 'none'`;
	await sql`alter table profiles add column if not exists subscription_id text`;
	await sql`alter table profiles add column if not exists stripe_customer_id text`;
	await sql`alter table profiles add column if not exists subscription_started_at timestamptz`;
	await sql`alter table profiles add column if not exists subscription_ends_at timestamptz`;
}
async function ensureProfile(sql, userId) {
	schemaReady ??= ensureTempleColumns(sql).catch((err) => {
		schemaReady = null;
		throw err;
	});
	await schemaReady;
	await sql`
    insert into profiles (user_id, credits)
    values (${userId}, 20)
    on conflict (user_id) do nothing
  `;
	await sql`
    insert into loop_state (user_id)
    values (${userId})
    on conflict (user_id) do nothing
  `;
}
function parseEntitlements(raw) {
	if (Array.isArray(raw)) return raw.filter((x) => typeof x === "string");
	if (typeof raw === "string") try {
		const parsed = JSON.parse(raw);
		if (Array.isArray(parsed)) return parsed.filter((x) => typeof x === "string");
	} catch {
		return [];
	}
	return [];
}
function isPro(proUntil) {
	if (!proUntil) return false;
	const t = typeof proUntil === "string" ? Date.parse(proUntil) : proUntil.getTime();
	return Number.isFinite(t) && t > Date.now();
}
async function readProfile(sql, userId) {
	const row = (await sql`
    select credits, pro_until, entitlements, venice_key, handle, prompt_day, prompts_today, paid_day, subscription_status
    from profiles where user_id = ${userId}
  `)[0];
	const entitlements = parseEntitlements(row?.entitlements);
	const pro = isPro(row?.pro_until) || entitlements.includes("pro") || row?.subscription_status === "active";
	const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	const day = row?.prompt_day ? String(row.prompt_day).slice(0, 10) : "";
	const paidDay = row?.paid_day ? String(row.paid_day).slice(0, 10) : "";
	const promptsToday = day === today ? Number(row?.prompts_today ?? 0) : 0;
	const paidToday = paidDay === today;
	return {
		credits: Number(row?.credits ?? 0),
		pro,
		proUntil: row?.pro_until ?? null,
		entitlements,
		hasVenice: false,
		handle: row?.handle ?? null,
		promptsToday,
		promptsLeft: pro ? 20 : Math.max(0, 20 - promptsToday),
		paidToday
	};
}
async function logPrayer(sql, userId, event, agent, message) {
	await sql`
    insert into prayers (user_id, event, agent, message)
    values (${userId}, ${event}, ${agent}, ${message.slice(0, 500)})
  `;
}
async function saveHistory(sql, userId, engagementId, kind, target, content) {
	await sql`
    insert into history (id, user_id, engagement_id, kind, target, content)
    values (${crypto.randomUUID()}, ${userId}, ${engagementId}, ${kind}, ${target}, ${content})
  `;
}
//#endregion
export { billedByStripe as a, logPrayer as c, readProfile as d, saveHistory as f, KALI_TOOLS as i, nativeProductId as l, CREDIT_COSTS as n, ensureProfile as o, FREE_TOOLS as r, getProduct as s, CATALOG as t, parseEntitlements as u };
