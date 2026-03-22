import { Text, View, Pressable, ScrollView } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { cn } from "@/lib/utils";
import { LinearGradient } from "expo-linear-gradient";
import { PLUSH_GRADIENT } from "@/components/plush-gradient";
import Purchases from 'react-native-purchases';
import { useSubscription } from "@/lib/revenuecat";

export default function PaywallScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<"annual" | "monthly">("annual");

  const { isPremium, loading, offerings } = useSubscription();
  const [purchasing, setPurchasing] = useState(false);

  const handleSubscribe = async () => {
    if (!offerings) {
      setPurchasing(true);
      // Wait a bit or show a non-blocking toast? 
      // For now, let's just wait and hope it loads.
      setTimeout(() => setPurchasing(false), 2000);
      return;
    }

    setPurchasing(true);
    try {
      // Find the package based on selection
      const packageToBuy = selectedPlan === "annual" 
        ? offerings.annual 
        : offerings.monthly;

      if (!packageToBuy) {
        throw new Error("Plan not found in store");
      }

      await Purchases.purchasePackage(packageToBuy);
      
      Alert.alert("Welcome to Plush AI! ✨", "Your subscription is now active. Enjoy the soft life.");
      
      if (from === "profile") {
        router.back();
      } else {
        router.push("./notifications");
      }
    } catch (e: any) {
      if (!e.userCancelled) {
        Alert.alert("Error", e.message || "Failed to complete purchase. Please try again.");
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
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-8 pb-12 gap-8 flex-1">
          {/* Header */}
          <View className="gap-3 items-center">
            <Text
              className="font-bold text-primary text-center leading-tight"
              style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 23 }}
            >
              Unlock your Soft Life Plan.
            </Text>
            <Text className="font-dm-sans text-base text-muted text-center px-4 leading-relaxed">
              Start your 3-day FREE trial to access your personalized roadmap and AI automated tracking.
            </Text>
          </View>

          {/* Value Props */}
          <View className="bg-surface border border-border rounded-2xl p-5 gap-4 shadow-sm">
             <View className="flex-row items-center gap-3">
              <View className="w-6 h-6 bg-success/10 rounded-full items-center justify-center">
                <Text className="text-success text-xs font-bold">✓</Text>
              </View>
              <Text className="font-dm-sans text-sm text-foreground flex-1 font-medium">
                Full access to your custom Timeline & Budget
              </Text>
            </View>
            <View className="flex-row items-center gap-3">
              <View className="w-6 h-6 bg-success/10 rounded-full items-center justify-center">
                <Text className="text-success text-xs font-bold">✓</Text>
              </View>
              <Text className="font-dm-sans text-sm text-foreground flex-1 font-medium">
                AI Receipt Scanning & Voice Logging
              </Text>
            </View>
            <View className="flex-row items-center gap-3">
               <View className="w-6 h-6 bg-success/10 rounded-full items-center justify-center">
                <Text className="text-success text-xs font-bold">✓</Text>
              </View>
              <Text className="font-dm-sans text-sm text-foreground flex-1 font-medium">
                Guilt-Free Spending Alerts & Streaks
              </Text>
            </View>
          </View>

          {/* Pricing Options */}
          <View className="gap-4">
            {/* Annual */}
            <Pressable
              onPress={() => setSelectedPlan("annual")}
              className={cn(
                "border-2 rounded-2xl p-4 flex-row items-center",
                selectedPlan === "annual" ? "border-primary bg-primary/5" : "border-border bg-surface"
              )}
            >
              <View className="flex-1 gap-1">
                <View className="flex-row items-center gap-2">
                  <Text className="font-dm-sans font-bold text-lg text-foreground">Annual Plan</Text>
                  <View className="bg-accentGold rounded-full px-2 py-0.5">
                    <Text className="font-dm-sans text-[10px] font-bold text-background uppercase">Save 31%</Text>
                  </View>
                </View>
                <Text className="font-dm-sans text-xs text-muted">First 3 days free, then ₦25,000/year</Text>
              </View>
              <View className="items-end">
                <Text className="font-dm-sans font-bold text-xl text-primary">₦2,083</Text>
                <Text className="font-dm-sans text-xs text-muted">/ month</Text>
              </View>
            </Pressable>

            {/* Monthly */}
            <Pressable
              onPress={() => setSelectedPlan("monthly")}
              className={cn(
                "border-2 rounded-2xl p-4 flex-row items-center",
                selectedPlan === "monthly" ? "border-primary bg-primary/5" : "border-border bg-surface"
              )}
            >
              <View className="flex-1 gap-1">
                <Text className="font-dm-sans font-bold text-lg text-foreground">Monthly Plan</Text>
                <Text className="font-dm-sans text-xs text-muted">First 3 days free, then ₦3,000/month</Text>
              </View>
              <View className="items-end">
                <Text className="font-dm-sans font-bold text-xl text-foreground">₦3,000</Text>
                <Text className="font-dm-sans text-xs text-muted">/ month</Text>
              </View>
            </Pressable>
          </View>

          {/* Objection Remover */}
          <View className="items-center px-4 mt-2">
            <Text className="font-dm-sans text-xs text-muted text-center leading-relaxed">
              Cancel anytime. We'll send you a reminder 2 days before your trial ends so you don't get billed unexpectedly.
            </Text>
          </View>

          {/* CTA */}
          <View className="mt-auto gap-4">
            <Pressable
              onPress={handleSubscribe}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                  borderRadius: 16,
                  overflow: "hidden"
                },
              ]}
              className="shadow-lg shadow-primary/30"
            >
              <LinearGradient colors={PLUSH_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="py-4 px-6 items-center w-full justify-center">
                <Text className="text-background font-dm-sans font-semibold text-base tracking-wide">
                  {purchasing || !offerings ? "Initializing... 🌸" : "Start your 3-day free trial 🌸"}
                </Text>
              </LinearGradient>
            </Pressable>
            
            <Pressable onPress={handleSkip}>
              <Text className="font-dm-sans text-muted text-sm text-center underline decoration-muted/30">
                Continue with limited free version
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
