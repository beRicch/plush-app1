import { Text, View, Dimensions } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import * as ExpoSplashScreen from "expo-splash-screen";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withDelay,
} from "react-native-reanimated";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { LinearGradient } from "expo-linear-gradient";
import { HAS_COMPLETED_ONBOARDING_KEY } from "@/constants/oauth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSessionToken } from "@/lib/_core/auth";
import Svg, { Circle } from "react-native-svg";

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const titleScale = useSharedValue(0.85);
  
  // Animation for background elements
  const ringScale = useSharedValue(1);

  useEffect(() => {
    // Title fade in, slide up, and scale up smoothly
    titleOpacity.value = withTiming(1, { duration: 1000 });
    titleTranslateY.value = withTiming(0, { duration: 1000 });
    titleScale.value = withTiming(1, { duration: 1000 });
    
    // Subtle pulse for background rings
    ringScale.value = withRepeat(
      withTiming(1.05, { duration: 4000 }),
      -1,
      true
    );

    let timeoutHandle: NodeJS.Timeout | number;

    async function checkUserStatusAndRedirect() {
      try {
        const [hasCompletedOnboarding, sessionToken] = await Promise.all([
          AsyncStorage.getItem(HAS_COMPLETED_ONBOARDING_KEY),
          getSessionToken(),
        ]);

        const isReturningUser = hasCompletedOnboarding === "true" || !!sessionToken;

        // Give the splash screen a moment to show the animation (min 2.8s total)
        timeoutHandle = setTimeout(async () => {
          await ExpoSplashScreen.hideAsync().catch(() => {});
          if (isReturningUser) {
            router.replace("/auth");
          } else {
            router.push("/onboarding/welcome");
          }
        }, 2800);
      } catch (error) {
        console.error("[Splash] Failed to check user status:", error);
        // Fallback to onboarding for safety
        timeoutHandle = setTimeout(async () => {
          await ExpoSplashScreen.hideAsync().catch(() => {});
          router.push("/onboarding/welcome");
        }, 2800);
      }
    }

    checkUserStatusAndRedirect();

    return () => {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle as ReturnType<typeof setTimeout>);
      }
    };
  }, [router]);

  const animatedTitleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [
      { translateY: titleTranslateY.value },
      { scale: titleScale.value }
    ],
  }));

  const animatedRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: 0.15,
  }));

  const isLight = colorScheme === "light";
  
  // Brand Colors
  const DEEP_PLUM = "#4A1560";
  const PLUM_GRADIENT = ["#3D0E4F", "#4A1560", "#6A1B8A"] as const;

  return (
    <View className="flex-1">
      <LinearGradient
        colors={isLight ? ["#4A1560", "#5E1A72", "#7A2C92"] : PLUM_GRADIENT}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScreenContainer
          edges={["top", "bottom", "left", "right"]}
          containerClassName="bg-transparent"
          className="flex-1 justify-center items-center"
        >
          {/* Background Decorative Rings */}
          <View style={{ position: "absolute", zIndex: -1 }}>
             <Animated.View style={animatedRingStyle}>
                <Svg width={width * 1.5} height={width * 1.5} viewBox="0 0 100 100">
                  <Circle cx="50" cy="50" r="20" stroke="white" strokeWidth="0.2" fill="none" opacity="0.5" />
                  <Circle cx="50" cy="50" r="35" stroke="white" strokeWidth="0.15" fill="none" opacity="0.3" />
                  <Circle cx="50" cy="50" r="48" stroke="white" strokeWidth="0.1" fill="none" opacity="0.2" />
                </Svg>
             </Animated.View>
          </View>

          {/* Floating Accents */}
          <View style={{ position: "absolute", top: height * 0.2, left: width * 0.1, opacity: 0.3 }}>
            <Text style={{ fontSize: 16 }}>🌸</Text>
          </View>
          <View style={{ position: "absolute", top: height * 0.35, right: width * 0.15, opacity: 0.2 }}>
            <Text style={{ fontSize: 12 }}>🌸</Text>
          </View>
          <View style={{ position: "absolute", bottom: height * 0.25, left: width * 0.2, opacity: 0.2 }}>
            <Text style={{ fontSize: 14 }}>🌸</Text>
          </View>
          <View style={{ position: "absolute", bottom: height * 0.1, right: width * 0.25, opacity: 0.3 }}>
            <Text style={{ fontSize: 18 }}>🌸</Text>
          </View>

          <View className="items-center gap-2">
            {/* Logo with Smooth Entry Effects (Fade, Slide, Scale) */}
            <Animated.View style={animatedTitleStyle} className="items-center">
              {/* Flower Icon */}
              <View className="mb-4">
                <Text style={{ fontSize: 74, color: "white" }}>🌸</Text>
              </View>
            </Animated.View>
          </View>

          <View
            style={{
              position: "absolute",
              bottom: 48,
              left: 0,
              right: 0,
              alignItems: "center",
              paddingHorizontal: 24,
            }}
          >
            <Text
              style={{
                fontFamily: "PlayfairDisplay_700Bold",
                fontSize: 35,
                fontWeight: "700",
                color: "white",
              }}
            >
              Plush
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.85)",
                textAlign: "center",
                marginTop: 8,
              }}
            >
              Soft Life Secure
            </Text>
          </View>
        </ScreenContainer>
      </LinearGradient>
    </View>
  );
}
