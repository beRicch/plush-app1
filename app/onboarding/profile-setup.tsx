import { Text, View, Pressable, TextInput, ScrollView } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColors } from "@/hooks/use-colors";
import { LinearGradient } from "expo-linear-gradient";
import { PLUSH_GRADIENT } from "@/components/plush-gradient";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const INCOME_RANGES = [
  "Under ₦200,000",
  "₦200,000 - ₦500,000",
  "₦500,000 - ₦1,000,000",
  "₦1,000,000 - ₦2,500,000",
  "Over ₦2,500,000",
];

export default function ProfileSetupScreen() {
  const router = useRouter();
  const colors = useColors();
  const [selectedIncome, setSelectedIncome] = useState("");

  const handleContinue = async () => {
    if (selectedIncome) {
      try {
        const existing = await AsyncStorage.getItem("plush_pending_onboarding");
        const parsed = existing ? JSON.parse(existing) : {};
        await AsyncStorage.setItem("plush_pending_onboarding", JSON.stringify({
          ...parsed,
          monthlyIncomeRange: selectedIncome,
        }));
      } catch (e) {
        console.warn("Failed to save income range", e);
      }
    }
    router.push("/auth");
  };

  return (
    <ScreenContainer
      edges={["top", "left", "right"]}
      containerClassName="bg-background"
      className="flex-1"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-12 pb-12 gap-8 flex-1 justify-between">
          <View className="gap-6">
            <View className="gap-2">
              <Text
                className="font-bold text-primary"
                style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 29 }}
              >
                Almost there, sis. 🌸
              </Text>
              <Text className="font-dm-sans text-lg text-muted leading-relaxed">
                One last thing. This helps Plush calibrate your savings rate and suggests realistic targets based on your income.
              </Text>
            </View>

            <View className="gap-4">
              <Text className="font-dm-sans font-bold text-foreground">What is your average monthly income?</Text>
              <View className="gap-3">
                {INCOME_RANGES.map((range) => (
                  <Pressable
                    key={range}
                    onPress={() => setSelectedIncome(range)}
                    className="flex-row items-center justify-between bg-surface border-2 rounded-2xl p-4"
                    style={{
                      borderColor: selectedIncome === range ? colors.primary : colors.border,
                    }}
                  >
                    <Text className="font-dm-sans text-base text-foreground">{range}</Text>
                    {selectedIncome === range && (
                      <MaterialIcons name="check-circle" size={20} color={colors.primary} />
                    )}
                  </Pressable>
                ))}
              </View>
            </View>
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
            className="mt-8 shadow-sm"
          >
            <LinearGradient colors={PLUSH_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="py-4 px-6 items-center w-full justify-center">
              <Text className="text-background font-dm-sans font-semibold text-base tracking-wide">
                Continue to my plan 🌸
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
