import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * MCP Server Integration
 *
 * Allows agents to:
 * - Discover tools and data sources (resources)
 * - Call external tools (custom scanners, APIs)
 * - Learn from historical findings
 * - Access map data for correlation
 */

interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

interface MCPResource {
  uri: string;
  name: string;
  mimeType: string;
  contents?: string;
}

interface ToolResult {
  ok: boolean;
  data?: unknown;
  error?: string;
}

class MCPAgentServer {
  private server: Server;
  private registeredTools: Map<string, MCPTool> = new Map();
  private learningCache: Map<string, unknown> = new Map();

  constructor() {
    this.server = new Server({
      name: "temple-mcp-agent",
      version: "1.0.0",
    });

    this.setupHandlers();
    this.registerBuiltInTools();
  }

  private setupHandlers() {
    // List available resources (findings, map data, etc.)
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      const resources: MCPResource[] = [
        {
          uri: "temple://findings/recent",
          name: "Recent Findings",
          mimeType: "application/json",
        },
        {
          uri: "temple://map/nodes",
          name: "Network Map Nodes",
          mimeType: "application/json",
        },
        {
          uri: "temple://learning/cache",
          name: "Agent Learning Cache",
          mimeType: "application/json",
        },
      ];
      return { resources };
    });

    // Read specific resource
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const uri = request.params.uri;
      let contents: string;

      if (uri === "temple://findings/recent") {
        contents = JSON.stringify(this.getRecentFindings());
      } else if (uri === "temple://map/nodes") {
        contents = JSON.stringify(this.getMapData());
      } else if (uri === "temple://learning/cache") {
        contents = JSON.stringify(Array.from(this.learningCache.entries()));
      } else {
        return { contents: "{}", mimeType: "application/json" };
      }

      return { contents, mimeType: "application/json" };
    });

    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: Array.from(this.registeredTools.values()),
      };
    });

    // Call tool
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const toolName = request.params.name;
      const toolArgs = request.params.arguments as Record<string, unknown>;

      const result = await this.callTool(toolName, toolArgs);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result),
          },
        ],
      };
    });
  }

  private registerBuiltInTools() {
    // Tool: Discover vulnerabilities from past findings
    this.registeredTools.set("learn_from_findings", {
      name: "learn_from_findings",
      description:
        "Analyze recent findings to identify patterns and common vulnerabilities",
      inputSchema: {
        type: "object",
        properties: {
          category: {
            type: "string",
            enum: ["network", "web", "auth", "infrastructure"],
            description: "Finding category to learn from",
          },
          limit: {
            type: "number",
            description: "Max number of past findings to analyze",
          },
        },
      },
    });

    // Tool: Query map for network correlation
    this.registeredTools.set("query_map", {
      name: "query_map",
      description:
        "Query the network map to find correlated hosts and attack paths",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "SPARQL-like query for network topology",
          },
        },
      },
    });

    // Tool: Store learning for future agent decisions
    this.registeredTools.set("cache_learning", {
      name: "cache_learning",
      description:
        "Cache successful patterns and findings for faster future analysis",
      inputSchema: {
        type: "object",
        properties: {
          key: { type: "string", description: "Cache key" },
          value: { type: "object", description: "Value to cache" },
          ttl: { type: "number", description: "Time to live in seconds" },
        },
      },
    });

    // Tool: Call external scanner or custom tool
    this.registeredTools.set("call_external_tool", {
      name: "call_external_tool",
      description: "Invoke registered external security tools",
      inputSchema: {
        type: "object",
        properties: {
          toolId: { type: "string", description: "External tool identifier" },
          target: { type: "string", description: "Target for tool" },
          options: { type: "object", description: "Tool options" },
        },
      },
    });
  }

  private async callTool(
    toolName: string,
    args: Record<string, unknown>,
  ): Promise<ToolResult> {
    switch (toolName) {
      case "learn_from_findings":
        return this.learnFromFindings(
          args.category as string,
          (args.limit as number) || 10,
        );

      case "query_map":
        return this.queryMapData(args.query as string);

      case "cache_learning":
        return this.cacheLearning(
          args.key as string,
          args.value,
          (args.ttl as number) || 3600,
        );

      case "call_external_tool":
        return this.callExternalTool(
          args.toolId as string,
          args.target as string,
          args.options as Record<string, unknown>,
        );

      default:
        return { ok: false, error: `Unknown tool: ${toolName}` };
    }
  }

  private learnFromFindings(
    category: string,
    limit: number,
  ): Promise<ToolResult> {
    // In real implementation, query database for recent findings
    const findings = [
      {
        type: "sql_injection",
        confidence: 0.95,
        remediation: "Use parameterized queries",
      },
      {
        type: "open_port_8080",
        confidence: 0.99,
        remediation: "Firewall ingress rules",
      },
    ];

    return Promise.resolve({
      ok: true,
      data: {
        category,
        patterns: findings.slice(0, limit),
        recommendation:
          "These patterns appear frequently. Prioritize these checks.",
      },
    });
  }

  private queryMapData(query: string): Promise<ToolResult> {
    // Simplified map query
    const mapNodes = [
      { id: "192.168.1.10", type: "host", risk: "high" },
      { id: "10.0.0.1", type: "router", risk: "medium" },
    ];

    return Promise.resolve({
      ok: true,
      data: {
        query,
        results: mapNodes,
        attackPaths: [
          "192.168.1.10 → 10.0.0.1 (SQL injection → network lateral movement)",
        ],
      },
    });
  }

  private cacheLearning(
    key: string,
    value: unknown,
    ttl: number,
  ): Promise<ToolResult> {
    this.learningCache.set(key, value);
    // In real implementation, set TTL expiration
    setTimeout(
      () => this.learningCache.delete(key),
      ttl * 1000,
    );

    return Promise.resolve({
      ok: true,
      data: { cached: key, ttl },
    });
  }

  private callExternalTool(
    toolId: string,
    target: string,
    options: Record<string, unknown>,
  ): Promise<ToolResult> {
    // In real implementation, dispatch to registered external tool
    return Promise.resolve({
      ok: true,
      data: {
        toolId,
        target,
        results: {
          openPorts: [22, 80, 443],
          services: ["SSH", "HTTP", "HTTPS"],
        },
      },
    });
  }

  private getRecentFindings() {
    return [
      {
        target: "example.com",
        type: "XSS",
        severity: "high",
        found_at: new Date().toISOString(),
      },
    ];
  }

  private getMapData() {
    return {
      nodes: [
        { id: "192.168.1.0/24", type: "subnet", label: "Internal" },
        { id: "1.2.3.4", type: "host", label: "Web Server", risk: "medium" },
      ],
      edges: [{ from: "1.2.3.4", to: "192.168.1.0/24", type: "route" }],
    };
  }

  async start(port = 3001) {
    console.log(`[MCP] Starting agent learning server on port ${port}`);
    await this.server.connect();
  }

  async stop() {
    await this.server.close();
  }
}

export const mcpServer = new MCPAgentServer();
