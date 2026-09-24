import { createServerFn } from "@tanstack/react-start";
import { getSql, type Sql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";

export interface Finding {
  id: string;
  target: string;
  source: string;
  title: string;
  severity: string;
  status: string;
  tactic: string;
  detail: string;
  next_step: string;
  created_at: string;
}

const TACTIC: Record<string, string> = {
  recon: "Reconnaissance",
  exploit: "Initial Access",
  detection: "Detection",
  hardening: "Harden",
  report: "Report",
  ask: "Advisory",
  scope: "Scope",
  note: "Note",
};

export function guessSeverity(text: string): string {
  const t = text.toLowerCase();
  if (/\bcritical\b/.test(t)) return "critical";
  if (/\bhigh\b/.test(t)) return "high";
  if (/\bmedium\b|\bmed\b/.test(t)) return "medium";
  if (/\blow\b/.test(t)) return "low";
  return "info";
}

function titleFrom(source: string, target: string, content: string): string {
  const line = content
    .split("\n")
    .map((l) => l.replace(/^#+\s*/, "").trim())
    .find((l) => l.length > 6 && l.length < 96 && !l.startsWith("-"));
  return (line || `${source} · ${target}`).slice(0, 120);
}

function nextFrom(content: string): string {
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
  const idx = lines.findIndex((l) => /next hop|next step|success criteria|recommendations/i.test(l));
  const slice = idx >= 0 ? lines.slice(idx, idx + 3) : lines.slice(-2);
  return slice.join(" ").slice(0, 320);
}

export async function ensureFindings(sql: Sql) {
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

export async function recordFinding(
  sql: Sql,
  userId: string,
  input: { source: string; target: string; content: string },
) {
  await ensureFindings(sql);
  const id = crypto.randomUUID();
  const source = input.source.slice(0, 40);
  const detail = input.content.slice(0, 4000);
  await sql`
    insert into findings (id, user_id, target, source, title, severity, status, tactic, detail, next_step)
    values (
      ${id},
      ${userId},
      ${input.target.slice(0, 200)},
      ${source},
      ${titleFrom(source, input.target, detail)},
      ${guessSeverity(detail)},
      'open',
      ${TACTIC[source] ?? source},
      ${detail},
      ${nextFrom(detail)}
    )
  `;
}

export const listFindings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await ensureFindings(sql);
    return sql<Finding>`
      select id, target, source, title, severity, status, tactic, detail, next_step, created_at
      from findings
      where user_id = ${context.userId}
      order by created_at desc
      limit 40
    `;
  });

export const addFinding = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { target: string; title: string; detail: string; source?: string }) => input)
  .handler(async ({ context, data }) => {
    const title = data.title.trim();
    if (!title) return { ok: false as const, error: "Title required" };
    const sql = await getSql();
    await recordFinding(sql, context.userId, {
      source: data.source || "note",
      target: data.target || "",
      content: `${title}\n${data.detail.trim()}`,
    });
    return { ok: true as const };
  });

export const setFindingStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string; status: string }) => input)
  .handler(async ({ context, data }) => {
    const status = ["open", "accepted", "closed"].includes(data.status) ? data.status : "open";
    const sql = await getSql();
    await ensureFindings(sql);
    await sql`
      update findings set status = ${status}
      where id = ${data.id} and user_id = ${context.userId}
    `;
    return { ok: true as const };
  });
