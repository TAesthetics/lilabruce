import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SYSTEM_CORE } from "./prompts";

export type FatherResult =
  | { ok: true; content: string; provider: "venice" }
  | { ok: false; error: string };

function veniceEnv(): { key: string; model: string } {
  let key = process.env.VENICE_API_KEY?.trim() || "";
  let model = process.env.VENICE_MODEL?.trim() || "";
  if (!key) {
    try {
      const text = readFileSync(join(process.cwd(), ".env"), "utf8");
      for (const line of text.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq < 0) continue;
        const name = trimmed.slice(0, eq).trim();
        const value = trimmed.slice(eq + 1).trim();
        if (name === "VENICE_API_KEY" && value) key = value;
        if (name === "VENICE_MODEL" && value) model = value;
      }
    } catch {
      /* no local env file */
    }
  }
  return { key, model: model || "llama-3.3-70b" };
}

export function modelConfigured(): boolean {
  return Boolean(veniceEnv().key);
}

async function chatComplete(
  apiKey: string,
  model: string,
  system: string,
  prompt: string,
): Promise<FatherResult> {
  const res = await fetch("https://api.venice.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system || SYSTEM_CORE },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 1600,
      venice_parameters: { include_venice_system_prompt: false },
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    return { ok: false, error: `Model ${res.status}: ${t.slice(0, 180)}` };
  }
  const body = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = body.choices?.[0]?.message?.content?.trim() ?? "";
  if (!content) return { ok: false, error: "The model returned an empty response." };
  return { ok: true, content, provider: "venice" };
}

export async function callFather(prompt: string, system: string): Promise<FatherResult> {
  const { key, model } = veniceEnv();
  if (!key) return { ok: false, error: "The model is not available." };
  return chatComplete(key, model, system, prompt);
}
