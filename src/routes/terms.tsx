import { createFileRoute, Link } from "@tanstack/react-router";
import { Wordmark } from "@/components/temple/brand";

export const Route = createFileRoute("/terms")({ component: Terms });

function Terms() {
  return (
    <main className="relative z-10 mx-auto min-h-dvh max-w-2xl px-5 py-10">
      <Wordmark />
      <h1 className="mt-8 font-sans text-3xl font-semibold">Terms of Use</h1>
      <p className="mt-2 text-[13px] text-muted">Last updated 31 August 2026</p>
      <div className="mt-6 space-y-4 text-[14px] leading-relaxed text-muted">
        <p>
          TEMPLE // WIRED is for educational and authorized security testing only.
          You must have written permission before assessing any system that is not
          yours. Unauthorized access is illegal.
        </p>
        <h2 className="font-sans text-base font-semibold text-fg">The product</h2>
        <p>
          The product generates plans, commands, and reports. It does not itself
          scan, exploit, or persist on remote hosts. You are responsible for how
          you use the output.
        </p>
        <h2 className="font-sans text-base font-semibold text-fg">Purchases</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Web: €15 per month, billed by Stripe after the twenty free prompts in a day.</li>
          <li>iOS app: billed by Apple In-App Purchase. Manage or cancel in iOS Settings.</li>
          <li>Android app: billed by Google Play Billing. Manage in the Play Store.</li>
          <li>Credits are consumable and generally non-refundable once used, subject to Apple and Google refund policy.</li>
          <li>The monthly payment renews until cancelled. It starts at €15.</li>
        </ul>
        <h2 className="font-sans text-base font-semibold text-fg">Acceptable use</h2>
        <p>
          No targeting of systems without authorization. No trafficking in access.
          We may suspend use that burns model quota in automated loops beyond
          normal product use.
        </p>
        <h2 className="font-sans text-base font-semibold text-fg">Liability</h2>
        <p>
          The product is provided as-is. Agent output can be wrong. You remain
          responsible for how you use it.
        </p>
      </div>
      <p className="mt-8 text-[12px] text-faint">
        <Link to="/" className="hover:text-cyan">
          Home
        </Link>
        {" · "}
        <Link to="/privacy" className="hover:text-cyan">
          Privacy
        </Link>
      </p>
    </main>
  );
}
