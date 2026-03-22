import { Text, View, Dimensions } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withDelay,
} from "react-native-reanimated";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { LinearGradient } from "expo-linear-gradient";
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

    const timer = setTimeout(() => {
      router.push("./welcome");
    }, 2800);

    return () => clearTimeout(timer);
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
  const VIBRANT_PURPLE = "#6A1B8A";
  const SOFT_LAVENDER = "#7A288A";

  return (
    <View className="flex-1">
      <LinearGradient
        colors={isLight ? ["#FAF5EF", "#F4B8C1"] : [DEEP_PLUM, VIBRANT_PURPLE, SOFT_LAVENDER]}
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
                <Text style={{ fontSize: 64 }}>🌸</Text>
              </View>
              {/* Main Text: Plush */}
              <Text
                className={isLight ? "font-bold text-foreground tracking-wider" : "font-bold text-white tracking-wider"}
                style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 65, letterSpacing: -2 }}
              >
                Plush
              </Text>
              {/* Tagline */}
              <Text
                className={isLight ? "text-primary text-center mt-3 font-playfair italic" : "text-background text-center mt-3 font-playfair italic"}
                style={{ fontSize: 17, opacity: 0.9 }}
              >
                Your money shouldn't be a mystery.
              </Text>
            </Animated.View>
          </View>
        </ScreenContainer>
      </LinearGradient>
    </View>
  );
}
