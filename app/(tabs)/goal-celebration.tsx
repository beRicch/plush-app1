import { View, Text, Pressable } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function GoalCelebrationScreen() {
  const colors = useColors();
  const router = useRouter();
  const { goalName } = useLocalSearchParams() as { goalName?: string };

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

          <Pressable
            onPress={() => router.back()}
            className="mt-4 rounded-full py-4 items-center"
            style={{ backgroundColor: "#B76E79" }}
          >
            <Text className="text-white font-bold">Back to Goals</Text>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}
