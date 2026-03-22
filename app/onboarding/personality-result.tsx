import { Text, View, Pressable, ScrollView } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { PLUSH_GRADIENT } from "@/components/plush-gradient";

// In a real app, this would be determined by the user's quiz answers
const ARCHETYPE = {
  title: "The Vault Builder",
  description: "You've had a financial setback and are rebuilding. You carry shame you don't deserve.",
  affirmation: "You were not bad with money. Your money was just never clear to you.",
};

export default function PersonalityResultScreen() {
  const router = useRouter();

  const handleContinue = () => {
    router.push("./plan-reveal");
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
              {ARCHETYPE.title}
            </Text>
            <Text className="font-dm-sans text-lg text-foreground text-center px-2 leading-relaxed mt-4">
              {ARCHETYPE.description}
            </Text>
            <Text
              className="text-accent-script text-primary text-center mt-8 leading-relaxed"
              style={{ fontSize: 23 }}
            >
              "{ARCHETYPE.affirmation}"
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
