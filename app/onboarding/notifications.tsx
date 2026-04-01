import { Text, View, Pressable, ScrollView } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { PLUSH_GRADIENT } from "@/components/plush-gradient";

import { registerForPushNotificationsAsync } from "@/lib/notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HAS_COMPLETED_ONBOARDING_KEY } from "@/constants/oauth";

export default function NotificationsScreen() {
  const router = useRouter();

  const handleRequestPermission = async () => {
    // In a real app, this would request native push notification permissions
    try {
      await registerForPushNotificationsAsync();
      await AsyncStorage.setItem(HAS_COMPLETED_ONBOARDING_KEY, "true");
    } catch (error) {
      console.error("[Notifications] Failed to set onboarding flag:", error);
    }
    // For now, navigate to tabs
    router.push("../(tabs)");
  };

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem(HAS_COMPLETED_ONBOARDING_KEY, "true");
    } catch (error) {
      console.error("[Notifications] Failed to set onboarding flag:", error);
    }
    router.push("../(tabs)");
  };

  return (
    <ScreenContainer
      edges={["top", "bottom", "left", "right"]}
      containerClassName="bg-background"
      style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ gap: 32, width: "100%", maxWidth: 384, paddingVertical: 48 }}>
          {/* Illustration */}
          <View style={{ alignItems: "center" }}>
            <View style={{ width: 96, height: 96, backgroundColor: "rgba(255,255,255,0.5)", borderRadius: 16, borderWidth: 1, borderColor: "#E5E5E5", alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 48 }}>🔔</Text>
            </View>
          </View>

          {/* Text */}
          <View style={{ gap: 16, alignItems: "center" }}>
            <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 24, fontWeight: "bold", color: "#4A1560", textAlign: "center" }}>
              Stay in the loop
            </Text>
            <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 16, color: "#1A1A1A", textAlign: "center", lineHeight: 24 }}>
              Plush needs to reach you. Let us send you ritual reminders, Ajo Circle updates, and your weekly Plush Score. 🌸
            </Text>
          </View>

          {/* Buttons */}
          <View style={{ gap: 12, marginTop: "auto" }}>
            <Pressable
              onPress={handleRequestPermission}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                  overflow: "hidden",
                  borderRadius: 16,
                  marginTop: 8,
                },
              ]}
            >
              <LinearGradient colors={PLUSH_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingVertical: 16, paddingHorizontal: 24, alignItems: "center", width: "100%", justifyContent: "center" }}>
                <Text style={{ color: "#FFFFFF", fontFamily: "DMSans_500Medium", fontWeight: "600", fontSize: 16 }}>
                  Yes, keep me in the loop
                </Text>
              </LinearGradient>
            </Pressable>

            <Pressable onPress={handleSkip}>
              <Text style={{ color: "#4A1560", fontFamily: "DMSans_400Regular", textAlign: "center", fontSize: 16, paddingVertical: 12 }}>Maybe later</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
