import type { ReactNode } from "react";

/** The console is always visible. Session linking must not cover the chat. */
export function AuthGate({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
