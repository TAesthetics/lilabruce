export type AgentStatus = "idle" | "running" | "complete" | "error";

export interface Prayer {
  ts: string;
  event: string;
  agent: string;
  message: string;
}

export interface Engagement {
  id: string;
  name: string;
  client: string;
  scope: string;
  notes: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AgentResult {
  target: string;
  content: string;
  created_at: string;
}

export interface ProfileState {
  credits: number;
  pro: boolean;
  proUntil: string | null;
  entitlements: string[];
  hasVenice: boolean;
  handle: string | null;
  promptsToday: number;
  promptsLeft: number;
  paidToday: boolean;
}

export interface LoopSnapshot {
  running: boolean;
  current_phase: string;
  cycle: number;
  target: string;
  current_engagement_id: string | null;
  stats_cycles: number;
  stats_vulns: number;
  stats_exploits: number;
  stats_detections: number;
}

export interface TempleSnapshot {
  profile: ProfileState;
  loop: LoopSnapshot;
  agents: Record<string, AgentStatus>;
  engagement: Engagement | null;
  engagements: Engagement[];
  prayers: Prayer[];
  results: Record<string, AgentResult | null>;
  father: "online" | "offline";
}

export interface PurchaseRow {
  id: string;
  product_id: string;
  platform: string;
  status: string;
  credits_granted: number;
  created_at: string;
}
