import { Text, View, Animated, Easing } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { useColorScheme } from "@/hooks/use-color-scheme";

const LOADING_STEPS = [
  "Analyzing your income and habits...",
  "Structuring guilt-free spending targets...",
  "Running projections for your Soft Life goals...",
  "Finalizing your personalized plan...",
];

export default function GeneratingPlanScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isLight = colorScheme === "light";
  const [step, setStep] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const params = useLocalSearchParams();
  const archetype = String(params.archetype ?? "balanced");

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 6000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    const interval = setInterval(() => {
      setStep((prev) => {
        if (prev >= LOADING_STEPS.length - 1) {
          clearInterval(interval);
          setTimeout(() => router.replace({ pathname: "./personality-result", params: params as Record<string, string> }), 500);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [archetype]);

  return (
    <ScreenContainer
      edges={["top", "bottom"]}
      containerClassName={isLight ? "bg-background flex-1" : "bg-primary flex-1"}
    >
      <View className="flex-1 items-center justify-center px-10 gap-8">
        <View className="w-24 h-24 rounded-full bg-surface/10 items-center justify-center">
           <Text className="text-4xl">✨</Text>
        </View>
        <Text className={isLight ? "font-playfair text-2xl font-bold text-foreground text-center leading-relaxed min-h-24" : "font-playfair text-2xl font-bold text-background text-center leading-relaxed min-h-24"}>
          {LOADING_STEPS[step]}
        </Text>
        
        {/* Progress bar */}
        <View className="w-full h-2 bg-background/20 rounded-full overflow-hidden mt-4">
          <Animated.View 
            className="h-full bg-accentGold rounded-full"
            style={{
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"]
              })
            }}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}
