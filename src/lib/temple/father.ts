import { SYSTEM_CORE } from "./prompts";

export type FatherResult =
  | { ok: true; content: string; provider: "xai" }
  | { ok: false; error: string };

async function chatComplete(
  url: string,
  apiKey: string,
  model: string,
  system: string,
  prompt: string,
): Promise<FatherResult> {
  const res = await fetch(url, {
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
      temperature: 0.7,
      max_tokens: 1600,
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
  return { ok: true, content, provider: "xai" };
}

export async function callFather(prompt: string, system: string): Promise<FatherResult> {
  const xai = process.env.XAI_API_KEY;
  if (!xai) return { ok: false, error: "The model is not available." };

  const r = await chatComplete(
    "https://api.x.ai/v1/chat/completions",
    xai,
    "grok-4.5",
    system,
    prompt,
  );
  return r.ok ? { ...r, provider: "xai" } : r;
}
