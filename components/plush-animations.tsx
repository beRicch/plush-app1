/**
 * Plush Shared Animation Utilities
 * - usePressAnimation: soft scale-down on tap
 * - Toast: Rose Gold ripple + message, auto-dismisses after 2s
 */
import { useRef, useCallback, useEffect, useState } from "react";
import {
  Animated,
  Text,
  View,
  Pressable,
  PressableProps,
  StyleSheet,
} from "react-native";

// ─────────────────────────────────────────
// usePressAnimation
// ─────────────────────────────────────────
export function usePressAnimation(scaleTo = 0.96) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: scaleTo,
      useNativeDriver: true,
      speed: 40,
      bounciness: 0,
    }).start();
  }, [scale, scaleTo]);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  }, [scale]);

  const animatedStyle = { transform: [{ scale }] };

  return { scale, onPressIn, onPressOut, animatedStyle };
}

// ─────────────────────────────────────────
// AnimatedPressable
// Convenience wrapper that auto-applies the scale animation
// ─────────────────────────────────────────
type AnimatedPressableProps = PressableProps & {
  children: React.ReactNode;
  scaleTo?: number;
};

export function AnimatedPressable({
  children,
  scaleTo = 0.96,
  onPressIn: externalPressIn,
  onPressOut: externalPressOut,
  style,
  ...props
}: AnimatedPressableProps) {
  const { onPressIn, onPressOut, animatedStyle } = usePressAnimation(scaleTo);

  return (
    <Pressable
      onPressIn={(e) => {
        onPressIn();
        externalPressIn?.(e);
      }}
      onPressOut={(e) => {
        onPressOut();
        externalPressOut?.(e);
      }}
      {...props}
    >
      <Animated.View style={[animatedStyle, style as any]}>{children}</Animated.View>
    </Pressable>
  );
}

// ─────────────────────────────────────────
// useCountUp
// Animates a number from 0 to `target` over `duration`ms
// ─────────────────────────────────────────
export function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: target,
      duration,
      useNativeDriver: false,
    }).start();

    const listener = animValue.addListener(({ value: v }) => {
      setValue(Math.round(v));
    });

    return () => animValue.removeListener(listener);
  }, [target, duration, animValue]);

  return value;
}

// ─────────────────────────────────────────
// Toast
// Rose Gold ripple toast that auto-dismisses
// ─────────────────────────────────────────
interface ToastProps {
  visible: boolean;
  message: string;
  onHide: () => void;
  durationMs?: number;
}

export function Toast({
  visible,
  message,
  onHide,
  durationMs = 2200,
}: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (visible) {
      // Fade + slide in
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          speed: 20,
          bounciness: 8,
        }),
      ]).start();

      // Auto-dismiss
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 20,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onHide();
        });
      }, durationMs);

      return () => clearTimeout(timer);
    }
  }, [visible, durationMs, opacity, translateY, onHide]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        { opacity, transform: [{ translateY }] },
      ]}
      pointerEvents="none"
    >
      {/* Rose Gold ripple ring */}
      <View style={styles.toastRipple} />
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    bottom: 110,
    alignSelf: "center",
    backgroundColor: "#B76E79",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#B76E79",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 9999,
  },
  toastRipple: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FAF5EF",
  },
  toastText: {
    color: "#FAF5EF",
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    fontWeight: "600",
  },
});
