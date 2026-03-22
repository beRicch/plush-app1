import {
  ScrollView,
  View,
  Text,
  Pressable,
  FlatList,
  Animated,
  Easing,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState, useEffect, useRef } from "react";
import { AnimatedPressable, useCountUp, Toast } from "@/components/plush-animations";
import { TooltipModal } from "@/components/plush-tooltip";
import Svg, { Circle } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { GradientAvatar, PLUSH_GRADIENT, PROGRESS_GRADIENT } from "@/components/plush-gradient";

// ─── Brand colours ───────────────────────────────────────────────
const ROSE_GOLD = "#B76E79";
const DEEP_PLUM = "#4A1560";
const CREAM = "#FAF5EF";
const BLUSH_PINK = "#F4B8C1";

// ─── Mock data ───────────────────────────────────────────────────
const MOCK_USER_NAME = "Zainab";
const MOCK_INCOME = 320000;
const MOCK_SPENT = 180000;
const MOCK_SAVED = 140000;
const MOCK_PLUSH_SCORE = 74; // renamed from savings % for clarity
const MOCK_SAFE_TO_SPEND = 45000;
const MOCK_ALLOWANCE = 60000;

const AFFIRMATIONS = [
  "Your money is getting clearer, sis. Keep going. 💜",
  "You're building wealth quietly and peacefully. 🌸",
  "Every naira you save is a win, celebrate it. ✨",
  "Your future self is grateful for today's choices. 💰",
  "Soft life is intentional spending, not no spending. 🧘‍♀️",
  "You deserve financial peace and you're creating it. 🌿",
];

const SPENDING_CATEGORIES = [
  { name: "Beauty", icon: "💄", amount: 45000, percentage: 25 },
  { name: "Food", icon: "🍽️", amount: 38000, percentage: 21 },
  { name: "Transport", icon: "🚗", amount: 32000, percentage: 18 },
  { name: "Ajo", icon: "💰", amount: 28000, percentage: 15 },
];

// FIX 8 — Bill status config: green ≥7d, amber 3–6d, rose gold 1–2d
const UPCOMING_BILLS = [
  { name: "Electricity", amount: 8500, daysUntilDue: 12, status: "green" },
  { name: "Internet", amount: 5000, daysUntilDue: 5, status: "amber" },
  { name: "Rent", amount: 150000, daysUntilDue: 2, status: "roseGold" },
];

const BILL_STATUS_CONFIG = {
  green: { color: "#4CAF50", icon: "check-circle" as const, label: "On time" },
  amber: { color: "#F59E0B", icon: "warning" as const, label: "Due soon" },
  roseGold: { color: ROSE_GOLD, icon: "notifications-active" as const, label: "Due very soon" },
};

const RITUALS = {
  sunday: { name: "Soft Audit", description: "Review this week's spending" },
  wednesday: { name: "Naira Wins", description: "Celebrate your money moves" },
  friday: { name: "Plush Vision", description: "Plan your weekend spending" },
};

// ─── Animated Score Ring ─────────────────────────────────────────
const RING_SIZE = 72; // Reduced size from 88
const STROKE_WIDTH = 8;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function ScoreRing({ score }: { score: number }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: score / 100,
      duration: 600,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [score]);

  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, 0],
  });

  // Animated.Value can't be passed directly to SVG strokeDashoffset without
  // a workaround — we use a JS-driven approach via state for cross-platform.
  const [offset, setOffset] = useState(CIRCUMFERENCE);
  useEffect(() => {
    const id = progress.addListener(({ value }) => {
      setOffset(CIRCUMFERENCE * (1 - value));
    });
    return () => progress.removeListener(id);
  }, []);

  return (
    <Svg width={RING_SIZE} height={RING_SIZE}>
      {/* Track */}
      <Circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={RADIUS}
        stroke={BLUSH_PINK}
        strokeWidth={STROKE_WIDTH}
        fill="transparent"
        opacity={0.4}
      />
      {/* Progress */}
      <Circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={RADIUS}
        stroke={ROSE_GOLD}
        strokeWidth={STROKE_WIDTH}
        fill="transparent"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        strokeLinecap="round"
        rotation="-90"
        origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
      />
    </Svg>
  );
}

// ─── Branded Components ──────────────────────────────────────────
// FIX 8 — Branded user initials avatar (gradient)
function BrandedAvatar({ name, size = 40 }: { name: string; size?: number }) {
  return <GradientAvatar name={name} size={size} borderColor={ROSE_GOLD} />;
}

// FIX 6 — Soft custom tick for bills
function SoftTick({ size = 22, iconSize = 14 }: { size?: number; iconSize?: number }) {
  return (
    <View
      style={{
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: BLUSH_PINK, alignItems: "center", justifyContent: "center",
      }}
    >
      <MaterialIcons name="check" size={iconSize} color={ROSE_GOLD} />
    </View>
  );
}

// ─── Floral SVG accent for quote card ────────────────────────────
function FloralAccent() {
  // Minimal hibiscus-inspired SVG at 20% opacity
  return (
    <Svg width={60} height={60} style={{ position: "absolute", bottom: 8, right: 8, opacity: 0.2 }}>
      <Circle cx={30} cy={30} r={10} fill={DEEP_PLUM} />
      <Circle cx={30} cy={10} r={8} fill={DEEP_PLUM} />
      <Circle cx={30} cy={50} r={8} fill={DEEP_PLUM} />
      <Circle cx={10} cy={30} r={8} fill={DEEP_PLUM} />
      <Circle cx={50} cy={30} r={8} fill={DEEP_PLUM} />
      <Circle cx={16} cy={16} r={7} fill={DEEP_PLUM} />
      <Circle cx={44} cy={16} r={7} fill={DEEP_PLUM} />
      <Circle cx={16} cy={44} r={7} fill={DEEP_PLUM} />
      <Circle cx={44} cy={44} r={7} fill={DEEP_PLUM} />
    </Svg>
  );
}

// ─── Main screen ─────────────────────────────────────────────────
export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();

  const [todayRitual, setTodayRitual] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [affirmationIndex, setAffirmationIndex] = useState(0);

  // FIX 2 — Plush Score animate count
  const animatedScore = useCountUp(MOCK_PLUSH_SCORE, 900);

  useEffect(() => {
    const today = new Date().getDay();
    if (today === 0) setTodayRitual("sunday");
    else if (today === 3) setTodayRitual("wednesday");
    else if (today === 5) setTodayRitual("friday");

    // Auto-rotate affirmations every 4 seconds
    const timer = setInterval(() => {
      setAffirmationIndex((prev) => (prev + 1) % AFFIRMATIONS.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  // FIX 3 — Greeting helpers
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  const getDateString = () =>
    new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  return (
    <ScreenContainer className="bg-background">
      {/* Plush Score first-time tooltip */}
      <TooltipModal
        storageKey="plush_score"
        title="Your Plush Score 💜"
        message="This is your financial wellness number. It updates as you track, save, and complete rituals."
      />

      {/* Rose Gold log-success toast */}
      <Toast
        visible={showToast}
        message="Logged. Your vault sees it. 💜"
        onHide={() => setShowToast(false)}
      />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ gap: 24, paddingBottom: 120, paddingTop: 24 }}>

          {/* ─── HEADER ─────────────────────────────────────────── */}
          <View style={{ paddingHorizontal: 24 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              {/* FIX 1 — Merged greeting line + emoji */}
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: "PlayfairDisplay_700Bold",
                    fontSize: 19,
                    color: DEEP_PLUM,
                    fontWeight: "bold",
                  }}
                >
                  {getGreeting()}, {MOCK_USER_NAME}.{"\n"}
                  <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 13, fontWeight: "normal", color: `${DEEP_PLUM}A6` }}>
                    Your vault is ready.
                  </Text>
                </Text>
                <Text
                  style={{
                    fontFamily: "DMSans_400Regular",
                    fontSize: 13,
                    color: `${DEEP_PLUM}8C`, // 55% opacity
                    marginTop: 0, // No space between greeting and date
                  }}
                >
                  {getDateString()}
                </Text>
              </View>


              <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
                {/* Plush Score Badge positioned in the header */}
                <Pressable
                  onPress={() => router.replace("/plush-score")}
                  style={{ borderRadius: 16, borderWidth: 1.5, borderColor: ROSE_GOLD, overflow: "hidden" }}
                >
                  <LinearGradient
                    colors={PLUSH_GRADIENT}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, gap: 4 }}
                  >
                    <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 16, color: CREAM }}>
                      {animatedScore}
                    </Text>
                    <Text style={{ fontSize: 12 }}>🌸</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          </View>

          {/* ─── VAULT OVERVIEW CARD ────────────────────────────── */}
          <View
            style={{
              paddingHorizontal: 24,
              marginTop: -16,
              shadowColor: DEEP_PLUM,
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.15,
              shadowRadius: 24,
              elevation: 8,
              marginBottom: 8,
            }}
          >
            <LinearGradient
              colors={["#4A1560", "#6B2080", "#8B2FA0", "#6A1B7A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 16,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: `${ROSE_GOLD}30`,
              }}
            >
              <View style={{ padding: 24, paddingBottom: 24 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 12, color: `${CREAM}B3`, letterSpacing: 0.8 }}>
                    Safe to spend this week
                  </Text>
                  <Text style={{ fontSize: 14 }}>🌿</Text>
                </View>

                {/* Hero Number */}
                <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 23, color: "#fff", lineHeight: 28, marginBottom: 6 }}>
                  ₦{(MOCK_SAFE_TO_SPEND / 1000).toFixed(0)}k
                </Text>

                {/* Progress Bar (Visualizing allowance left) */}
                <View style={{ marginTop: 8, marginBottom: 20, height: 6, backgroundColor: `${CREAM}4D`, borderRadius: 100, overflow: "hidden" }}>
                  <LinearGradient
                    colors={PROGRESS_GRADIENT}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ width: "75%", height: "100%", borderRadius: 100 }}
                  />
                </View>

                {/* Secondary stats */}
                <View style={{ flexDirection: "row", gap: 32 }}>
                  <View>
                    <Text style={{ fontFamily: "DMSans_400Regular", color: `${CREAM}80`, fontSize: 11, marginBottom: 4 }}>Weekly Allowance</Text>
                    <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 14, color: "#fff" }}>₦{(MOCK_ALLOWANCE / 1000).toFixed(0)}k</Text>
                  </View>
                  <View>
                    <Text style={{ fontFamily: "DMSans_400Regular", color: `${CREAM}80`, fontSize: 11, marginBottom: 4 }}>Total Saved</Text>
                    <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 14, color: "#fff" }}>₦{(MOCK_SAVED / 1000).toFixed(0)}k</Text>
                  </View>
                </View>

                {/* FIX 4 — Affirmation line */}
                <View style={{ height: 1, backgroundColor: `${CREAM}26`, marginVertical: 12 }} />
                <Text
                  style={{
                    fontFamily: "DancingScript_400Regular",
                    fontSize: 12,
                    color: "#FAF5EF",
                    textAlign: "center",
                    opacity: 0.9,
                    fontStyle: "italic",
                  }}
                >
                  "You deserve financial peace and you're creating it. 🌸"
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* ─── LOG & RITUAL ACTION PILL SELECTOR ──────────────────────── */}
          <View style={{ paddingHorizontal: 24, marginTop: 2 }}>
            <View
              style={{
                flexDirection: "row",
                backgroundColor: colors.surface,
                borderRadius: 18,
                padding: 4,
                gap: 4,
              }}
            >
              {/* View Insights — Custom background style */}
              <Pressable
                onPress={() => router.replace("/insights")}
                style={{
                  flex: 1,
                  height: 52,
                  borderRadius: 14,
                  backgroundColor: "#E8DFE5", // Sourced from uploaded image
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  gap: 6,
                }}
              >
                <Text style={{ fontSize: 14 }}>✨</Text>
                <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 15, color: DEEP_PLUM }}>
                  View Insights
                </Text>
              </Pressable>

              {/* Begin Ritual — Active gradient style */}
              <Pressable
                onPress={() => router.replace("/rituals-hub")}
                style={{ flex: 1, borderRadius: 14, overflow: "hidden" }}
              >
                <LinearGradient
                  colors={PLUSH_GRADIENT}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    height: 52,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    gap: 6,
                  }}
                >
                  <Text style={{ fontSize: 14 }}>🌿</Text>
                  <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 15, color: CREAM }}>
                    Begin Ritual
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>

          {/* ─── FIX 6 — TOP SPENDING CATEGORY CARDS ───────────── */}
          <View style={{ paddingHorizontal: 24, gap: 12 }}>
            <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 16, color: colors.foreground }}>
              Top Spending
            </Text>
            <FlatList
              data={SPENDING_CATEGORIES}
              horizontal
              scrollEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => item.name === "Ajo" && router.replace("/ajo-circle")}
                  style={{
                    borderRadius: 16,
                    padding: 12,
                    marginRight: 12,
                    minWidth: 105,
                    alignItems: "center",
                    gap: 2,
                    backgroundColor: "#F2E4E1",
                    shadowColor: DEEP_PLUM,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.08,
                    shadowRadius: 16,
                    elevation: 3,
                  }}
                >
                  <Text style={{ fontSize: 20, textAlign: "center" }}>{item.icon}</Text>
                  <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 13, color: `${DEEP_PLUM}A6`, textAlign: "center", marginBottom: 2 }}>
                    {item.name}
                  </Text>
                  <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 15, color: DEEP_PLUM }}>
                    ₦{(item.amount / 1000).toFixed(0)}k
                  </Text>
                  <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 12, color: ROSE_GOLD }}>
                    {item.percentage}%
                  </Text>
                </Pressable>
              )}
            />
          </View>


          {/* ─── FIX 8 — BILLS COMING UP CARDS ──────────────────── */}
          <View style={{ paddingHorizontal: 24, gap: 12 }}>
            <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 16, color: colors.foreground }}>
              Bills Coming Up 💸
            </Text>
            <FlatList
              data={UPCOMING_BILLS}
              horizontal
              scrollEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => {
                const cfg = BILL_STATUS_CONFIG[item.status as keyof typeof BILL_STATUS_CONFIG];
                return (
                  <View
                    style={{
                      borderRadius: 12,
                      padding: 12,
                      marginRight: 10,
                      minWidth: 140,
                      borderLeftWidth: 5,
                      borderLeftColor: cfg.color,
                      backgroundColor: "#F2E4E1",
                      borderWidth: 1,
                      borderColor: `${DEEP_PLUM}10`,
                      shadowColor: cfg.color,
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: 0.12,
                      shadowRadius: 10,
                      elevation: 2,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "DMSans_500Medium",
                        fontSize: 13,
                        color: DEEP_PLUM,
                        marginBottom: 4,
                      }}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "PlayfairDisplay_700Bold",
                        fontSize: 14,
                        color: DEEP_PLUM,
                        marginBottom: 8,
                      }}
                    >
                      ₦{(item.amount / 1000).toFixed(0)}k
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      {/* FIX 6 — Soft custom tick for Electricity bill */}
                      {item.name === "Electricity" ? (
                        <SoftTick />
                      ) : (
                        <MaterialIcons name={cfg.icon} size={14} color={cfg.color} />
                      )}
                      <Text
                        style={{
                          fontFamily: "DMSans_400Regular",
                          fontSize: 12,
                          color: cfg.color,
                        }}
                      >
                        {item.daysUntilDue} days
                      </Text>
                    </View>
                  </View>
                );
              }}
            />
          </View>


          {/* ─── LATEST FROM COMMUNITY ──────────────────────────── */}
          <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
            <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 16, color: colors.foreground, marginBottom: 12 }}>
              Latest from the Community 💕
            </Text>
            <Pressable
              onPress={() => router.push("/(tabs)/community")}
              style={{
                backgroundColor: CREAM,
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: `${DEEP_PLUM}10`,
                shadowColor: DEEP_PLUM,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 1,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <GradientAvatar name="Sarah Williams" size={28} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 13, color: DEEP_PLUM }}>
                    Sarah W.
                  </Text>
                  <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 11, color: `${DEEP_PLUM}80` }}>
                    2h ago
                  </Text>
                </View>
                <View style={{ backgroundColor: `${ROSE_GOLD}20`, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                  <Text style={{ fontSize: 10, fontFamily: "DMSans_700Bold", color: ROSE_GOLD, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Goal Met 🎉
                  </Text>
                </View>
              </View>
              <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 14, color: DEEP_PLUM, lineHeight: 20 }}>
                "Just hit my first 100k milestone for the Detty December fund! Consistently prioritizing my peace of mind! Soft life pending..."
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
