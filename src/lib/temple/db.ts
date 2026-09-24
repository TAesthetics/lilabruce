import type { Sql } from "@/lib/db";
import type { ProfileState } from "./types";
import { DAILY_FREE_PROMPTS } from "./catalog";

let schemaReady: Promise<void> | null = null;

async function ensureTempleColumns(sql: Sql) {
  await sql`alter table profiles add column if not exists prompt_day date`;
  await sql`alter table profiles add column if not exists prompts_today integer not null default 0`;
  await sql`alter table profiles add column if not exists paid_day date`;
}

export async function ensureProfile(sql: Sql, userId: string) {
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

export function parseEntitlements(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((x): x is string => typeof x === "string");
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) return parsed.filter((x): x is string => typeof x === "string");
    } catch {
      return [];
    }
  }
  return [];
}

export function isPro(proUntil: string | Date | null | undefined): boolean {
  if (!proUntil) return false;
  const t = typeof proUntil === "string" ? Date.parse(proUntil) : proUntil.getTime();
  return Number.isFinite(t) && t > Date.now();
}

export async function readProfile(sql: Sql, userId: string): Promise<ProfileState> {
  const rows = await sql<{
    credits: number;
    pro_until: string | null;
    entitlements: unknown;
    venice_key: string;
    handle: string | null;
    prompt_day: string | null;
    prompts_today: number;
    paid_day: string | null;
  }>`
    select credits, pro_until, entitlements, venice_key, handle, prompt_day, prompts_today, paid_day
    from profiles where user_id = ${userId}
  `;
  const row = rows[0];
  const entitlements = parseEntitlements(row?.entitlements);
  const pro = isPro(row?.pro_until) || entitlements.includes("pro");
  const today = new Date().toISOString().slice(0, 10);
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
    promptsLeft: pro ? DAILY_FREE_PROMPTS : Math.max(0, DAILY_FREE_PROMPTS - promptsToday),
    paidToday,
  };
}

export async function logPrayer(
  sql: Sql,
  userId: string,
  event: string,
  agent: string,
  message: string,
) {
  await sql`
    insert into prayers (user_id, event, agent, message)
    values (${userId}, ${event}, ${agent}, ${message.slice(0, 500)})
  `;
}

export async function saveHistory(
  sql: Sql,
  userId: string,
  engagementId: string | null,
  kind: string,
  target: string,
  content: string,
) {
  const id = crypto.randomUUID();
  await sql`
    insert into history (id, user_id, engagement_id, kind, target, content)
    values (${id}, ${userId}, ${engagementId}, ${kind}, ${target}, ${content})
  `;
}
