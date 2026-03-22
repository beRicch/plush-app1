import { Text, View, Pressable, TextInput, ScrollView, Modal } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useState } from "react";
import { cn } from "@/lib/utils";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { supabase } from "@/lib/supabase";
import { Alert, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PLUSH_GRADIENT } from "@/components/plush-gradient";

export default function AuthScreen() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+234");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Show trust popup immediately on mounting this screen
  const [showTrustPopup, setShowTrustPopup] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    // Mock authentication for testing
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace("../(tabs)");
    }, 1000);
  };

  const TRUST_STATEMENTS = [
    "Plush never connects to your bank account",
    "You enter what you choose. Nothing is automatic.",
    "Your data is never sold. Ever.",
  ];

  return (
    <ScreenContainer
      edges={["top", "left", "right"]}
      containerClassName="bg-background"
      className="flex-1"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-8 pb-12 gap-6">
          {/* Logo */}
          <View className="items-center mb-4">
            <Text
              className="font-bold text-primary"
              style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 23 }}
            >
              Plush
            </Text>
          </View>

          {/* Toggle Tabs */}
          <View className="flex-row gap-0 border-b border-border">
            <Pressable
              onPress={() => setIsSignUp(true)}
              className={cn(
                "flex-1 py-4 items-center border-b-2",
                isSignUp ? "border-primary" : "border-transparent"
              )}
            >
              <Text className={cn("font-dm-sans font-semibold", isSignUp ? "text-primary" : "text-muted")}>
                Sign Up
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setIsSignUp(false)}
              className={cn(
                "flex-1 py-4 items-center border-b-2",
                !isSignUp ? "border-primary" : "border-transparent"
              )}
            >
              <Text className={cn("font-dm-sans font-semibold", !isSignUp ? "text-primary" : "text-muted")}>
                Log In
              </Text>
            </Pressable>
          </View>

          {/* Form Fields */}
          <View className="gap-4">
            {isSignUp && (
              <View>
                <Text className="font-dm-sans text-sm text-foreground mb-2">First name</Text>
                <TextInput
                  placeholder="Enter your first name"
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholderTextColor="#9B8FA3"
                  className="border border-border rounded-lg px-4 py-3 font-dm-sans text-foreground bg-surface"
                />
              </View>
            )}

            <View>
              <Text className="font-dm-sans text-sm text-foreground mb-2">Email address</Text>
              <TextInput
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholderTextColor="#9B8FA3"
                className="border border-border rounded-lg px-4 py-3 font-dm-sans text-foreground bg-surface"
              />
            </View>

            {isSignUp && (
              <View>
                <Text className="font-dm-sans text-sm text-foreground mb-2">Phone (optional)</Text>
                <TextInput
                  placeholder="+234 XXX XXX XXXX"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholderTextColor="#9B8FA3"
                  className="border border-border rounded-lg px-4 py-3 font-dm-sans text-foreground bg-surface"
                />
              </View>
            )}

            <View>
              <Text className="font-dm-sans text-sm text-foreground mb-2">Password</Text>
              <View className="flex-row items-center border border-border rounded-lg bg-surface">
                <TextInput
                  placeholder="Create a password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#9B8FA3"
                  className="flex-1 px-4 py-3 font-dm-sans text-foreground"
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  className="px-4 py-3"
                >
                  <Text className="text-primary font-dm-sans text-sm">
                    {showPassword ? "Hide" : "Show"}
                  </Text>
                </Pressable>
              </View>
            </View>

            {!isSignUp && (
              <View className="items-end">
                <Pressable>
                  <Text className="text-primary font-dm-sans text-sm">Forgot password?</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Social Auth Divider */}
          <View className="flex-row items-center gap-3 my-2">
            <View className="flex-1 h-px bg-border" />
            <Text className="text-muted font-dm-sans text-sm">or continue with</Text>
            <View className="flex-1 h-px bg-border" />
          </View>

          {/* Social Auth Buttons */}
          <View className="gap-3">
            <Pressable
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            className="border border-border rounded-2xl py-3 px-4 items-center bg-surface"
            >
              <Text className="font-dm-sans font-semibold text-foreground">Continue with Google</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
            className="border border-border rounded-2xl py-3 px-4 items-center bg-surface"
            >
              <Text className="font-dm-sans font-semibold text-foreground">Continue with Apple</Text>
            </Pressable>
          </View>

          {/* Main CTA Button */}
          <Pressable
            onPress={handleContinue}
            style={({ pressed }) => [
              {
                opacity: (pressed || loading) ? 0.9 : 1,
                transform: [{ scale: (pressed || loading) ? 0.97 : 1 }],
              },
            ]}
            className={cn(
              "rounded-2xl mt-4 items-center overflow-hidden",
              loading ? "bg-muted" : "bg-primary/0"
            )}
            disabled={loading}
          >
            {loading ? (
              <View className="py-4 px-6 items-center w-full">
                <ActivityIndicator color="white" />
              </View>
            ) : (
              <LinearGradient colors={PLUSH_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="py-4 w-full items-center justify-center">
                <Text className="text-background font-dm-sans font-semibold text-base">
                  {isSignUp ? "Create My Account 🌸" : "Sign In 🌸"}
                </Text>
              </LinearGradient>
            )}
          </Pressable>
        </View>
      </ScrollView>

      {/* Trust Notification Modal (Pop-up) */}
      <Modal
        visible={showTrustPopup}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {}} // User must agree via the button
      >
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-background rounded-3xl p-8 w-full max-w-sm gap-8 items-center pt-10">
            {/* Headline */}
            <Text
              className="font-bold text-primary text-center"
              style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 23 }}
            >
              Before we start, let's be clear.
            </Text>

            {/* Trust Statements */}
            <View className="gap-5 w-full">
              {TRUST_STATEMENTS.map((statement, idx) => (
                <View key={idx} className="flex-row items-start gap-3">
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center mt-0.5"
                    style={{ backgroundColor: "#B76E7920" }}
                  >
                    <MaterialIcons name="check-circle" size={22} color="#B76E79" />
                  </View>
                  <Text className="font-dm-sans text-base text-foreground flex-1 leading-relaxed">
                    {statement}
                  </Text>
                </View>
              ))}
            </View>

            {/* Affirmation */}
            <Text className="text-accent-script text-center text-lg leading-relaxed mt-2">
              Your money. Your clarity. Your pace.
            </Text>

            {/* CTA */}
            <Pressable
              onPress={() => setShowTrustPopup(false)}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
              className="w-full rounded-2xl mt-2 items-center overflow-hidden"
            >
              <LinearGradient colors={PLUSH_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="py-4 w-full items-center justify-center">
                <Text className="text-background font-dm-sans font-semibold text-base">
                  I'm in 🌸
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
