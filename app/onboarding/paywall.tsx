import { Text, View, Pressable, ScrollView, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { PLUSH_GRADIENT } from "@/components/plush-gradient";
import Purchases from "react-native-purchases";
import { useSubscription } from "@/lib/revenuecat";

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
  const router = useRouter();
  const { from } = useLocalSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("ai");
  const { offerings } = useSubscription();
  const [purchasing, setPurchasing] = useState(false);

  const plan = PLANS.find((p) => p.id === selectedPlan)!;

  const handleSubscribe = async () => {
    if (!offerings) {
      Alert.alert(
        "Store unavailable",
        "Please try again in a moment."
      );
      return;
    }
    setPurchasing(true);
    try {
      const packageToBuy =
        selectedPlan === "society"
          ? offerings.annual
          : offerings.monthly;

      if (!packageToBuy) throw new Error("Plan not found in store");

      await Purchases.purchasePackage(packageToBuy);
      Alert.alert(
        `Welcome to ${plan.name}! ✨`,
        "Your subscription is now active. Enjoy the soft life."
      );
      if (from === "profile") {
        router.back();
      } else {
        router.push("./notifications");
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
      router.push("./notifications");
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
        <View style={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 48, gap: 28, flex: 1 }}>

          {/* Header */}
          <View style={{ gap: 8, alignItems: "center" }}>
            <Text
              style={{
                fontFamily: "PlayfairDisplay_700Bold",
                fontSize: 24,
                color: DEEP_PLUM,
                textAlign: "center",
                lineHeight: 32,
              }}
            >
              Unlock your Soft Life Plan.
            </Text>
            <Text
              style={{
                fontFamily: "DMSans_400Regular",
                fontSize: 14,
                color: `${DEEP_PLUM}99`,
                textAlign: "center",
                lineHeight: 20,
                paddingHorizontal: 16,
              }}
            >
              Pick the plan that fits your financial glow-up journey.
            </Text>
          </View>

          {/* Plan Selector */}
          <View style={{ gap: 12 }}>
            {PLANS.map((p) => {
              const isSelected = selectedPlan === p.id;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => setSelectedPlan(p.id)}
                  style={{
                    borderWidth: 2,
                    borderColor: isSelected ? DEEP_PLUM : `${DEEP_PLUM}20`,
                    borderRadius: 20,
                    padding: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: isSelected ? `${DEEP_PLUM}08` : "#fff",
                  }}
                >
                  {/* Radio dot */}
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: isSelected ? DEEP_PLUM : `${DEEP_PLUM}40`,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    {isSelected && (
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: DEEP_PLUM,
                        }}
                      />
                    )}
                  </View>

                  <View style={{ flex: 1, gap: 2 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Text
                        style={{
                          fontFamily: "DMSans_700Bold",
                          fontSize: 15,
                          color: DEEP_PLUM,
                        }}
                      >
                        {p.name}
                      </Text>
                      {p.badge && (
                        <View
                          style={{
                            backgroundColor: p.id === "society" ? ROSE_GOLD : BLUSH_PINK,
                            borderRadius: 20,
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: "DMSans_700Bold",
                              fontSize: 9,
                              color: p.id === "society" ? CREAM : DEEP_PLUM,
                              textTransform: "uppercase",
                              letterSpacing: 0.5,
                            }}
                          >
                            {p.badge}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={{ alignItems: "flex-end" }}>
                    <Text
                      style={{
                        fontFamily: "PlayfairDisplay_700Bold",
                        fontSize: 18,
                        color: isSelected ? DEEP_PLUM : `${DEEP_PLUM}99`,
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
          </View>

          {/* Dynamic Feature List */}
          <View
            style={{
              backgroundColor: `${DEEP_PLUM}06`,
              borderRadius: 20,
              padding: 20,
              gap: 12,
              borderWidth: 1,
              borderColor: `${DEEP_PLUM}10`,
            }}
          >
            <Text
              style={{
                fontFamily: "DMSans_700Bold",
                fontSize: 13,
                color: DEEP_PLUM,
                marginBottom: 4,
              }}
            >
              What's included in {plan.name}:
            </Text>
            {plan.features.map((feature, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: BLUSH_PINK,
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Text style={{ fontSize: 11, color: ROSE_GOLD, fontWeight: "bold" }}>✓</Text>
                </View>
                <Text
                  style={{
                    fontFamily: "DMSans_400Regular",
                    fontSize: 13,
                    color: `${DEEP_PLUM}CC`,
                    flex: 1,
                  }}
                >
                  {feature}
                </Text>
              </View>
            ))}
          </View>

          {/* Fine print */}
          <View style={{ alignItems: "center", paddingHorizontal: 16 }}>
            <Text
              style={{
                fontFamily: "DMSans_400Regular",
                fontSize: 11,
                color: `${DEEP_PLUM}66`,
                textAlign: "center",
                lineHeight: 16,
              }}
            >
              Cancel anytime. No hidden fees. Your first 3 days are free.
            </Text>
          </View>

          {/* CTAs */}
          <View style={{ marginTop: "auto", gap: 16 }}>
            <Pressable
              onPress={handleSubscribe}
              disabled={purchasing}
              style={({ pressed }) => ({
                opacity: pressed || purchasing ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
                borderRadius: 16,
                overflow: "hidden",
              })}
            >
              <LinearGradient
                colors={PLUSH_GRADIENT}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  paddingVertical: 16,
                  paddingHorizontal: 24,
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

            <Pressable onPress={handleSkip}>
              <Text
                style={{
                  fontFamily: "DMSans_400Regular",
                  fontSize: 13,
                  color: `${DEEP_PLUM}66`,
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
