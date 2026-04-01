import React from "react";
import { Modal, View, StyleSheet, PanResponder, Animated, Pressable } from "react-native";
import { useColors } from "@/hooks/use-colors";

interface PlushBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxHeight?: string | number;
}

export function PlushBottomSheet({
  visible,
  onClose,
  children,
  maxHeight = "90%",
}: PlushBottomSheetProps) {
  const colors = useColors();
  const panY = React.useRef(new Animated.Value(0)).current;

  const resetPositionAnim = Animated.timing(panY, {
    toValue: 0,
    duration: 300,
    useNativeDriver: true,
  });

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          onClose();
          setTimeout(() => panY.setValue(0), 300);
        } else {
          resetPositionAnim.start();
        }
      },
    })
  ).current;

  React.useEffect(() => {
    if (visible) {
      panY.setValue(0);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.dismissArea} onPress={onClose} />
        <Animated.View
          style={[
            styles.container,
            { 
              backgroundColor: colors.background,
              maxHeight: maxHeight as any,
              transform: [{ translateY: panY }] 
            }
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.handle} />
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(74, 21, 96, 0.4)",
    justifyContent: "flex-end",
  },
  dismissArea: {
    flex: 1,
  },
  container: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingTop: 12,
    borderTopWidth: 1.5,
    borderColor: "#B76E79",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#E8D5E3",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 24,
  },
});
