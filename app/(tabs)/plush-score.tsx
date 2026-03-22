import { View, Text, Pressable, ScrollView, Modal, Share, Platform } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useRouter } from "expo-router";
import { useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { AnimatedPressable } from "@/components/plush-animations";
import { PLUSH_GRADIENT, PROGRESS_GRADIENT } from "@/components/plush-gradient";

const PLUSH_SCORE = 78;

const BADGES = [
  { id: "1", icon: "💎", title: "Golden Nest", description: "Saved 20% of income", color: "#F4B8C1" },
  { id: "2", icon: "✨", title: "Soft Soul", description: "10 Rituals completed", color: "#E8D5F5" },
  { id: "3", icon: "🌙", title: "Streak Star", description: "5-day logging streak", color: "#D5F0E8" },
];

const DEEP_PLUM = "#4A1560";
const ROSE_GOLD = "#B76E79";
const BLUSH_PINK = "#F4B8C1";
const CREAM = "#FAF5EF";

export default function PlushScoreScreen() {
  const colors = useColors();
  const router = useRouter();
  const [showShareModal, setShowShareModal] = useState(false);

  const handleShare = async () => {
    try {
      if (Platform.OS === 'web') {
        alert("Sharing link copied to clipboard! ✨");
      } else {
        await Share.share({
          message: `My Plush Score is ${PLUSH_SCORE}! I've earned the ${BADGES[0].title} badge. ✨`,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 px-6 py-10">
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text
                className="font-bold text-foreground"
                style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 23 }}
              >
                Plush Score
              </Text>
              <Text className="text-sm text-muted mt-1">
                Your money wellness meter, refined.
              </Text>
            </View>
            <Pressable
              onPress={() => router.back()}
              className="rounded-full p-2"
              style={{ backgroundColor: colors.surface }}
            >
              <MaterialIcons name="close" size={24} color={DEEP_PLUM} />
            </Pressable>
          </View>

          {/* SCORE CARD */}
          <View
            className="rounded-[32px] p-8 items-center justify-center mb-8"
            style={{
              backgroundColor: colors.surface,
              shadowColor: DEEP_PLUM,
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.05,
              shadowRadius: 20,
              elevation: 5
            }}
          >
            <View
              className="w-32 h-32 rounded-full items-center justify-center mb-6"
              style={{
                backgroundColor: CREAM,
                borderWidth: 8,
                borderColor: ROSE_GOLD,
                shadowColor: ROSE_GOLD,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 10,
              }}
            >
              <Text
                className="text-6xl"
                style={{ fontFamily: "PlayfairDisplay_700Bold", color: DEEP_PLUM }}
              >
                {PLUSH_SCORE}
              </Text>
            </View>

            <Text className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: "PlayfairDisplay_700Bold" }}>
              Soft Wealth Status
            </Text>
            <Text className="text-sm text-muted text-center mb-8 leading-5">
              A gentle measure of your saving strength, spending balance, and ritual consistency.
            </Text>

            {/* BADGES SECTION */}
            <View className="w-full mb-6">
              <Text className="text-xs font-bold text-muted uppercase tracking-widest mb-4">Badges Earned</Text>
              <View className="flex-row justify-between">
                {BADGES.map((badge) => (
                  <View key={badge.id} className="items-center w-1/3">
                    <View
                      className="w-14 h-14 rounded-full items-center justify-center mb-2"
                      style={{ backgroundColor: `${badge.color}40` }}
                    >
                      <Text className="text-2xl">{badge.icon}</Text>
                    </View>
                    <Text className="text-[10px] font-bold text-foreground text-center">{badge.title}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className="w-full gap-3">
              {[
                { label: "Savings Rate", value: "18/25", percent: 72 },
                { label: "Ritual Consistency", value: "15/20", percent: 75 },
                { label: "Goal Progress", value: "16/20", percent: 80 },
              ].map((item) => (
                <View key={item.label} className="w-full">
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-xs font-semibold text-muted">{item.label}</Text>
                    <Text className="text-xs font-bold text-primary">{item.value}</Text>
                  </View>
                  <View className="h-2 bg-surface rounded-full overflow-hidden mb-2">
                    <LinearGradient
                      colors={PROGRESS_GRADIENT}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{ height: "100%", width: `${item.percent}%` }}
                    />
                  </View>
                </View>
              ))}
            </View>

            <AnimatedPressable
              onPress={() => setShowShareModal(true)}
              className="mt-8 w-full"
              style={{ borderRadius: 16, overflow: "hidden" }}
            >
              <LinearGradient
                colors={PLUSH_GRADIENT}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  height: 52,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8
                }}
              >
                <MaterialIcons name="share" size={20} color="#FFFFFF" />
                <Text className="text-white font-bold">Share Achievement</Text>
              </LinearGradient>
            </AnimatedPressable>
          </View>
        </View>
      </ScrollView>

      {/* SHARING MODAL */}
      <Modal visible={showShareModal} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-center px-6">
          <View className="bg-white rounded-[40px] overflow-hidden">
            <LinearGradient
              colors={[BLUSH_PINK, CREAM]}
              style={{ padding: 32, alignItems: 'center' }}
            >
              <View className="items-center mb-8">
                <Text style={{ fontFamily: "DancingScript_400Regular", fontSize: 24, color: DEEP_PLUM }}>Plush Wellness</Text>
                <View style={{ height: 1, width: 40, backgroundColor: DEEP_PLUM, marginVertical: 8 }} />
              </View>

              <View
                className="w-32 h-32 rounded-full items-center justify-center mb-6"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderWidth: 4,
                  borderColor: '#FFFFFF',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.1,
                  shadowRadius: 15,
                }}
              >
                <Text
                  className="text-6xl"
                  style={{ fontFamily: "PlayfairDisplay_700Bold", color: DEEP_PLUM }}
                >
                  {PLUSH_SCORE}
                </Text>
              </View>

              <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 20, color: DEEP_PLUM, marginBottom: 8 }}>Soft Wealth Master</Text>
              <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 13, color: DEEP_PLUM, opacity: 0.7, textAlign: 'center', marginBottom: 24 }}>
                "Financial peace is a ritual, not a race. 🌸"
              </Text>

              <View className="flex-row gap-4 mb-4">
                {BADGES.map((badge) => (
                  <View key={badge.id} className="bg-white/50 px-3 py-1 rounded-full flex-row items-center gap-1">
                    <Text className="text-sm">{badge.icon}</Text>
                    <Text className="text-[10px] font-bold text-foreground">{badge.title}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>

            <View className="px-6 py-8 flex-row gap-3 bg-white">
              <View style={{ flex: 1 }}>
                <AnimatedPressable
                  onPress={() => setShowShareModal(false)}
                  style={{
                    height: 52,
                    borderRadius: 16,
                    borderWidth: 1.5,
                    borderColor: `${DEEP_PLUM}26`, // Muted border
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%'
                  }}
                >
                  <Text style={{ fontFamily: 'DMSans_700Bold', color: DEEP_PLUM, opacity: 0.6 }}>Close</Text>
                </AnimatedPressable>
              </View>

              <View style={{ flex: 1.5 }}>
                <AnimatedPressable
                  onPress={handleShare}
                  style={{ borderRadius: 16, overflow: "hidden", width: "100%" }}
                >
                  <LinearGradient
                    colors={PLUSH_GRADIENT}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      height: 52,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    <MaterialIcons name="file-download" size={20} color="#FFFFFF" />
                    <Text style={{ fontFamily: 'DMSans_700Bold', color: '#FFFFFF' }}>Share Card</Text>
                  </LinearGradient>
                </AnimatedPressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
