import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { i as getSql } from "./db-D6L-vCpY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reset-P4706uYy.js
async function ensureOutbox(sql) {
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
var latestResetLink_createServerFn_handler = createServerRpc({
	id: "8ad59534dc2193fea32f658e0667ce7b743d8ce813d8825092f615d1d781dab5",
	name: "latestResetLink",
	filename: "src/lib/mail/reset.ts"
}, (opts) => latestResetLink.__executeServer(opts));
var latestResetLink = createServerFn({ method: "POST" }).validator((input) => input).handler(latestResetLink_createServerFn_handler, async ({ data }) => {
	if (process.env.RESEND_API_KEY) return { link: null };
	const email = data.email.trim().toLowerCase();
	if (!email) return { link: null };
	const sql = await getSql();
	await ensureOutbox(sql);
	return { link: ((await sql`
      select body from mail_outbox
      where recipient = ${email}
        and created_at > now() - interval '15 minutes'
      order by created_at desc
      limit 1
    `)[0]?.body ?? "").match(/https?:\/\/\S+/)?.[0] ?? null };
});
//#endregion
export { latestResetLink_createServerFn_handler };
