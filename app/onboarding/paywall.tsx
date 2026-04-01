import { Text, View, Pressable, ScrollView, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { PLUSH_GRADIENT } from "@/components/plush-gradient";
import Purchases from "react-native-purchases";
import { useSubscription } from "@/lib/revenuecat";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HAS_COMPLETED_ONBOARDING_KEY } from "@/constants/oauth";

// ─── Brand colours ───────────────────────────────────────────────
const ROSE_GOLD = "#B76E79";
const DEEP_PLUM = "#4A1560";
const CREAM = "#FAF5EF";
const BLUSH_PINK = "#F4B8C1";

// ─── Plan Definitions ────────────────────────────────────────────
type PlanId = "member" | "ai" | "society";

const PLANS: Array<{
  id: PlanId;
  name: string;
  price: string;
  period: string;
  badge?: string;
  features: string[];
  cta: string;
}> = [
  {
    id: "member",
    name: "Plush Member",
    price: "₦1,200",
    period: "/ month",
    features: [
      "Unlimited expense logging",
      "All 8 Soft Money Rituals",
      "Streak tracking & history",
      "Community full access",
      "Savings goals & Vault Twins",
    ],
    cta: "Start Plush Member 🌸",
  },
  {
    id: "ai",
    name: "Plush AI",
    price: "₦3,000",
    period: "/ month",
    badge: "Most Popular",
    features: [
      "Everything in Plush Member",
      "AI Screenshot & Camera scan",
      "Voice expense logging",
      "Ask Plush AI personal coach",
      "Smart spending nudges",
    ],
    cta: "Start Plush AI ✨",
  },
  {
    id: "society",
    name: "Plush Society",
    price: "₦8,000",
    period: "/ month",
    badge: "Premium",
    features: [
      "Everything in Plush AI",
      "Weekly live group calls",
      "Investment tracker",
      "Founder early access",
      "Private Society community",
    ],
    cta: "Join Plush Society 👑",
  },
];

export default function PaywallScreen() {
  const colors = useColors();
  const router = useRouter();
  const { from } = useLocalSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("ai");
  const { offerings, isPremium, loading: subLoading } = useSubscription();
  const [purchasing, setPurchasing] = useState(false);

  // Skip paywall if user is already a premium subscriber
  useEffect(() => {
    if (!subLoading && isPremium) {
      router.replace("/onboarding/notifications");
    }
  }, [subLoading, isPremium, router]);

  useEffect(() => {
    AsyncStorage.getItem(HAS_COMPLETED_ONBOARDING_KEY).then((val) => {
      if (val === "true") {
        router.replace("/(tabs)");
      }
    });
  }, []);

  const plan = PLANS.find((p) => p.id === selectedPlan)!;

  const handleSubscribe = async () => {
    if (!offerings) {
      Alert.alert("Store unavailable", "Please try again in a moment.");
      return;
    }
    setPurchasing(true);
    try {
      // Find the package in RevenueCat that matches the selected plan ID
      const packageToBuy = offerings.availablePackages.find(
        (pkg: any) => pkg.identifier.toLowerCase() === selectedPlan.toLowerCase()
      );

      if (!packageToBuy) {
        // Fallback to monthly/annual if exact identifier match fails
        const fallbackPackage = selectedPlan === "society" ? offerings.annual : offerings.monthly;
        if (!fallbackPackage) throw new Error("Plan not found in store");
        await Purchases.purchasePackage(fallbackPackage);
      } else {
        await Purchases.purchasePackage(packageToBuy);
      }
      Alert.alert(
        `Welcome to ${plan.name}! ✨`,
        "Your subscription is now active. Enjoy the soft life.",
      );
      if (from === "profile") {
        router.back();
      } else {
        router.push("/onboarding/notifications");
      }
    } catch (e: any) {
      if (!e.userCancelled) {
        Alert.alert("Error", e.message || "Purchase failed. Please try again.");
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleSkip = () => {
    if (from === "profile") {
      router.back();
    } else {
      router.push("/onboarding/notifications");
    }
  };

  return (
    <ScreenContainer
      edges={["top", "left", "right"]}
      containerClassName="bg-background"
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            paddingHorizontal: 24,
            paddingTop: 32,
            paddingBottom: 48,
            gap: 24,
            flex: 1,
            backgroundColor: colors.background,
          }}
        >
          {/* Header */}
          <View style={{ gap: 10, alignItems: "center" }}>
            <Text
              style={{
                fontFamily: "PlayfairDisplay_700Bold",
                fontSize: 28,
                color: DEEP_PLUM,
                textAlign: "center",
                lineHeight: 36,
              }}
            >
              Unlock your Soft Life Plan.
            </Text>
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 20,
                backgroundColor: `${BLUSH_PINK}22`,
              }}
            >
              <Text
                style={{
                  fontFamily: "DMSans_500Medium",
                  fontSize: 12,
                  color: DEEP_PLUM,
                  textAlign: "center",
                }}
              >
                First 3 days are free — no surprise charges, only soft money
                clarity.
              </Text>
            </View>
          </View>

          {/* Dynamic Feature List */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 28,
              padding: 22,
              gap: 14,
              borderWidth: 1,
              borderColor: `${DEEP_PLUM}10`,
              shadowColor: DEEP_PLUM,
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.08,
              shadowRadius: 22,
              elevation: 4,
            }}
          >
            <Text
              style={{
                fontFamily: "DMSans_700Bold",
                fontSize: 14,
                color: DEEP_PLUM,
                marginBottom: 6,
              }}
            >
              What you get with {plan.name}:
            </Text>
            {plan.features.map((feature, i) => (
              <View
                key={i}
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: `${ROSE_GOLD}22`,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: ROSE_GOLD,
                      fontWeight: "700",
                    }}
                  >
                    ✓
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: "DMSans_400Regular",
                    fontSize: 13,
                    color: `${DEEP_PLUM}CC`,
                    flex: 1,
                    lineHeight: 20,
                  }}
                >
                  {feature}
                </Text>
              </View>
            ))}
          </View>

          {/* Plan Selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ flexDirection: "row", paddingVertical: 4 }}
          >
            {PLANS.map((p) => {
              const isSelected = selectedPlan === p.id;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => setSelectedPlan(p.id)}
                  style={{
                    position: "relative",
                    width: 220,
                    marginRight: 12,
                    borderWidth: 1,
                    borderColor: isSelected ? ROSE_GOLD : `${DEEP_PLUM}18`,
                    borderRadius: 24,
                    padding: 16,
                    backgroundColor: colors.surface,
                    flexDirection: "row",
                    alignItems: "center",
                    alignSelf: "flex-start",
                  }}
                >
                  {p.badge && (
                    <View
                      style={{
                        position: "absolute",
                        top: -8,
                        right: 10,
                        borderRadius: 20,
                        backgroundColor:
                          p.id === "society" ? ROSE_GOLD : BLUSH_PINK,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderWidth: 1,
                        borderColor: colors.surface,
                        zIndex: 1,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "DMSans_700Bold",
                          fontSize: 10,
                          color: p.id === "society" ? CREAM : DEEP_PLUM,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}
                      >
                        {p.badge}
                      </Text>
                    </View>
                  )}
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      borderWidth: 2,
                      borderColor: isSelected ? ROSE_GOLD : `${DEEP_PLUM}30`,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    {isSelected && (
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: ROSE_GOLD,
                        }}
                      />
                    )}
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "DMSans_700Bold",
                          fontSize: 15,
                          color: DEEP_PLUM,
                        }}
                      >
                        {p.name}
                      </Text>
                    </View>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text
                      style={{
                        fontFamily: "PlayfairDisplay_700Bold",
                        fontSize: 20,
                        color: DEEP_PLUM,
                      }}
                    >
                      {p.price}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "DMSans_400Regular",
                        fontSize: 11,
                        color: `${DEEP_PLUM}66`,
                      }}
                    >
                      {p.period}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Fine print */}
          <View style={{ alignItems: "center", paddingHorizontal: 16 }}>
            <Text
              style={{
                fontFamily: "DMSans_400Regular",
                fontSize: 12,
                color: `${DEEP_PLUM}88`,
                textAlign: "center",
                lineHeight: 18,
              }}
            >
              No payment due now.
            </Text>
          </View>

          {/* CTAs */}
          <View style={{ marginTop: "auto", gap: 16 }}>
            <Pressable
              onPress={handleSubscribe}
              disabled={purchasing}
              style={({ pressed }) => ({
                opacity: pressed || purchasing ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
                borderRadius: 20,
                overflow: "hidden",
                shadowColor: ROSE_GOLD,
                shadowOffset: { width: 0, height: 16 },
                shadowOpacity: 0.18,
                shadowRadius: 28,
                elevation: 7,
              })}
            >
              <LinearGradient
                colors={PLUSH_GRADIENT}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  paddingVertical: 18,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "DMSans_700Bold",
                    fontSize: 16,
                    color: CREAM,
                    letterSpacing: 0.3,
                  }}
                >
                  {purchasing ? "Processing... 🌸" : plan.cta}
                </Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              onPress={handleSkip}
              style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
            >
              <Text
                style={{
                  fontFamily: "DMSans_500Medium",
                  fontSize: 13,
                  color: DEEP_PLUM,
                  textAlign: "center",
                  textDecorationLine: "underline",
                }}
              >
                Continue with limited free version
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
