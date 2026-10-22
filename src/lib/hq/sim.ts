export type UnitId = "sales" | "support" | "marketing" | "finance";

export const UNIT_IDS: readonly UnitId[] = ["sales", "support", "marketing", "finance"];

export const UNITS: Record<
  UnitId,
  { label: string; color: string; room: { x: number; y: number }; tasks: string[] }
> = {
  sales: {
    label: "VERKAUF",
    color: "#e0523c",
    room: { x: 0, y: 0 },
    tasks: ["Lead qualifizieren", "Angebot schreiben", "Follow-up senden"],
  },
  support: {
    label: "SUPPORT",
    color: "#3fa7d6",
    room: { x: 160, y: 0 },
    tasks: ["Ticket beantworten", "FAQ aktualisieren", "Rückerstattung prüfen"],
  },
  marketing: {
    label: "MARKETING",
    color: "#b56cd9",
    room: { x: 0, y: 100 },
    tasks: ["Post planen", "Newsletter bauen", "Anzeige testen"],
  },
  finance: {
    label: "FINANZEN",
    color: "#5fbf6a",
    room: { x: 160, y: 100 },
    tasks: ["Rechnung abgleichen", "Mahnung senden", "Monatsreport erstellen"],
  },
};

export const WORLD_W = 320;
export const WORLD_H = 200;
export const ROOM_W = 160;
export const ROOM_H = 100;
export const HUB = { x: 160, y: 100 };
export const MAX_AGENTS_PER_UNIT = 6;

const QUEUE_MAX = 12;
const SPAWN_EVERY = 3.5;
const WALK_SPEED = 38;
const STATION_OFFSET = 18;
const AGENT_NAMES = ["ARIA", "BYTE", "CRUX", "DOT", "EMBER", "FLUX", "GLYPH", "HEX", "IRIS", "JOLT"];
const LOG_MAX = 40;
const SAVE_KEY = "agenten-hq-v1";

export interface Task {
  id: number;
  unit: UnitId;
  title: string;
  reward: number;
  duration: number;
}

export interface Agent {
  id: number;
  name: string;
  unit: UnitId;
  slot: number;
  x: number;
  y: number;
  tx: number;
  ty: number;
  mode: "wander" | "walk" | "work";
  task: Task | null;
  timer: number;
  frame: number;
  animT: number;
}

export interface Effect {
  x: number;
  y: number;
  text: string;
  life: number;
}

export interface LogLine {
  t: number;
  text: string;
}

export interface HQState {
  gold: number;
  done: number;
  xp: number;
  level: number;
  queue: Task[];
  agents: Agent[];
  log: LogLine[];
  fx: Effect[];
  nextId: number;
  spawnTimer: number;
}

export interface UnitView {
  agents: number;
  busy: number;
  queue: number;
  cost: number;
  full: boolean;
}

export interface HqView {
  gold: number;
  level: number;
  xp: number;
  xpNext: number;
  done: number;
  queue: number;
  log: LogLine[];
  units: Record<UnitId, UnitView>;
}

const rnd = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

export function deskFor(unit: UnitId, slot: number) {
  const room = UNITS[unit].room;
  const col = [36, 80, 124][slot % 3];
  const row = [40, 74][Math.floor(slot / 3) % 2];
  return { x: room.x + col, y: room.y + row };
}

export function stationFor(unit: UnitId, slot: number) {
  const desk = deskFor(unit, slot);
  return { x: desk.x, y: desk.y + STATION_OFFSET };
}

export const xpNeeded = (level: number) => level * 60;

export function hireCost(s: HQState, unit: UnitId): number {
  const count = s.agents.filter((a) => a.unit === unit).length;
  return 40 + count * 35;
}

function addLog(s: HQState, text: string) {
  s.log.push({ t: Date.now(), text });
  if (s.log.length > LOG_MAX) s.log.splice(0, s.log.length - LOG_MAX);
}

function wanderTarget(a: Agent) {
  const room = UNITS[a.unit].room;
  a.tx = room.x + rnd(10, 150);
  a.ty = room.y + rnd(22, 96);
}

function makeTask(s: HQState, unit: UnitId): Task {
  return {
    id: s.nextId++,
    unit,
    title: pick(UNITS[unit].tasks),
    reward: 10 + Math.floor(Math.random() * 4) * 5,
    duration: rnd(3, 7),
  };
}

function makeAgent(s: HQState, unit: UnitId): Agent {
  const slot = s.agents.filter((a) => a.unit === unit).length;
  const room = UNITS[unit].room;
  const x = room.x + rnd(20, 140);
  const y = room.y + rnd(30, 90);
  const agent: Agent = {
    id: s.nextId,
    name: `${pick(AGENT_NAMES)}-${s.nextId}`,
    unit,
    slot,
    x,
    y,
    tx: x,
    ty: y,
    mode: "wander",
    task: null,
    timer: rnd(0.5, 2),
    frame: 0,
    animT: 0,
  };
  s.nextId++;
  return agent;
}

export function createState(): HQState {
  const s: HQState = {
    gold: 40,
    done: 0,
    xp: 0,
    level: 1,
    queue: [],
    agents: [],
    log: [],
    fx: [],
    nextId: 1,
    spawnTimer: 0,
  };
  for (const unit of UNIT_IDS) s.agents.push(makeAgent(s, unit));
  addLog(s, "System online. Ein Agent pro Abteilung bereit.");
  return s;
}

export function hire(s: HQState, unit: UnitId): boolean {
  const count = s.agents.filter((a) => a.unit === unit).length;
  if (count >= MAX_AGENTS_PER_UNIT) return false;
  const cost = hireCost(s, unit);
  if (s.gold < cost) return false;
  s.gold -= cost;
  const agent = makeAgent(s, unit);
  s.agents.push(agent);
  addLog(s, `${agent.name} eingestellt für ${UNITS[unit].label}.`);
  return true;
}

function moveToward(a: Agent, dt: number): boolean {
  const dx = a.tx - a.x;
  const dy = a.ty - a.y;
  const dist = Math.hypot(dx, dy);
  const step = WALK_SPEED * dt;
  if (dist <= step || dist === 0) {
    a.x = a.tx;
    a.y = a.ty;
    return true;
  }
  a.x += (dx / dist) * step;
  a.y += (dy / dist) * step;
  return false;
}

function finishTask(s: HQState, a: Agent) {
  const task = a.task;
  if (!task) return;
  s.gold += task.reward;
  s.done += 1;
  s.xp += task.reward;
  let need = xpNeeded(s.level);
  while (s.xp >= need) {
    s.xp -= need;
    s.level += 1;
    need = xpNeeded(s.level);
    addLog(s, `LEVEL UP! Stufe ${s.level}`);
  }
  s.fx.push({ x: a.x, y: a.y - 14, text: `+${task.reward}`, life: 1.2 });
  addLog(s, `${a.name}: ${task.title} (+${task.reward} Gold)`);
  a.task = null;
  a.mode = "wander";
  a.timer = rnd(0.5, 1.5);
  wanderTarget(a);
}

function updateAgent(s: HQState, a: Agent, dt: number) {
  a.animT += dt;
  if (a.animT > 0.18) {
    a.animT = 0;
    a.frame ^= 1;
  }

  if (a.mode === "work") {
    a.timer -= dt;
    if (a.timer <= 0) finishTask(s, a);
    return;
  }

  if (a.mode === "walk") {
    if (!a.task) {
      a.mode = "wander";
      return;
    }
    if (moveToward(a, dt)) {
      a.mode = "work";
      a.timer = a.task.duration;
    }
    return;
  }

  const idx = s.queue.findIndex((t) => t.unit === a.unit);
  if (idx >= 0) {
    a.task = s.queue.splice(idx, 1)[0];
    const station = stationFor(a.unit, a.slot);
    a.tx = station.x;
    a.ty = station.y;
    a.mode = "walk";
    return;
  }

  if (moveToward(a, dt)) {
    a.timer -= dt;
    if (a.timer <= 0) {
      wanderTarget(a);
      a.timer = rnd(1.5, 4);
    }
  }
}

export function step(s: HQState, dt: number) {
  s.spawnTimer += dt;
  if (s.spawnTimer >= SPAWN_EVERY) {
    s.spawnTimer = 0;
    if (s.queue.length < QUEUE_MAX) s.queue.push(makeTask(s, pick(UNIT_IDS)));
  }
  for (const a of s.agents) updateAgent(s, a, dt);
  s.fx = s.fx.map((f) => ({ ...f, y: f.y - 8 * dt, life: f.life - dt })).filter((f) => f.life > 0);
}

export function view(s: HQState): HqView {
  const units = {} as Record<UnitId, UnitView>;
  for (const unit of UNIT_IDS) {
    const mine = s.agents.filter((a) => a.unit === unit);
    units[unit] = {
      agents: mine.length,
      busy: mine.filter((a) => a.mode !== "wander").length,
      queue: s.queue.filter((t) => t.unit === unit).length,
      cost: hireCost(s, unit),
      full: mine.length >= MAX_AGENTS_PER_UNIT,
    };
  }
  return {
    gold: s.gold,
    level: s.level,
    xp: s.xp,
    xpNext: xpNeeded(s.level),
    done: s.done,
    queue: s.queue.length,
    log: s.log.slice(-30),
    units,
  };
}

export function loadState(): HQState {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const s = JSON.parse(raw) as HQState;
      if (Array.isArray(s.agents) && typeof s.gold === "number") {
        s.queue = Array.isArray(s.queue) ? s.queue : [];
        s.log = Array.isArray(s.log) ? s.log : [];
        s.fx = [];
        s.spawnTimer = 0;
        for (const a of s.agents) {
          a.task = null;
          a.mode = "wander";
          a.timer = 0;
          a.animT = 0;
        }
        return s;
      }
    }
  } catch {
    /* corrupt or blocked storage: start fresh */
  }
  return createState();
}

export function saveState(s: HQState) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...s, fx: [] }));
  } catch {
    /* private mode: game still runs */
  }
}
