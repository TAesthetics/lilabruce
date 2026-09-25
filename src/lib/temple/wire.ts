import { lookup } from "node:dns/promises";
import net from "node:net";
import tls from "node:tls";

const PORTS = [22, 25, 53, 80, 110, 143, 443, 445, 993, 995, 1433, 3306, 3389, 5432, 6379, 8080, 8443, 9200];

const LIVE_TOOLS = new Set(["portscan", "vulnscan", "webapp", "osint"]);

export function isLiveTool(tool: string): boolean {
  return LIVE_TOOLS.has(tool);
}

function blockedAddress(address: string): boolean {
  const a = address.toLowerCase();
  if (a === "169.254.169.254" || a.startsWith("169.254.")) return true;
  if (a === "::1" || a === "0.0.0.0" || a === "::") return false;
  if (a.startsWith("fe80:") || a.startsWith("fd00:ec2")) return true;
  return false;
}

function hostOf(target: string): string {
  const raw = target.trim().replace(/^[a-z]+:\/\//i, "").split("/")[0]?.split("?")[0] ?? "";
  return raw.replace(/:\d+$/, "").replace(/^\[|\]$/g, "");
}

async function assertReachable(host: string): Promise<void> {
  if (!host || host.length > 253) throw new Error("Bad target");
  if (host === "localhost") return;
  const records = await lookup(host, { all: true, verbatim: true });
  if (records.length === 0) throw new Error("Target did not resolve");
  if (records.some((r) => blockedAddress(r.address))) {
    throw new Error("That address is blocked");
  }
}

function probePort(host: string, port: number): Promise<"open" | "closed" | "filtered"> {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port });
    const timer = setTimeout(() => {
      socket.destroy();
      resolve("filtered");
    }, 1200);
    socket.once("connect", () => {
      clearTimeout(timer);
      socket.destroy();
      resolve("open");
    });
    socket.once("error", (err: NodeJS.ErrnoException) => {
      clearTimeout(timer);
      resolve(err.code === "ECONNREFUSED" ? "closed" : "filtered");
    });
  });
}

async function scanPorts(host: string): Promise<number[]> {
  const open: number[] = [];
  for (let i = 0; i < PORTS.length; i += 6) {
    const batch = PORTS.slice(i, i + 6);
    const results = await Promise.all(batch.map(async (port) => [port, await probePort(host, port)] as const));
    for (const [port, state] of results) {
      if (state === "open") open.push(port);
    }
  }
  return open;
}

async function tcpScan(host: string): Promise<string> {
  const open = await scanPorts(host);
  return [
    `TCP connect scan of ${host}`,
    `Open: ${open.length ? open.join(", ") : "none"}`,
    `Checked: ${PORTS.join(", ")}`,
    "Method: TCP connect. No payloads.",
  ].join("\n");
}

const HIGH_PORTS = new Set([23, 445, 1433, 3306, 3389, 5432, 5900, 6379, 9200]);

export function portNote(port: number): { severity: "high" | "medium" | "info"; note: string } {
  if (HIGH_PORTS.has(port)) {
    return {
      severity: "high",
      note: "This service is reachable. Restrict who can connect, and confirm it should be exposed.",
    };
  }
  if (port === 22 || port === 21) {
    return {
      severity: "medium",
      note: "Remote access is reachable. Prefer keys over passwords and limit the source addresses.",
    };
  }
  if (port === 80) {
    return { severity: "info", note: "HTTP is open. Serve the app on HTTPS and set the security headers." };
  }
  if (port === 443 || port === 8443) {
    return { severity: "info", note: "TLS is reachable. Check the certificate date and the response headers." };
  }
  return { severity: "medium", note: "A service answered. Confirm it is in scope and not a forgotten listener." };
}

export async function collectExposure(target: string): Promise<{
  host: string;
  text: string;
  open: { port: number; severity: "high" | "medium" | "info"; note: string }[];
}> {
  const host = hostOf(target);
  await assertReachable(host);
  const [dns, openPorts, http, cert] = await Promise.all([
    dnsProbe(host).catch((err: Error) => `DNS failed: ${err.message}`),
    scanPorts(host),
    httpProbe(host),
    tlsProbe(host),
  ]);
  const open = openPorts.map((port) => ({ port, ...portNote(port) }));
  const text = [dns, `Open ports: ${openPorts.length ? openPorts.join(", ") : "none"}`, http, cert].join("\n\n");
  return { host, text, open };
}

async function httpProbe(host: string): Promise<string> {
  const lines: string[] = [];
  for (const scheme of ["https", "http"] as const) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    try {
      const res = await fetch(`${scheme}://${host}/`, {
        method: "GET",
        redirect: "manual",
        signal: ctrl.signal,
        headers: { "user-agent": "TEMPLE-WIRED-lab/1.0" },
      });
      const headers = ["server", "x-powered-by", "strict-transport-security", "content-security-policy", "x-frame-options", "set-cookie"]
        .map((name) => {
          const value = res.headers.get(name);
          return value ? `${name}: ${value.slice(0, 180)}` : null;
        })
        .filter(Boolean);
      lines.push(`${scheme.toUpperCase()} ${res.status} ${res.headers.get("location") ?? ""}`.trim());
      lines.push(...headers.map((h) => `  ${h}`));
    } catch (err) {
      lines.push(`${scheme.toUpperCase()} failed: ${err instanceof Error ? err.message : "error"}`);
    } finally {
      clearTimeout(timer);
    }
  }
  return lines.join("\n");
}

function tlsProbe(host: string): Promise<string> {
  return new Promise((resolve) => {
    const socket = tls.connect(
      { host, port: 443, servername: host, rejectUnauthorized: false, timeout: 5000 },
      () => {
        const cert = socket.getPeerCertificate();
        const proto = socket.getProtocol() ?? "unknown";
        socket.end();
        resolve(
          [
            `TLS ${proto}`,
            cert.subject ? `Subject: ${cert.subject.CN ?? JSON.stringify(cert.subject)}` : "No certificate",
            cert.issuer ? `Issuer: ${cert.issuer.O ?? cert.issuer.CN ?? ""}` : "",
            cert.valid_to ? `Valid to: ${cert.valid_to}` : "",
            socket.authorized ? "Chain trusted" : `Chain note: ${socket.authorizationError || "not verified"}`,
          ]
            .filter(Boolean)
            .join("\n"),
        );
      },
    );
    socket.setTimeout(5000, () => {
      socket.destroy();
      resolve("TLS 443 did not complete");
    });
    socket.once("error", (err) => resolve(`TLS failed: ${err.message}`));
  });
}

async function dnsProbe(host: string): Promise<string> {
  const records = await lookup(host, { all: true, verbatim: true });
  return [`DNS ${host}`, ...records.map((r) => `${r.family === 6 ? "AAAA" : "A"} ${r.address}`)].join("\n");
}

/** Real collection. No shells, no credentials, no exploit payloads. */
export async function collectLive(tool: string, target: string): Promise<string> {
  const host = hostOf(target);
  await assertReachable(host);
  if (tool === "portscan") return tcpProbeSafe(host);
  if (tool === "osint") return dnsProbe(host);
  if (tool === "webapp") return httpProbe(host);
  if (tool === "vulnscan") return `${await tlsProbe(host)}\n\n${await httpProbe(host)}`;
  return "";
}

async function tcpProbeSafe(host: string): Promise<string> {
  return tcpScan(host);
}
