import { View, Text } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";

export default function GoalCelebrationScreen() {
  const colors = useColors();
  const router = useRouter();
  const { goalName } = useLocalSearchParams() as { goalName?: string };

  // Auto-redirect to goals page after 2.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/goals");
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ScreenContainer className="bg-background">
      <View className="flex-1 px-6 py-10 justify-center">
        <View
          className="rounded-[32px] p-8 gap-6"
          style={{
            backgroundColor: colors.surface,
            shadowColor: "#4A1560",
            shadowOffset: { width: 0, height: 16 },
            shadowOpacity: 0.15,
            shadowRadius: 24,
            elevation: 8,
          }}
        >
          <Text className="text-5xl text-center">🎉</Text>
          <Text
            className="font-bold text-foreground text-center"
            style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 23 }}
          >
            Your Naira Naming Ceremony is complete!
          </Text>
          <Text className="text-sm text-muted text-center">
            Your Plush is holding space for {goalName ?? "this goal"}. Now let's fill it.
          </Text>
          <Text
            className="text-xs text-muted text-center"
            style={{ fontFamily: "DancingScript_400Regular", fontSize: 13 }}
          >
            Taking you to your goals in a moment... ✨
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}
