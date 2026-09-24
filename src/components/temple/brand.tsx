import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Wordmark({ className, to = "/" }: { className?: string; to?: string }) {
  return (
    <Link
      to={to}
      className={cn(
        "font-sans text-[15px] font-bold tracking-[0.16em] text-primary uppercase",
        className,
      )}
    >
      TEMPLE<span className="text-cyan">//</span>WIRED
    </Link>
  );
}
