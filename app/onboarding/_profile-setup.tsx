import { Text, View, Pressable, TextInput, ScrollView } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { LinearGradient } from "expo-linear-gradient";
import { PLUSH_GRADIENT } from "@/components/plush-gradient";

const INCOME_RANGES = [
  "₦0–50k",
  "₦50k–150k",
  "₦150k–300k",
  "₦300k–500k",
  "₦500k+",
];

export default function ProfileSetupScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [incomeRange, setIncomeRange] = useState<string | null>(null);
  const [moneyGoal, setMoneyGoal] = useState("");

  const handleSkip = () => {
    router.push("./paywall");
  };

  const handleSetup = () => {
    router.push("./paywall");
  };

  return (
    <ScreenContainer
      edges={["top", "left", "right"]}
      containerClassName="bg-background"
      className="flex-1"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-8 pb-12 gap-6 flex-1">
          {/* Heading */}
          <Text
            className="font-bold text-primary"
            style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 23 }}
          >
            Let's set up your vault, love.
          </Text>

          {/* Form Fields */}
          <View className="gap-5">
            {/* First Name */}
            <View>
              <Text className="font-dm-sans text-sm text-foreground mb-2">What should we call you?</Text>
              <TextInput
                placeholder="Your first name"
                value={firstName}
                onChangeText={setFirstName}
                placeholderTextColor="#9B8FA3"
                className="border border-border rounded-lg px-4 py-3 font-dm-sans text-foreground bg-surface"
              />
            </View>

            {/* Income Range */}
            <View>
              <Text className="font-dm-sans text-sm text-foreground mb-3">Your monthly income range</Text>
              <View className="gap-2">
                {INCOME_RANGES.map((range) => (
                  <Pressable
                    key={range}
                    onPress={() => setIncomeRange(range)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                    className={cn(
                      "border-2 rounded-2xl px-4 py-3",
                      incomeRange === range
                        ? "border-primary bg-surface"
                        : "border-border bg-surface"
                    )}
                  >
                    <Text className={cn(
                      "font-dm-sans text-base",
                      incomeRange === range ? "text-primary font-semibold" : "text-foreground"
                    )}>
                      {range}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Money Goal */}
            <View>
              <Text className="font-dm-sans text-sm text-foreground mb-2">Your biggest money goal right now</Text>
              <TextInput
                placeholder="e.g., Save for emergency fund"
                value={moneyGoal}
                onChangeText={setMoneyGoal}
                maxLength={60}
                placeholderTextColor="#9B8FA3"
                className="border border-border rounded-lg px-4 py-3 font-dm-sans text-foreground bg-surface"
              />
              <Text className="font-dm-sans text-xs text-muted mt-1">
                {moneyGoal.length}/60 characters
              </Text>
            </View>

            {/* Auto-Applied Settings Info */}
            <View className="bg-surface rounded-lg p-4 border border-border gap-2">
              <Text className="font-dm-sans text-sm font-semibold text-foreground">Auto-applied settings:</Text>
              <Text className="font-dm-sans text-sm text-muted">• Currency: ₦ Nigerian Naira</Text>
              <Text className="font-dm-sans text-sm text-muted">• Timezone: WAT UTC+1</Text>
              <Text className="font-dm-sans text-sm text-muted">• Date format: DD/MM/YYYY</Text>
            </View>
          </View>

          {/* Buttons */}
          <View className="gap-3 mt-auto">
            <Pressable
              onPress={handleSetup}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                  overflow: "hidden",
                  borderRadius: 16,
                },
              ]}
              className="mt-2"
            >
              <LinearGradient colors={PLUSH_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="py-4 px-6 items-center w-full justify-center">
                <Text className="text-background font-dm-sans font-semibold text-base">
                  Set up my vault 🌸
                </Text>
              </LinearGradient>
            </Pressable>

            <Pressable onPress={handleSkip}>
              <Text className="text-primary font-dm-sans text-center text-base">Skip for now</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
