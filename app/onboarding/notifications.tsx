import { Text, View, Pressable, ScrollView } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { PLUSH_GRADIENT } from "@/components/plush-gradient";

export default function NotificationsScreen() {
  const router = useRouter();

  const handleRequestPermission = async () => {
    // In a real app, this would request native push notification permissions
    // For now, navigate to tabs
    router.push("../(tabs)");
  };

  const handleSkip = () => {
    router.push("../(tabs)");
  };

  return (
    <ScreenContainer
      edges={["top", "bottom", "left", "right"]}
      containerClassName="bg-background"
      className="flex-1 justify-center items-center px-6"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-8 w-full max-w-sm py-12">
          {/* Illustration */}
          <View className="items-center">
            <View className="w-24 h-24 bg-surface rounded-2xl border border-border items-center justify-center">
              <Text className="text-5xl">🔔</Text>
            </View>
          </View>

          {/* Text */}
          <View className="gap-4 items-center">
            <Text className="font-playfair text-2xl font-bold text-primary text-center">
              Stay in the loop
            </Text>
            <Text className="font-dm-sans text-base text-foreground text-center leading-relaxed">
              Plush needs to reach you. Let us send you ritual reminders, Ajo Circle updates, and your weekly Plush Score. 🌸
            </Text>
          </View>

          {/* Buttons */}
          <View className="gap-3 mt-auto">
            <Pressable
              onPress={handleRequestPermission}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                  overflow: "hidden",
                  borderRadius: 16,
                },
              ]}
              className="w-full mt-2"
            >
              <LinearGradient colors={PLUSH_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="py-4 px-6 items-center w-full justify-center">
                <Text className="text-background font-dm-sans font-semibold text-base">
                  Yes, keep me in the loop
                </Text>
              </LinearGradient>
            </Pressable>

            <Pressable onPress={handleSkip}>
              <Text className="text-primary font-dm-sans text-center text-base">Maybe later</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
