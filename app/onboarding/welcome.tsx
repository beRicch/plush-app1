import { Text, View, Pressable, ScrollView } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { PLUSH_GRADIENT } from "@/components/plush-gradient";

export default function WelcomeScreen() {
  const router = useRouter();

  const handleContinue = () => {
    router.push("./quiz");
  };

  return (
    <ScreenContainer
      edges={["top", "left", "right"]}
      containerClassName="bg-background"
      className="flex-1"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-8 pb-12 gap-6 flex-1 justify-between">
          {/* Product Magic Hook */}
          <View className="items-center mt-4">
            <View className="w-full bg-surface rounded-3xl border border-border p-6 gap-4 shadow-sm">
               {/* UI Mockup for Product Magic */}
               <View className="w-full bg-background rounded-3xl p-4 border border-border shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                 <View className="flex-row items-center gap-3">
                   <View className="w-12 h-12 bg-accentGold/20 rounded-full items-center justify-center border border-accentGold/40">
                     <Text className="text-2xl">📸</Text>
                   </View>
                   <View className="flex-1 gap-1">
                     <Text className="font-dm-sans text-sm font-bold text-foreground">Snap a receipt</Text>
                     <Text className="font-dm-sans text-xs text-muted">AI extracts and categorizes instantly</Text>
                   </View>
                 </View>
               </View>

               <View className="w-full bg-background rounded-3xl p-4 border border-border shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                 <View className="flex-row items-center gap-3">
                   <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center border border-primary/20">
                     <Text className="text-2xl">🎙️</Text>
                   </View>
                   <View className="flex-1 gap-1">
                     <Text className="font-dm-sans text-sm font-bold text-foreground">"I spent 5k on Uber"</Text>
                     <Text className="font-dm-sans text-xs text-muted">Voice logs automatically added</Text>
                   </View>
                 </View>
               </View>
            </View>
          </View>

          {/* Content */}
          <View className="gap-3 mt-6 px-2">
            {/* Headline */}
            <Text 
              className="font-playfair font-bold text-primary text-center"
              style={{ fontSize: 28, lineHeight: 36 }}
            >
              Soft Life,{"\n"}on autopilot. ✨
            </Text>
          </View>

          {/* CTA Button */}
          <Pressable
            onPress={handleContinue}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
                borderRadius: 16, // standardized rounding
                overflow: "hidden"
              },
            ]}
          >
            <LinearGradient
              colors={PLUSH_GRADIENT}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width: "100%", alignItems: "center", justifyContent: "center", paddingVertical: 16, paddingHorizontal: 24 }}
            >
              <Text className="text-background font-dm-sans font-semibold text-base">
                Enter your Plush Era
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
