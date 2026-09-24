import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Crosshair,
  FileText,
  Mail,
  Plus,
  Radio,
  Search,
  Send,
  Settings,
  Shield,
} from "lucide-react";
import { AuthGate } from "@/components/temple/auth-gate";
import { Clock } from "@/components/temple/clock";
import { TempleShell } from "@/components/temple/shell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { UserButton } from "@/lib/auth/gates";
import { cn } from "@/lib/utils";
import { FREE_TOOLS, KALI_TOOLS, DAILY_FREE_PROMPTS } from "@/lib/temple/catalog";
import { TOOL_DEFS } from "@/lib/temple/prompts";
import {
  askFather,
  clearPrayers,
  createEngagement,
  generateReport,
  getSnapshot,
  runAgent,
  runTool,
  sealCycle,
  selectEngagement,
  sendFeedback,
  setLoopRunning,
  setTarget,
} from "@/lib/temple/fns";
import type { AgentName } from "@/lib/temple/prompts";

export const Route = createFileRoute("/deck")({
  component: () => (
    <AuthGate>
      <DeckPage />
    </AuthGate>
  ),
});

const AGENT_META: { id: AgentName; name: string; icon: typeof Search }[] = [
  { id: "recon", name: "Recon", icon: Search },
  { id: "exploit", name: "Exploit", icon: Crosshair },
  { id: "detection", name: "Detect", icon: Radio },
  { id: "hardening", name: "Harden", icon: Shield },
];

type TermLine = { cls: "cmd" | "err" | "info" | "father" | "success"; text: string };

function DeckPage() {
  const snap = useQuery({
    queryKey: ["temple"],
    queryFn: () => getSnapshot(),
    refetchInterval: 4000,
  });
  const data = snap.data;
  const [target, setTargetLocal] = useState("localhost");
  const [tab, setTab] = useState<string>("recon");
  const [result, setResult] = useState("");
  const [lines, setLines] = useState<TermLine[]>([]);
  const [cmd, setCmd] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [busy, setBusy] = useState(false);
  const [loopOn, setLoopOn] = useState(false);
  const [engOpen, setEngOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fbOpen, setFbOpen] = useState(false);
  const [mobilePane, setMobilePane] = useState<"chat" | "ops" | "out">("ops");
  const loopRef = useRef(false);
  const targetRef = useRef(target);
  const termRef = useRef<HTMLDivElement>(null);
  const booted = useRef(false);

  useEffect(() => {
    targetRef.current = target;
  }, [target]);
  useEffect(() => {
    loopRef.current = loopOn;
  }, [loopOn]);
  useEffect(() => {
    if (data?.loop.target && data.loop.target !== target) setTargetLocal(data.loop.target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.loop.target]);
  useEffect(() => {
    if (data?.loop.running) setLoopOn(true);
  }, [data?.loop.running]);
  useEffect(() => {
    termRef.current?.scrollTo({ top: termRef.current.scrollHeight });
  }, [lines]);
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    print("info", "Purple-team chat. Ask about the target, or type /help.");
  }, []);

  function print(cls: TermLine["cls"], text: string) {
    setLines((prev) => [...prev.slice(-340), { cls, text }]);
  }

  async function refresh() {
    await snap.refetch();
  }

  async function doAgent(name: AgentName, override?: string) {
    if (busy) {
      print("err", "busy");
      return;
    }
    const t = override || targetRef.current;
    setBusy(true);
    print("cmd", `${name} → ${t}`);
    try {
      const res = await runAgent({ data: { name, target: t } });
      if (!res.ok) {
        print("err", res.error);
      } else {
        print("success", `${name} ok`);
        setTab(name);
        setResult(res.content);
      }
    } catch (e) {
      print("err", e instanceof Error ? e.message : "failed");
    } finally {
      setBusy(false);
      await refresh();
    }
  }

  useEffect(() => {
    if (!loopOn) return;
    let cancelled = false;
    const phases: AgentName[] = ["recon", "exploit", "detection", "hardening"];
    void (async () => {
      while (!cancelled && loopRef.current) {
        for (const name of phases) {
          if (cancelled || !loopRef.current) return;
          await doAgent(name);
        }
        if (cancelled || !loopRef.current) return;
        await sealCycle();
        await refresh();
        await new Promise((r) => setTimeout(r, 12_000));
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loopOn]);

  async function startLoop() {
    print("cmd", `▶ ${target}`);
    await setLoopRunning({ data: { running: true, target } });
    setLoopOn(true);
    await refresh();
  }
  async function stopLoop() {
    print("cmd", "■");
    setLoopOn(false);
    await setLoopRunning({ data: { running: false } });
    await refresh();
  }

  async function doTool(tool: string) {
    if (busy) return;
    setBusy(true);
    print("cmd", `${tool} → ${target}`);
    try {
      const res = await runTool({ data: { tool, target } });
      if (!res.ok) print("err", res.error);
      else {
        const bits = res.content.split("\n");
        bits.slice(0, 6).forEach((l) => print("father", l));
        if (bits.length > 6) print("info", "… full in RESULTS");
        setResult(res.content);
      }
    } catch (e) {
      print("err", e instanceof Error ? e.message : "failed");
    } finally {
      setBusy(false);
      await refresh();
    }
  }

  async function doReport() {
    if (busy) return;
    setBusy(true);
    print("cmd", "◈ Report…");
    try {
      const res = await generateReport({ data: { target } });
      if (!res.ok) print("err", res.error);
      else {
        print("success", "Report ready");
        setTab("report");
        setResult(res.content);
      }
    } finally {
      setBusy(false);
      await refresh();
    }
  }

  async function exec(raw: string) {
    const parts = raw.split(/\s+/);
    const c = (parts[0] || "").toLowerCase();
    const arg = parts.slice(1).join(" ");
    if (["/help", "help", "?"].includes(c)) {
      print("info", "/target <host>  /loop start|stop  /report  /eng  /shop");
      print("info", "/recon /exploit /detect /harden  /key  /clear");
      return;
    }
    if (["/clear", "clear", "cls"].includes(c)) {
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
      const res = await askFather({
        data: {
          prompt: `Target: ${targetRef.current}\n\nOperator: ${raw}`,
        },
      });
      if (!res.ok) print("err", res.error);
      else print("father", res.content);
    } catch (e) {
      print("err", e instanceof Error ? e.message : "failed");
    } finally {
      setBusy(false);
      await refresh();
    }
  }

  function onTermKey(e: KeyboardEvent<HTMLTextAreaElement>) {
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
  const shownResult =
    tab === "report"
      ? result
      : result || data?.results[tab]?.content || "Select engagement → run agents/tools → generate REPORT.";

  return (
    <TempleShell
      credits={data?.profile.credits}
      pro={data?.profile.pro}
      right={
        <div className="flex items-center gap-1.5">
          <Clock />
          <StatusPill
            label="Model"
            on={data?.father === "online"}
          />
          <button
            type="button"
            className="grid size-9 place-items-center rounded-sm border border-border text-muted hover:border-primary hover:text-primary"
            onClick={() => setFbOpen(true)}
            aria-label="Feedback"
          >
            <Mail className="size-4" />
          </button>
          <button
            type="button"
            className="grid size-9 place-items-center rounded-sm border border-border text-muted hover:border-primary hover:text-primary"
            onClick={() => setSettingsOpen(true)}
            aria-label="Settings"
          >
            <Settings className="size-4" />
          </button>
          <span className="hidden lg:inline-flex">
            <UserButton />
          </span>
        </div>
      }
    >
      <div className="flex gap-1 border-b border-border px-3 py-2 md:hidden">
        {(["chat", "ops", "out"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setMobilePane(p)}
            className={cn(
              "h-9 flex-1 rounded-sm border font-sans text-[10px] tracking-[0.14em] uppercase",
              mobilePane === p ? "border-primary text-primary" : "border-border text-muted",
            )}
          >
            {p === "ops" ? "Tasks" : p === "chat" ? "Chat" : "Result"}
          </button>
        ))}
      </div>

      <div className="mx-auto grid w-full max-w-[1400px] flex-1 grid-cols-1 gap-2.5 p-2.5 md:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)_minmax(260px,0.9fr)] md:overflow-hidden">
        <Panel
          title="Chat"
          meta={
            data?.profile.pro
              ? "included"
              : `${data?.profile.promptsLeft ?? DAILY_FREE_PROMPTS} of ${DAILY_FREE_PROMPTS} left`
          }
          className={cn("min-h-[70dvh] md:min-h-0", mobilePane !== "chat" && "hidden md:flex")}
        >
          <div ref={termRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto bg-bg px-3 py-3">
            {lines.map((l, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[92%] rounded-md px-3 py-2 text-[13px] leading-relaxed whitespace-pre-wrap",
                  l.cls === "cmd" && "ml-auto bg-elevated text-fg",
                  l.cls === "father" && "border border-border bg-surface text-fg",
                  l.cls === "err" && "border border-danger/40 text-danger",
                  (l.cls === "info" || l.cls === "success") && "text-[12px] text-muted",
                )}
              >
                {l.cls === "cmd" ? <span className="mb-1 block font-sans text-[10px] tracking-[0.12em] text-faint uppercase">You</span> : null}
                {l.cls === "father" ? <span className="mb-1 block font-sans text-[10px] tracking-[0.12em] text-faint uppercase">Assistant</span> : null}
                {l.text}
              </div>
            ))}
          </div>
          <form
            className="flex items-end gap-2 border-t border-border bg-elevated px-3 py-2"
            onSubmit={(e) => {
              e.preventDefault();
              const v = cmd.trim();
              if (!v || busy) return;
              setHistory((h) => [...h, v]);
              setHistIdx(-1);
              setCmd("");
              void exec(v);
            }}
          >
            <textarea
              value={cmd}
              onChange={(e) => setCmd(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  e.currentTarget.form?.requestSubmit();
                } else {
                  onTermKey(e);
                }
              }}
              rows={2}
              className="min-h-11 min-w-0 flex-1 resize-none bg-transparent font-sans text-[14px] text-fg outline-none placeholder:text-faint"
              placeholder="Ask about recon, detection, or this target"
              autoCapitalize="sentences"
              spellCheck
            />
            <Button type="submit" variant="solid" size="sm" disabled={busy || !cmd.trim()} aria-label="Send">
              <Send className="size-3.5" />
              Send
            </Button>
          </form>
          <p className="border-t border-border px-3 py-2 text-[11px] text-faint">
            {DAILY_FREE_PROMPTS} prompts a day are free in alpha. After that, €15 per month.{" "}
            <Link to="/shop" className="text-fg underline-offset-2 hover:underline">
              Pay
            </Link>
          </p>
        </Panel>

        <div className={cn("flex min-h-0 flex-col gap-2.5", mobilePane !== "ops" && "hidden md:flex")}>
          <section className="flex flex-col gap-3 md:hidden">
            <div>
              <label className="mb-1 block font-sans text-[10px] tracking-[0.14em] text-faint uppercase">
                Target
              </label>
              <Input
                value={target}
                onChange={(e) => setTargetLocal(e.target.value)}
                onBlur={() => void setTarget({ data: { target } })}
                spellCheck={false}
                placeholder="host or scope"
              />
            </div>
            <p className="text-[12px] text-muted">
              {data?.profile.pro
                ? "Pro includes prompts."
                : `${data?.profile.promptsLeft ?? DAILY_FREE_PROMPTS} of ${DAILY_FREE_PROMPTS} free prompts left today.`}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {AGENT_META.map((a) => {
                const Icon = a.icon;
                const st = data?.agents[a.id] ?? "idle";
                return (
                  <button
                    key={a.id}
                    type="button"
                    disabled={busy}
                    onClick={() => void doAgent(a.id)}
                    className="flex min-h-24 flex-col items-start justify-between rounded-md border border-border bg-surface p-3 text-left active:scale-[0.98]"
                  >
                    <Icon className="size-5 text-primary" strokeWidth={1.6} />
                    <span>
                      <span className="block font-sans text-sm font-semibold">{a.name}</span>
                      <span className="text-[11px] text-muted uppercase">{busy ? "working" : st}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {tools.map((id) => {
                return (
                  <button
                    key={id}
                    type="button"
                    disabled={busy}
                    onClick={() => void doTool(id)}
                    className="h-11 shrink-0 rounded-sm border border-border px-3 font-sans text-[11px] tracking-[0.08em] text-muted uppercase disabled:text-faint"
                  >
                    {TOOL_DEFS[id]?.label ?? id}
                  </button>
                );
              })}
            </div>
            {result ? (
              <button
                type="button"
                onClick={() => setMobilePane("out")}
                className="rounded-md border border-border bg-surface p-3 text-left"
              >
                <p className="line-clamp-5 text-[13px] leading-relaxed text-muted">{result}</p>
                <span className="mt-2 block font-sans text-[11px] tracking-[0.12em] text-primary uppercase">
                  Open result
                </span>
              </button>
            ) : (
              <p className="text-[13px] text-muted">
                Choose a task. The assistant writes an authorized plan for this target.
              </p>
            )}
          </section>
          <Panel
            title="Engagement"
            className="hidden md:flex"
            action={
              <button
                type="button"
                className="grid size-8 place-items-center rounded-sm border border-border text-muted hover:border-primary hover:text-primary"
                onClick={() => setEngOpen(true)}
                aria-label="New engagement"
              >
                <Plus className="size-3.5" />
              </button>
            }
          >
            <div className="flex gap-2 px-3 pt-3">
              <select
                className="h-11 min-w-0 flex-1 rounded-sm border border-border bg-bg px-2 font-mono text-[12px] text-fg outline-none focus:border-primary"
                value={data?.loop.current_engagement_id ?? ""}
                onChange={(e) => void selectEngagement({ data: { id: e.target.value } }).then(refresh)}
              >
                <option value="">— none —</option>
                {(data?.engagements ?? []).map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.client ? `${e.name} · ${e.client}` : e.name}
                  </option>
                ))}
              </select>
              <Button variant="ghost" size="sm" onClick={() => void doReport()}>
                <FileText className="size-3.5" />
                Report
              </Button>
            </div>
            <p className="px-3 pt-2 pb-3 text-[12px] text-muted">
              {data?.engagement
                ? [data.engagement.client && `Client: ${data.engagement.client}`, data.engagement.scope && `Scope: ${data.engagement.scope}`]
                    .filter(Boolean)
                    .join(" · ") || data.engagement.name
                : "Select or create an engagement (client / job)."}
            </p>
          </Panel>

          <Panel title="Status" className="hidden md:flex">
            <div className="grid grid-cols-2 gap-2 p-3">
              <Stat label="Loop" value={loopOn || data?.loop.running ? "RUNNING" : "IDLE"} live={loopOn} />
              <Stat
                label="Phase"
                value={
                  !data?.loop.current_phase || data.loop.current_phase === "idle"
                    ? "—"
                    : data.loop.current_phase.replace("_complete", " ✓").toUpperCase()
                }
              />
              <Stat label="Cycle" value={String(data?.loop.cycle ?? 0)} />
              <Stat label="Vulns" value={String(data?.loop.stats_vulns ?? 0)} />
            </div>
            <label className="block px-3 text-[10px] tracking-[0.12em] text-faint uppercase">Target</label>
            <div className="px-3 pb-2">
              <Input
                value={target}
                onChange={(e) => setTargetLocal(e.target.value)}
                onBlur={() => void setTarget({ data: { target } })}
                spellCheck={false}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 px-3 pb-3">
              <Button variant="primary" onClick={() => void startLoop()} disabled={loopOn}>
                Start loop
              </Button>
              <Button variant="danger" onClick={() => void stopLoop()}>
                Stop
              </Button>
            </div>
          </Panel>

          <Panel title="Agents" className="hidden md:flex">
            <div className="grid grid-cols-2 gap-2 p-3">
              {AGENT_META.map((a) => {
                const st = data?.agents[a.id] ?? "idle";
                const Icon = a.icon;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => void doAgent(a.id)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-sm border bg-bg px-2 py-3 transition-colors",
                      st === "running" && "border-cyan text-cyan",
                      st === "complete" && "border-ok",
                      st === "error" && "border-danger",
                      st === "idle" && "border-border hover:border-primary",
                    )}
                  >
                    <Icon className="size-5" strokeWidth={1.6} />
                    <span className="font-sans text-[11px] tracking-[0.12em] uppercase">{a.name}</span>
                    <span className="text-[10px] text-muted uppercase">{st}</span>
                  </button>
                );
              })}
            </div>
          </Panel>

          <Panel title="Tools" className="hidden md:flex">
            <div className="grid grid-cols-3 gap-1.5 p-3">
              {tools.map((id) => {
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => void doTool(id)}
                    className="h-10 rounded-sm border border-border font-sans text-[9px] tracking-[0.08em] text-muted uppercase hover:border-cyan hover:text-cyan"
                    title={TOOL_DEFS[id]?.label}
                  >
                    {TOOL_DEFS[id]?.label ?? id}
                  </button>
                );
              })}
            </div>
          </Panel>
        </div>

        <div className={cn("flex min-h-0 flex-col gap-2.5", mobilePane !== "out" && "hidden md:flex")}>
          <Panel title="Results" className="min-h-[220px] flex-1">
            <div className="flex flex-wrap gap-1 border-b border-border px-2 py-2">
              {["recon", "exploit", "detection", "hardening", "report"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTab(t);
                    if (t !== "report") setResult(data?.results[t]?.content ?? "");
                  }}
                  className={cn(
                    "rounded-sm border px-2 py-1 font-sans text-[9px] tracking-[0.1em] uppercase",
                    tab === t ? "border-primary text-primary" : "border-transparent text-muted",
                  )}
                >
                  {t === "detection" ? "detect" : t === "hardening" ? "harden" : t}
                </button>
              ))}
            </div>
            <pre className="min-h-0 flex-1 overflow-auto bg-bg p-3 font-mono text-[12px] leading-relaxed whitespace-pre-wrap text-muted">
              {shownResult}
            </pre>
          </Panel>
          <Panel
            title="Log"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void clearPrayers().then(refresh)}
              >
                Clr
              </Button>
            }
            className="h-48 md:h-auto md:flex-none md:min-h-[160px]"
          >
            <div className="min-h-0 flex-1 overflow-auto bg-bg px-3 py-2 text-[11px] leading-relaxed">
              {(data?.prayers ?? []).length === 0 ? (
                <p className="text-faint">No activity yet.</p>
              ) : (
                (data?.prayers ?? []).map((p, i) => (
                  <div
                    key={i}
                    className={cn(
                      "mb-1 break-all",
                      p.event === "invoke" && "text-primary",
                      p.event === "error" && "text-danger",
                      p.event === "response" && "text-cyan",
                      p.event !== "invoke" && p.event !== "error" && p.event !== "response" && "text-muted",
                    )}
                  >
                    [{new Date(p.ts).toLocaleTimeString("en-GB", { hour12: false })}] {p.agent}: {p.message}
                  </div>
                ))
              )}
            </div>
          </Panel>
        </div>
      </div>

      <EngagementDialog open={engOpen} onOpenChange={setEngOpen} onCreated={refresh} onTarget={setTargetLocal} />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <FeedbackDialog open={fbOpen} onOpenChange={setFbOpen} />
    </TempleShell>
  );
}

function Panel({
  title,
  meta,
  action,
  className,
  children,
}: {
  title: string;
  meta?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "glow-line flex min-h-0 flex-col overflow-hidden rounded-md border border-border bg-surface",
        className,
      )}
    >
      <header className="flex h-10 shrink-0 items-center justify-between border-b border-border bg-primary/10 px-3">
        <span className="font-sans text-[11px] font-semibold tracking-[0.16em] text-primary uppercase">
          {title}
        </span>
        {action ?? (meta ? <span className="text-[10px] text-muted">{meta}</span> : null)}
      </header>
      {children}
    </section>
  );
}

function Stat({ label, value, live }: { label: string; value: string; live?: boolean }) {
  return (
    <div className={cn("rounded-sm border border-border border-l-2 bg-bg px-2.5 py-2", live ? "border-l-ok" : "border-l-primary")}>
      <div className="text-[9px] tracking-[0.12em] text-faint uppercase">{label}</div>
      <div className="font-sans text-[16px] text-primary tabular-nums">{value}</div>
    </div>
  );
}

function StatusPill({ label, on }: { label: string; on: boolean }) {
  return (
    <span
      className={cn(
        "hidden rounded-sm border px-2 py-0.5 font-sans text-[9px] tracking-[0.12em] uppercase sm:inline",
        on ? "live-pill border-ok text-ok" : "border-border text-muted",
      )}
    >
      {label}
    </span>
  );
}

function EngagementDialog({
  open,
  onOpenChange,
  onCreated,
  onTarget,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreated: () => void;
  onTarget: (t: string) => void;
}) {
  const [name, setName] = useState("");
  const [client, setClient] = useState("");
  const [scope, setScope] = useState("");
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    const res = await createEngagement({ data: { name, client, scope, notes } });
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="New engagement">
        <form className="space-y-2" onSubmit={submit}>
          <label className="block text-[10px] tracking-[0.12em] text-faint uppercase">Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
          <label className="block text-[10px] tracking-[0.12em] text-faint uppercase">Client</label>
          <Input value={client} onChange={(e) => setClient(e.target.value)} />
          <label className="block text-[10px] tracking-[0.12em] text-faint uppercase">Scope / targets</label>
          <Input value={scope} onChange={(e) => setScope(e.target.value)} />
          <label className="block text-[10px] tracking-[0.12em] text-faint uppercase">Notes</label>
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
          {err ? <p className="text-sm text-danger">{err}</p> : null}
          <Button type="submit" variant="solid" className="w-full">
            Create
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Model">
        <p className="text-[13px] leading-relaxed text-muted">
          Twenty prompts each day are free in this alpha, including the Kali tools. After that, €15 per month. The model key stays on the server.
        </p>
      </DialogContent>
    </Dialog>
  );
}

function FeedbackDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [rating, setRating] = useState<number | null>(null);
  const [category, setCategory] = useState("general");
  const [message, setMessage] = useState("");
  const [msg, setMsg] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Alpha feedback">
        <p className="mb-3 text-[13px] text-muted">Bugs, UX, missing features, agent quality.</p>
        <div className="mb-3 flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className={cn(
                "h-10 flex-1 rounded-sm border font-sans",
                rating === n ? "border-primary text-primary" : "border-border text-muted",
              )}
            >
              {n}
            </button>
          ))}
        </div>
        <select
          className="mb-3 h-11 w-full rounded-sm border border-border bg-bg px-2 font-mono text-[13px]"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="bug">Bug</option>
          <option value="ux">UX / UI</option>
          <option value="agent">Agent quality</option>
          <option value="feature">Feature request</option>
          <option value="report">Report quality</option>
          <option value="general">General</option>
        </select>
        <textarea
          className="mb-3 min-h-24 w-full rounded-sm border border-border bg-bg p-3 font-mono text-[13px] outline-none focus:border-primary"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What broke / what you need…"
        />
        <Button
          variant="solid"
          className="w-full"
          onClick={async () => {
            const res = await sendFeedback({ data: { message, category, rating } });
            if (!res.ok) setMsg(res.error);
            else {
              setMsg("Received. Thanks.");
              setMessage("");
              setTimeout(() => onOpenChange(false), 700);
            }
          }}
        >
          Send
        </Button>
        {msg ? <p className="mt-2 text-[12px] text-ok">{msg}</p> : null}
      </DialogContent>
    </Dialog>
  );
}
