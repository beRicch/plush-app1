import { ScrollView, Text, View, Pressable, TextInput, Modal, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useColors } from "@/hooks/use-colors";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useSubscription } from "@/lib/revenuecat";
import { PremiumGate } from "@/components/premium-gate";
import { PlushCelebration } from "@/components/plush-celebration";
import { LinearGradient } from "expo-linear-gradient";
import { PLUSH_GRADIENT } from "@/components/plush-gradient";

// Brand colours
const ROSE_GOLD = "#B76E79";
const DEEP_PLUM = "#4A1560";
const CREAM = "#FAF5EF";
const BLUSH_PINK = "#F4B8C1";

const INTENTIONS = [
  "I am worthy of a soft, abundant life.",
  "My money serves my peace, not just my needs.",
  "I track with grace, not guilt.",
];

const CORE_RITUALS = [
  { id: "soft-audit", name: "Soft Audit", emoji: "🌅", day: "Sunday", time: "15 minutes", description: "Your weekly money check-in, done with love not judgment", color: "#B76E79", streak: 4 },
  { id: "naira-naming", name: "Naira Naming Ceremony", emoji: "💰", day: "When creating a goal", time: "10 minutes", description: "Give your savings a name. Money moves differently with purpose.", color: "#4A1560", streak: 2 },
  { id: "financial-gratitude", name: "First Fruit Financial Gratitude", emoji: "🕯️", day: "1st of every month", time: "5 minutes", description: "Before you plan what goes out, honor what came in", color: "#F4B8C1", streak: 0 },
  { id: "budget-blessing", name: "Owambe Budget Blessing", emoji: "✨", day: "Before any event", time: "8 minutes", description: "Show up fully without the post-party regret", color: "#B8E6D5", streak: 1 },
  { id: "money-meditation", name: "Evening Money Meditation", emoji: "🌙", day: "Daily, optional", time: "5 minutes", description: "5 minutes before bed. Your wealth affirmation practice.", color: "#FAF5EF", streak: 0 },
  { id: "naira-wins", name: "Naira Wins Wednesday", emoji: "🎉", day: "Every Wednesday", time: "3 minutes", description: "Celebrate your money wins this week", color: "#B76E79", streak: 8 },
  { id: "plush-vision", name: "Plush Vision Friday", emoji: "🌟", day: "Every Friday", time: "10 minutes", description: "Set your soft money intentions for the week ahead", color: "#F4B8C1", streak: 6 },
  { id: "vault-reset", name: "Quarterly Vault Reset", emoji: "🎯", day: "Every 3 months", time: "20 minutes", description: "Zoom out, realign, and set your next season's vision", color: "#4A1560", streak: 0 },
];

const BADGES = [
  { id: "first-ritual", name: "First Ritual", emoji: "🌸", unlocked: true },
  { id: "7-day-streak", name: "7-Day Streak", emoji: "💜", unlocked: true },
  { id: "30-day-soft", name: "30-Day Soft Life", emoji: "👑", unlocked: false },
  { id: "first-audit", name: "First Audit", emoji: "✨", unlocked: true },
  { id: "owambe-survived", name: "Owambe Survived", emoji: "🎉", unlocked: false },
  { id: "ajo-circle", name: "Ajo Circle", emoji: "💰", unlocked: true },
];

export default function RitualsHubScreen() {
  const router = useRouter();
  const colors = useColors();
  const [intention, setIntention] = useState("");
  const [intentions, setIntentions] = useState(INTENTIONS);
  const [focusedInput, setFocusedInput] = useState<any>(null);
  const [showFullHub, setShowFullHub] = useState(false);
  const [showRitualFlow, setShowRitualFlow] = useState(false);
  const [selectedRitual, setSelectedRitual] = useState<any>(null);
  const [ritualStep, setRitualStep] = useState(1);
  const [ritualResponses, setRitualResponses] = useState<Record<string, string>>({});
  const [showCelebration, setShowCelebration] = useState(false);

  const { isPremium } = useSubscription();

  const TODAY = new Date().getDay();
  // Sunday=0, Monday=1, ... Wednesday=3, Friday=5
  const todayRitual = CORE_RITUALS.find((r) => {
    if (r.day === "Sunday" && TODAY === 0) return true;
    if (r.day === "Every Wednesday" && TODAY === 3) return true;
    if (r.day === "Every Friday" && TODAY === 5) return true;
    return false;
  }) || CORE_RITUALS.find(r => r.day === "Daily, optional") || CORE_RITUALS[0];

  const handleStartRitual = (ritual: any) => {
    setSelectedRitual(ritual);
    setShowRitualFlow(true);
    setRitualStep(1);
    setRitualResponses({});
  };

  const handleCompleteRitual = () => {
    setShowCelebration(true);
  };

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

  const primaryBtn = {
    borderRadius: 16,
    overflow: "hidden" as const,
  };
  const primaryBtnInner = {
    height: 52,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  };
  const primaryBtnText = { fontFamily: "DMSans_500Medium" as const, fontSize: 15, color: CREAM };
  const GradientPrimaryBtn = ({ label, onPress }: { label: string; onPress: () => void }) => (
    <Pressable onPress={onPress} style={primaryBtn}>
      <LinearGradient
        colors={PLUSH_GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ ...primaryBtnInner }}
      >
        <Text style={primaryBtnText}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );

  const handleUnlock = () => {
    // Opens RevenueCat paywall
  };

  const handleAddIntention = () => {
    if (!intention.trim()) return;
    setIntentions([intention, ...intentions]);
    setIntention("");
  };

  return (
    <ScreenContainer className="bg-background">
      <PremiumGate isPremium={true} onUnlock={handleUnlock}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View style={{ padding: 24, gap: 24, paddingBottom: 48 }}>
            {/* Header */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 24, color: colors.foreground }}>
                    Soft Money Rituals
                  </Text>
                  <Text style={{ fontSize: 22 }}>🕯️</Text>
                </View>
                <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 14, color: colors.muted, marginTop: 4 }}>
                  Wealth-building that feels like self-care
                </Text>
              </View>
              <Pressable
                onPress={() => router.back()}
                style={{ width: 40, height: 40, borderRadius: 16, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }}
              >
                <MaterialIcons name="close" size={24} color={colors.foreground} />
              </Pressable>
            </View>

            {/* HORIZONTAL WEEK SCROLL */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", backgroundColor: `${CREAM}80`, padding: 12, borderRadius: 20 }}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
                <View key={i} style={{ alignItems: "center", gap: 4, opacity: i > 4 ? 0.4 : 1 }}>
                  <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 10, color: colors.muted }}>{day}</Text>
                  {i < TODAY ? (
                    <Text style={{ fontSize: 16 }}>🔥</Text>
                  ) : (
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: i === TODAY ? DEEP_PLUM : ROSE_GOLD, marginTop: 6 }} />
                  )}
                </View>
              ))}
            </View>

            {/* STREAK SUMMARY BOX */}
            <View
              style={{ borderRadius: 16, padding: 24, gap: 16, backgroundColor: colors.surface, shadowColor: DEEP_PLUM, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View>
                  <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 11, color: colors.muted, textTransform: "uppercase", letterSpacing: 1 }}>
                    Current Streak
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 24, color: DEEP_PLUM }}>
                      12 Days
                    </Text>
                    <Text style={{ fontSize: 18 }}>🔥</Text>
                  </View>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 11, color: colors.muted, textTransform: "uppercase", letterSpacing: 1 }}>
                    Weekly Goal
                  </Text>
                  <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 16, color: colors.foreground }}>
                    5/7 Complete
                  </Text>
                </View>
              </View>
            </View>

            {/* THE CORE RITUALS (Dropdown logic) */}
            <View style={{ gap: 16 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 18, color: colors.foreground }}>
                  {showFullHub ? "The 8 Core Rituals" : "Today's Ritual"}
                </Text>
                <Pressable onPress={() => setShowFullHub(!showFullHub)}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 12, color: ROSE_GOLD }}>
                      {showFullHub ? "Close Hub" : "View Hub"}
                    </Text>
                    <MaterialIcons
                      name={showFullHub ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                      size={18}
                      color={ROSE_GOLD}
                    />
                  </View>
                </Pressable>
              </View>

              <View style={{ gap: 12 }}>
                {(showFullHub ? CORE_RITUALS : [todayRitual]).map((ritual) => (
                  <Pressable
                    key={ritual.id}
                    onPress={() => handleStartRitual(ritual)}
                    style={{
                      borderRadius: 16, backgroundColor: colors.surface, padding: 16, gap: 12,
                      borderWidth: 1, borderColor: `${ROSE_GOLD}15`,
                    }}
                  >
                    <View style={{ flexDirection: "row", gap: 16 }}>
                      <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: `${ROSE_GOLD}10`, alignItems: "center", justifyContent: "center" }}>
                        <Text style={{ fontSize: 24 }}>{ritual.emoji}</Text>
                      </View>
                      <View style={{ flex: 1, gap: 2 }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                          <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 16, color: DEEP_PLUM }}>
                            {ritual.name}
                          </Text>
                          {ritual.streak > 0 ? (
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: `${ROSE_GOLD}15`, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                              <Text style={{ fontSize: 12 }}>🔥</Text>
                              <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 10, color: ROSE_GOLD }}>{ritual.streak}</Text>
                            </View>
                          ) : null}
                        </View>
                        <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 12, color: colors.muted }}>
                          {ritual.day}
                        </Text>
                      </View>
                    </View>

                    <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 13, color: `${DEEP_PLUM}CC`, lineHeight: 18 }}>
                      {ritual.description}
                    </Text>

                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: `${colors.border}50`, paddingTop: 10 }}>
                      <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 12, color: colors.muted }}>
                        {ritual.time}
                      </Text>
                      <MaterialIcons name="chevron-right" size={20} color={colors.muted} />
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* BADGES SECTION */}
            {showFullHub && (
              <Animated.View entering={FadeInUp} style={{ gap: 16 }}>
                <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 18, color: colors.foreground }}>
                  Badges Earned
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                  {BADGES.map((badge) => (
                    <View
                      key={badge.id}
                      style={{ alignItems: "center", gap: 6, opacity: badge.unlocked ? 1 : 0.4 }}
                    >
                      <View
                        style={{
                          width: 68, height: 68, borderRadius: 34,
                          alignItems: "center", justifyContent: "center",
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
              </Animated.View>
            )}

            {/* SOFT INTENTIONS JOURNAL */}
            <Animated.View entering={FadeInUp.delay(600)} style={{ gap: 16 }}>
              <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 18, color: colors.foreground }}>
                Soft Intentions ✨
              </Text>
              <View style={{ borderRadius: 16, padding: 24, gap: 16, backgroundColor: colors.surface }}>
                <View
                  style={{
                    flexDirection: "row", alignItems: "center", gap: 8,
                    backgroundColor: colors.background, borderRadius: 12,
                    paddingHorizontal: 16, paddingVertical: 4,
                    borderWidth: 1.5,
                    borderColor: focusedInput === "main_intent" ? DEEP_PLUM : BLUSH_PINK,
                  }}
                >
                  <TextInput
                    placeholder="Today, I intend to..."
                    placeholderTextColor={colors.muted}
                    value={intention}
                    onChangeText={setIntention}
                    onFocus={() => setFocusedInput("main_intent")}
                    onBlur={() => setFocusedInput(null)}
                    style={{ flex: 1, fontFamily: "DMSans_400Regular", fontSize: 14, color: colors.foreground, paddingVertical: 12 }}
                  />
                  <Pressable onPress={handleAddIntention}>
                    <MaterialIcons name="add-circle" size={24} color={ROSE_GOLD} />
                  </Pressable>
                </View>

                <View style={{ gap: 12 }}>
                  {intentions.map((item, i) => (
                    <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
                      <Text style={{ color: ROSE_GOLD, marginTop: 2, fontSize: 12 }}>🌸</Text>
                      <Text style={{ flex: 1, fontFamily: "DancingScript_400Regular", fontSize: 14, color: colors.foreground, lineHeight: 20, fontStyle: "italic" }}>
                        {item}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </Animated.View>
          </View>
        </ScrollView>
      </PremiumGate>

      {/* RITUAL FLOW MODAL */}
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
                  <View style={{ flex: 1 }}>
                    {ritualStep === 1 && (
                      <View style={{ flex: 1, paddingHorizontal: 24 }}>
                        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 24 }}>
                          <Text style={{ fontSize: 48 }}>🌸</Text>
                          <View style={{ borderRadius: 20, padding: 24, backgroundColor: `${BLUSH_PINK}26`, gap: 12 }}>
                            <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 20, color: DEEP_PLUM, textAlign: "center", lineHeight: 28 }}>
                              Grab your favorite drink.{"\n"}Get comfortable.
                            </Text>
                            <Text style={{ fontFamily: "DancingScript_400Regular", fontSize: 18, color: DEEP_PLUM, textAlign: "center", fontStyle: "italic" }}>
                              You're not in trouble. You're just checking in. 🌸
                            </Text>
                          </View>
                        </View>
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
                            {[{ label: "Food & Dining", value: "₦8,500" }, { label: "Transport", value: "₦3,200" }, { label: "Shopping", value: "₦12,000" }].map((row, i) => (
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
                          {[
                            { key: "q1", label: "What spending this week felt good and aligned?", placeholder: "e.g. My skincare routine 🧴" },
                            { key: "q2", label: "What purchase made you wince a little?", placeholder: "e.g. That impulse Shein haul 😅" },
                            { key: "q3", label: "One thing I want to do differently next week:", placeholder: "e.g. Set a daily spending limit 💪" },
                          ].map(({ key, label, placeholder }) => (
                            <View key={key}>
                              <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 14, color: colors.foreground, marginBottom: 8 }}>{label}</Text>
                              <TextInput
                                placeholder={placeholder}
                                placeholderTextColor={colors.muted}
                                value={ritualResponses[key] || ""}
                                onChangeText={(text) => setRitualResponses({ ...ritualResponses, [key]: text })}
                                onFocus={() => setFocusedInput(key)}
                                onBlur={() => setFocusedInput(null)}
                                style={inputStyle(key) as any}
                                multiline
                              />
                            </View>
                          ))}
                        </ScrollView>
                        <View style={{ paddingBottom: 24, paddingTop: 12 }}>
                          <GradientPrimaryBtn label="Next" onPress={() => setRitualStep(4)} />
                        </View>
                      </View>
                    )}

                    {ritualStep === 4 && (
                      <View style={{ flex: 1, paddingHorizontal: 24 }}>
                        <View style={{ flex: 1, gap: 16, justifyContent: "center" }}>
                          <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 14, color: colors.foreground }}>Set one soft intention for next week</Text>
                          <TextInput
                            placeholder="e.g. I will be intentional with my money 💜"
                            placeholderTextColor={colors.muted}
                            value={ritualResponses.intention || ""}
                            onChangeText={(text) => setRitualResponses({ ...ritualResponses, intention: text })}
                            onFocus={() => setFocusedInput("intention")}
                            onBlur={() => setFocusedInput(null)}
                            style={inputStyle("intention") as any}
                            multiline
                          />
                        </View>
                        <View style={{ paddingBottom: 24 }}>
                          <GradientPrimaryBtn label="Complete Ritual" onPress={handleCompleteRitual} />
                        </View>
                      </View>
                    )}
                  </View>
                )}

                {/* OTHER RITUALS - SIMPLIFIED FLOW */}
                {selectedRitual.id !== "soft-audit" && (
                  <View style={{ flex: 1, paddingHorizontal: 24 }}>
                    <ScrollView contentContainerStyle={{ flexGrow: 1, gap: 16 }}>
                      <View style={{ borderRadius: 20, padding: 24, gap: 12, backgroundColor: `${selectedRitual.color || ROSE_GOLD}20` }}>
                        <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 15, color: colors.foreground, lineHeight: 24 }}>
                          {selectedRitual.description}
                        </Text>
                      </View>
                      <View>
                        <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 14, color: colors.foreground, marginBottom: 8 }}>Your response:</Text>
                        <TextInput
                          placeholder="Type your response here..."
                          placeholderTextColor={colors.muted}
                          value={ritualResponses.response || ""}
                          onChangeText={(text) => setRitualResponses({ ...ritualResponses, response: text })}
                          onFocus={() => setFocusedInput("response")}
                          onBlur={() => setFocusedInput(null)}
                          style={[inputStyle("response") as any, { minHeight: 120 }]}
                          multiline
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
      <PlushCelebration
        visible={showCelebration}
        onClose={() => {
          setShowCelebration(false);
          setShowRitualFlow(false);
          setSelectedRitual(null);
          setRitualStep(1);
        }}
        title="Ritual Complete! 🎉"
        subtitle="5 weeks in a row, sis! 🔥"
      />
    </ScreenContainer>
  );
}
