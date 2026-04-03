import {
  ScrollView,
  View,
  Text,
  Pressable,
  FlatList,
  Animated,
  Easing,
  Platform,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState, useEffect, useRef } from "react";
import { AnimatedPressable, useCountUp, Toast } from "@/components/plush-animations";
import { TooltipModal } from "@/components/plush-tooltip";
import { cn, formatNaira, getArchetypeAffirmation } from "@/lib/utils";
import Svg, { Circle } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { GradientAvatar, PLUSH_GRADIENT, PROGRESS_GRADIENT } from "@/components/plush-gradient";
import { trpc } from "@/lib/trpc";
import * as Auth from "@/lib/_core/auth";

// ─── Brand colours ───────────────────────────────────────────────
const ROSE_GOLD = "#B76E79";
const DEEP_PLUM = "#4A1560";
const CREAM = "#FAF5EF";
const BLUSH_PINK = "#F4B8C1";

// ─── Mock data removed - using real tRPC queries ─────────────────

const AFFIRMATIONS = [
  "Your money is getting clearer, sis. Keep going. 💜",
  "You're building wealth quietly and peacefully. 🌸",
  "Every naira you save is a win, celebrate it. ✨",
  "Your future self is grateful for today's choices. 💰",
  "Soft life is intentional spending, not no spending. 🧘‍♀️",
  "You deserve financial peace and you're creating it. 🌿",
];

const SPENDING_CATEGORIES: any[] = [];

// Mock data removed - using real tRPC queries

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
        strokeDasharray={[CIRCUMFERENCE, CIRCUMFERENCE]}
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
  const { data: user } = trpc.auth.me.useQuery();
  const [localUser, setLocalUser] = useState<Auth.User | null>(null);

  useEffect(() => {
    if (Platform.OS === "web") return;
    Auth.getUserInfo()
      .then((cached) => setLocalUser(cached))
      .catch((error) => console.error("Failed to load cached user:", error));
  }, []);

  // tRPC Queries
  const dashboardQuery = trpc.plush.analytics.dashboard.useQuery();
  const spendingBreakdownQuery = trpc.plush.analytics.spendingBreakdown.useQuery();
  const billsQuery = trpc.plush.bills.list.useQuery();
  const communityQuery = trpc.plush.community.getLatestActivity.useQuery();

  const stats = dashboardQuery.data || {
    safeToSpend: 0,
    totalSaved: 0,
    weeklyAllowance: 0,
    plushScore: 0,
    income: 0,
    spent: 0,
    spentThisWeek: 0,
    savedThisMonth: 0,
  };

  const spentThisWeek = "spentThisWeek" in stats ? stats.spentThisWeek ?? 0 : 0;
  const savedThisMonth = "savedThisMonth" in stats ? stats.savedThisMonth ?? 0 : 0;

  const spendingCategories = spendingBreakdownQuery.data?.map(s => {
    const icons: Record<string, string> = {
      Food: "🍽️",
      Beauty: "💄",
      Transport: "🚗",
      Groceries: "🛒",
      Shopping: "🛍️",
      Utilities: "💡",
      Rent: "🏠",
    };
    return {
      name: s.category,
      icon: icons[s.category] || "✨",
      amount: s.amount,
      percentage: stats.spent > 0 ? Math.round((s.amount / stats.spent) * 100) : 0,
    };
  }) || SPENDING_CATEGORIES;

  const upcomingBills = billsQuery.data || [];
  const latestActivity = communityQuery.data?.[0];

  // Use first word of the user's name, fallback to a warm default
  const displayName = user?.name?.split(" ")[0] ?? localUser?.name?.split(" ")[0] ?? "Queen";

  const [todayRitual, setTodayRitual] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [affirmationIndex, setAffirmationIndex] = useState(0);

  // FIX 2 — Plush Score animate count
  const animatedScore = useCountUp(stats.plushScore || 0, 900);

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

  const getBillStatus = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = Math.max(0, due.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 7) return { status: "green", days: diffDays };
    if (diffDays >= 3) return { status: "amber", days: diffDays };
    return { status: "roseGold", days: diffDays };
  };

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
                  {getGreeting()}, {displayName}.{"\n"}
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
              colors={["#4A1560", "#7D2DA0", "#B76E79"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 24,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.2)",
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
                  {formatNaira(stats.safeToSpend)}
                </Text>

                {/* Progress Bar (Visualizing spent vs allowance) */}
                <View style={{ marginTop: 8, marginBottom: 12, height: 6, backgroundColor: "rgba(250, 245, 239, 0.3)", borderRadius: 100, overflow: "hidden" }}>
                  <LinearGradient
                    colors={PROGRESS_GRADIENT}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ width: `${Math.min(100, (spentThisWeek / (stats.weeklyAllowance || 1)) * 100)}%`, height: "100%", borderRadius: 100 }}
                  />
                </View>

                {/* Overspend Indicator */}
                {spentThisWeek > stats.weeklyAllowance && (
                  <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 11, color: "#F59E0B", marginBottom: 12, textAlign: "center" }}>
                    You've reached your weekly allowance. 💜
                  </Text>
                )}
                {spentThisWeek > stats.weeklyAllowance * 0.8 && spentThisWeek <= stats.weeklyAllowance && (
                   <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 11, color: "#F59E0B", marginBottom: 12, textAlign: "center" }}>
                    Careful, queen! Almost at your limit. ✨
                  </Text>
                )}

                {/* Secondary stats */}
                <View style={{ flexDirection: "row", gap: 32 }}>
                  <View>
                    <Text style={{ fontFamily: "DMSans_400Regular", color: `${CREAM}80`, fontSize: 11, marginBottom: 4 }}>Weekly Allowance</Text>
                    <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 14, color: "#fff" }}>{formatNaira(stats.weeklyAllowance)}</Text>
                  </View>
                  <View>
                    <Text style={{ fontFamily: "DMSans_400Regular", color: `${CREAM}80`, fontSize: 11, marginBottom: 4 }}>Saved (This month)</Text>
                    <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 14, color: "#fff" }}>{formatNaira(savedThisMonth)}</Text>
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
                  "{getArchetypeAffirmation(user?.moneyPersonality)}"
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* ─── LOG & RITUAL ACTION PILL SELECTOR ──────────────────────── */}
          <View style={{ paddingHorizontal: 24, marginTop: 2 }}>
            <View
              style={{
                flexDirection: "row",
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
              data={spendingCategories}
              horizontal
              scrollEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => item.name === "Ajo" && router.replace("/ajo-circle")}
                  style={{
                    borderRadius: 16,
                    padding: 16,
                    marginRight: 12,
                    width: 140,
                    height: 140,
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    backgroundColor: "#EFE6F3",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  <Text style={{ fontSize: 24, textAlign: "center", marginBottom: 2 }}>{item.icon}</Text>
                  <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 13, color: DEEP_PLUM, textAlign: "center", opacity: 0.6 }}>
                    {item.name}
                  </Text>
                  <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 15, color: DEEP_PLUM }}>
                    {formatNaira(item.amount)}
                  </Text>
                  <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 11, color: ROSE_GOLD }}>
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
              data={upcomingBills}
              horizontal
              scrollEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={() => (
                <Text className="text-xs text-muted py-4">No bills due soon. Relax, queen! 🌸</Text>
              )}
              renderItem={({ item }) => {
                const { status, days } = getBillStatus(item.dueDate);
                const cfg = BILL_STATUS_CONFIG[status as keyof typeof BILL_STATUS_CONFIG];
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
                      {formatNaira(item.amount)}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <MaterialIcons name={cfg.icon} size={14} color={cfg.color} />
                      <Text
                        style={{
                          fontFamily: "DMSans_400Regular",
                          fontSize: 12,
                          color: cfg.color,
                        }}
                      >
                        {days} days
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
              onPress={() => router.push("/community")}
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
              {latestActivity ? (
                <>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <GradientAvatar name={latestActivity.userName || "Sister"} size={28} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 13, color: DEEP_PLUM }}>
                        {latestActivity.userName}
                      </Text>
                      <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 11, color: `${DEEP_PLUM}80` }}>
                        {new Date(latestActivity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                    <View style={{ backgroundColor: `${ROSE_GOLD}20`, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                      <Text style={{ fontSize: 10, fontFamily: "DMSans_700Bold", color: ROSE_GOLD, textTransform: "uppercase", letterSpacing: 0.5 }}>
                        {latestActivity.postType} 🎉
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 14, color: DEEP_PLUM, lineHeight: 20 }}>
                    "{latestActivity.content}"
                  </Text>
                </>
              ) : (
                <Text className="text-xs text-muted text-center py-2">Join the conversation with your sisters! 🌸</Text>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
