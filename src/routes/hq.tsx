import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pause, Play, RotateCcw } from "lucide-react";
import { drawWorld } from "@/lib/hq/render";
import {
  createState,
  hire,
  loadState,
  saveState,
  step,
  UNIT_IDS,
  UNITS,
  view,
  WORLD_H,
  WORLD_W,
  type HQState,
  type HqView,
  type UnitId,
} from "@/lib/hq/sim";
import { cn } from "@/lib/utils";

const PIXEL_FONT_URL =
  "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap";
const PIXEL: React.CSSProperties = { fontFamily: '"Press Start 2P", monospace' };
const SPEEDS = [1, 2, 4] as const;
const BTN =
  "border-2 border-[#e8ecf5] bg-[#1a2033] px-2 py-1.5 text-[9px] text-[#e8ecf5] hover:bg-[#262e47] disabled:cursor-not-allowed disabled:opacity-40";

export const Route = createFileRoute("/hq")({
  head: () => ({
    meta: [{ title: "AGENTEN-HQ" }],
    links: [{ rel: "stylesheet", href: PIXEL_FONT_URL }],
  }),
  component: HqPage,
});

function HqPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<HQState | null>(null);
  const pausedRef = useRef(false);
  const speedRef = useRef(1);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [hud, setHud] = useState<HqView | null>(null);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.imageSmoothingEnabled = false;

    const initial = loadState();
    simRef.current = initial;
    setHud(view(initial));

    let raf = 0;
    let last = performance.now();
    let lastHud = 0;
    let lastSave = last;

    const frame = (now: number) => {
      const sim = simRef.current;
      if (sim) {
        const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
        if (!pausedRef.current) step(sim, dt * speedRef.current);
        drawWorld(ctx, sim, now / 1000);
        if (now - lastHud > 250) {
          lastHud = now;
          setHud(view(sim));
        }
        if (now - lastSave > 5000) {
          lastSave = now;
          saveState(sim);
        }
      }
      last = now;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      if (simRef.current) saveState(simRef.current);
    };
  }, []);

  const onHire = (unit: UnitId) => {
    const sim = simRef.current;
    if (!sim || !hire(sim, unit)) return;
    saveState(sim);
    setHud(view(sim));
  };

  const onReset = () => {
    if (!window.confirm("Büro zurücksetzen? Gold und Agenten gehen verloren.")) return;
    const fresh = createState();
    simRef.current = fresh;
    saveState(fresh);
    setHud(view(fresh));
  };

  const xpPct = hud ? Math.min(100, (hud.xp / hud.xpNext) * 100) : 0;

  return (
    <main className="min-h-dvh bg-[#07080f] px-3 py-4 text-[#e8ecf5] sm:px-6" style={PIXEL}>
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-[12px] tracking-wide text-[#f5c542]">AGENTEN-HQ</h1>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={BTN}
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Fortsetzen" : "Pausieren"}
            >
              {paused ? <Play className="size-3" /> : <Pause className="size-3" />}
            </button>
            {SPEEDS.map((s) => (
              <button
                key={s}
                type="button"
                className={cn(BTN, speed === s && "bg-[#f5c542] text-[#07080f]")}
                onClick={() => setSpeed(s)}
              >
                {s}x
              </button>
            ))}
            <button type="button" className={BTN} onClick={onReset} aria-label="Zurücksetzen">
              <RotateCcw className="size-3" />
            </button>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-2 text-[9px] sm:grid-cols-4">
          <Stat label="GOLD" value={hud ? String(hud.gold) : "–"} tone="text-[#f5c542]" />
          <div className="border-2 border-[#262c3d] bg-[#0b0d18] p-2">
            <div className="text-[#9aa3b8]">STUFE {hud?.level ?? "–"}</div>
            <div className="mt-2 h-2 w-full border border-[#262c3d] bg-[#07080f]">
              <div className="h-full bg-[#5fbf6a]" style={{ width: `${xpPct}%` }} />
            </div>
          </div>
          <Stat label="ERLEDIGT" value={hud ? String(hud.done) : "–"} tone="text-[#5fbf6a]" />
          <Stat label="OFFEN" value={hud ? String(hud.queue) : "–"} tone="text-[#3fa7d6]" />
        </section>

        <canvas
          ref={canvasRef}
          width={WORLD_W}
          height={WORLD_H}
          className="w-full border-4 border-[#0a0c16] bg-[#0a0c16]"
          style={{ imageRendering: "pixelated", aspectRatio: `${WORLD_W} / ${WORLD_H}` }}
          role="img"
          aria-label="Pixel-Büro mit Agenten in vier Abteilungen"
        />

        <section className="grid gap-2 sm:grid-cols-2">
          {UNIT_IDS.map((unit) => {
            const u = hud?.units[unit];
            const canAfford = hud && u ? hud.gold >= u.cost : false;
            return (
              <div
                key={unit}
                className="flex items-center justify-between gap-3 border-2 border-[#262c3d] bg-[#0b0d18] p-3"
              >
                <div className="flex flex-col gap-2 text-[9px]">
                  <span style={{ color: UNITS[unit].color }}>{UNITS[unit].label}</span>
                  <span className="text-[#9aa3b8]">
                    {u ? `${u.agents}/6 Agenten · ${u.busy} aktiv · ${u.queue} offen` : "–"}
                  </span>
                </div>
                <button
                  type="button"
                  className={BTN}
                  disabled={!u || u.full || !canAfford}
                  onClick={() => onHire(unit)}
                >
                  {u?.full ? "VOLL" : `+ AGENT ${u?.cost ?? ""}G`}
                </button>
              </div>
            );
          })}
        </section>

        <section
          className="h-48 overflow-y-auto border-2 border-[#262c3d] bg-[#0b0d18] p-3 font-mono text-xs leading-relaxed text-[#c7cedc]"
          aria-live="polite"
        >
          {hud && hud.log.length > 0 ? (
            [...hud.log].reverse().map((l) => (
              <div key={`${l.t}-${l.text}`}>
                <span className="text-[#6b7385]">
                  {new Date(l.t).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>{" "}
                {l.text}
              </div>
            ))
          ) : (
            <div className="text-[#6b7385]">Warte auf Aktivität…</div>
          )}
        </section>

        <p className="text-[8px] leading-relaxed text-[#6b7385]">
          Simulation im Browser. Die Agenten arbeiten lokal, ohne echte KI-Anbindung. Der
          Fortschritt wird auf diesem Gerät gespeichert.
        </p>
      </div>
    </main>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="border-2 border-[#262c3d] bg-[#0b0d18] p-2">
      <div className="text-[#9aa3b8]">{label}</div>
      <div className={cn("mt-2 text-[12px]", tone)}>{value}</div>
    </div>
  );
}
