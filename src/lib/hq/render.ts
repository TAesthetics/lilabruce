import {
  HUB,
  ROOM_H,
  ROOM_W,
  UNIT_IDS,
  UNITS,
  WORLD_H,
  WORLD_W,
  deskFor,
  type Agent,
  type HQState,
  type UnitId,
} from "./sim";

const FLOOR_A = "#26334f";
const FLOOR_B = "#2c3b5c";
const WALL = "#0a0c16";
const WOOD = "#7a5a32";
const WOOD_DARK = "#4d3619";
const SCREEN_OFF = "#15202e";
const GOLD = "#f5c542";

const PALETTE: Record<string, string> = {
  h: "#2b1d12",
  s: "#f2c9a0",
  e: "#0d0d0d",
  d: "#262b38",
};

// 8x10 pixel sprite. Letters map to PALETTE; "b" is the unit colour.
const BODY = [
  "..hhhh..",
  ".hhhhhh.",
  ".ssssss.",
  ".sesses.",
  "..ssss..",
  ".bbbbbb.",
  "sbbbbbbs",
  "sbbbbbbs",
  "..dddd..",
];
const LEGS = [".dd..dd.", "..dd.dd."];

export function drawWorld(ctx: CanvasRenderingContext2D, s: HQState, time: number) {
  ctx.clearRect(0, 0, WORLD_W, WORLD_H);
  drawFloors(ctx);
  drawWalls(ctx);

  for (const unit of UNIT_IDS) {
    const room = UNITS[unit].room;
    drawRoomLabel(ctx, unit);
    const queued = s.queue.filter((t) => t.unit === unit).length;
    for (let i = 0; i < Math.min(queued, 12); i++) {
      ctx.fillStyle = UNITS[unit].color;
      ctx.fillRect(room.x + ROOM_W - 8 - i * 6, room.y + 5, 3, 3);
    }
    const agentsHere = s.agents.filter((a) => a.unit === unit);
    const slots = Math.max(1, agentsHere.length);
    for (let slot = 0; slot < slots; slot++) {
      const working = agentsHere.some((a) => a.slot === slot && a.mode === "work");
      drawDesk(ctx, unit, slot, working, time);
    }
  }

  drawHub(ctx, time);

  for (const a of [...s.agents].sort((p, q) => p.y - q.y)) drawAgent(ctx, a, time);

  ctx.font = "bold 7px monospace";
  ctx.textAlign = "center";
  ctx.fillStyle = GOLD;
  for (const f of s.fx) ctx.fillText(f.text, Math.round(f.x), Math.round(f.y));
}

function drawFloors(ctx: CanvasRenderingContext2D) {
  for (const unit of UNIT_IDS) {
    const room = UNITS[unit].room;
    for (let y = 0; y < ROOM_H; y += 8) {
      for (let x = 0; x < ROOM_W; x += 8) {
        ctx.fillStyle = ((x + y) / 8) % 2 === 0 ? FLOOR_A : FLOOR_B;
        ctx.fillRect(room.x + x, room.y + y, 8, Math.min(8, ROOM_H - y));
      }
    }
  }
}

function drawWalls(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = WALL;
  ctx.fillRect(0, 0, WORLD_W, 3);
  ctx.fillRect(0, WORLD_H - 3, WORLD_W, 3);
  ctx.fillRect(0, 0, 3, WORLD_H);
  ctx.fillRect(WORLD_W - 3, 0, 3, WORLD_H);
  ctx.fillRect(ROOM_W - 2, 0, 4, WORLD_H);
  ctx.fillRect(0, ROOM_H - 2, WORLD_W, 4);
}

function drawRoomLabel(ctx: CanvasRenderingContext2D, unit: UnitId) {
  const room = UNITS[unit].room;
  ctx.font = "bold 7px monospace";
  ctx.textAlign = "left";
  ctx.fillStyle = UNITS[unit].color;
  const bottom = room.y > 0;
  ctx.fillText(UNITS[unit].label, room.x + 6, bottom ? room.y + ROOM_H - 6 : room.y + 11);
}

function drawDesk(
  ctx: CanvasRenderingContext2D,
  unit: UnitId,
  slot: number,
  working: boolean,
  time: number,
) {
  const { x, y } = deskFor(unit, slot);
  ctx.fillStyle = WOOD_DARK;
  ctx.fillRect(x - 13, y - 3, 26, 9);
  ctx.fillStyle = WOOD;
  ctx.fillRect(x - 13, y - 4, 26, 3);

  ctx.fillStyle = WALL;
  ctx.fillRect(x - 6, y - 13, 12, 9);
  ctx.fillStyle = working ? UNITS[unit].color : SCREEN_OFF;
  ctx.fillRect(x - 5, y - 12, 10, 7);
  if (working) {
    const line = Math.floor(time * 6) % 6;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x - 4 + line, y - 10, 2, 1);
    ctx.fillRect(x - 4 + ((line + 3) % 6), y - 8, 2, 1);
  }
}

function drawHub(ctx: CanvasRenderingContext2D, time: number) {
  const pulse = 0.5 + 0.5 * Math.sin(time * 3);
  ctx.fillStyle = `rgba(245, 197, 66, ${0.15 + 0.15 * pulse})`;
  ctx.fillRect(HUB.x - 18, HUB.y - 18, 36, 36);
  ctx.fillStyle = WALL;
  ctx.fillRect(HUB.x - 11, HUB.y - 11, 22, 22);
  ctx.fillStyle = GOLD;
  ctx.fillRect(HUB.x - 9, HUB.y - 9, 18, 18);
  ctx.fillStyle = WALL;
  ctx.fillRect(HUB.x - 4, HUB.y - 4, 8, 8);
  ctx.fillStyle = GOLD;
  ctx.fillRect(HUB.x - 2, HUB.y - 2, 4, 4);
}

function drawAgent(ctx: CanvasRenderingContext2D, a: Agent, time: number) {
  const color = UNITS[a.unit].color;
  const legs = LEGS[a.mode === "walk" ? a.frame : 0];
  const rows = [...BODY, legs];
  const x0 = Math.round(a.x) - 4;
  const y0 = Math.round(a.y) - 10;
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < 8; c++) {
      const ch = rows[r][c];
      const fill = ch === "b" ? color : PALETTE[ch];
      if (!fill) continue;
      ctx.fillStyle = fill;
      ctx.fillRect(x0 + c, y0 + r, 1, 1);
    }
  }
  if (a.mode === "work") {
    const blink = Math.floor(time * 2) % 2;
    ctx.fillStyle = GOLD;
    ctx.fillRect(x0 + 9, y0 - 2 + blink, 2, 2);
  }
}
