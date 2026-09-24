import { CATALOG, nativeProductId, type ProductId } from "@/lib/temple/catalog";
import { detectStorePlatform, type StorePlatform } from "./platform";

export interface NativePurchaseResult {
  platform: "ios" | "android";
  productId: ProductId;
  nativeId: string;
  transactionId: string;
  receipt: string;
}

interface DigitalGoodsService {
  getDetails: (ids: string[]) => Promise<{ itemId: string; title: string; price: { value: string; currency: string } }[]>;
  acknowledge: (tokens: string[]) => Promise<void>;
}

interface PurchaseDetails {
  itemId: string;
  purchaseToken: string;
}

declare global {
  interface Window {
    getDigitalGoodsService?: (paymentMethod: string) => Promise<DigitalGoodsService>;
  }
}

function nativeIdFor(productId: ProductId, platform: "ios" | "android"): string {
  const product = CATALOG.find((p) => p.id === productId);
  if (!product) throw new Error("Unknown product");
  return nativeProductId(product, platform);
}

async function purchaseViaDigitalGoods(
  productId: ProductId,
): Promise<NativePurchaseResult | null> {
  if (typeof window === "undefined" || !window.getDigitalGoodsService) return null;
  const service = await window.getDigitalGoodsService("https://play.google.com/billing");
  const nativeId = nativeIdFor(productId, "android");
  const details = await service.getDetails([nativeId]);
  if (!details[0]) throw new Error("Google Play product not found");

  const request = new PaymentRequest(
    [
      {
        supportedMethods: "https://play.google.com/billing",
        data: { sku: nativeId },
      },
    ],
    {
      total: {
        label: "Total",
        amount: { currency: details[0].price.currency, value: details[0].price.value },
      },
    },
  );
  const response = await request.show();
  const data = response.details as PurchaseDetails | undefined;
  await response.complete("success");
  const token = data?.purchaseToken;
  if (!token) throw new Error("Google Play returned no purchase token");
  try {
    await service.acknowledge([token]);
  } catch {
    /* server verification is source of truth */
  }
  return {
    platform: "android",
    productId,
    nativeId,
    transactionId: token,
    receipt: token,
  };
}

interface CapacitorIapPlugin {
  purchaseProduct?: (opts: { productId: string }) => Promise<{
    transactionId?: string;
    transactionIdentifier?: string;
    receipt?: string;
    purchaseToken?: string;
  }>;
  restorePurchases?: () => Promise<{
    purchases?: { productId: string; transactionId?: string; receipt?: string; purchaseToken?: string }[];
  }>;
}

function capacitorIap(): CapacitorIapPlugin | null {
  if (typeof window === "undefined") return null;
  const cap = (window as unknown as { Capacitor?: { Plugins?: Record<string, CapacitorIapPlugin> } })
    .Capacitor;
  return cap?.Plugins?.InAppPurchase2 ?? cap?.Plugins?.Purchases ?? null;
}

export async function nativePurchase(productId: ProductId): Promise<NativePurchaseResult> {
  const platform = detectStorePlatform();
  if (platform !== "ios" && platform !== "android") {
    throw new Error("Native billing is only available in the App Store and Play Store builds.");
  }

  const digital = platform === "android" ? await purchaseViaDigitalGoods(productId).catch(() => null) : null;
  if (digital) return digital;

  const plugin = capacitorIap();
  const nativeId = nativeIdFor(productId, platform);
  if (!plugin?.purchaseProduct) {
    throw new Error(
      platform === "ios"
        ? "Apple In-App Purchase is available in the App Store build of TEMPLE // WIRED."
        : "Google Play Billing is available in the Play Store build of TEMPLE // WIRED.",
    );
  }
  const result = await plugin.purchaseProduct({ productId: nativeId });
  const transactionId =
    result.transactionId || result.transactionIdentifier || result.purchaseToken;
  const receipt = result.receipt || result.purchaseToken || transactionId;
  if (!transactionId || !receipt) throw new Error("Store returned an empty receipt");
  return { platform, productId, nativeId, transactionId, receipt };
}

export async function nativeRestore(): Promise<NativePurchaseResult[]> {
  const platform = detectStorePlatform();
  if (platform !== "ios" && platform !== "android") return [];
  const plugin = capacitorIap();
  if (!plugin?.restorePurchases) return [];
  const bag = await plugin.restorePurchases();
  const out: NativePurchaseResult[] = [];
  for (const p of bag.purchases ?? []) {
    const match = CATALOG.find(
      (c) => c.appleProductId === p.productId || c.googleProductId === p.productId,
    );
    if (!match) continue;
    const transactionId = p.transactionId || p.purchaseToken;
    const receipt = p.receipt || p.purchaseToken || transactionId;
    if (!transactionId || !receipt) continue;
    out.push({
      platform,
      productId: match.id,
      nativeId: p.productId,
      transactionId,
      receipt,
    });
  }
  return out;
}

export function storePlatform(): StorePlatform {
  return detectStorePlatform();
}
