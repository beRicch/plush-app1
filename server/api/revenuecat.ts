/**
 * RevenueCat Integration (Mock Implementation)
 * Replace with real RevenueCat SDK when you have credentials
 */

export type SubscriptionTier = "free" | "plush_member" | "plush_ai" | "plush_society";

export interface Entitlement {
  identifier: string;
  isActive: boolean;
  expiresAt?: string;
}

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  isActive: boolean;
  expiresAt?: string;
  autoRenew: boolean;
  entitlements: Entitlement[];
}

/**
 * Mock RevenueCat subscription check
 */
export async function checkSubscription(userId: number): Promise<SubscriptionInfo> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock: User has Member tier
  return {
    tier: "plush_member",
    isActive: true,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    autoRenew: true,
    entitlements: [
      {
        identifier: "plush_member",
        isActive: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  };
}

/**
 * Mock RevenueCat restore purchases
 */
export async function restorePurchases(userId: number): Promise<SubscriptionInfo> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    tier: "plush_member",
    isActive: true,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    autoRenew: true,
    entitlements: [
      {
        identifier: "plush_member",
        isActive: true,
      },
    ],
  };
}

/**
 * Mock RevenueCat purchase
 */
export async function purchaseSubscription(
  userId: number,
  tier: SubscriptionTier
): Promise<SubscriptionInfo> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const entitlementMap: Record<SubscriptionTier, string> = {
    free: "",
    plush_member: "plush_member",
    plush_ai: "plush_ai",
    plush_society: "plush_society",
  };

  return {
    tier,
    isActive: tier !== "free",
    expiresAt:
      tier !== "free"
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : undefined,
    autoRenew: tier !== "free",
    entitlements: tier !== "free"
      ? [
          {
            identifier: entitlementMap[tier],
            isActive: true,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ]
      : [],
  };
}

/**
 * Check if user has access to a feature
 */
export function hasFeatureAccess(
  tier: SubscriptionTier,
  feature: "screenshot" | "voice" | "camera" | "ai_chat" | "debt_tracking" | "investments"
): boolean {
  const featureMap: Record<SubscriptionTier, string[]> = {
    free: [],
    plush_member: [],
    plush_ai: ["screenshot", "voice", "camera", "ai_chat"],
    plush_society: ["screenshot", "voice", "camera", "ai_chat", "debt_tracking", "investments"],
  };

  return featureMap[tier].includes(feature);
}

/**
 * Get pricing for all tiers
 */
export function getTierPricing() {
  return {
    free: {
      name: "Free",
      price: "₦0",
      period: "forever",
      features: ["Manual expense entry", "1 savings goal", "Read-only community", "Sunday ritual"],
    },
    plush_member: {
      name: "Plush Member",
      price: "₦1,200",
      period: "month",
      features: ["Unlimited expenses", "All 8 rituals", "Community posting", "Vault Twins"],
    },
    plush_ai: {
      name: "Plush AI",
      price: "₦3,000",
      period: "month",
      features: ["Screenshot scanning", "Voice entry", "Camera scan", "Ask Plush AI chat"],
    },
    plush_society: {
      name: "Plush Society",
      price: "₦8,000",
      period: "month",
      features: ["Weekly group calls", "Investment tracker", "Founder access", "Early features"],
    },
  };
}
