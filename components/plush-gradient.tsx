import React from "react";
import { Pressable, Text, View, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

// ─── Shared gradient stops ─────────────────────────────────────────────────
export const PLUSH_GRADIENT: [string, string, string, string] = [
  "#4A1560",
  "#6B2080",
  "#8B2FA0",
  "#6A1B7A",
];

export const PROGRESS_GRADIENT: [string, string] = [
  "#F4B8C1", // BLUSH_PINK
  "#B76E79", // ROSE_GOLD
];

// ─── PlushGradient — generic gradient wrapper ───────────────────────────────
interface PlushGradientProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  /** Override default diagonal direction */
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  colors?: readonly [string, string, ...string[]];
}

export function PlushGradient({
  children,
  style,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  colors = PLUSH_GRADIENT,
}: PlushGradientProps) {
  return (
    <LinearGradient colors={colors} start={start} end={end} style={style}>
      {children}
    </LinearGradient>
  );
}

// ─── GradientButton — full-width gradient CTA button ───────────────────────
interface GradientButtonProps {
  onPress?: () => void;
  label: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  /** px height, default 52 */
  height?: number;
  borderRadius?: number;
}

export function GradientButton({
  onPress,
  label,
  style,
  textStyle,
  disabled = false,
  height = 52,
  borderRadius = 16,
}: GradientButtonProps) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [{ opacity: pressed || disabled ? 0.75 : 1 }]}
    >
      <LinearGradient
        colors={disabled ? (["#9B8FA3", "#9B8FA3"] as any) : PLUSH_GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          {
            height,
            borderRadius,
            alignItems: "center",
            justifyContent: "center",
          },
          style,
        ]}
      >
        <Text
          style={[
            {
              fontFamily: "DMSans_700Bold",
              fontSize: 15,
              color: "#FFFFFF",
              letterSpacing: 0.2,
            },
            textStyle,
          ]}
        >
          {label}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

// ─── GradientBadge — small pill/badge  ─────────────────────────────────────
interface GradientBadgeProps {
  label: string;
  textStyle?: TextStyle;
  style?: ViewStyle;
}

export function GradientBadge({ label, textStyle, style }: GradientBadgeProps) {
  return (
    <LinearGradient
      colors={PLUSH_GRADIENT}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        {
          borderRadius: 20,
          paddingHorizontal: 8,
          paddingVertical: 3,
        },
        style,
      ]}
    >
      <Text
        style={[
          {
            fontFamily: "DMSans_500Medium",
            fontSize: 10,
            color: "#FFFFFF",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: 0.6,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </LinearGradient>
  );
}

// ─── GradientAvatar — circular branded initials avatar ─────────────────────
interface GradientAvatarProps {
  name: string;
  size?: number;
  borderColor?: string;
}

export function GradientAvatar({
  name,
  size = 40,
  borderColor = "#B76E79",
}: GradientAvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <LinearGradient
      colors={PLUSH_GRADIENT}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2.5,
        borderColor,
      }}
    >
      <Text
        style={{
          fontFamily: "PlayfairDisplay_700Bold",
          fontSize: size * 0.38,
          color: "#FAF5EF",
          textAlign: "center",
        }}
      >
        {initials}
      </Text>
    </LinearGradient>
  );
}
