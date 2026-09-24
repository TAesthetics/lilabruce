/**
 * Local email/password sign-in (this app's Better Auth DB — not the broker).
 *
 * Do NOT edit `server.ts` for this — that file is frozen pre-wired config.
 * The reset mailer is invoked from here so password reset stays with this flag.
 */
import { deliverPasswordReset } from "@/lib/mail/reset";

export const emailAndPasswordEnabled = true;

export const emailAndPassword = {
  enabled: true,
  minPasswordLength: 8,
  resetPasswordTokenExpiresIn: 60 * 60,
  sendResetPassword: async ({
    user,
    url,
  }: {
    user: { email: string };
    url: string;
    token: string;
  }) => {
    await deliverPasswordReset(user.email, url);
  },
};
