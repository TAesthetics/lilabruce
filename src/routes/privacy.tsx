import { createFileRoute, Link } from "@tanstack/react-router";
import { Wordmark } from "@/components/temple/brand";

export const Route = createFileRoute("/privacy")({ component: Privacy });

function Privacy() {
  return (
    <main className="relative z-10 mx-auto min-h-dvh max-w-2xl px-5 py-10">
      <Wordmark />
      <h1 className="mt-8 font-sans text-3xl font-semibold">Privacy Policy</h1>
      <p className="mt-2 text-[13px] text-muted">Last updated 31 August 2026</p>
      <div className="mt-6 space-y-4 text-[14px] leading-relaxed text-muted">
        <p>
          TEMPLE // WIRED is a purple-team console. We collect the
          minimum needed to run the workspace, engagements, and purchases.
        </p>
        <h2 className="font-sans text-base font-semibold text-fg">What we store</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Account identity from Google, X, or email (name, email, user id).</li>
          <li>Engagements, agent output, and feedback you submit.</li>
          <li>Purchase records (product, platform, transaction id, credits granted).</li>
        </ul>
        <h2 className="font-sans text-base font-semibold text-fg">Payments</h2>
        <p>
          Web payments are processed by Stripe. iOS in-app purchases are processed by
          Apple. Android in-app purchases are processed by Google Play. We do not
          receive or store full card numbers. Receipts are verified server-side to
          grant credits and entitlements.
        </p>
        <h2 className="font-sans text-base font-semibold text-fg">AI processing</h2>
        <p>
          Agent, tool, report, and chat prompts are sent to the built-in model. The key stays on the server.
          Do not paste secrets you are not allowed to share with that processor.
        </p>
        <h2 className="font-sans text-base font-semibold text-fg">Your rights</h2>
        <p>
          You may export nothing more than what is on screen, and you may delete your
          workspace data from Account → Delete my data. That control exists to satisfy
          Apple App Store Guideline 5.1.1(v).
        </p>
        <h2 className="font-sans text-base font-semibold text-fg">Contact</h2>
        <p>Privacy requests: operator@templewired.app (replace with your support inbox before store submission).</p>
      </div>
      <p className="mt-8 text-[12px] text-faint">
        <Link to="/" className="hover:text-cyan">
          Home
        </Link>
        {" · "}
        <Link to="/terms" className="hover:text-cyan">
          Terms
        </Link>
      </p>
    </main>
  );
}
