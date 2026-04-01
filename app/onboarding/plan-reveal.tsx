import { Text, View, Pressable, ScrollView } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter, useLocalSearchParams } from "expo-router";
import { cn } from "@/lib/utils";
import { LinearGradient } from "expo-linear-gradient";
import { PLUSH_GRADIENT } from "@/components/plush-gradient";

export default function PlanRevealScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const targetGoal = Number(params.targetGoal ?? "500000");
  const targetDate = String(params.targetDate ?? "September 2026");
  const monthlyTarget = Number(params.monthlyTarget ?? "") || Math.ceil(targetGoal / 6);
  const allowance = Number(params.allowance ?? "40000");
  const ritual = String(params.ritual ?? "Weekly Logging Ritual");
  const ritualDetail = String(params.ritualDetail ?? "Every Sunday at 7 PM");

  const parseTargetMonth = (dateString: string) => {
    const parsed = new Date(dateString);
    if (!isNaN(parsed.getTime())) {
      return parsed.toLocaleString("en-US", { month: "long" });
    }
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setMonth(today.getMonth() + Math.max(1, Math.ceil(targetGoal / monthlyTarget)));
    return monthNames[futureDate.getMonth()];
  };

  const timelineMonth = parseTargetMonth(targetDate);
  const timelineSubtitle = `Achievable by ${timelineMonth}`;

  const formatCurrency = (value: number) => {
    return `₦${value.toLocaleString("en-NG")}`;
  };

  const handleContinue = () => {
    router.push("../auth");
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
              <Text className="font-playfair text-4xl font-bold text-foreground">{formatCurrency(targetGoal)}</Text>
              <View className="bg-accent rounded-full px-3 py-1 mt-1">
                <Text className="font-dm-sans text-xs font-semibold text-background">By {targetDate}</Text>
              </View>
            </View>

            <View className="gap-5">
              <View className="flex-row items-center gap-4">
                <View className="w-12 h-12 bg-success/10 border border-success/20 rounded-full items-center justify-center">
                  <Text className="text-xl">💰</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-dm-sans text-sm font-semibold text-foreground">Monthly Savings Target</Text>
                  <Text className="font-dm-sans text-xs text-muted mt-0.5">{formatCurrency(monthlyTarget)} / month</Text>
                </View>
              </View>

              <View className="flex-row items-center gap-4">
                <View className="w-12 h-12 bg-accentGold/10 border border-accentGold/20 rounded-full items-center justify-center">
                  <Text className="text-xl">🥂</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-dm-sans text-sm font-semibold text-foreground">Guilt-Free Allowance</Text>
                  <Text className="font-dm-sans text-xs text-muted mt-0.5">{formatCurrency(allowance)} / month</Text>
                </View>
              </View>

              <View className="flex-row items-center gap-4">
                <View className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-full items-center justify-center">
                  <Text className="text-xl">✨</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-dm-sans text-sm font-semibold text-foreground">{ritual}</Text>
                  <Text className="font-dm-sans text-xs text-muted mt-0.5">{ritualDetail}</Text>
                </View>
              </View>

              <View className="flex-row items-center gap-4">
                <View className="w-12 h-12 bg-surface border border-border rounded-full items-center justify-center">
                  <Text className="text-lg">🗓️</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-dm-sans text-sm font-semibold text-foreground">Goal timeline</Text>
                  <Text className="font-dm-sans text-xs text-muted mt-0.5">{timelineSubtitle}</Text>
                </View>
              </View>
            </View>
          </View>

          <Text className="text-accent-script text-center text-[13px] mt-2 leading-relaxed px-4">
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
