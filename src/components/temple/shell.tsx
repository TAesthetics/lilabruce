import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutGrid,
  Network,
  ShoppingBag,
  TerminalSquare,
  UserRound,
} from "lucide-react";
import { Wordmark } from "./brand";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/deck" as const, label: "Tasks", icon: TerminalSquare },
  { to: "/map" as const, label: "Map", icon: Network },
  { to: "/shop" as const, label: "Shop", icon: ShoppingBag },
  { to: "/account" as const, label: "Account", icon: UserRound },
];

export function TempleShell({
  children,
  credits,
  pro,
  right,
}: {
  children: ReactNode;
  credits?: number;
  pro?: boolean;
  right?: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="relative z-10 flex h-dvh max-h-dvh flex-col overflow-hidden bg-bg">
      <header className="sticky top-0 z-30 flex h-12 items-center justify-between gap-3 border-b border-border bg-surface px-3 pt-[env(safe-area-inset-top)] sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Wordmark to="/deck" />
          {pro ? (
            <span className="hidden rounded-sm border border-ok px-1.5 py-0.5 font-sans text-[9px] font-semibold tracking-[0.14em] text-ok sm:inline">
              PRO
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {typeof credits === "number" ? (
            <Link
              to="/shop"
              className="rounded-sm border border-border px-2 py-1 font-sans text-[10px] font-semibold tracking-[0.12em] text-cyan tabular-nums hover:border-cyan"
            >
              CR {credits}
            </Link>
          ) : null}
          {right}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-[calc(4.25rem+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:hidden">
        {NAV.map((item) => {
          const active = pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex h-14 flex-col items-center justify-center gap-1 font-sans text-[10px] tracking-[0.12em] uppercase",
                active ? "text-primary" : "text-muted",
              )}
            >
              <Icon className="size-4" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <nav className="hidden border-t border-border bg-surface md:flex">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-1 px-4 py-2">
          {NAV.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-sm border px-3 font-sans text-[11px] font-semibold tracking-[0.12em] uppercase",
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-muted hover:border-border hover:text-fg",
                )}
              >
                <Icon className="size-3.5" />
                {item.label}
              </Link>
            );
          })}
          <span className="ml-auto inline-flex items-center gap-1.5 text-faint">
            <LayoutGrid className="size-3.5" />
            <span className="font-sans text-[10px] tracking-[0.14em] uppercase">
              Security console
            </span>
          </span>
        </div>
      </nav>
    </div>
  );
}
