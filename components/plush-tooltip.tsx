/**
 * Plush First-Time Tooltip
 * - Deep Plum bubble, Cream text, Rose Gold close button
 * - Uses AsyncStorage to track first-view; never shown again after dismiss
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Modal, Pressable, Text, View, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface TooltipProps {
  /** Unique key stored in AsyncStorage so the tooltip is only shown once */
  storageKey: string;
  message: string;
  children: React.ReactNode;
  /** Where to anchor the tooltip bubble relative to the child */
  position?: "above" | "below";
}

export function Tooltip({
  storageKey,
  message,
  children,
  position = "below",
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const checkSeen = async () => {
      try {
        const seen = await AsyncStorage.getItem(`tooltip_seen_${storageKey}`);
        if (!seen) {
          setVisible(true);
          Animated.timing(opacity, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }).start();
        }
      } catch {
        // silently fail — don't block the UI
      }
    };
    checkSeen();
  }, [storageKey, opacity]);

  const handleDismiss = useCallback(async () => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
    });
    try {
      await AsyncStorage.setItem(`tooltip_seen_${storageKey}`, "1");
    } catch {
      // silently fail
    }
  }, [storageKey, opacity]);

  return (
    <View style={{ position: "relative" }}>
      {children}
      {visible && (
        <Animated.View
          style={[
            styles.bubble,
            position === "above" ? styles.above : styles.below,
            { opacity },
          ]}
        >
          {/* Caret */}
          <View style={position === "above" ? styles.caretDown : styles.caretUp} />

          <View style={styles.bubbleInner}>
            <Text style={styles.message}>{message}</Text>
            <Pressable onPress={handleDismiss} style={styles.closeBtn} hitSlop={8}>
              <MaterialIcons name="close" size={14} color="#B76E79" />
            </Pressable>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────
// useFirstTimeTooltip
// Lightweight hook for tooltips not anchored to a specific component
// ─────────────────────────────────────────
export function useFirstTimeTooltip(storageKey: string) {
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const seen = await AsyncStorage.getItem(`tooltip_seen_${storageKey}`);
        if (!seen) setShowTooltip(true);
      } catch {
        // silently fail
      }
    };
    check();
  }, [storageKey]);

  const dismiss = useCallback(async () => {
    setShowTooltip(false);
    try {
      await AsyncStorage.setItem(`tooltip_seen_${storageKey}`, "1");
    } catch {
      // silently fail
    }
  }, [storageKey]);

  return { showTooltip, dismiss };
}

// ─────────────────────────────────────────
// TooltipModal
// Full overlay version for screens that need a modal-style first-time tooltip
// ─────────────────────────────────────────
interface TooltipModalProps {
  storageKey: string;
  title: string;
  message: string;
}

export function TooltipModal({ storageKey, title, message }: TooltipModalProps) {
  const { showTooltip, dismiss } = useFirstTimeTooltip(storageKey);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showTooltip) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }).start();
    }
  }, [showTooltip, opacity]);

  if (!showTooltip) return null;

  return (
    <Modal transparent visible={showTooltip} animationType="none">
      <Pressable style={styles.overlay} onPress={dismiss}>
        <Animated.View style={[styles.floatingBubble, { opacity }]}>
          <Text style={styles.floatingTitle}>{title}</Text>
          <Text style={styles.floatingMessage}>{message}</Text>
          <Pressable onPress={dismiss} style={styles.floatingClose}>
            <Text style={styles.floatingCloseText}>Got it ✓</Text>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 999,
  },
  above: {
    bottom: "110%",
  },
  below: {
    top: "110%",
  },
  caretUp: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#4A1560",
    alignSelf: "center",
    marginBottom: -1,
  },
  caretDown: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#4A1560",
    alignSelf: "center",
    marginTop: -1,
  },
  bubbleInner: {
    backgroundColor: "#4A1560",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  message: {
    color: "#FAF5EF",
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  closeBtn: {
    padding: 2,
  },
  // Modal variant
  overlay: {
    flex: 1,
    backgroundColor: "rgba(74,21,96,0.25)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  floatingBubble: {
    backgroundColor: "#4A1560",
    borderRadius: 20,
    padding: 24,
    gap: 10,
    maxWidth: 340,
    width: "100%",
    shadowColor: "#4A1560",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  floatingTitle: {
    color: "#FAF5EF",
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 18,
  },
  floatingMessage: {
    color: "#FAF5EF",
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.9,
  },
  floatingClose: {
    alignSelf: "flex-end",
    backgroundColor: "#B76E79",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    marginTop: 4,
  },
  floatingCloseText: {
    color: "#FAF5EF",
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    fontWeight: "600",
  },
});
