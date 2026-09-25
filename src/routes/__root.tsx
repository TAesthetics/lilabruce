import { useEffect, useState, type ReactNode } from "react";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { createServerFn } from "@tanstack/react-start";
import appCss from "../styles.css?url";

const APP_NAME = "TEMPLE // WIRED";

const fetchSessionUser = createServerFn({ method: "GET" }).handler(async () => {
  const { getSessionUser } = await import("@/lib/auth/verify.server");
  const u = await getSessionUser();
  return u ? { id: u.id, email: u.email } : null;
});

export const Route = createRootRoute({
  beforeLoad: async () => ({ sessionUser: await fetchSessionUser() }),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1",
      },
      { title: APP_NAME },
      { name: "theme-color", content: "#0b0c0e" },
      {
        name: "description",
        content:
          "TEMPLE // WIRED — purple-team console. Recon, exploit, detect, harden.",
      },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@500;600;700&display=swap",
      },
    ],
  }),
  component: RootDocument,
});

function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { refetchOnWindowFocus: false, retry: 1 },
        },
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

function AndroidChrome() {
  useEffect(() => {
    let remove = () => {};
    let cancelled = false;
    void (async () => {
      const { Capacitor } = await import("@capacitor/core");
      if (cancelled || !Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") return;
      const { StatusBar, Style } = await import("@capacitor/status-bar");
      const { App } = await import("@capacitor/app");
      await StatusBar.setBackgroundColor({ color: "#0b0c0e" }).catch(() => {});
      await StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
      const handle = await App.addListener("backButton", () => {
        if (window.history.length > 1) window.history.back();
        else void App.exitApp();
      });
      remove = () => void handle.remove();
    })();
    return () => {
      cancelled = true;
      remove();
    };
  }, []);
  return null;
}

function RootDocument() {
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-bg text-fg">
        <AndroidChrome />
        <PreviewHostBridge />
        <AuthProvider>
          <Providers>
            <Outlet />
          </Providers>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
