export type StorePlatform = "web" | "ios" | "android";

interface CapacitorBridge {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
  Plugins?: Record<string, unknown>;
}

function capacitor(): CapacitorBridge | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { Capacitor?: CapacitorBridge }).Capacitor;
}

export function detectStorePlatform(): StorePlatform {
  const cap = capacitor();
  if (cap?.isNativePlatform?.()) {
    const p = cap.getPlatform?.();
    if (p === "ios") return "ios";
    if (p === "android") return "android";
  }
  return "web";
}

export function isNativeStore(): boolean {
  const p = detectStorePlatform();
  return p === "ios" || p === "android";
}

export function payMethodLabel(platform: StorePlatform): string {
  if (platform === "ios") return "Apple";
  if (platform === "android") return "Google Play";
  return "Stripe";
}

export function payMethodBlurb(platform: StorePlatform): string {
  if (platform === "ios") {
    return "In-app purchases are billed through Apple. Subscriptions renew until cancelled in Settings.";
  }
  if (platform === "android") {
    return "In-app purchases are billed through Google Play. Manage subscriptions in Play Store.";
  }
  return "Alpha includes 20 prompts a day and the lab checks. After that, the month is €15.";
}
