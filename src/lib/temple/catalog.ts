export type ProductType = "consumable" | "non_consumable" | "subscription";

export type ProductId = "month_15";

export interface CatalogProduct {
  id: ProductId;
  name: string;
  blurb: string;
  priceUsd: number;
  priceLabel: string;
  type: ProductType;
  credits: number;
  entitlement?: "pro" | "kali";
  period?: "month" | "year";
  currency?: "eur" | "usd";
  appleProductId: string;
  googleProductId: string;
  highlight?: boolean;
}

export const CATALOG: CatalogProduct[] = [
  {
    id: "month_15",
    name: "Monthly",
    blurb: "€15 per month. After 20 prompts in a day, this keeps the console open.",
    priceUsd: 15,
    priceLabel: "€15 / month",
    type: "subscription",
    credits: 0,
    entitlement: "pro",
    period: "month",
    currency: "eur",
    appleProductId: "temple.month.15",
    googleProductId: "temple.month.15",
    highlight: true,
  },
];

export const CREDIT_COSTS = {
  agent: 2,
  tool: 1,
  ask: 1,
  report: 3,
} as const;

export const DAILY_FREE_PROMPTS = 20;

export const FREE_TOOLS = [
  "portscan",
  "vulnscan",
  "webapp",
  "osint",
  "siem",
] as const;

export const KALI_TOOLS = ["privesc", "lateral", "evasion", "mitre"] as const;

export const STRIPE_MINIMUM_USD = 15;

export function billedByStripe(product: Pick<CatalogProduct, "priceUsd">): boolean {
  return product.priceUsd >= STRIPE_MINIMUM_USD;
}

export function getProduct(id: string): CatalogProduct | undefined {
  return CATALOG.find((p) => p.id === id);
}

export function nativeProductId(
  product: CatalogProduct,
  platform: "ios" | "android",
): string {
  return platform === "ios" ? product.appleProductId : product.googleProductId;
}
