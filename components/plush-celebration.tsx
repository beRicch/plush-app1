import React, { useEffect, useRef } from "react";
import { Modal, View, Text, Pressable, StyleSheet, Animated, Dimensions } from "react-native";
import * as Haptics from "expo-haptics";

const { width, height } = Dimensions.get("window");

interface PlushCelebrationProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  emoji?: string;
}

export function PlushCelebration({
  visible,
  onClose,
  title = "Ritual Complete!",
  subtitle = "5 weeks in a row, sis! 🔥",
  emoji = "🎉",
}: PlushCelebrationProps) {
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          tension: 40,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scale.setValue(0.8);
      opacity.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, { opacity, transform: [{ scale }] }]}>
          <Text style={styles.emoji}>{emoji}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          
          <Pressable onPress={onClose} style={styles.button}>
            <Text style={styles.buttonText}>Done 🌸</Text>
          </Pressable>
        </Animated.View>
        
        {/* Simple Confetti Emojis */}
        <Confetti />
      </View>
    </Modal>
  );
}

function Confetti() {
  const emojis = ["🌸", "💜", "💰", "✨", "👑"];
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: 15 }).map((_, i) => (
        <FallingEmoji key={i} emoji={emojis[i % emojis.length]} index={i} />
      ))}
    </View>
  );
}

function FallingEmoji({ emoji, index }: { emoji: string; index: number }) {
  const anim = useRef(new Animated.Value(-50)).current;
  const lateral = useRef(new Animated.Value(Math.random() * width)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(anim, {
        toValue: height + 50,
        duration: 2000 + Math.random() * 3000,
        delay: index * 200,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <Animated.Text
      style={[
        styles.confetti,
        {
          transform: [{ translateY: anim }, { translateX: lateral }],
          fontSize: 20 + Math.random() * 20,
        },
      ]}
    >
      {emoji}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#4A1560", // Deep Plum
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  container: {
    alignItems: "center",
    gap: 16,
    zIndex: 10,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  title: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 28,
    color: "#FAF5EF", // Cream
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "DMSans_500Medium",
    fontSize: 18,
    color: "#F4B8C1", // Blush Pink
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#FAF5EF", // Cream
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontFamily: "DMSans_700Bold",
    fontSize: 16,
    color: "#4A1560", // Deep Plum
  },
  confetti: {
    position: "absolute",
    top: 0,
    opacity: 0.6,
  },
});
