import { SYSTEM_CORE } from "./prompts";

export type FatherResult =
  | { ok: true; content: string; provider: "venice" }
  | { ok: false; error: string };

export function modelConfigured(): boolean {
  return Boolean(process.env.VENICE_API_KEY);
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
  const key = process.env.VENICE_API_KEY;
  const model = process.env.VENICE_MODEL || "llama-3.3-70b";
  if (!key) return { ok: false, error: "The model is not available." };
  return chatComplete(key, model, system, prompt);
}
