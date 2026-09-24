import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import {
  AGENT_DEFS,
  SYSTEM_CORE,
  TOOL_DEFS,
  type AgentName,
} from "./prompts";
import { CREDIT_COSTS, DAILY_FREE_PROMPTS, FREE_TOOLS, KALI_TOOLS } from "./catalog";
import { callFather } from "./father";
import {
  ensureProfile,
  logPrayer,
  readProfile,
  saveHistory,
} from "./db";
import type {
  AgentResult,
  AgentStatus,
  Engagement,
  LoopSnapshot,
  Prayer,
  TempleSnapshot,
} from "./types";

const AGENTS: AgentName[] = ["recon", "exploit", "detection", "hardening"];

function asAgent(name: string): AgentName | null {
  return AGENTS.includes(name as AgentName) ? (name as AgentName) : null;
}

async function spendCredits(
  sql: Awaited<ReturnType<typeof getSql>>,
  userId: string,
  cost: number,
): Promise<{ ok: true; credits: number; pro: boolean } | { ok: false; error: string }> {
  const profile = await readProfile(sql, userId);
  if (profile.pro) return { ok: true, credits: profile.credits, pro: true };
  if (profile.credits < cost) {
    return {
      ok: false,
      error: `Insufficient credits (${profile.credits}). Buy more in the Shop.`,
    };
  }
  await sql`update profiles set credits = credits - ${cost} where user_id = ${userId}`;
  return { ok: true, credits: profile.credits - cost, pro: false };
}

type SqlClient = Awaited<ReturnType<typeof getSql>>;

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Twenty prompts are free for all users. After that, a €20/month subscription is required. */
async function authorizePrompt(
  sql: SqlClient,
  userId: string,
  _cost: number,
): Promise<
  | { ok: true; bill: false; used: number; credits: number }
  | { ok: false; error: string }
> {
  const profile = await readProfile(sql, userId);
  const used = profile.promptsUsed;

  // Allow prompts if: subscription is active OR less than 20 free prompts used
  if (profile.subscriptionStatus === "active" || used < DAILY_FREE_PROMPTS) {
    return { ok: true, bill: false, used, credits: profile.credits };
  }

  return {
    ok: false,
    error: "20 prompts used today. Subscribe for €20/month to continue.",
  };
}

async function commitPrompt(
  sql: SqlClient,
  userId: string,
  used: number,
  cost: number,
  bill: boolean,
): Promise<number> {
  const today = todayUtc();
  await sql`
    update profiles
    set prompt_day = ${today}, prompts_today = ${used + 1}
    where user_id = ${userId}
  `;
  if (!bill) return (await readProfile(sql, userId)).credits;
  const spent = await spendCredits(sql, userId, cost);
  return spent.ok ? spent.credits : 0;
}

async function currentEngagementId(
  sql: Awaited<ReturnType<typeof getSql>>,
  userId: string,
): Promise<string | null> {
  const rows = await sql<{ current_engagement_id: string | null }>`
    select current_engagement_id from loop_state where user_id = ${userId}
  `;
  return rows[0]?.current_engagement_id ?? null;
}

export const getSnapshot = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<TempleSnapshot> => {
    const sql = await getSql();
    await ensureProfile(sql, context.userId);

    const profile = await readProfile(sql, context.userId);

    const loopRows = await sql<LoopSnapshot>`
      select running, current_phase, cycle, target, current_engagement_id,
             stats_cycles, stats_vulns, stats_exploits, stats_detections
      from loop_state where user_id = ${context.userId}
    `;
    const loop = loopRows[0] ?? {
      running: false,
      current_phase: "idle",
      cycle: 0,
      target: "localhost",
      current_engagement_id: null,
      stats_cycles: 0,
      stats_vulns: 0,
      stats_exploits: 0,
      stats_detections: 0,
    };

    const engagements = await sql<Engagement>`
      select id, name, client, scope, notes, status, created_at, updated_at
      from engagements where user_id = ${context.userId}
      order by updated_at desc
    `;
    const engagement =
      engagements.find((e) => e.id === loop.current_engagement_id) ?? null;

    const prayerRows = await sql<{
      event: string;
      agent: string;
      message: string;
      created_at: string;
    }>`
      select event, agent, message, created_at
      from prayers where user_id = ${context.userId}
      order by id desc limit 80
    `;
    const prayers: Prayer[] = prayerRows
      .slice()
      .reverse()
      .map((p) => ({
        ts: p.created_at,
        event: p.event,
        agent: p.agent,
        message: p.message,
      }));

    const resultRows = await sql<{
      kind: string;
      target: string;
      content: string;
      created_at: string;
    }>`
      select kind, target, content, created_at
      from agent_results where user_id = ${context.userId}
    `;
    const results: Record<string, AgentResult | null> = {
      recon: null,
      exploit: null,
      detection: null,
      hardening: null,
    };
    for (const r of resultRows) {
      results[r.kind] = { target: r.target, content: r.content, created_at: r.created_at };
    }

    const agents: Record<string, AgentStatus> = {
      recon: "idle",
      exploit: "idle",
      detection: "idle",
      hardening: "idle",
    };
    const phase = loop.current_phase;
    for (const name of AGENTS) {
      if (phase === name) agents[name] = "running";
      else if (results[name]) agents[name] = "complete";
    }

    const father = process.env.XAI_API_KEY ? "online" : "offline";

    return {
      profile,
      loop: {
        ...loop,
        running: Boolean(loop.running),
        cycle: Number(loop.cycle),
        stats_cycles: Number(loop.stats_cycles),
        stats_vulns: Number(loop.stats_vulns),
        stats_exploits: Number(loop.stats_exploits),
        stats_detections: Number(loop.stats_detections),
      },
      agents,
      engagement,
      engagements,
      prayers,
      results,
      father,
    };
  });

export const createEngagement = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { name: string; client: string; scope: string; notes: string }) => input)
  .handler(async ({ context, data }) => {
    const name = data.name.trim();
    if (name.length < 2) return { ok: false as const, error: "Name required (≥2)" };
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
    return { ok: true as const, id, name };
  });

export const selectEngagement = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureProfile(sql, context.userId);
    if (!data.id) {
      await sql`
        update loop_state set current_engagement_id = null, updated_at = now()
        where user_id = ${context.userId}
      `;
      return { ok: true as const };
    }
    const found = await sql<{ id: string }>`
      select id from engagements where id = ${data.id} and user_id = ${context.userId}
    `;
    if (!found[0]) return { ok: false as const, error: "Not found" };
    await sql`
      update loop_state set current_engagement_id = ${data.id}, updated_at = now()
      where user_id = ${context.userId}
    `;
    return { ok: true as const };
  });

export const setTarget = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { target: string }) => input)
  .handler(async ({ context, data }) => {
    const target = data.target.trim() || "localhost";
    const sql = await getSql();
    await ensureProfile(sql, context.userId);
    await sql`
      update loop_state set target = ${target}, updated_at = now()
      where user_id = ${context.userId}
    `;
    return { ok: true as const, target };
  });

export const setLoopRunning = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { running: boolean; target?: string }) => input)
  .handler(async ({ context, data }) => {
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
    return { ok: true as const };
  });

export const runAgent = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { name: string; target: string }) => input)
  .handler(async ({ context, data }) => {
    const name = asAgent(data.name);
    if (!name) return { ok: false as const, error: "Unknown agent" };
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
      return { ok: false as const, error: result.error, credits: gate.credits };
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
    await logPrayer(sql, context.userId, "response", `${name}-agent`, "done");

    if (name === "recon") {
      await sql`update loop_state set stats_vulns = stats_vulns + 1 where user_id = ${context.userId}`;
    }
    if (name === "exploit") {
      await sql`update loop_state set stats_exploits = stats_exploits + 1 where user_id = ${context.userId}`;
    }
    if (name === "detection") {
      await sql`update loop_state set stats_detections = stats_detections + 1 where user_id = ${context.userId}`;
    }

    await sql`
      update loop_state set current_phase = ${name + "_complete"}, updated_at = now()
      where user_id = ${context.userId}
    `;

    return {
      ok: true as const,
      content: result.content,
      provider: result.provider,
      credits,
    };
  });

export const sealCycle = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
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
    const rows = await sql<{ cycle: number }>`
      select cycle from loop_state where user_id = ${context.userId}
    `;
    const cycle = Number(rows[0]?.cycle ?? 0);
    await logPrayer(sql, context.userId, "cycle_end", "purple-loop", `Cycle #${cycle} sealed`);
    return { ok: true as const, cycle };
  });

export const runTool = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { tool: string; target: string }) => input)
  .handler(async ({ context, data }) => {
    const def = TOOL_DEFS[data.tool];
    if (!def) return { ok: false as const, error: "Unknown tool" };
    const sql = await getSql();
    await ensureProfile(sql, context.userId);
    if (
      !(FREE_TOOLS as readonly string[]).includes(data.tool) &&
      !(KALI_TOOLS as readonly string[]).includes(data.tool)
    ) {
      return { ok: false as const, error: "Unknown tool" };
    }

    const gate = await authorizePrompt(sql, context.userId, CREDIT_COSTS.tool);
    if (!gate.ok) return gate;

    const target = data.target.trim() || "localhost";
    await logPrayer(sql, context.userId, "invoke", `tool-${data.tool}`, `${data.tool} → ${target}`);
    const result = await callFather(def.prompt(target), def.system);
    if (!result.ok) {
      await logPrayer(sql, context.userId, "error", `tool-${data.tool}`, result.error);
      return { ok: false as const, error: result.error, credits: gate.credits };
    }
    const credits = await commitPrompt(sql, context.userId, gate.used, CREDIT_COSTS.tool, gate.bill);
    await logPrayer(sql, context.userId, "response", `tool-${data.tool}`, "done");
    const engId = await currentEngagementId(sql, context.userId);
    await saveHistory(sql, context.userId, engId, "tool-" + data.tool, target, result.content);
    return {
      ok: true as const,
      content: result.content,
      provider: result.provider,
      credits,
    };
  });

export const askFather = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { prompt: string }) => input)
  .handler(async ({ context, data }) => {
    const prompt = data.prompt.trim();
    if (!prompt) return { ok: false as const, error: "Empty prompt" };
    const sql = await getSql();
    await ensureProfile(sql, context.userId);
    const gate = await authorizePrompt(sql, context.userId, CREDIT_COSTS.ask);
    if (!gate.ok) return gate;
    await logPrayer(sql, context.userId, "invoke", "terminal", prompt.slice(0, 80));
    const result = await callFather(prompt, SYSTEM_CORE);
    if (!result.ok) {
      await logPrayer(sql, context.userId, "error", "terminal", result.error);
      return { ok: false as const, error: result.error, credits: gate.credits };
    }
    const credits = await commitPrompt(sql, context.userId, gate.used, CREDIT_COSTS.ask, gate.bill);
    await logPrayer(sql, context.userId, "response", "terminal", "done");
    return {
      ok: true as const,
      content: result.content,
      provider: result.provider,
      credits,
    };
  });

export const generateReport = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { target: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureProfile(sql, context.userId);
    const gate = await authorizePrompt(sql, context.userId, CREDIT_COSTS.report);
    if (!gate.ok) return gate;

    const engId = await currentEngagementId(sql, context.userId);
    const engRows = engId
      ? await sql<Engagement>`
          select id, name, client, scope, notes, status, created_at, updated_at
          from engagements where id = ${engId} and user_id = ${context.userId}
        `
      : [];
    const eng = engRows[0] ?? null;
    const results = await sql<{ kind: string; content: string }>`
      select kind, content from agent_results where user_id = ${context.userId}
    `;
    const byKind: Record<string, string> = {};
    for (const r of results) byKind[r.kind] = r.content.slice(0, 1500);

    const target = data.target.trim() || eng?.scope || "unknown";
    const prompt = `Write a client-facing purple-team report from the following engagement data.

ENGAGEMENT:
${eng ? `Name: ${eng.name}\nClient: ${eng.client || "—"}\nScope: ${eng.scope || "—"}\nNotes: ${eng.notes || "—"}` : "Ad-hoc (no engagement record)"}

PRIMARY TARGET: ${target}

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
    const result = await callFather(
      prompt,
      SYSTEM_CORE + " You write concise client-facing security reports. Every sentence earns its place.",
    );
    if (!result.ok) {
      await logPrayer(sql, context.userId, "error", "report", result.error);
      return { ok: false as const, error: result.error, credits: gate.credits };
    }
    const credits = await commitPrompt(sql, context.userId, gate.used, CREDIT_COSTS.report, gate.bill);
    await logPrayer(sql, context.userId, "response", "report", "done");
    await saveHistory(sql, context.userId, engId, "report", target, result.content);
    return { ok: true as const, content: result.content, credits };
  });

export const sendFeedback = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { message: string; category: string; rating: number | null }) => input)
  .handler(async ({ context, data }) => {
    const message = data.message.trim();
    if (message.length < 5) return { ok: false as const, error: "Message too short (min 5)" };
    if (message.length > 4000) return { ok: false as const, error: "Message too long" };
    const sql = await getSql();
    await ensureProfile(sql, context.userId);
    const id = crypto.randomUUID();
    const rating =
      data.rating && data.rating >= 1 && data.rating <= 5 ? data.rating : null;
    await sql`
      insert into feedback (id, user_id, rating, category, message)
      values (${id}, ${context.userId}, ${rating}, ${data.category.slice(0, 40)}, ${message})
    `;
    await logPrayer(sql, context.userId, "response", "feedback", "feedback sent");
    return { ok: true as const };
  });

export const clearPrayers = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await sql`delete from prayers where user_id = ${context.userId}`;
    return { ok: true as const };
  });

export const deleteAccountData = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await sql`delete from history where user_id = ${context.userId}`;
    await sql`delete from prayers where user_id = ${context.userId}`;
    await sql`delete from agent_results where user_id = ${context.userId}`;
    await sql`delete from engagements where user_id = ${context.userId}`;
    await sql`delete from loop_state where user_id = ${context.userId}`;
    await sql`delete from feedback where user_id = ${context.userId}`;
    await sql`delete from purchases where user_id = ${context.userId}`;
    await sql`delete from profiles where user_id = ${context.userId}`;
    return { ok: true as const };
  });
