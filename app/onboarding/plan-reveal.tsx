import { Text, View, Pressable, ScrollView } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { cn } from "@/lib/utils";
import { LinearGradient } from "expo-linear-gradient";
import { PLUSH_GRADIENT } from "@/components/plush-gradient";

export default function PlanRevealScreen() {
  const router = useRouter();

  const handleContinue = () => {
    router.push("./paywall");
  };

  return (
    <ScreenContainer
      edges={["top", "left", "right"]}
      containerClassName="bg-background"
      className="flex-1"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-8 pb-12 gap-8 flex-1 justify-between">

          <View className="gap-2 items-center">
            <Text
              className="font-bold text-primary text-center leading-tight"
              style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 23 }}
            >
              Welcome to your Plush Era. 🌸
            </Text>
            <Text className="font-dm-sans text-base text-muted text-center px-4">
              Here is your customized roadmap back to financial peace.
            </Text>
          </View>

          {/* Plan Card */}
          <View className="bg-surface border-2 border-primary rounded-3xl p-6 gap-6 shadow-sm">
            <View className="gap-2 items-center border-b border-border pb-6">
              <Text className="font-dm-sans font-bold tracking-widest text-muted uppercase text-[10px]">Target Goal</Text>
              <Text className="font-playfair text-4xl font-bold text-foreground">₦500,000</Text>
              <View className="bg-accent rounded-full px-3 py-1 mt-1">
                <Text className="font-dm-sans text-xs font-semibold text-background">By September 2026</Text>
              </View>
            </View>

            <View className="gap-5">
              <View className="flex-row items-center gap-4">
                <View className="w-12 h-12 bg-success/10 border border-success/20 rounded-full items-center justify-center">
                  <Text className="text-xl">💰</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-dm-sans text-sm font-semibold text-foreground">Monthly Savings Target</Text>
                  <Text className="font-dm-sans text-xs text-muted mt-0.5">₦85,000 / month</Text>
                </View>
              </View>

              <View className="flex-row items-center gap-4">
                <View className="w-12 h-12 bg-accentGold/10 border border-accentGold/20 rounded-full items-center justify-center">
                  <Text className="text-xl">🥂</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-dm-sans text-sm font-semibold text-foreground">Guilt-Free Allowance</Text>
                  <Text className="font-dm-sans text-xs text-muted mt-0.5">₦40,000 / month</Text>
                </View>
              </View>

              <View className="flex-row items-center gap-4">
                <View className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-full items-center justify-center">
                  <Text className="text-xl">✨</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-dm-sans text-sm font-semibold text-foreground">Weekly Logging Ritual</Text>
                  <Text className="font-dm-sans text-xs text-muted mt-0.5">Every Sunday at 7 PM</Text>
                </View>
              </View>
            </View>
          </View>

          <Text className="text-accent-script text-center text-xl mt-2 leading-relaxed px-4">
            Plush members who follow this exact plan are 2.5x more likely to hit their target.
          </Text>

          <Pressable
            onPress={handleContinue}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
                borderRadius: 16,
                overflow: "hidden"
              },
            ]}
            className="mt-2 shadow-sm"
          >
            <LinearGradient colors={PLUSH_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="py-4 px-6 items-center w-full justify-center">
              <Text className="text-background font-dm-sans font-semibold text-base tracking-wide">
                Unlock my custom plan 🌸
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
