/**
 * Agent Integration with MCP Learning Systems
 *
 * Agents automatically consult MCP tools before making decisions.
 * Results are cached and fed back into subsequent agent runs.
 */

interface AgentContext {
  userId: string;
  target: string;
  engagementId: string;
}

interface LearningData {
  patterns: string[];
  recommendations: string[];
  attackPaths: string[];
  timestamp: string;
}

interface MCPQuery {
  category: string;
  context: AgentContext;
  limit?: number;
}

class AgentLearningBridge {
  private learningCache: Map<string, LearningData> = new Map();

  /**
   * Before Recon Agent runs: learn from past reconnaissance patterns
   */
  async learnForRecon(context: AgentContext): Promise<LearningData> {
    const cacheKey = `recon:${context.target}`;

    if (this.learningCache.has(cacheKey)) {
      return this.learningCache.get(cacheKey)!;
    }

    // Query MCP for past recon findings
    const learning = await this.queryMCP({
      category: "network",
      context,
      limit: 5,
    });

    this.learningCache.set(cacheKey, learning);
    return learning;
  }

  /**
   * Before Exploit Agent runs: learn successful exploit paths
   */
  async learnForExploit(
    context: AgentContext,
    reconFindings: string[],
  ): Promise<LearningData> {
    const cacheKey = `exploit:${context.target}`;

    // Query map for correlated hosts and lateral movement paths
    const learning = await this.queryMapForAttackPaths(context, reconFindings);

    this.learningCache.set(cacheKey, learning);
    return learning;
  }

  /**
   * Before Detection Agent runs: learn what detection gaps were found before
   */
  async learnForDetection(context: AgentContext): Promise<LearningData> {
    const cacheKey = `detect:${context.target}`;

    // Query past detection analysis
    const learning = await this.queryMCP({
      category: "detection",
      context,
      limit: 10,
    });

    return learning;
  }

  /**
   * Before Hardening Agent runs: learn what remediations worked
   */
  async learnForHardening(context: AgentContext): Promise<LearningData> {
    const cacheKey = `harden:${context.target}`;

    // Query MCP for successful hardening patterns
    const learning = await this.queryMCP({
      category: "remediation",
      context,
      limit: 10,
    });

    return learning;
  }

  /**
   * Query MCP for findings and patterns
   */
  private async queryMCP(query: MCPQuery): Promise<LearningData> {
    try {
      // In real implementation, call MCP server
      const response = await fetch("http://localhost:3001/mcp/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "learn_from_findings",
          args: {
            category: query.category,
            limit: query.limit || 10,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`MCP error: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        patterns: result.data?.patterns?.map((p: unknown) => String(p)) || [],
        recommendations:
          result.data?.recommendations?.map((r: unknown) => String(r)) || [],
        attackPaths: result.data?.attackPaths || [],
        timestamp: new Date().toISOString(),
      };
    } catch (e) {
      console.error("[MCP] Learn query failed:", e);
      return {
        patterns: [],
        recommendations: [],
        attackPaths: [],
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Query map for network topology and attack paths
   */
  private async queryMapForAttackPaths(
    context: AgentContext,
    reconFindings: string[],
  ): Promise<LearningData> {
    try {
      const response = await fetch("http://localhost:3001/mcp/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "query_map",
          args: {
            query: `paths FROM ${context.target} WHERE risk > medium`,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Map query failed`);
      }

      const result = await response.json();

      return {
        patterns: [],
        recommendations: [],
        attackPaths: result.data?.attackPaths || [],
        timestamp: new Date().toISOString(),
      };
    } catch (e) {
      console.error("[MCP] Map query failed:", e);
      return {
        patterns: [],
        recommendations: [],
        attackPaths: [],
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Cache successful agent decisions for future runs
   */
  async cacheAgentDecision(
    agentName: string,
    context: AgentContext,
    decision: unknown,
  ): Promise<void> {
    try {
      await fetch("http://localhost:3001/mcp/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "cache_learning",
          args: {
            key: `${agentName}:${context.target}`,
            value: decision,
            ttl: 86400, // 24 hours
          },
        }),
      });
    } catch (e) {
      console.error("[MCP] Cache decision failed:", e);
    }
  }

  /**
   * Clear old learning data
   */
  clearExpired(): void {
    // In real implementation, check TTLs
    const now = Date.now();
    for (const [key, data] of this.learningCache.entries()) {
      const age = now - new Date(data.timestamp).getTime();
      if (age > 24 * 60 * 60 * 1000) {
        // 24 hours
        this.learningCache.delete(key);
      }
    }
  }
}

export const agentLearning = new AgentLearningBridge();

/**
 * Usage in Agent Prompts:
 *
 * Before calling Venice:
 *
 *   const learning = await agentLearning.learnForRecon(context);
 *
 *   const systemPrompt = `
 *     You are the Recon Agent.
 *     ${learning.patterns.length > 0 ? `Past reconnaissance found these patterns: ${learning.patterns.join(", ")}` : ""}
 *     ${learning.recommendations.length > 0 ? `Recommendation: ${learning.recommendations.join(", ")}` : ""}
 *     Target: ${context.target}
 *   `;
 *
 * After agent returns result:
 *
 *   await agentLearning.cacheAgentDecision("recon", context, result);
 */
