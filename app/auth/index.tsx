import {
  Text,
  View,
  Pressable,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useState } from "react";
import { cn } from "@/lib/utils";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import * as Auth from "@/lib/_core/auth";
import * as SecureStore from "expo-secure-store";
import { startOAuthLogin, APP_ID, OAUTH_PORTAL_URL } from "@/constants/oauth";
import { PLUSH_GRADIENT } from "@/components/plush-gradient";
import { trpc } from "@/lib/trpc";

const ACCOUNTS_KEY = "plush_local_accounts";

type LocalAccount = {
  firstName: string;
  email: string;
  phone: string;
  password: string;
  createdAt: string;
};

async function loadLocalAccounts(): Promise<LocalAccount[]> {
  try {
    if (Platform.OS === "web") {
      const raw = window.localStorage.getItem(ACCOUNTS_KEY);
      return raw ? JSON.parse(raw) : [];
    }
    const raw = await SecureStore.getItemAsync(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Failed to load local accounts", error);
    return [];
  }
}

async function saveLocalAccounts(accounts: LocalAccount[]) {
  try {
    const payload = JSON.stringify(accounts);
    if (Platform.OS === "web") {
      window.localStorage.setItem(ACCOUNTS_KEY, payload);
      return;
    }
    await SecureStore.setItemAsync(ACCOUNTS_KEY, payload);
  } catch (error) {
    console.error("Failed to save local accounts", error);
  }
}

const GOAL_STORAGE_PREFIX = "plush_goals_";

function formatIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

async function initializeDefaultGoalForUser(email: string) {
  try {
    const storageKey = `${GOAL_STORAGE_PREFIX}${email}`;
    const existing = await AsyncStorage.getItem(storageKey);
    if (existing) return;

    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + 6);

    const defaultGoal = {
      id: `plush_default_goal_${email}`,
      name: "Plush Savings Target",
      target: 100000,
      current: 0,
      targetDate: formatIsoDate(targetDate),
      monthlyContribution: 20000,
      motivation: "A custom target to kickstart your Plush journey.",
      coverColor: "#E8D5F5",
    };

    await AsyncStorage.setItem(storageKey, JSON.stringify([defaultGoal]));
  } catch (error) {
    console.error("Failed to initialize default goal for user", error);
  }
}

export default function AuthScreen() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(true);
  const [showTrustPopup, setShowTrustPopup] = useState(true);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const profileUpdate = trpc.plush.profile.update.useMutation();

  const oauthConfigured = Boolean(
    APP_ID &&
    OAUTH_PORTAL_URL &&
    !OAUTH_PORTAL_URL.includes("example") &&
    !OAUTH_PORTAL_URL.includes("your-"),
  );

  const signInLocal = async (emailValue: string, passwordValue: string) => {
    const accounts = await loadLocalAccounts();
    const account = accounts.find(
      (item) =>
        item.email.toLowerCase() === emailValue.toLowerCase() &&
        item.password === passwordValue,
    );
    if (!account) {
      throw new Error("No account found for that email and password.");
    }
    const userInfo: Auth.User = {
      id: Date.now(),
      openId: account.email,
      name: account.firstName,
      email: account.email,
      phone: account.phone || null,
      avatarUrl: null,
      loginMethod: "local",
      moneyPersonality: null,
      monthlyIncomeRange: null,
      subscriptionTier: "free",
      lastSignedIn: new Date(),
    };
    await Auth.setUserInfo(userInfo);
    if (Platform.OS !== "web") {
      await Auth.setSessionToken(`local-${account.email}`);
    }
    return userInfo;
  };

  const createAccountLocal = async () => {
    const accounts = await loadLocalAccounts();
    if (
      accounts.some((item) => item.email.toLowerCase() === email.toLowerCase())
    ) {
      throw new Error("An account with this email already exists.");
    }

    const newAccount: LocalAccount = {
      firstName: firstName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password,
      createdAt: new Date().toISOString(),
    };

    accounts.push(newAccount);
    await saveLocalAccounts(accounts);

    const userInfo: Auth.User = {
      id: Date.now(),
      openId: newAccount.email,
      name: newAccount.firstName,
      email: newAccount.email,
      phone: newAccount.phone || null,
      avatarUrl: null,
      loginMethod: "local",
      moneyPersonality: null,
      monthlyIncomeRange: null,
      subscriptionTier: "free",
      lastSignedIn: new Date(),
    };
    await Auth.setUserInfo(userInfo);
    if (Platform.OS !== "web") {
      await Auth.setSessionToken(`local-${newAccount.email}`);
    }
    await initializeDefaultGoalForUser(newAccount.email);
    return userInfo;
  };

  const handleSubmit = async () => {
    setAuthError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (
          !firstName.trim() ||
          !email.trim() ||
          !password ||
          !confirmPassword
        ) {
          throw new Error("Please fill in all required fields.");
        }
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }
        await createAccountLocal();
      } else {
        if (!email.trim() || !password) {
          throw new Error("Please enter your email and password.");
        }
        await signInLocal(email, password);
      }

      // Sync pending onboarding data if exists
      try {
        const pendingData = await AsyncStorage.getItem("plush_pending_onboarding");
        if (pendingData) {
          const parsed = JSON.parse(pendingData);
          const weeklyCapMap: Record<string, number> = { A: 25000, B: 50000, C: 75000, D: 100000 };
          await profileUpdate.mutateAsync({
            moneyPersonality: parsed.moneyPersonality,
            monthlyIncomeRange: parsed.monthlyIncomeRange,
            incomeFrequency: parsed.incomeFrequency,
            weeklyCap: weeklyCapMap[parsed.weeklyCap as keyof typeof weeklyCapMap] ?? 50000,
          });
          // Clear after successful sync
          await AsyncStorage.removeItem("plush_pending_onboarding");
        }
      } catch (e) {
        console.warn("Failed to sync onboarding data", e);
      }

      router.push("/onboarding/paywall");
    } catch (error: any) {
      setAuthError(error?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    if (!oauthConfigured) {
      Alert.alert(
        "OAuth not configured",
        "Social sign-in is unavailable in this build. Please use the email form to continue.",
      );
      return;
    }

    setLoading(true);
    try {
      await startOAuthLogin();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.message || `Failed to sign in with ${provider}`,
      );
    } finally {
      setLoading(false);
    }
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
      style={{ backgroundColor: '#FAF5EF' }} // Forced background color
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 48, gap: 24 }}>
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <Text
              style={{ 
                fontFamily: "PlayfairDisplay_700Bold", 
                fontSize: 28, 
                fontWeight: 'bold',
                color: '#4A1560' 
              }}
            >
              Plush
            </Text>
          </View>

          <View style={{ 
            flexDirection: 'row', 
            borderBottomWidth: 1, 
            borderColor: '#E5E5E5', 
          }}>
            <Pressable
              onPress={() => setIsSignUp(true)}
              style={{
                flex: 1,
                paddingVertical: 12,
                alignItems: 'center',
                borderBottomWidth: 2,
                borderBottomColor: isSignUp ? '#4A1560' : 'transparent',
              }}
            >
              <Text style={{ 
                fontFamily: "DMSans_500Medium", 
                fontWeight: '600',
                color: isSignUp ? '#4A1560' : '#9A9A9A'
              }}>
                Sign Up
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setIsSignUp(false)}
              style={{
                flex: 1,
                paddingVertical: 12,
                alignItems: 'center',
                borderBottomWidth: 2,
                borderBottomColor: !isSignUp ? '#4A1560' : 'transparent',
              }}
            >
              <Text style={{ 
                fontFamily: "DMSans_500Medium", 
                fontWeight: '600',
                color: !isSignUp ? '#4A1560' : '#9A9A9A'
              }}>
                Log In
              </Text>
            </Pressable>
          </View>

          <View style={{ gap: 24, marginTop: 12 }}>
            <View style={{ gap: 16 }}>
              {isSignUp && (
                <View style={{ gap: 8 }}>
                  <Text style={{ fontFamily: "DMSans_500Medium", color: '#4A1560', fontSize: 13, fontWeight: '600' }}>First name</Text>
                  <TextInput
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Enter your first name"
                    placeholderTextColor="#9A9A9A"
                    autoCapitalize="words"
                    style={{ height: 52, borderRadius: 12, borderWidth: 1, borderColor: '#E5E5E5', backgroundColor: '#FFFFFF', paddingHorizontal: 16, color: '#1A1A1A' }}
                  />
                </View>
              )}

              <View style={{ gap: 8 }}>
                <Text style={{ fontFamily: "DMSans_500Medium", color: '#4A1560', fontSize: 13, fontWeight: '600' }}>Email address</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor="#9A9A9A"
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  style={{ height: 52, borderRadius: 12, borderWidth: 1, borderColor: '#E5E5E5', backgroundColor: '#FFFFFF', paddingHorizontal: 16, color: '#1A1A1A' }}
                />
              </View>

              {isSignUp && (
                <View style={{ gap: 8 }}>
                  <Text style={{ fontFamily: "DMSans_500Medium", color: '#4A1560', fontSize: 13, fontWeight: '600' }}>Phone (optional)</Text>
                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="+234"
                    placeholderTextColor="#9A9A9A"
                    keyboardType="phone-pad"
                    style={{ height: 52, borderRadius: 12, borderWidth: 1, borderColor: '#E5E5E5', backgroundColor: '#FFFFFF', paddingHorizontal: 16, color: '#1A1A1A' }}
                  />
                </View>
              )}

              <View style={{ gap: 8 }}>
                <Text style={{ fontFamily: "DMSans_500Medium", color: '#4A1560', fontSize: 13, fontWeight: '600' }}>Password</Text>
                <View style={{ height: 52, borderRadius: 12, borderWidth: 1, borderColor: '#E5E5E5', backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Create a password"
                    placeholderTextColor="#9A9A9A"
                    secureTextEntry={!showPassword}
                    style={{ flex: 1, height: '100%', color: '#1A1A1A' }}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    <Text style={{ fontFamily: "DMSans_500Medium", color: '#4A1560', fontSize: 13 }}>
                      {showPassword ? "Hide" : "Show"}
                    </Text>
                  </Pressable>
                </View>
              </View>

              {isSignUp && (
                <View style={{ gap: 8 }}>
                  <Text style={{ fontFamily: "DMSans_500Medium", color: '#4A1560', fontSize: 13, fontWeight: '600' }}>Confirm password</Text>
                  <View style={{ height: 52, borderRadius: 12, borderWidth: 1, borderColor: '#E5E5E5', backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
                    <TextInput
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Confirm your password"
                      placeholderTextColor="#9A9A9A"
                      secureTextEntry={!showPassword}
                      style={{ flex: 1, height: '100%', color: '#1A1A1A' }}
                    />
                  </View>
                </View>
              )}
            </View>

            {authError ? (
              <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 13, color: '#D32F2F' }}>
                {authError}
              </Text>
            ) : null}

            <Pressable
              onPress={handleSubmit}
              style={({ pressed }) => [
                {
                  opacity: pressed || loading ? 0.9 : 1,
                  transform: [{ scale: pressed || loading ? 0.97 : 1 }],
                  borderRadius: 16,
                  overflow: 'hidden'
                },
              ]}
              disabled={loading}
            >
              {loading ? (
                <View style={{ paddingVertical: 16, backgroundColor: '#9A9A9A', alignItems: 'center', height: 56, justifyContent: 'center', borderRadius: 16 }}>
                  <ActivityIndicator color="white" />
                </View>
              ) : (
                <View
                  style={{ height: 56, width: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: '#4A1560', borderRadius: 16 }}
                >
                  <Text style={{ color: '#FFFFFF', fontFamily: "DMSans_500Medium", fontWeight: '600', fontSize: 16 }}>
                    {isSignUp ? "Create My Account 🌸" : "Log In 🌸"}
                  </Text>
                </View>
              )}
            </Pressable>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 8 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: '#EDE0D4' }} />
              <Text style={{ color: '#9A9A9A', fontFamily: "DMSans_400Regular", fontSize: 14 }}>
                or continue with
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#EDE0D4' }} />
            </View>

            <View style={{ gap: 12 }}>
              <Pressable
                onPress={() => handleSocialLogin("Google")}
                style={{ borderRadius: 12, borderWidth: 1, borderColor: '#E5E5E5', backgroundColor: '#FFFFFF', paddingVertical: 16, alignItems: 'center' }}
              >
                <Text style={{ fontFamily: "DMSans_500Medium", fontWeight: '600', color: '#4A1560', fontSize: 15 }}>
                  Continue with Google
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleSocialLogin("Apple")}
                style={{ borderRadius: 12, borderWidth: 1, borderColor: '#E5E5E5', backgroundColor: '#FFFFFF', paddingVertical: 16, alignItems: 'center' }}
              >
                <Text style={{ fontFamily: "DMSans_500Medium", fontWeight: '600', color: '#4A1560', fontSize: 15 }}>
                  Continue with Apple
                </Text>
              </Pressable>
              {!oauthConfigured ? (
                <Text style={{ color: '#9A9A9A', fontFamily: "DMSans_400Regular", fontSize: 12, textAlign: 'center' }}>
                  Social login is unavailable in this build. Use the email form
                  above to sign up or sign in.
                </Text>
              ) : (
                <Text style={{ color: '#9A9A9A', fontFamily: "DMSans_400Regular", fontSize: 12, textAlign: 'center' }}>
                  Social sign-in helps keep your account signed in across
                  devices.
                </Text>
              )}
            </View>
          </View>
        </View>

        <Modal
          visible={showTrustPopup}
          animationType="fade"
          transparent={true}
          onRequestClose={() => {}}
        >
          <View style={{ 
            flex: 1, 
            backgroundColor: 'rgba(0,0,0,0.6)', 
            justifyContent: 'center', 
            alignItems: 'center', 
            paddingHorizontal: 24 
          }}>
            <View style={{ 
              backgroundColor: '#FAF5EF', 
              borderRadius: 32, 
              padding: 32, 
              width: '100%', 
              maxWidth: 400, 
              gap: 32, 
              alignItems: 'center', 
              paddingTop: 40, 
              borderWidth: 1, 
              borderColor: '#B76E7930' 
            }}>
              <Text
                style={{ 
                  fontFamily: "PlayfairDisplay_700Bold", 
                  fontSize: 24, 
                  fontWeight: 'bold', 
                  color: '#4A1560', 
                  textAlign: 'center' 
                }}
              >
                Before we start, let's be clear.
              </Text>

              <View style={{ gap: 20, width: '100%' }}>
                {TRUST_STATEMENTS.map((statement, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                    <View
                      style={{ 
                        width: 32, 
                        height: 32, 
                        borderRadius: 16, 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        marginTop: 2, 
                        backgroundColor: "#B76E7920" 
                      }}
                    >
                      <MaterialIcons
                        name="check-circle"
                        size={24}
                        color="#B76E79"
                      />
                    </View>
                    <Text style={{ 
                      fontFamily: "DMSans_400Regular", 
                      fontSize: 16, 
                      color: '#4A1560', 
                      flex: 1, 
                      lineHeight: 24 
                    }}>
                      {statement}
                    </Text>
                  </View>
                ))}
              </View>

              <Text style={{ 
                fontFamily: "DancingScript_400Regular", 
                textAlign: 'center', 
                fontSize: 20, 
                color: '#B76E79', 
                lineHeight: 28 
              }}>
                Your money. Your clarity. Your pace.
              </Text>

              <Pressable
                onPress={() => setShowTrustPopup(false)}
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                    width: '100%',
                    borderRadius: 16,
                    overflow: 'hidden'
                  },
                ]}
              >
                <LinearGradient
                  colors={PLUSH_GRADIENT}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ width: '100%', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 }}
                >
                  <Text style={{ 
                    fontFamily: "DMSans_500Medium", 
                    color: '#FAF5EF', 
                    fontWeight: '600', 
                    fontSize: 16 
                  }}>
                    I'm in 🌸
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </ScreenContainer>
  );
}
