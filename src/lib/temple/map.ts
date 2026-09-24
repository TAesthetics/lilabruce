/**
 * Network Intelligence Map
 *
 * Geo-spatial and network topology correlation.
 * Agents use this to understand attack surface and lateral movement paths.
 */

import type { Sql } from "@/lib/db";
import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { ensureFindings } from "@/lib/temple/findings";

export interface MapNode {
  id: string; // IP, hostname, or CIDR
  type: "host" | "network" | "service" | "user" | "external";
  label: string;
  risk: "critical" | "high" | "medium" | "low" | "info";
  findings: string[]; // References to finding IDs
  lastSeen: string;
}

export interface MapEdge {
  from: string; // Node ID
  to: string; // Node ID
  type: "network" | "data-flow" | "dependency" | "exploit-path";
  weight?: number; // For path scoring
  bidirectional?: boolean;
}

export interface NetworkMap {
  engagementId: string;
  nodes: MapNode[];
  edges: MapEdge[];
  lastUpdated: string;
  attackSurface: {
    exposedServices: number;
    vulnerableHosts: number;
    lateralPaths: string[];
    recommendedHardening: string[];
  };
}

/**
 * Build network map from agent findings
 */
export async function buildNetworkMap(
  sql: Sql,
  engagementId: string,
): Promise<NetworkMap> {
  // Query historical findings for this engagement
  const findings = await sql<{
    id: string;
    target: string;
    kind: string;
    content: string;
  }>`
    select id, target, kind, content from history
    where engagement_id = ${engagementId}
    order by created_at desc
    limit 100
  `;

  const nodes = new Map<string, MapNode>();
  const edges = new Map<string, MapEdge>();

  // Parse findings into nodes and edges
  for (const finding of findings) {
    // Add target node if not exists
    if (!nodes.has(finding.target)) {
      nodes.set(finding.target, {
        id: finding.target,
        type: guessNodeType(finding.target),
        label: finding.target,
        risk: assessRisk(finding.content),
        findings: [finding.id],
        lastSeen: new Date().toISOString(),
      });
    } else {
      const node = nodes.get(finding.target)!;
      node.findings.push(finding.id);
    }

    // Parse lateral movement paths from exploit findings
    if (finding.kind === "exploit") {
      const paths = extractLateralPaths(finding.content);
      for (const path of paths) {
        const edgeKey = `${path.from}->${path.to}`;
        if (!edges.has(edgeKey)) {
          edges.set(edgeKey, {
            from: path.from,
            to: path.to,
            type: "exploit-path",
            weight: path.confidence,
          });
          // Ensure destination node exists
          if (!nodes.has(path.to)) {
            nodes.set(path.to, {
              id: path.to,
              type: guessNodeType(path.to),
              label: path.to,
              risk: "medium",
              findings: [],
              lastSeen: new Date().toISOString(),
            });
          }
        }
      }
    }
  }

  // Calculate attack surface metrics
  const attackSurface = {
    exposedServices: nodes.size,
    vulnerableHosts: Array.from(nodes.values()).filter(
      (n) => n.risk === "critical" || n.risk === "high",
    ).length,
    lateralPaths: Array.from(edges.values())
      .filter((e) => e.type === "exploit-path")
      .map((e) => `${e.from} → ${e.to}`),
    recommendedHardening: generateHardeningRecs(nodes, edges),
  };

  return {
    engagementId,
    nodes: Array.from(nodes.values()),
    edges: Array.from(edges.values()),
    lastUpdated: new Date().toISOString(),
    attackSurface,
  };
}

/**
 * Query attack paths from map
 */
export function findAttackPaths(
  map: NetworkMap,
  start: string,
  maxHops = 3,
): string[] {
  const paths: string[] = [];
  const visited = new Set<string>();

  function dfs(node: string, path: string[], hops: number) {
    if (hops === 0 || visited.has(node)) return;
    visited.add(node);

    for (const edge of map.edges) {
      if (edge.from === node && edge.type === "exploit-path") {
        const newPath = [...path, edge.to];
        paths.push(newPath.join(" → "));

        if (hops > 1) {
          dfs(edge.to, newPath, hops - 1);
        }
      }
    }
  }

  dfs(start, [start], maxHops);
  return paths;
}

/**
 * Get high-risk nodes for priority assessment
 */
export function getHighRiskNodes(map: NetworkMap): MapNode[] {
  return map.nodes
    .filter((n) => n.risk === "critical" || n.risk === "high")
    .sort((a, b) => {
      const riskScore = { critical: 5, high: 4, medium: 3, low: 2, info: 1 };
      return riskScore[b.risk] - riskScore[a.risk];
    });
}

/**
 * Generate hardening recommendations based on map analysis
 */
function generateHardeningRecs(
  nodes: Map<string, MapNode>,
  edges: Map<string, MapEdge>,
): string[] {
  const recs: string[] = [];

  // Count high-risk nodes
  const highRisk = Array.from(nodes.values()).filter(
    (n) => n.risk === "critical" || n.risk === "high",
  ).length;
  if (highRisk > 0) {
    recs.push(`Patch ${highRisk} critical/high-risk systems`);
  }

  // Identify lateral movement vectors
  const exploitPaths = Array.from(edges.values()).filter(
    (e) => e.type === "exploit-path",
  );
  if (exploitPaths.length > 0) {
    recs.push(`Isolate network segments (${exploitPaths.length} lateral paths)`);
  }

  // Suggest network segmentation
  const subnets = Array.from(nodes.values()).filter((n) =>
    n.type === "network",
  );
  if (subnets.length > 0) {
    recs.push(`Implement microsegmentation between ${subnets.length} subnets`);
  }

  return recs;
}

/**
 * Helper: Guess node type from string
 */
function guessNodeType(
  id: string,
): "host" | "network" | "service" | "user" | "external" {
  if (id.includes("/")) return "network"; // CIDR
  if (id.includes(".")) return "host"; // IP
  if (id.includes(":")) return "service"; // IP:port
  if (id.includes("@")) return "user"; // email-like
  return "external";
}

/**
 * Helper: Assess risk from finding description
 */
function assessRisk(
  content: string,
): "critical" | "high" | "medium" | "low" | "info" {
  const lower = content.toLowerCase();
  if (lower.includes("rce") || lower.includes("remote code")) return "critical";
  if (
    lower.includes("sql") ||
    lower.includes("xss") ||
    lower.includes("auth bypass")
  ) {
    return "high";
  }
  if (lower.includes("weak") || lower.includes("outdated")) return "medium";
  if (lower.includes("info")) return "info";
  return "low";
}

/**
 * Helper: Extract lateral movement paths from exploit findings
 */
function extractLateralPaths(
  content: string,
): Array<{ from: string; to: string; confidence: number }> {
  const paths: Array<{ from: string; to: string; confidence: number }> = [];

  // Simple regex-based extraction (in real impl, use NLP/ML)
  const pathRegex = /(?:move|lateral|jump|pivot|from|to)[\s:]*([0-9.]+)\s*(?:->|to)\s*([0-9.]+)/gi;
  let match;
  while ((match = pathRegex.exec(content)) !== null) {
    paths.push({
      from: match[1],
      to: match[2],
      confidence: 0.7,
    });
  }

  return paths;
}

/** Map for the signed-in operator, built from saved findings. */
export const getUserMap = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<NetworkMap> => {
    const sql = await getSql();
    await ensureFindings(sql);
    const findings = await sql<{
      id: string;
      target: string;
      kind: string;
      content: string;
    }>`
      select id, target, source as kind, detail as content
      from findings
      where user_id = ${context.userId}
      order by created_at desc
      limit 100
    `;
    const nodes = new Map<string, MapNode>();
    for (const finding of findings) {
      const id = finding.target || "unknown";
      const risk = assessRisk(finding.content);
      const existing = nodes.get(id);
      if (!existing) {
        nodes.set(id, {
          id,
          type: guessNodeType(id),
          label: id,
          risk,
          findings: [finding.id],
          lastSeen: new Date().toISOString(),
        });
      } else {
        existing.findings.push(finding.id);
        const rank = { critical: 5, high: 4, medium: 3, low: 2, info: 1 } as const;
        if (rank[risk] > rank[existing.risk]) existing.risk = risk;
      }
    }
    return {
      engagementId: context.userId,
      nodes: Array.from(nodes.values()),
      edges: [],
      lastUpdated: new Date().toISOString(),
      attackSurface: {
        exposedServices: nodes.size,
        vulnerableHosts: Array.from(nodes.values()).filter(
          (n) => n.risk === "critical" || n.risk === "high",
        ).length,
        lateralPaths: [],
        recommendedHardening: generateHardeningRecs(nodes, new Map()),
      },
    };
  });

