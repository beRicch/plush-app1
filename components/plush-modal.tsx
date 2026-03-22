import React from "react";
import { Modal, View, Text, Pressable, StyleSheet, ViewStyle, TextStyle } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface PlushModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "error" | "info" | "success";
  buttonText?: string;
}

export function PlushModal({
  visible,
  onClose,
  title,
  message,
  type = "info",
  buttonText = "Got it 🌸",
}: PlushModalProps) {
  const iconMap: Record<string, { name: string; color: string }> = {
    error: { name: "error-outline", color: "#EF4444" },
    info: { name: "info-outline", color: "#B76E79" },
    success: { name: "check-circle-outline", color: "#22C55E" },
  };

  const icon = iconMap[type] || iconMap.info;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.handle} />
          
          <View style={styles.content}>
            <View style={[styles.iconContainer, { backgroundColor: icon.color + "20" }]}>
              <MaterialIcons name={icon.name as any} size={32} color={icon.color} />
            </View>
            
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            
            <Pressable onPress={onClose} style={styles.button}>
              <Text style={styles.buttonText}>{buttonText}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(74, 21, 96, 0.4)", // Deep Plum overlay
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#FAF5EF", // Cream
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingTop: 12,
    borderTopWidth: 1.5,
    borderColor: "#B76E79", // Rose Gold border
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#E8D5E3",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 24,
  },
  content: {
    alignItems: "center",
    gap: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 22,
    color: "#4A1560", // Deep Plum
    textAlign: "center",
  },
  message: {
    fontFamily: "DMSans_500Medium",
    fontSize: 15,
    color: "#4A1560CC",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#4A1560", // Deep Plum
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  buttonText: {
    fontFamily: "DMSans_700Bold",
    fontSize: 16,
    color: "#FAF5EF", // Cream
  },
});
