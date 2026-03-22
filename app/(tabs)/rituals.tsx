import {
  ScrollView,
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  Alert,
  Animated,
  Easing,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState, useRef } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import Svg, { Polyline } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { PLUSH_GRADIENT } from "@/components/plush-gradient";

// ─── Brand colours ───────────────────────────────────────────────
const ROSE_GOLD  = "#B76E79";
const DEEP_PLUM  = "#4A1560";
const CREAM      = "#FAF5EF";
const BLUSH_PINK = "#F4B8C1";

// ─── FIX 1 — Soft tick component ─────────────────────────────────
function SoftTick() {
  return (
    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: BLUSH_PINK, alignItems: "center", justifyContent: "center" }}>
      <Svg width={14} height={10}>
        <Polyline points="2,5 5.5,8.5 12,2" fill="none" stroke={ROSE_GOLD} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}

// Mock data
const RITUALS = [
  { id: "soft-audit",          name: "Soft Audit",                        emoji: "🌅", day: "Sunday",          time: "15 minutes",  description: "Your weekly money check-in, done with love not judgment",            color: "#B76E79", streak: 4 },
  { id: "naira-naming",        name: "Naira Naming Ceremony",             emoji: "💰", day: "When creating a goal", time: "10 minutes", description: "Give your savings a name. Money moves differently with purpose.", color: "#4A1560", streak: 2 },
  { id: "financial-gratitude", name: "First Fruit Financial Gratitude",   emoji: "🕯️", day: "1st of every month",  time: "5 minutes",  description: "Before you plan what goes out, honor what came in",               color: "#F4B8C1", streak: 0 },
  { id: "budget-blessing",     name: "Owambe Budget Blessing",            emoji: "✨", day: "Before any event",    time: "8 minutes",  description: "Show up fully without the post-party regret",                       color: "#B8E6D5", streak: 1 },
  { id: "money-meditation",    name: "Evening Money Meditation",          emoji: "🌙", day: "Daily, optional",     time: "5 minutes",  description: "5 minutes before bed. Your wealth affirmation practice.",          color: "#FAF5EF", streak: 0 },
  { id: "naira-wins",          name: "Naira Wins Wednesday",              emoji: "🎉", day: "Every Wednesday",     time: "3 minutes",  description: "Celebrate your money wins this week",                               color: "#B76E79", streak: 8 },
  { id: "plush-vision",        name: "Plush Vision Friday",               emoji: "🌟", day: "Every Friday",        time: "10 minutes",  description: "Set your soft money intentions for the week ahead",                color: "#F4B8C1", streak: 6 },
  { id: "vault-reset",         name: "Quarterly Vault Reset",             emoji: "🎯", day: "Every 3 months",      time: "20 minutes",  description: "Zoom out, realign, and set your next season's vision",            color: "#4A1560", streak: 0 },
];

const BADGES = [
  { id: "first-ritual",    name: "First Ritual",       emoji: "🌸", unlocked: true  },
  { id: "7-day-streak",    name: "7-Day Streak",        emoji: "💜", unlocked: true  },
  { id: "30-day-soft",     name: "30-Day Soft Life",    emoji: "👑", unlocked: false },
  { id: "first-audit",     name: "First Audit",         emoji: "✨", unlocked: true  },
  { id: "owambe-survived", name: "Owambe Survived",     emoji: "🎉", unlocked: false },
  { id: "ajo-circle",      name: "Ajo Circle",          emoji: "💰", unlocked: true  },
];

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TODAY = new Date().getDay();

export default function RitualsScreen() {
  const colors = useColors();
  const router  = useRouter();
  const [showRitualFlow, setShowRitualFlow]     = useState(false);
  const [selectedRitual, setSelectedRitual]     = useState<typeof RITUALS[0] | null>(null);
  const [ritualStep, setRitualStep]             = useState(1);
  const [ritualResponses, setRitualResponses]   = useState<Record<string, string>>({});
  const [focusedInput, setFocusedInput]         = useState<string | null>(null);

  const todayRitual = RITUALS.find((r) => r.day === "Sunday" && TODAY === 0);

  const handleStartRitual = (ritual: typeof RITUALS[0]) => {
    setSelectedRitual(ritual);
    setShowRitualFlow(true);
    setRitualStep(1);
    setRitualResponses({});
  };

  const handleCompleteRitual = () => {
    Alert.alert("🎉 Ritual Complete!", "You've earned +3 streak points!\n\n🔥 Your streak: 5 weeks in a row, sis!", [
      { text: "Done", onPress: () => { setShowRitualFlow(false); setSelectedRitual(null); setRitualStep(1); } },
    ]);
  };

  // FIX 12 — Primary button: gradient shape
  const primaryBtn = {
    borderRadius: 16,
    overflow: "hidden" as const,
  };
  const primaryBtnText = { fontFamily: "DMSans_500Medium" as const, fontSize: 15, color: CREAM };
  const GradientPrimaryBtn = ({ label, onPress }: { label: string; onPress: () => void }) => (
    <Pressable onPress={onPress} style={primaryBtn}>
      <LinearGradient
        colors={PLUSH_GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ height: 52, alignItems: "center", justifyContent: "center" }}
      >
        <Text style={primaryBtnText}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );

  // FIX 2 — Input border style (base vs focused)
  const inputStyle = (key: string) => ({
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.foreground,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: focusedInput === key ? DEEP_PLUM : BLUSH_PINK,
    shadowColor: focusedInput === key ? DEEP_PLUM : "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: focusedInput === key ? 0.08 : 0,
    shadowRadius: 3,
  });

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ gap: 24, paddingBottom: 32 }}>
          {/* HEADER */}
          <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
            <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 28, color: colors.foreground }}>
              Soft Money Rituals 🕯️
            </Text>
            <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 14, color: colors.muted, marginTop: 4 }}>
              Wealth-building that feels like self-care
            </Text>
          </View>

          {/* ─── FIX 13 — WEEKLY RITUAL CALENDAR ────────────────── */}
          <View style={{ paddingHorizontal: 24 }}>
            {/* FIX 13: sentence case, DM Sans Medium, Deep Plum 60% */}
            <Text
              style={{
                fontFamily: "DMSans_500Medium",
                fontSize: 12,
                color: `${DEEP_PLUM}99`,
                marginBottom: 12,
              }}
            >
              This week
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
              {WEEK_DAYS.map((day, idx) => {
                const isToday  = idx === TODAY;
                const hasRitual = idx === 0 || idx === 3 || idx === 5;
                const dotColors: Record<number, string> = {
                  0: ROSE_GOLD,
                  3: DEEP_PLUM,
                  5: BLUSH_PINK,
                };
                return (
                  <View
                    key={day}
                    style={{
                      flex: 1, alignItems: "center", gap: 8, padding: 8, borderRadius: 12,
                      backgroundColor: isToday ? `${DEEP_PLUM}20` : colors.surface,
                    }}
                  >
                    <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 12, color: isToday ? DEEP_PLUM : colors.muted }}>
                      {day}
                    </Text>
                    {hasRitual && (
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dotColors[idx] }} />
                    )}
                    {!hasRitual && (
                      <Text style={{ fontSize: 16 }}>
                        {idx === 1 || idx === 2 || idx === 4 || idx === 6 ? "🔥" : ""}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          {/* TODAY'S RITUAL HERO CARD */}
          {todayRitual && (
            <View style={{ paddingHorizontal: 24 }}>
              <View style={{ borderRadius: 16, padding: 24, gap: 16, backgroundColor: `${todayRitual.color}20` }}>
                <View style={{ gap: 8 }}>
                  <Text style={{ fontSize: 48 }}>{todayRitual.emoji}</Text>
                  <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 22, color: colors.foreground }}>
                    {todayRitual.name}
                  </Text>
                  <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 12, color: colors.muted }}>
                    {todayRitual.time}
                  </Text>
                </View>
                <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 14, color: colors.foreground, lineHeight: 22 }}>
                  {todayRitual.description}
                </Text>
                <View style={{ gap: 12 }}>
                  <GradientPrimaryBtn label="Begin Ritual" onPress={() => handleStartRitual(todayRitual)} />
                  {/* FIX 7 — streak badge */}
                  <View style={{ alignItems: "center" }}>
                    <View style={{ backgroundColor: BLUSH_PINK, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 4 }}>
                      <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 11, color: DEEP_PLUM }}>
                        🔥 {todayRitual.streak} weeks in a row, sis!
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* ─── THE 8 CORE RITUALS (FIX 7 streak badges) ────────── */}
          <View style={{ paddingHorizontal: 24, gap: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 18, color: colors.foreground }}>
                The 8 Core Rituals
              </Text>
              <Pressable onPress={() => router.replace("/rituals-hub")}>
                <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 14, color: ROSE_GOLD }}>View Hub →</Text>
              </Pressable>
            </View>

            {RITUALS.map((ritual) => (
              <Pressable
                key={ritual.id}
                onPress={() => handleStartRitual(ritual)}
                style={{ borderRadius: 16, padding: 16, gap: 12, backgroundColor: colors.surface }}
              >
                <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, flex: 1 }}>
                    <Text style={{ fontSize: 24 }}>{ritual.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 14, color: colors.foreground }}>
                        {ritual.name}
                      </Text>
                      <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 12, color: colors.muted, marginTop: 2 }}>
                        {ritual.day}
                      </Text>
                    </View>
                  </View>
                  {/* FIX 7 — uniform streak badge */}
                  <View style={{ backgroundColor: BLUSH_PINK, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
                    <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 11, color: DEEP_PLUM }}>
                      🔥 {ritual.streak}
                    </Text>
                  </View>
                </View>

                <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 13, color: colors.muted }}>
                  {ritual.description}
                </Text>

                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 8 }}>
                  <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 12, color: colors.muted }}>{ritual.time}</Text>
                  <MaterialIcons name="chevron-right" size={16} color={colors.muted} />
                </View>
              </Pressable>
            ))}
          </View>

          {/* ─── FIX 11 — STREAK SYSTEM & BADGES ─────────────────── */}
          <View style={{ paddingHorizontal: 24, gap: 16 }}>
            <View style={{ borderRadius: 16, padding: 16, gap: 12, backgroundColor: colors.surface }}>
              <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 18, color: colors.foreground }}>
                🔥 12 rituals completed
              </Text>
              {/* FIX 11 — Updated supporting copy */}
              <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 13, color: `${DEEP_PLUM}A6`, textAlign: "center", lineHeight: 20 }}>
                Your vault has been showing up. Keep the ritual alive. 🌸
              </Text>
            </View>

            {/* BADGES */}
            <View style={{ gap: 8 }}>
              <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 16, color: colors.foreground }}>
                Badges Earned
              </Text>

              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                {BADGES.map((badge) => (
                  <View
                    key={badge.id}
                    style={{ alignItems: "center", gap: 6, opacity: badge.unlocked ? 1 : 0.4 }}
                  >
                    {/* FIX 11 — earned badge: Rose Gold gradient ring, locked: plain grey */}
                    <View
                      style={{
                        width: 68,
                        height: 68,
                        borderRadius: 34,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: badge.unlocked ? `${DEEP_PLUM}1A` : colors.border,
                        borderWidth: badge.unlocked ? 3 : 0,
                        borderColor: badge.unlocked ? ROSE_GOLD : "transparent",
                      }}
                    >
                      <Text style={{ fontSize: 24 }}>{badge.emoji}</Text>
                    </View>
                    <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 11, color: colors.muted, textAlign: "center", width: 64 }}>
                      {badge.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ─── RITUAL FLOW MODAL ──────────────────────────────────── */}
      <Modal visible={showRitualFlow} transparent animationType="slide">
        {selectedRitual && (
          <View style={{ flex: 1, backgroundColor: colors.background }}>
            <ScreenContainer className="bg-background">
              <View style={{ flex: 1 }}>
                {/* Header */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 }}>
                  <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 22, color: colors.foreground, flex: 1 }}>
                    {selectedRitual.emoji} {selectedRitual.name}
                  </Text>
                  <Pressable onPress={() => setShowRitualFlow(false)}>
                    <MaterialIcons name="close" size={24} color={colors.foreground} />
                  </Pressable>
                </View>

                {/* SOFT AUDIT FLOW */}
                {selectedRitual.id === "soft-audit" && (
                  <>
                    {ritualStep === 1 && (
                      <View style={{ flex: 1, paddingHorizontal: 24 }}>
                        {/* FIX 2 — Vertically centred content + Blush Pink bg wash (simulated) */}
                        <View
                          style={{
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 24,
                          }}
                        >
                          <Text style={{ fontSize: 48 }}>🌸</Text>
                          <View
                            style={{
                              borderRadius: 20,
                              padding: 24,
                              backgroundColor: `${BLUSH_PINK}26`,
                              gap: 12,
                            }}
                          >
                            <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 20, color: DEEP_PLUM, textAlign: "center", lineHeight: 28 }}>
                              Grab your favorite drink.{"\n"}Get comfortable.
                            </Text>
                            <Text style={{ fontFamily: "DancingScript_400Regular", fontSize: 18, color: DEEP_PLUM, textAlign: "center", fontStyle: "italic" }}>
                              You're not in trouble. You're just checking in. 🌸
                            </Text>
                          </View>
                        </View>

                        {/* FIX 2 — Next pinned to bottom */}
                        <View style={{ paddingBottom: 24 }}>
                          <GradientPrimaryBtn label="I'm Ready" onPress={() => setRitualStep(2)} />
                        </View>
                      </View>
                    )}

                    {ritualStep === 2 && (
                      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, gap: 16, paddingBottom: 24 }}>
                        <View style={{ borderRadius: 16, padding: 16, gap: 12, backgroundColor: colors.surface }}>
                          <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 14, color: colors.foreground }}>
                            This Week's Spending
                          </Text>
                          <View style={{ gap: 8 }}>
                            {[
                              { label: "Food & Dining", value: "₦8,500" },
                              { label: "Transport",     value: "₦3,200" },
                              { label: "Shopping",      value: "₦12,000" },
                            ].map((row, i) => (
                              <View key={i} style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 13, color: colors.muted }}>{row.label}</Text>
                                <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 13, color: colors.foreground }}>{row.value}</Text>
                              </View>
                            ))}
                            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
                              <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 13, color: colors.foreground }}>Total</Text>
                              <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 13, color: colors.foreground }}>₦23,700</Text>
                            </View>
                          </View>
                        </View>
                        <GradientPrimaryBtn label="Next" onPress={() => setRitualStep(3)} />
                      </ScrollView>
                    )}

                    {ritualStep === 3 && (
                      <View style={{ flex: 1, paddingHorizontal: 24 }}>
                        <ScrollView contentContainerStyle={{ flexGrow: 1, gap: 16 }} showsVerticalScrollIndicator={false}>
                          {/* FIX 2 — Blush Pink gradient wash (simulated with background tint) */}
                          <View style={{ gap: 16 }}>
                            {[
                              { key: "q1", label: "What spending this week felt good and aligned?", placeholder: "e.g. My skincare routine 🧴" },
                              { key: "q2", label: "What purchase made you wince a little?",          placeholder: "e.g. That impulse Shein haul 😅" },
                              { key: "q3", label: "One thing I want to do differently next week:",   placeholder: "e.g. Set a daily spending limit 💪" },
                            ].map(({ key, label, placeholder }) => (
                              <View key={key}>
                                <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 14, color: colors.foreground, marginBottom: 8 }}>
                                  {label}
                                </Text>
                                <TextInput
                                  placeholder={placeholder}
                                  placeholderTextColor={colors.muted}
                                  value={ritualResponses[key] || ""}
                                  onChangeText={(text) => setRitualResponses({ ...ritualResponses, [key]: text })}
                                  onFocus={() => setFocusedInput(key)}
                                  onBlur={() => setFocusedInput(null)}
                                  style={inputStyle(key)}
                                  multiline
                                />
                              </View>
                            ))}
                          </View>
                        </ScrollView>

                        {/* FIX 2 — Next pinned to bottom */}
                        <View style={{ paddingBottom: 24, paddingTop: 12, backgroundColor: `${BLUSH_PINK}10` }}>
                          <GradientPrimaryBtn label="Next" onPress={() => setRitualStep(4)} />
                        </View>
                      </View>
                    )}

                    {ritualStep === 4 && (
                      <View style={{ flex: 1, paddingHorizontal: 24 }}>
                        <View style={{ flex: 1, gap: 16, justifyContent: "center" }}>
                          <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 14, color: colors.foreground }}>
                            Set one soft intention for next week
                          </Text>
                          <TextInput
                            placeholder="e.g. I will be intentional with my money 💜"
                            placeholderTextColor={colors.muted}
                            value={ritualResponses.intention || ""}
                            onChangeText={(text) => setRitualResponses({ ...ritualResponses, intention: text })}
                            onFocus={() => setFocusedInput("intention")}
                            onBlur={() => setFocusedInput(null)}
                            style={inputStyle("intention")}
                            multiline
                          />
                        </View>
                        <View style={{ paddingBottom: 24 }}>
                          <GradientPrimaryBtn label="Complete Ritual" onPress={handleCompleteRitual} />
                        </View>
                      </View>
                    )}
                  </>
                )}

                {/* OTHER RITUALS - SIMPLIFIED FLOW */}
                {selectedRitual.id !== "soft-audit" && (
                  <View style={{ flex: 1, paddingHorizontal: 24 }}>
                    <ScrollView contentContainerStyle={{ flexGrow: 1, gap: 16 }}>
                      <View style={{ borderRadius: 20, padding: 24, gap: 12, backgroundColor: `${selectedRitual.color}20` }}>
                        <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 15, color: colors.foreground, lineHeight: 24 }}>
                          {selectedRitual.description}
                        </Text>
                      </View>
                      <View>
                        <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 14, color: colors.foreground, marginBottom: 8 }}>
                          Your response:
                        </Text>
                        <TextInput
                          placeholder="Type your response here..."
                          placeholderTextColor={colors.muted}
                          value={ritualResponses.response || ""}
                          onChangeText={(text) => setRitualResponses({ ...ritualResponses, response: text })}
                          onFocus={() => setFocusedInput("response")}
                          onBlur={() => setFocusedInput(null)}
                          style={[inputStyle("response"), { minHeight: 120 }]}
                          multiline
                          numberOfLines={4}
                        />
                      </View>
                    </ScrollView>
                    <View style={{ paddingBottom: 24 }}>
                      <GradientPrimaryBtn label="Complete Ritual" onPress={handleCompleteRitual} />
                    </View>
                  </View>
                )}
              </View>
            </ScreenContainer>
          </View>
        )}
      </Modal>
    </ScreenContainer>
  );
}
