/**
 * Plush Empty State
 * Consistent warm empty-state layout used across Goals, Log, Community screens.
 */
import { View, Text, StyleSheet, ViewStyle } from "react-native";

interface EmptyStateProps {
  /** Emoji or small illustration character */
  illustration?: string;
  headline: string;
  body?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
}

export function EmptyState({
  illustration = "🌸",
  headline,
  body,
  children,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      {/* Soft circular illustration container */}
      <View style={styles.illustrationWrap}>
        <Text style={styles.illustration}>{illustration}</Text>
      </View>

      <Text style={styles.headline}>{headline}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 40,
    gap: 12,
  },
  illustrationWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F4B8C1",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    // Soft glow
    shadowColor: "#B76E79",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  illustration: {
    fontSize: 44,
  },
  headline: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 20,
    color: "#4A1560",
    textAlign: "center",
    lineHeight: 28,
  },
  body: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: "#9B8EA0",
    textAlign: "center",
    lineHeight: 22,
  },
});
