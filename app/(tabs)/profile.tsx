import {
  ScrollView,
  View,
  Text,
  Pressable,
  Modal,
  Alert,
  Share,
  Animated,
  Easing,
  Platform,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useThemeContext } from "@/lib/theme-provider";
import { useState, useEffect, useRef } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Api from "@/lib/_core/api";
import * as Auth from "@/lib/_core/auth";
import * as Linking from "expo-linking";
import Svg, { Circle, Polyline } from "react-native-svg";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { trpc } from "@/lib/trpc";
import { GradientAvatar, GradientBadge, PLUSH_GRADIENT } from "@/components/plush-gradient";

// ─── Brand colours ───────────────────────────────────────────────
const ROSE_GOLD  = "#B76E79";
const DEEP_PLUM  = "#4A1560";
const CREAM      = "#FAF5EF";
const BLUSH_PINK = "#F4B8C1";



// ─── FIX 1 — Soft tick in Blush Pink circle ──────────────────────
function SoftTick() {
  return (
    <View
      style={{
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: BLUSH_PINK,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg width={14} height={10}>
        <Polyline
          points="2,5 5.5,8.5 12,2"
          fill="none"
          stroke={ROSE_GOLD}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

// ─── FIX 3 — Compact tier badge pill ─────────────────────────────
function TierBadge({ tier }: { tier: string }) {
  if (tier === "Society") {
    return <GradientBadge label="👑 Plush Society" />;
  }
  if (tier === "AI") {
    return (
      <View style={{ backgroundColor: `${ROSE_GOLD}33`, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 }}>
        <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 10, color: ROSE_GOLD }}>💜 Plush AI</Text>
      </View>
    );
  }
  return (
    <View style={{ backgroundColor: BLUSH_PINK, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 }}>
      <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 10, color: DEEP_PLUM }}>🌸 Plush Member</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const colors = useColors();
  const { data: user } = trpc.auth.me.useQuery();
  const [localUser, setLocalUser] = useState<Auth.User | null>(null);
  const { colorScheme, setColorScheme } = useThemeContext();
  const [showSettings, setShowSettings] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    ritualReminders: true,
    billAlerts: true,
    communityActivity: false,
    ajoUpdates: true,
    weeklyReport: true,
  });
  const [privacySettings, setPrivacySettings] = useState({
    biometric: true,
    appLock: false,
  });

  const deleteAccountMutation = trpc.plush.profile.deleteAccount.useMutation();

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account 🌸",
      "Are you sure, sis? This will permanently delete your vault, expenses, and all your progress. This cannot be undone.",
      [
        { text: "Keep My Vault", style: "cancel" },
        { 
          text: "Delete permanently", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccountMutation.mutateAsync();
              await Auth.removeSessionToken();
              await Auth.clearUserInfo();
              router.replace("/");
              Alert.alert("Account Deleted", "Your data has been permanently removed. We'll miss you! 🌸");
            } catch (error) {
              console.error("Failed to delete account:", error);
              Alert.alert("Error", "Something went wrong. Please try again later.");
            }
          }
        },
      ]
    );
  };
   
  useEffect(() => {
    if (Platform.OS === "web") return;
    Auth.getUserInfo()
      .then((cached) => setLocalUser(cached))
      .catch((error) => console.error("Failed to load cached user:", error));
  }, []);

  const handleShare = async (text: string) => {
    try {
      await Share.share({ message: text, title: "Plush - Financial Wellness" });
    } catch (error) {
      console.error(error);
    }
  };

  const handleCopyReferralCode = () => {
    Alert.alert("Copied!", "Your referral code SOFT-AMARA has been copied to clipboard");
  };

  // FIX 10 — Settings icon map (outline, 22px, Deep Plum 70%)
  const SETTINGS_ROWS = [
    { icon: "notifications-none" as const, label: "Notifications" },
    { icon: "lock-outline" as const,       label: "Privacy & Security" },
    { icon: "palette" as const,            label: "Personalization" },
    { icon: "file-download" as const,      label: "Data & Export" },
    { icon: "help-outline" as const,       label: "Support" },
  ];

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View style={{ gap: 24, paddingBottom: 32 }}>

          {/* ─── PROFILE HEADER ─────────────────────────────────── */}
          <View style={{ paddingHorizontal: 24, paddingTop: 16, gap: 16, alignItems: "center" }}>
            {/* FIX 8 — Branded user initials avatar (gradient) */}
            <GradientAvatar name={user?.name || localUser?.name || "Amara Okonkwo"} size={96} borderColor={ROSE_GOLD} />

            <View style={{ alignItems: "center", gap: 4 }}>
              <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 24, color: colors.foreground }}>
                {user?.name || localUser?.name || "Amara Okonkwo"}
              </Text>
              {/* FIX 9 — Archetype label color (80% opacity) */}
              <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 13, color: `${DEEP_PLUM}CC` }}>
                {user?.moneyPersonality || "The Soft Strategist"} ✨
              </Text>
            </View>

            {/* FIX 3 — Compact tier badge */}
            <TierBadge tier="Member" />
            {/* FIX 9 — Member since date color (55% opacity) */}
            <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 12, color: `${DEEP_PLUM}8C` }}>
              Member since March 2024
            </Text>
          </View>



          {/* ─── MY VAULT SUMMARY ───────────────────────────────── */}
          <View style={{ paddingHorizontal: 24, gap: 12 }}>
            <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 18, color: colors.foreground }}>
              My Vault Summary
            </Text>
            <View style={{ gap: 12 }}>
              {[
                { label: "Tracked This Month", value: "₦81,000",  icon: "trending-down" as const, trend: "neutral" },
                { label: "Total Saved",         value: "₦245,000", icon: "trending-up"   as const, trend: "up" },
                { label: "Longest Streak",      value: "12 weeks", icon: "local-fire-department" as const, trend: "up" },
                { label: "Community Posts",     value: "24",       icon: "chat-bubble"   as const, trend: "neutral" },
              ].map((stat, idx) => (
                <View
                  key={idx}
                  style={{
                    borderRadius: 16, padding: 16, flexDirection: "row",
                    alignItems: "center", justifyContent: "space-between",
                    backgroundColor: colors.surface,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                    <MaterialIcons name={stat.icon} size={16} color={`${DEEP_PLUM}B3`} />
                    <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 13, color: colors.muted }}>
                      {stat.label}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 14, color: colors.foreground }}>
                      {stat.value}
                    </Text>
                    {/* FIX 10 — Trend Arrows */}
                    {stat.trend === "up" ? (
                      <Text style={{ fontSize: 14, color: ROSE_GOLD }}>↗</Text>
                    ) : stat.trend === "neutral" ? (
                      <Text style={{ fontSize: 14, color: `${DEEP_PLUM}66` }}>-</Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* ─── REFERRAL PROGRAM ───────────────────────────────── */}
          <View style={{ paddingHorizontal: 24 }}>
            <Pressable
              style={{
                borderRadius: 20, padding: 24, gap: 16,
                backgroundColor: `${DEEP_PLUM}1A`,
              }}
            >
              <View style={{ gap: 8 }}>
                <Text style={{ fontSize: 24 }}>🌸</Text>
                <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 18, color: colors.foreground }}>
                  Invite Your Girls
                </Text>
                <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 14, color: colors.muted }}>
                  Every girl you invite earns you ₦500 vault credit
                </Text>
              </View>

              <View style={{ gap: 12 }}>
                <View style={{ backgroundColor: colors.background, borderRadius: 12, padding: 12, alignItems: "center", gap: 4 }}>
                  <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 12, color: colors.muted }}>Your Referral Code</Text>
                  <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 22, color: DEEP_PLUM }}>SOFT-AMARA</Text>
                </View>

                {/* FIX 12 — Buttons: 52px height, 16px radius */}
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Pressable
                    onPress={handleCopyReferralCode}
                    style={{ flex: 1, height: 52, borderRadius: 16, overflow: "hidden" }}
                  >
                    <LinearGradient
                      colors={PLUSH_GRADIENT}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        flex: 1, alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 15, color: CREAM }}>Copy Code</Text>
                    </LinearGradient>
                  </Pressable>
                  <Pressable
                    onPress={() => handleShare("Join me on Plush! Use code SOFT-AMARA to get ₦500 off 🌸")}
                    style={{
                      flex: 1, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center",
                      borderWidth: 1.5, borderColor: DEEP_PLUM,
                    }}
                  >
                    <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 15, color: DEEP_PLUM }}>Share</Text>
                  </Pressable>
                </View>
              </View>

              <View style={{ gap: 8, paddingTop: 16, borderTopWidth: 1, borderTopColor: `${DEEP_PLUM}20` }}>
                <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 14, color: colors.foreground }}>
                  You've invited 3 girls. 2 joined. ₦1,000 credit earned 💜
                </Text>
                <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 12, color: colors.muted }}>
                  Top referrer this month: Chiamaka — 12 girls! 👑
                </Text>
              </View>
            </Pressable>
          </View>

          {/* ─── FIX 1 — SUBSCRIPTION (soft ticks) ─────────────── */}
          <View style={{ paddingHorizontal: 24, gap: 12 }}>
            <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 18, color: colors.foreground }}>
              Your Subscription
            </Text>

            <Pressable
              onPress={() => setShowSubscription(true)}
              style={{ borderRadius: 16, padding: 16, gap: 12, backgroundColor: colors.surface }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ gap: 4 }}>
                  <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 14, color: colors.foreground }}>
                    Plush Member
                  </Text>
                  <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 12, color: colors.muted }}>₦1,200/month</Text>
                </View>
                <SoftTick />
              </View>

              <View style={{ gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
                <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 12, color: colors.foreground }}>Includes:</Text>
                {[
                  "Unlimited expense logging",
                  "All 8 rituals + streak system",
                  "Community full access",
                ].map((feature, idx) => (
                  <View key={idx} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <SoftTick />
                    <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 12, color: colors.muted }}>{feature}</Text>
                  </View>
                ))}
              </View>

              {/* FIX 12 — Primary CTA button (gradient) */}
              <Pressable
                onPress={() => router.push("/onboarding/paywall?from=profile")}
                style={{ borderRadius: 16, overflow: "hidden", marginTop: 8 }}
              >
                <LinearGradient
                  colors={PLUSH_GRADIENT}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ height: 52, alignItems: "center", justifyContent: "center" }}
                >
                  <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 15, color: CREAM }}>Upgrade to Plush AI 💜</Text>
                </LinearGradient>
              </Pressable>
            </Pressable>
          </View>

          {/* ─── FIX 10 — SETTINGS ──────────────────────────────── */}
          <View style={{ paddingHorizontal: 24, gap: 12 }}>
            <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 18, color: colors.foreground }}>
              Settings
            </Text>

            <View
              style={{ borderRadius: 16, padding: 16, gap: 4, backgroundColor: colors.surface }}
            >
              {SETTINGS_ROWS.map((row, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => setShowSettings(true)}
                  style={{
                    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    {/* FIX 10 — outline stroke icon, 22px, Deep Plum 70% */}
                    <MaterialIcons name={row.icon} size={22} color={`${DEEP_PLUM}B3`} />
                    <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 14, color: colors.foreground }}>
                      {row.label}
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={18} color={`${DEEP_PLUM}59`} />
                </Pressable>
              ))}

              {/* Delete Account row */}
              <Pressable 
                onPress={handleDeleteAccount}
                style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12 }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <MaterialIcons name="delete-outline" size={22} color={`${DEEP_PLUM}B3`} />
                  <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 14, color: colors.foreground }}>
                    Delete Account
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={18} color={`${DEEP_PLUM}59`} />
              </Pressable>
            </View>
          </View>

          {/* ─── FIX 6 — LOGOUT (text-only) ─────────────────────── */}
          <View style={{ paddingHorizontal: 24, gap: 8, paddingBottom: 24 }}>
            <Pressable
              onPress={() => {
                Alert.alert("Logout", "Are you sure you want to logout?", [
                  { text: "Cancel", style: "cancel" },
                  { 
                    text: "Logout", 
                    style: "destructive",
                    onPress: async () => {
                      try {
                        await Api.logout();
                      } catch (error) {
                        console.warn("Logout API failed", error);
                      }
                      await Auth.removeSessionToken();
                      await Auth.clearUserInfo();
                      router.replace("/");
                    }
                  },
                ]);
              }}
              style={{ marginTop: 32, alignItems: "center" }}
            >
              <Text
                style={{
                  fontFamily: "DMSans_400Regular",
                  fontSize: 14,
                  color: `${DEEP_PLUM}73`, 
                }}
              >
                Log out
              </Text>
            </Pressable>
            <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 12, color: colors.muted, textAlign: "center" }}>
              Plush v1.0.0 • Build 2024.03
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* ─── SETTINGS MODAL ─────────────────────────────────────── */}
      <Modal visible={showSettings} transparent animationType="slide">
        <ScreenContainer className="bg-background">
          <View style={{ flex: 1, gap: 16, paddingHorizontal: 24, paddingTop: 24 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 20, color: colors.foreground }}>Settings</Text>
              <Pressable onPress={() => setShowSettings(false)}>
                <MaterialIcons name="close" size={24} color={colors.foreground} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* NOTIFICATIONS */}
              <View style={{ gap: 12, marginBottom: 24 }}>
                <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 14, color: colors.foreground }}>Notifications</Text>
                {[
                  { key: "ritualReminders",   label: "Ritual Reminders" },
                  { key: "billAlerts",        label: "Bill Due Alerts" },
                  { key: "communityActivity", label: "Community Activity" },
                  { key: "ajoUpdates",        label: "Ajo Circle Updates" },
                  { key: "weeklyReport",      label: "Weekly Vault Report" },
                ].map((item) => (
                  <View
                    key={item.key}
                    style={{
                      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                      padding: 12, borderRadius: 12, backgroundColor: colors.surface,
                    }}
                  >
                    <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 14, color: colors.foreground }}>
                      {item.label}
                    </Text>
                    <Pressable
                      onPress={() =>
                        setNotificationSettings({
                          ...notificationSettings,
                          [item.key]: !notificationSettings[item.key as keyof typeof notificationSettings],
                        })
                      }
                    >
                      <MaterialIcons
                        name={notificationSettings[item.key as keyof typeof notificationSettings] ? "toggle-on" : "toggle-off"}
                        size={24}
                        color={notificationSettings[item.key as keyof typeof notificationSettings] ? ROSE_GOLD : colors.muted}
                      />
                    </Pressable>
                  </View>
                ))}
              </View>

              {/* PRIVACY */}
              <View style={{ gap: 12, marginBottom: 24 }}>
                <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 14, color: colors.foreground }}>Privacy & Security</Text>
                {[
                  { key: "biometric", label: "Biometric Login (Face ID)" },
                  { key: "appLock",   label: "App Lock PIN" },
                ].map((item) => (
                  <View
                    key={item.key}
                    style={{
                      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                      padding: 12, borderRadius: 12, backgroundColor: colors.surface,
                    }}
                  >
                    <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 14, color: colors.foreground }}>
                      {item.label}
                    </Text>
                    <Pressable
                      onPress={() =>
                        setPrivacySettings({
                          ...privacySettings,
                          [item.key]: !privacySettings[item.key as keyof typeof privacySettings],
                        })
                      }
                    >
                      <MaterialIcons
                        name={privacySettings[item.key as keyof typeof privacySettings] ? "toggle-on" : "toggle-off"}
                        size={24}
                        color={privacySettings[item.key as keyof typeof privacySettings] ? ROSE_GOLD : colors.muted}
                      />
                    </Pressable>
                  </View>
                ))}
              </View>

              {/* PERSONALIZATION */}
              <View style={{ gap: 12, marginBottom: 24 }}>
                <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 14, color: colors.foreground }}>Personalization</Text>

                <View
                  style={{
                    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                    padding: 12, borderRadius: 12, backgroundColor: colors.surface,
                  }}
                >
                  <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 14, color: colors.foreground }}>
                    Theme
                  </Text>

                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Pressable
                      onPress={() => setColorScheme("light")}
                      style={{ borderRadius: 16, overflow: "hidden" }}
                    >
                      {colorScheme === "light" ? (
                        <LinearGradient colors={PLUSH_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                          style={{ paddingVertical: 6, paddingHorizontal: 14 }}>
                          <Text style={{ color: "#FAF5EF", fontFamily: "DMSans_500Medium", fontSize: 12 }}>Light</Text>
                        </LinearGradient>
                      ) : (
                        <View style={{ paddingVertical: 6, paddingHorizontal: 14, backgroundColor: colors.border }}>
                          <Text style={{ color: colors.foreground, fontFamily: "DMSans_500Medium", fontSize: 12 }}>Light</Text>
                        </View>
                      )}
                    </Pressable>

                    <Pressable
                      onPress={() => setColorScheme("dark")}
                      style={{ borderRadius: 16, overflow: "hidden" }}
                    >
                      {colorScheme === "dark" ? (
                        <LinearGradient colors={PLUSH_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                          style={{ paddingVertical: 6, paddingHorizontal: 14 }}>
                          <Text style={{ color: "#FAF5EF", fontFamily: "DMSans_500Medium", fontSize: 12 }}>Dark</Text>
                        </LinearGradient>
                      ) : (
                        <View style={{ paddingVertical: 6, paddingHorizontal: 14, backgroundColor: colors.border }}>
                          <Text style={{ color: colors.foreground, fontFamily: "DMSans_500Medium", fontSize: 12 }}>Dark</Text>
                        </View>
                      )}
                    </Pressable>
                  </View>
                </View>

                {[
                  { label: "Currency",   value: "₦ Naira" },
                  { label: "Week Start", value: "Sunday" },
                  { label: "Language",   value: "English" },
                ].map((item, idx) => (
                  <View
                    key={idx}
                    style={{
                      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                      padding: 12, borderRadius: 12, backgroundColor: colors.surface,
                    }}
                  >
                    <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 14, color: colors.foreground }}>
                      {item.label}
                    </Text>
                    <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 12, color: colors.muted }}>{item.value}</Text>
                  </View>
                ))}
              </View>

              {/* LEGAL */}
              <View style={{ gap: 12, marginBottom: 40 }}>
                <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 14, color: colors.foreground }}>Legal & About</Text>
                {[
                  { label: "Privacy Policy", url: "https://plushapp-qtcs3erk.manus.space/privacy" },
                  { label: "Terms of Service", url: "https://plushapp-qtcs3erk.manus.space/terms" },
                  { label: "Open Source Licenses" },
                ].map((item, idx) => (
                  <Pressable
                    key={idx}
                    onPress={() => item.url && Linking.openURL(item.url)}
                    android_ripple={{ color: `${colors.border}22` }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: 12,
                      borderRadius: 12,
                      backgroundColor: colors.surface,
                    }}
                  >
                    <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 14, color: colors.foreground }}>
                      {item.label}
                    </Text>
                    <MaterialIcons name="chevron-right" size={18} color={`${DEEP_PLUM}59`} />
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        </ScreenContainer>
      </Modal>

      {/* ─── SUBSCRIPTION MODAL ─────────────────────────────────── */}
      <Modal visible={showSubscription} transparent animationType="slide">
        <ScreenContainer className="bg-background">
          <View style={{ flex: 1, gap: 16, paddingHorizontal: 24, paddingTop: 24 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 20, color: colors.foreground }}>
                Upgrade Your Vault
              </Text>
              <Pressable onPress={() => setShowSubscription(false)}>
                <MaterialIcons name="close" size={24} color={colors.foreground} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                {
                  name: "Free",
                  price: "₦0",
                  tier: "Member",
                  features: ["Manual expense entry", "1 savings goal", "Read-only community", "Sunday ritual"],
                  current: false,
                },
                {
                  name: "Plush Member",
                  price: "₦1,200/month",
                  tier: "Member",
                  features: ["Unlimited expenses", "All 8 rituals", "Community posting", "Vault Twins"],
                  current: true,
                },
                {
                  name: "Plush AI",
                  price: "₦3,000/month",
                  tier: "AI",
                  features: ["Screenshot scanning", "Voice entry", "Camera scan", "Ask Plush AI chat"],
                  current: false,
                },
                {
                  name: "Plush Society",
                  price: "₦8,000/month",
                  tier: "Society",
                  features: ["Weekly group calls", "Investment tracker", "Founder access", "Early features"],
                  current: false,
                },
              ].map((tier, idx) => (
                <View
                  key={idx}
                  style={{
                    borderRadius: 16, padding: 16, gap: 12, marginBottom: 12,
                    backgroundColor: tier.current ? `${DEEP_PLUM}1A` : colors.surface,
                    borderWidth: tier.current ? 2 : 0,
                    borderColor: tier.current ? DEEP_PLUM : "transparent",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 14, color: colors.foreground }}>
                      {tier.name}
                    </Text>
                    {tier.current && <SoftTick />}
                  </View>

                  <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 18, color: DEEP_PLUM }}>
                    {tier.price}
                  </Text>

                  <View style={{ gap: 8 }}>
                    {tier.features.map((feature, fidx) => (
                      <View key={fidx} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <SoftTick />
                        <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 13, color: colors.muted }}>
                          {feature}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {!tier.current && (
                    <Pressable
                      onPress={() => {
                        setShowSubscription(false);
                        router.push("/onboarding/paywall?from=profile");
                      }}
                      style={{ borderRadius: 16, overflow: "hidden", marginTop: 8 }}
                    >
                      <LinearGradient
                        colors={PLUSH_GRADIENT}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ height: 52, alignItems: "center", justifyContent: "center" }}
                      >
                        <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 15, color: CREAM }}>Upgrade</Text>
                      </LinearGradient>
                    </Pressable>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        </ScreenContainer>
      </Modal>
    </ScreenContainer>
  );
}
