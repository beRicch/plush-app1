import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, { FadeIn } from 'react-native-reanimated';

interface PremiumGateProps {
  children: React.ReactNode;
  isPremium: boolean;
  onUnlock?: () => void;
}

export function PremiumGate({ children, isPremium, onUnlock }: PremiumGateProps) {
  const colors = useColors();

  // Bypass for testing
  return <>{children}</>;

  /* Original Logic:
  if (isPremium) {
    return <>{children}</>;
  }
  */

  return (
    <View style={styles.container}>
      <View style={styles.content}>{children}</View>
      <Animated.View
        entering={FadeIn}
        style={[styles.overlay, { backgroundColor: 'rgba(250, 245, 239, 0.95)' }]}
      >
        <View className="items-center px-8 gap-6">
          <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center">
            <MaterialIcons name="lock" size={40} color={colors.primary} />
          </View>

          <View className="gap-2 items-center">
            <Text
              className="text-2xl font-bold text-foreground text-center"
              style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
            >
              Unlock Plush Premium 🌸
            </Text>
            <Text className="text-sm text-muted text-center leading-relaxed">
              Ready to take your financial wellness to the next level? Get deep insights, personalized advice, and advanced rituals.
            </Text>
          </View>

          <Pressable
            onPress={onUnlock}
            className="bg-primary w-full rounded-full py-4 items-center"
          >
            <Text className="text-white font-bold">Start 7-Day Free Trial ✨</Text>
          </Pressable>

          <Text className="text-[10px] text-muted text-center">
            Only ₦2,500/month after. Cancel anytime. 💜
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  content: {
    flex: 1,
    opacity: 0.3, // Dim the background content
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});
