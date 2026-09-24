import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Crosshair,
  Radio,
  Search,
  Shield,
  ShoppingBag,
  Smartphone,
} from "lucide-react";
import { Wordmark } from "@/components/temple/brand";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({ component: Home });

const AGENTS = [
  { icon: Search, name: "Recon", copy: "Surface, OSINT, and an attack map." },
  { icon: Crosshair, name: "Exploit", copy: "Likely paths, proof steps, and post-access notes." },
  { icon: Radio, name: "Detect", copy: "SIEM, EDR, and time-to-detect." },
  { icon: Shield, name: "Harden", copy: "Controls that raise the bar." },
];

function Home() {
  return (
    <main className="relative z-10 min-h-dvh bg-bg">
      <header className="flex items-center justify-between px-5 py-4">
        <Wordmark />
        <div className="flex items-center gap-2">
          <Link
            to="/shop"
            className="hidden h-10 items-center gap-2 rounded-sm border border-border px-3 font-sans text-[11px] tracking-[0.12em] text-muted uppercase sm:inline-flex hover:border-primary hover:text-primary"
          >
            <ShoppingBag className="size-3.5" />
            Shop
          </Link>
          <Link to="/login">
            <Button variant="primary" size="sm">
              Sign in
            </Button>
          </Link>
        </div>
      </header>

      <section className="mx-auto flex max-w-3xl flex-col items-center px-5 pt-10 pb-16 text-center sm:pt-20">
        <p className="font-sans text-[11px] tracking-[0.28em] text-cyan uppercase">
          Purple-team platform
        </p>
        <h1 className="mt-3 font-sans text-[clamp(2.4rem,8vw,4.6rem)] leading-[0.95] font-bold tracking-[-0.03em] text-fg">
          Purple team.
          <br />
          <span className="text-primary">On your phone.</span>
        </h1>
        <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-muted">
          TEMPLE // WIRED is the iPhone and Android app for authorized purple-team
          work. Pick a target, run Recon, Exploit, Detect, or Harden, then ask the
          assistant to refine the plan.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/deck">
            <Button variant="solid" className="min-w-44">
              Start a task
            </Button>
          </Link>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[10px] tracking-[0.14em] text-faint uppercase">
          <span className="rounded-sm border border-border px-2 py-1">App Store IAP</span>
          <span className="rounded-sm border border-border px-2 py-1">Google Play Billing</span>
          <span className="rounded-sm border border-border px-2 py-1">Stripe web</span>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-3 px-5 pb-16 sm:grid-cols-2 lg:grid-cols-4">
        {AGENTS.map((a) => {
          const Icon = a.icon;
          return (
            <article
              key={a.name}
              className="glow-line rounded-lg border border-border bg-surface p-4"
            >
              <Icon className="size-5 text-primary" strokeWidth={1.6} />
              <h2 className="mt-3 font-sans text-sm font-semibold tracking-[0.12em] uppercase">
                {a.name}
              </h2>
              <p className="mt-1 text-[13px] text-muted">{a.copy}</p>
            </article>
          );
        })}
      </section>

      <section className="mx-auto mb-16 max-w-5xl px-5">
        <div className="glow-line flex flex-col gap-6 rounded-xl border border-border bg-surface p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="max-w-md">
            <div className="mb-2 inline-flex items-center gap-2 text-cyan">
              <Smartphone className="size-4" />
              <span className="font-sans text-[11px] tracking-[0.16em] uppercase">
                Store ready
              </span>
            </div>
            <h2 className="font-sans text-xl font-semibold tracking-tight">
              Same app on iPhone and Android.
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              Add it to your home screen and work tasks full screen. The App Store
              and Play Store builds are this app: Apple bills through the App Store,
              Google through Play, and the web uses Stripe after the free prompts.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <a
              href="/?install=1&platform=ios"
              className="inline-flex h-12 items-center justify-center rounded-sm border border-fg bg-fg px-5 font-sans text-[11px] font-semibold tracking-[0.12em] text-bg uppercase"
            >
              Add to iPhone
            </a>
            <a
              href="/?install=1&platform=android"
              className="inline-flex h-12 items-center justify-center rounded-sm border border-border px-5 font-sans text-[11px] font-semibold tracking-[0.12em] text-fg uppercase hover:border-primary hover:text-primary"
            >
              Add to Android
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-5 py-8 text-center text-[11px] text-faint">
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/privacy" className="hover:text-cyan">
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-cyan">
            Terms
          </Link>
          <Link to="/shop" className="hover:text-cyan">
            Shop
          </Link>
          <Link to="/reel" className="hover:text-cyan">
            Reel
          </Link>
          <span>Authorized testing only.</span>
        </div>
        <p className="mt-3">Authorized security testing. Commercial terms apply.</p>
      </footer>
    </main>
  );
}
