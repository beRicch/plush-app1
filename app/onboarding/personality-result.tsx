import { Text, View, Pressable, ScrollView } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { PLUSH_GRADIENT } from "@/components/plush-gradient";

const ARCHETYPES: Record<string, { title: string; description: string; affirmation: string; report: string; firstWin: string }> = {
  "bloom-saver": {
    title: "The Bloom Saver",
    description: "Cautious and anxious, building her financial foundation from scratch. She avoids looking at numbers and needs visible progress to trust the process.",
    affirmation: "A small, steady save is a huge win for your future self.",
    report: "Plush gives you a clear first score and the confidence to move from confusion to consistent saving.",
    firstWin: "A Plush Score that improves visibly, so progress becomes proof.",
  },
  "ritual-builder": {
    title: "The Ritual Builder",
    description: "Community-oriented and structured, she stays consistent when she has accountability. She thrives when money rituals are shared and social.",
    affirmation: "Your best money moves are the ones you make together.",
    report: "Plush gives you ritual-based habits, community check‑ins, and a supportive Ajo Circle experience.",
    firstWin: "Sunday Plush Audit + Ajo Circle — your money routine with social support.",
  },
  "soft-strategist": {
    title: "The Soft Strategist",
    description: "Intentional and goal-driven, she needs advanced tools to match her ambition and planning style.",
    affirmation: "You can be both soft and strategic with your money.",
    report: "Plush gives you spending insights, Ask Plush AI guidance, and a naming ceremony for your Naira goals.",
    firstWin: "Naira Naming Ceremony + spending insights + Ask Plush AI.",
  },
  "vault-visionary": {
    title: "The Vault Visionary",
    description: "A high earner with big goals, she needs wealth-building tools that match her income level.",
    affirmation: "Your money is working for the life you’re building.",
    report: "Plush gives you Society-level tracking, investment context, and an Inflation Shield for future-proof plans.",
    firstWin: "Plush Society + investment tracker + Inflation Shield.",
  },
  balanced: {
    title: "The Balanced",
    description: "Steady and organised, she needs optimisation not rescue. She’s already doing okay and wants to do better.",
    affirmation: "Small refinements make your already good money habits even softer.",
    report: "Plush gives you comparative score data, a smart PDF report, and community accountability to level up what already works.",
    firstWin: "Plush Score comparative data + PDF report + community accountability.",
  },
};

export default function PersonalityResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const archetypeKey = String(params.archetype ?? "balanced");
  const archetype = ARCHETYPES[archetypeKey] ?? ARCHETYPES.balanced;

  const handleContinue = () => {
    router.push({ pathname: "./plan-reveal", params: params as Record<string, string> });
  };

  return (
    <ScreenContainer
      edges={["top", "left", "right"]}
      containerClassName="bg-background"
      className="flex-1"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-12 pb-12 gap-8 flex-1 justify-between">
          
          <View className="gap-4 items-center bg-primary/5 rounded-3xl p-8 border border-primary/10 mt-8">
            <Text className="font-dm-sans font-bold tracking-widest text-primary uppercase text-xs text-center">Your Financial Foundation</Text>
            <Text
              className="font-bold text-primary text-center leading-tight mt-2"
              style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 29 }}
            >
              {archetype.title}
            </Text>
            <Text className="font-dm-sans text-lg text-foreground text-center px-2 leading-relaxed mt-4">
              {archetype.description}
            </Text>
            <Text
              className="text-accent-script text-primary text-center mt-8 leading-relaxed"
              style={{ fontSize: 23 }}
            >
              "{archetype.affirmation}"
            </Text>
          </View>

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
            className="mt-auto shadow-sm"
          >
            <LinearGradient colors={PLUSH_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="py-4 px-6 items-center w-full justify-center">
              <Text className="text-background font-dm-sans font-semibold text-base tracking-wide">
                See my customized roadmap 🌸
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
