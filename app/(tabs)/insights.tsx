import {
  ScrollView,
  View,
  Text,
  Pressable,
  TextInput,
  FlatList,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useSubscription } from "@/lib/revenuecat";
import { PremiumGate } from "@/components/premium-gate";
import { Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PLUSH_GRADIENT, PROGRESS_GRADIENT } from "@/components/plush-gradient";

// Brand Colors
const DEEP_PLUM = "#4A1560";
const BLUSH_PINK = "#F4B8C1";
const CREAM = "#FAF5EF";
const ROSE_GOLD = "#B76E79";

// Mock data
const PLUSH_SCORE = 74;
const SCORE_BREAKDOWN = [
  { name: "Savings Rate", points: 18, max: 25 },
  { name: "Ritual Consistency", points: 15, max: 20 },
  { name: "Goal Progress", points: 16, max: 20 },
  { name: "Bill Timeliness", points: 15, max: 20 },
  { name: "Community Participation", points: 10, max: 15 },
];

const SPENDING_CATEGORIES = [
  { name: "Food & Dining", amount: 28500, percentage: 35 },
  { name: "Shopping", amount: 18200, percentage: 22 },
  { name: "Transport", amount: 12400, percentage: 15 },
  { name: "Beauty & Self-Care", amount: 10800, percentage: 13 },
  { name: "Entertainment", amount: 11100, percentage: 15 },
];

const AI_OBSERVATIONS = [
  {
    id: "1",
    observation: "You spend 40% more on Fridays 👀",
    context: "Your Friday average is ₦12,400 vs ₦8,800 other days",
    suggestion: "Consider a Friday soft cap of ₦10,000",
  },
  {
    id: "2",
    observation: "Beauty spending spiked this week 💄",
    context: "₦4,200 spent vs your usual ₦2,100 weekly average",
    suggestion: "No judgment—just now you know. Plan ahead for next month's skincare haul 🧴",
  },
  {
    id: "3",
    observation: "You're crushing your savings goal 💪",
    context: "You've saved ₦45,000 this month (18% of income)",
    suggestion: "At this rate, you'll hit your ₦200k goal in 5 months. You're doing it, sis!",
  },
];

const CHAT_MESSAGES = [
  { id: "1", type: "bot", text: "Welcome back, Queen! 👑 I'm Plush, your financial wellness bestie. How is your soft life journey going today? 🌸" },
  { id: "2", type: "user", text: "Why do I never have money?" },
  { id: "3", type: "bot", text: "I looked into it, and your records show ₦18,000 went to Airtime and data last month — that caught me off guard too! 😮 Now you know where that quiet drain is. Want to set a monthly cap for it with me? 🌸" },
];

const STARTER_PROMPTS = [
  "Should I buy this? 💭",
  "Why is my score low? 📊",
  "Help me budget for December 🎄",
  "How do I save faster? 💰",
  "Explain my spending 👀",
  "I want to invest 📈",
];

export default function InsightsScreen() {
  const router = useRouter();
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<"insights" | "ask" | "ajo">("insights");
  const [chatMessages, setChatMessages] = useState(CHAT_MESSAGES);
  const [chatInput, setChatInput] = useState("");
  const { isPremium, loading } = useSubscription();

  const handleUnlock = () => {
    Alert.alert("Premium Feature", "Unlock deep insights and AI-powered advice with Plush Premium 🌸");
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const newMessage = {
      id: String(chatMessages.length + 1),
      type: "user",
      text: chatInput,
    };

    setChatMessages([...chatMessages, newMessage]);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: String(chatMessages.length + 2),
        type: "bot",
        text: "I hear you! Let me think about that... 💜 What specific area would you like help with?",
      };
      setChatMessages((prev) => [...prev, botResponse]);
    }, 500);

    setChatInput("");
  };

  return (
    <ScreenContainer className="bg-background">
      <PremiumGate isPremium={true} onUnlock={handleUnlock}>
        {/* TAB NAVIGATION */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            paddingHorizontal: 16,
            paddingTop: 16,
            marginBottom: 24,
            borderBottomWidth: 1,
            borderBottomColor: `${DEEP_PLUM}14`,
          }}
        >
          <Pressable
            onPress={() => setActiveTab("insights")}
            style={{
              flex: 1,
              paddingBottom: 12,
              alignItems: "center",
              borderBottomWidth: 3,
              borderBottomColor: activeTab === "insights" ? DEEP_PLUM : "transparent",
            }}
          >
            <Text
              style={{
                fontFamily: activeTab === "insights" ? "DMSans_700Bold" : "DMSans_400Regular",
                fontSize: 16,
                color: activeTab === "insights" ? DEEP_PLUM : `#9E9E9E`,
              }}
            >
              My Insights
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("ask")}
            style={{
              flex: 1,
              paddingBottom: 12,
              alignItems: "center",
              borderBottomWidth: 3,
              borderBottomColor: activeTab === "ask" ? DEEP_PLUM : "transparent",
            }}
          >
            <Text
              style={{
                fontFamily: activeTab === "ask" ? "DMSans_700Bold" : "DMSans_400Regular",
                fontSize: 16,
                color: activeTab === "ask" ? DEEP_PLUM : `#9E9E9E`,
              }}
            >
              Ask Plush
            </Text>
          </Pressable>
        </View>

        {/* MY INSIGHTS TAB */}
        {activeTab === "insights" && (
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="gap-6 pb-8 px-6">
              {/* HEADER */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View>
                  <Text
                    className="font-bold text-foreground"
                    style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 23 }}
                  >
                    My Insights
                  </Text>
                  <Text className="text-sm text-muted mt-1">
                    Your financial wellness at a glance
                  </Text>
                </View>
                <Pressable
                  onPress={() => router.replace("/")}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 16,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: colors.surface,
                  }}
                >
                  <MaterialIcons name="close" size={20} color={colors.foreground} />
                </Pressable>
              </View>

              {/* PLUSH SCORE & TOTAL SPENT */}
              <View
                className="rounded-2xl p-6 gap-4 items-center"
                style={{ backgroundColor: colors.surface }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-around", width: "100%", alignItems: "center" }}>
                  {/* Plush Score Circle */}
                  <View style={{ alignItems: "center", gap: 8 }}>
                    <View
                      className="items-center justify-center"
                      style={{
                        width: 140,
                        height: 140,
                        borderRadius: 70,
                        flexShrink: 0,
                        borderColor: "#B76E79",
                        borderWidth: 6,
                        backgroundColor: "#FAF5EF",
                        shadowColor: "#B76E79",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 10,
                        elevation: 5,
                      }}
                    >
                      <Text
                        className="text-4xl font-bold"
                        style={{ fontFamily: "PlayfairDisplay_700Bold", color: "#4A1560" }}
                      >
                        {PLUSH_SCORE}
                      </Text>
                    </View>
                    <Text className="text-sm font-semibold text-foreground">Plush Score</Text>
                  </View>

                  {/* Total Amount Circle */}
                  <View style={{ alignItems: "center", gap: 8 }}>
                    <View
                      className="items-center justify-center"
                      style={{
                        width: 140,
                        height: 140,
                        borderRadius: 70,
                        flexShrink: 0,
                        borderColor: "#E8B4D4",
                        borderWidth: 6,
                        backgroundColor: "#FAF5EF",
                      }}
                    >
                      <View className="items-center">
                        <Text className="text-xl font-bold text-foreground">
                          ₦81k
                        </Text>
                      </View>
                    </View>
                    <Text className="text-sm font-semibold text-foreground">Total Spent</Text>
                  </View>
                </View>

                {/* Motivational Quote */}
                <Text className="text-sm text-muted text-center mt-2">
                  Strong savings rate, but beauty spending spiked this week 💄
                </Text>
              </View>

              {/* SPENDING BREAKDOWN */}
              <View className="gap-3">
                <View className="flex-row justify-between items-center">
                  <Text
                    className="text-lg font-bold text-foreground"
                    style={{ fontFamily: "PlayfairDisplay_700Bold" }}
                  >
                    Spending Breakdown
                  </Text>
                  <View className="flex-row gap-2">
                    {["Week", "Month", "3M"].map((period) => (
                      <Pressable
                        key={period}
                        className="px-3 py-1 rounded-full border border-border"
                      >
                        <Text className="text-xs font-semibold text-muted">{period}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
                {/* CATEGORY BREAKDOWN CARD */}
                <View
                  className="rounded-2xl p-6 gap-4"
                  style={{ backgroundColor: colors.surface }}
                >
                  <View className="gap-2">
                    {SPENDING_CATEGORIES.map((cat, idx) => (
                      <View key={cat.name} className="gap-2">
                        <View className="flex-row justify-between items-center">
                          <View className="flex-row items-center gap-2 flex-1">
                            <View
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: [
                                  "#E8B4D4",
                                  "#D4A574",
                                  "#B8E6D5",
                                  "#6B4C7A",
                                  "#FFF4E6",
                                ][idx],
                              }}
                            />
                            <Text className="text-xs font-semibold text-foreground flex-1">
                              {cat.name}
                            </Text>
                          </View>
                          <Text className="text-xs font-bold text-foreground">
                            ₦{cat.amount.toLocaleString()}
                          </Text>
                        </View>
                        <View style={{ height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: "hidden" }}>
                          <LinearGradient
                            colors={PROGRESS_GRADIENT}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{
                              height: "100%",
                              width: `${cat.percentage}%`,
                              borderRadius: 3,
                            }}
                          />
                        </View>
                        <Text className="text-xs text-muted">{cat.percentage}% of total</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              {/* AI OBSERVATIONS */}
              <View className="gap-3">
                <Text
                  className="text-lg font-bold text-foreground"
                  style={{ fontFamily: "PlayfairDisplay_700Bold" }}
                >
                  AI Observations
                </Text>

                {AI_OBSERVATIONS.map((obs) => (
                  <View
                    key={obs.id}
                    className="rounded-2xl p-4 gap-2"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <Text className="text-sm font-bold text-foreground">{obs.observation}</Text>
                    <Text className="text-xs text-muted">{obs.context}</Text>
                    <View className="pt-2 border-t border-border">
                      <Text className="text-xs text-foreground italic">{obs.suggestion}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* MONTHLY VAULT REPORT */}
              <View
                className="rounded-2xl p-4 gap-3"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-sm font-bold text-foreground">
                  Your March Vault Report is ready 🌸
                </Text>
                <View className="gap-2">
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-muted">Income</Text>
                    <Text className="text-xs font-bold text-foreground">₦250,000</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-muted">Expenses</Text>
                    <Text className="text-xs font-bold text-foreground">₦81,000</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-muted">Savings</Text>
                    <Text className="text-xs font-bold text-foreground">₦169,000</Text>
                  </View>
                </View>
                <Pressable
                  className="items-center justify-center mt-2"
                  style={{ height: 52, borderRadius: 16, overflow: "hidden" }}
                >
                  <LinearGradient
                    colors={PLUSH_GRADIENT}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ height: 52, width: "100%", alignItems: "center", justifyContent: "center" }}
                  >
                    <Text className="text-white font-bold text-sm">Download PDF Report</Text>
                  </LinearGradient>
                </Pressable>
              </View>

              {/* PREDICTIVE ALERT */}
              <View
                className="rounded-2xl p-4 gap-3 border-l-4"
                style={{
                  backgroundColor: "#F59E0B20",
                  borderLeftColor: "#F59E0B",
                }}
              >
                <Text className="text-sm font-bold" style={{ color: "#F59E0B" }}>
                  Heads up, sis 💛
                </Text>
                <Text className="text-xs text-foreground">
                  At your current pace, you'll overspend by ₦23,000 this month
                </Text>
                <View className="gap-2 pt-2">
                  <Text className="text-xs font-semibold text-foreground">
                    Here's what to do:
                  </Text>
                  <Text className="text-xs text-muted">
                    1. Reduce dining out by ₦5,000 this week
                  </Text>
                  <Text className="text-xs text-muted">
                    2. Skip non-essentials shopping for 2 weeks
                  </Text>
                  <Text className="text-xs text-muted">
                    3. Set a daily spending cap of ₦2,500
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        )}

        {/* ASK PLUSH TAB */}
        {activeTab === "ask" && (
          <View className="flex-1">
            <FlatList
              data={chatMessages}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 16 }}
              renderItem={({ item }) => (
                <View
                  className={`mb-4 ${item.type === "user" ? "items-end" : "items-start"}`}
                >
                  <View
                    className="rounded-2xl px-4 py-3 max-w-xs"
                    style={{
                      backgroundColor:
                        item.type === "user" ? "#D4A574" : colors.surface,
                    }}
                  >
                    <Text
                      className="text-sm"
                      style={{
                        color: item.type === "user" ? "white" : colors.foreground,
                      }}
                    >
                      {item.text}
                    </Text>
                  </View>
                </View>
              )}
            />

            {/* STARTER PROMPTS */}
            {chatMessages.length === 3 && (
              <View className="px-6 gap-2 mb-4">
                <Text className="text-xs text-muted font-semibold mb-2">
                  Quick prompts:
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {STARTER_PROMPTS.map((prompt) => (
                    <Pressable
                      key={prompt}
                      onPress={() => setChatInput(prompt)}
                      className="px-3 py-2 rounded-full border border-border"
                    >
                      <Text className="text-xs text-muted">{prompt}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* CHAT INPUT */}
            <View className="px-6 pb-6 gap-3 border-t border-border pt-3">
              <View className="flex-row items-center gap-2 bg-surface rounded-lg px-4 py-3">
                <TextInput
                  placeholder="Ask Plush anything..."
                  placeholderTextColor={colors.muted}
                  value={chatInput}
                  onChangeText={setChatInput}
                  className="flex-1 text-foreground"
                />
                <Pressable
                  onPress={handleSendMessage}
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <MaterialIcons name="send" size={20} color={colors.primary} />
                </Pressable>
              </View>
              <Pressable className="items-center py-2">
                <MaterialIcons name="mic" size={20} color={colors.muted} />
              </Pressable>
            </View>
          </View>
        )}
      </PremiumGate>
    </ScreenContainer>
  );
}
