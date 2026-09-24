import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";

async function ensureOutbox(sql: Awaited<ReturnType<typeof getSql>>) {
  await sql`
    create table if not exists mail_outbox (
      id text primary key,
      recipient text not null,
      subject text not null,
      body text not null,
      created_at timestamptz not null default now()
    )
  `;
}

export async function deliverPasswordReset(to: string, url: string) {
  const sql = await getSql();
  await ensureOutbox(sql);
  const id = crypto.randomUUID();
  const subject = "Reset your TEMPLE // WIRED password";
  const body = `Reset your password:\n${url}\n\nThis link expires in one hour.`;
  await sql`
    insert into mail_outbox (id, recipient, subject, body)
    values (${id}, ${to.toLowerCase()}, ${subject}, ${body})
  `;

  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const from = process.env.MAIL_FROM || "TEMPLE WIRED <onboarding@resend.dev>";
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text: body,
    }),
  });
}

/** When no mail provider is configured, the preview can show the link once. */
export const latestResetLink = createServerFn({ method: "POST" })
  .validator((input: { email: string }) => input)
  .handler(async ({ data }) => {
    if (process.env.RESEND_API_KEY) return { link: null as string | null };
    const email = data.email.trim().toLowerCase();
    if (!email) return { link: null };
    const sql = await getSql();
    await ensureOutbox(sql);
    const rows = await sql<{ body: string }>`
      select body from mail_outbox
      where recipient = ${email}
        and created_at > now() - interval '15 minutes'
      order by created_at desc
      limit 1
    `;
    const body = rows[0]?.body ?? "";
    const link = body.match(/https?:\/\/\S+/)?.[0] ?? null;
    return { link };
  });
