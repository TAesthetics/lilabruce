import { createFileRoute, Link } from "@tanstack/react-router";
import { Wordmark } from "@/components/temple/brand";
import { ReelPlayer } from "@/components/temple/reel-player";

export const Route = createFileRoute("/reel")({ component: ReelPage });

function ReelPage() {
  return (
    <main className="relative z-10 min-h-dvh bg-bg">
      <header className="flex items-center justify-between px-5 py-4">
        <Wordmark />
        <Link
          to="/"
          className="font-sans text-[11px] tracking-[0.14em] text-muted uppercase hover:text-primary"
        >
          Home
        </Link>
      </header>
      <section className="mx-auto flex max-w-lg flex-col items-center px-5 pb-16">
        <p className="mb-4 font-sans text-[11px] tracking-[0.28em] text-cyan uppercase">
          Alpha-Teaser
        </p>
        <ReelPlayer />
      </section>
    </main>
  );
}
