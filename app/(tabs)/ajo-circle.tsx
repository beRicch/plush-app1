import {
  ScrollView,
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useRouter } from "expo-router";
import { useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useSubscription } from "@/lib/revenuecat";
import { PremiumGate } from "@/components/premium-gate";
import { PlushCelebration } from "@/components/plush-celebration";
import { PlushModal } from "@/components/plush-modal";
import { LinearGradient } from "expo-linear-gradient";
import { GradientAvatar, PLUSH_GRADIENT } from "@/components/plush-gradient";

// Brand colours
const ROSE_GOLD = "#B76E79";
const DEEP_PLUM = "#4A1560";
const CREAM = "#FAF5EF";
const BLUSH_PINK = "#F4B8C1";

// Mock data
const MOCK_CIRCLES = [
  {
    id: "1",
    name: "Lagos Soft Girls Ajo 🌸",
    contribution: 10000,
    frequency: "Weekly",
    members: 5,
    currentRound: 3,
    totalRounds: 10,
    currentRecipient: "Temi",
    nextPaymentDate: "2024-03-29",
    status: "active",
    isPayoutDay: true,
  },
  {
    id: "2",
    name: "Office Circle 💼",
    contribution: 15000,
    frequency: "Biweekly",
    members: 8,
    currentRound: 2,
    totalRounds: 8,
    currentRecipient: "Chioma",
    nextPaymentDate: "2024-04-05",
    status: "active",
    isPayoutDay: false,
  },
];

const CIRCLE_SUGGESTIONS = [
  "Girls Ajo 🌸",
  "Office Circle 💼",
  "Soft Life Fund 💜",
  "Market Circle 🛒",
];

export default function AjoCircleScreen() {
  const colors = useColors();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"for-you" | "ajo">("ajo");
  const [hasCircles, setHasCircles] = useState(true);
  const [showCreateFlow, setShowCreateFlow] = useState(false);
  const [showDetailView, setShowDetailView] = useState<string | null>(null);
  const [showJoinFlow, setShowJoinFlow] = useState(false);
  const [step, setStep] = useState(1);

  // Form state
  const [circleName, setCircleName] = useState("");
  const [contribution, setContribution] = useState("");
  const [frequency, setFrequency] = useState("Monthly");
  const [maxMembers, setMaxMembers] = useState("5");
  const [startDate, setStartDate] = useState("");
  const [payoutOrder, setPayoutOrder] = useState("random");
  const [joinCode, setJoinCode] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState({ title: "", subtitle: "" });
  const [errorModal, setErrorModal] = useState<{ visible: boolean; title: string; message: string }>({
    visible: false,
    title: "",
    message: "",
  });
  const { isPremium, loading } = useSubscription();

  const handleUnlock = () => {
    setErrorModal({
      visible: true,
      title: "Premium Feature",
      message: "Ajo Circles are a premium feature. Unlock to save with your girls! 🌸",
    });
  };

  const selectedCircle = MOCK_CIRCLES.find((c) => c.id === showDetailView);

  const handleCreateCircle = () => {
    if (!circleName || !contribution || !startDate) {
      setErrorModal({
        visible: true,
        title: "Missing Info",
        message: "Please fill in all required fields to start your circle 🌸",
      });
      return;
    }
    setStep(3);
  };

  const handleCompleteCircle = () => {
    setCelebrationData({
      title: "Circle Created! 🎉",
      subtitle: `Your Ajo Circle "${circleName}" is ready!\n\nInvite Code: SOFT42`,
    });
    setShowCelebration(true);
  };

  const handleJoinCircle = () => {
    if (!joinCode) {
      setErrorModal({
        visible: true,
        title: "Missing Code",
        message: "Please enter a valid invite code to join your girls! 🌸",
      });
      return;
    }
    setCelebrationData({
      title: "✨ Joined!",
      subtitle: `You've joined the Ajo Circle!\n\nYou'll be notified when it's your turn.`,
    });
    setShowCelebration(true);
  };

  return (
    <ScreenContainer className="bg-background">
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          height: 50,
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          paddingHorizontal: 16,
        }}
      >
        {[
          { key: "for-you", label: "For You" },
          { key: "ajo", label: "Ajo Circles" },
        ].map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => {
              if (tab.key === "for-you") {
                router.replace("/community");
              } else {
                setActiveTab(tab.key as any);
              }
            }}
            style={{
              flex: 1,
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
              borderBottomWidth: activeTab === tab.key ? 3 : 0,
              borderBottomColor: activeTab === tab.key ? "#4A1560" : "transparent",
            }}
          >
            <Text
              style={{
                fontFamily: activeTab === tab.key ? "DMSans_700Bold" : "DMSans_400Regular",
                fontSize: 15,
                color: activeTab === tab.key ? "#4A1560" : "#9B8FA3",
              }}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <PremiumGate isPremium={true} onUnlock={handleUnlock}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-6 pb-8">
            <View className="px-6 pt-4">
              <Text
                className="font-bold text-foreground"
                style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 23 }}
              >
                Ajo Circle 💰
              </Text>
              <Text className="text-sm text-muted mt-1">
                Save together, win together, sis
              </Text>
            </View>

            {/* CIRCLES LIST */}

            {/* EMPTY STATE */}
            {!hasCircles ? (
              <View className="px-6 items-center justify-center py-12 gap-4">
                <Text className="text-6xl">👯</Text>
                <Text
                  className="text-lg font-bold text-foreground text-center"
                  style={{ fontFamily: "PlayfairDisplay_700Bold" }}
                >
                  No circles yet
                </Text>
                <Text className="text-sm text-muted text-center">
                  Start one with your girls or join an existing circle.
                </Text>
                <View className="flex-row gap-3 mt-4 w-full">
                  <Pressable
                    onPress={() => setShowCreateFlow(true)}
                    className="flex-1 bg-primary rounded-lg py-4 items-center"
                  >
                    <Text className="text-white font-bold">Create a Circle</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setShowJoinFlow(true)}
                    className="flex-1 border border-primary rounded-lg py-4 items-center"
                  >
                    <Text className="text-primary font-bold">Join with Code</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <>
                {/* MY CIRCLES LIST */}
                <View className="px-6 gap-4">
                  {MOCK_CIRCLES.map((circle) => (
                    <Pressable
                      key={circle.id}
                      onPress={() => setShowDetailView(circle.id)}
                      className="rounded-2xl p-4 gap-3"
                      style={{ backgroundColor: colors.surface }}
                    >
                      {/* CIRCLE NAME & STATUS */}
                      <View className="flex-row justify-between items-start">
                        <Text className="text-base font-bold text-foreground flex-1">
                          {circle.name}
                        </Text>
                        <View
                          className="px-2 py-1 rounded-full"
                          style={{
                            backgroundColor:
                              circle.status === "active"
                                ? DEEP_PLUM
                                : circle.status === "waiting"
                                  ? BLUSH_PINK
                                  : ROSE_GOLD,
                          }}
                        >
                          <Text
                            className="text-[10px] font-bold uppercase tracking-wider"
                            style={{ color: circle.status === "waiting" ? DEEP_PLUM : "white" }}
                          >
                            {circle.status}
                          </Text>
                        </View>
                      </View>

                      {/* CONTRIBUTION & FREQUENCY */}
                      <View className="flex-row justify-between items-center">
                        <View>
                          <Text className="text-xs text-muted mb-1">Per Round</Text>
                          <Text className="text-sm font-bold text-foreground">
                            ₦{(circle.contribution / 1000).toFixed(0)}k
                          </Text>
                        </View>
                        <View>
                          <Text className="text-xs text-muted mb-1">Frequency</Text>
                          <Text className="text-sm font-bold text-foreground">
                            {circle.frequency}
                          </Text>
                        </View>
                        <View>
                          <Text className="text-xs text-muted mb-1">Round</Text>
                          <Text className="text-sm font-bold text-foreground">
                            {circle.currentRound}/{circle.totalRounds}
                          </Text>
                        </View>
                      </View>

                      {/* CURRENT RECIPIENT & NEXT PAYMENT */}
                      <View className="gap-2 pt-2 border-t border-border">
                        <View className="flex-row justify-between items-center">
                          <Text className="text-xs text-muted">
                            Current recipient: {circle.currentRecipient} 👑
                          </Text>
                        </View>
                        <View className="flex-row justify-between items-center">
                          <Text className="text-xs text-muted">
                            Next payment: {circle.nextPaymentDate}
                          </Text>
                          <MaterialIcons
                            name="chevron-right"
                            size={16}
                            color={colors.muted}
                          />
                        </View>
                      </View>
                    </Pressable>
                  ))}
                </View>

                {/* CREATE/JOIN BUTTONS */}
                <View className="px-6 gap-3">
                  <Pressable
                    onPress={() => setShowCreateFlow(true)}
                    className="rounded-lg items-center overflow-hidden"
                    style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                  >
                    <LinearGradient colors={PLUSH_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="py-4 w-full items-center justify-center">
                      <Text className="text-white font-bold">Create a Circle</Text>
                    </LinearGradient>
                  </Pressable>
                  <Pressable
                    onPress={() => setShowJoinFlow(true)}
                    className="border border-primary rounded-lg py-4 items-center"
                    style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                  >
                    <Text className="text-primary font-bold">Join with Code</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </ScrollView>

        {/* CREATE CIRCLE FLOW - BOTTOM SHEET */}
        <Modal visible={showCreateFlow} transparent animationType="slide">
          <View className="flex-1 bg-black/50 justify-end">
            <View
              className="bg-background rounded-t-3xl p-6 gap-4 max-h-[90%]"
              style={{ backgroundColor: colors.background }}
            >
              <View className="items-center mb-2">
                <View className="w-12 h-1 bg-border rounded-full" />
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* STEP 1: NAME YOUR CIRCLE */}
                {step === 1 && (
                  <>
                    <Text
                      className="font-bold text-foreground mb-4"
                      style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 17 }}
                    >
                      Name your circle
                    </Text>

                    <TextInput
                      placeholder="e.g. Lagos Soft Girls Ajo"
                      placeholderTextColor={colors.muted}
                      value={circleName}
                      onChangeText={setCircleName}
                      className="bg-surface rounded-lg px-4 py-3 text-foreground mb-4"
                    />

                    <Text className="text-xs text-muted mb-2">Suggestions:</Text>
                    <View className="flex-row flex-wrap gap-2 mb-6">
                      {CIRCLE_SUGGESTIONS.map((suggestion) => (
                        <Pressable
                          key={suggestion}
                          onPress={() => setCircleName(suggestion)}
                          className="px-3 py-2 rounded-full border border-primary"
                        >
                          <Text className="text-xs text-primary">{suggestion}</Text>
                        </Pressable>
                      ))}
                    </View>

                    <Pressable
                      onPress={() => setStep(2)}
                      className="rounded-lg items-center overflow-hidden"
                    >
                      <LinearGradient colors={PLUSH_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="py-4 w-full items-center justify-center">
                        <Text className="text-white font-bold">Next</Text>
                      </LinearGradient>
                    </Pressable>
                  </>
                )}

                {/* STEP 2: SET THE RULES */}
                {step === 2 && (
                  <>
                    <Text
                      className="font-bold text-foreground mb-4"
                      style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 17 }}
                    >
                      Set the Rules
                    </Text>

                    <View className="gap-4 mb-6">
                      {/* CONTRIBUTION AMOUNT */}
                      <View>
                        <Text className="text-sm font-semibold text-foreground mb-1">
                          Contribution per person (₦)
                        </Text>
                        <View className="flex-row items-center bg-surface rounded-lg px-3 py-3">
                          <Text className="text-lg font-bold text-muted mr-2">₦</Text>
                          <TextInput
                            placeholder="e.g. 10000"
                            placeholderTextColor={colors.muted}
                            keyboardType="decimal-pad"
                            value={contribution}
                            onChangeText={setContribution}
                            className="flex-1 text-foreground"
                          />
                        </View>
                      </View>

                      {/* FREQUENCY */}
                      <View>
                        <Text className="text-sm font-semibold text-foreground mb-2">
                          Frequency
                        </Text>
                        <View className="flex-row gap-2">
                          {["Weekly", "Biweekly", "Monthly"].map((freq) => (
                            <Pressable
                              key={freq}
                              onPress={() => setFrequency(freq)}
                              className="flex-1 py-3 rounded-lg items-center"
                              style={{
                                backgroundColor:
                                  frequency === freq ? colors.primary : colors.surface,
                              }}
                            >
                              <Text
                                className="font-semibold text-sm"
                                style={{
                                  color: frequency === freq ? "white" : colors.muted,
                                }}
                              >
                                {freq}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      </View>

                      {/* MAX MEMBERS */}
                      <View>
                        <Text className="text-sm font-semibold text-foreground mb-1">
                          Maximum members: {maxMembers}
                        </Text>
                        <View className="bg-surface rounded-lg px-4 py-3">
                          <Text className="text-foreground">Slider: 2–20 members</Text>
                        </View>
                      </View>

                      {/* START DATE */}
                      <View>
                        <Text className="text-sm font-semibold text-foreground mb-1">
                          Start date
                        </Text>
                        <TextInput
                          placeholder="YYYY-MM-DD"
                          placeholderTextColor={colors.muted}
                          value={startDate}
                          onChangeText={setStartDate}
                          className="bg-surface rounded-lg px-4 py-3 text-foreground"
                        />
                      </View>

                      {/* PAYOUT ORDER */}
                      <View>
                        <Text className="text-sm font-semibold text-foreground mb-2">
                          Payout order
                        </Text>
                        <View className="gap-2">
                          {["Random (AI assigns)", "First come first", "Manual order"].map(
                            (order) => (
                              <Pressable
                                key={order}
                                onPress={() => setPayoutOrder(order)}
                                className="py-3 rounded-lg items-center border border-border"
                                style={{
                                  borderColor:
                                    payoutOrder === order ? colors.primary : colors.border,
                                  backgroundColor:
                                    payoutOrder === order ? colors.primary + "20" : "transparent",
                                }}
                              >
                                <Text
                                  className="font-semibold text-xs text-center"
                                  style={{
                                    color:
                                      payoutOrder === order ? colors.primary : colors.muted,
                                  }}
                                >
                                  {order}
                                </Text>
                              </Pressable>
                            )
                          )}
                        </View>
                      </View>
                    </View>

                    <View className="flex-row gap-3">
                      <Pressable
                        onPress={() => setStep(1)}
                        className="flex-1 border border-border rounded-lg py-4 items-center"
                      >
                        <Text className="text-foreground font-bold">Back</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setStep(3)}
                        className="flex-1 bg-primary rounded-lg py-4 items-center"
                      >
                        <Text className="text-white font-bold">Next</Text>
                      </Pressable>
                    </View>
                  </>
                )}

                {/* STEP 3: INVITE MEMBERS */}
                {step === 3 && (
                  <>
                    <Text
                      className="font-bold text-foreground mb-4"
                      style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 17 }}
                    >
                      Invite Members
                    </Text>

                    <View className="gap-4 mb-6">
                      {/* INVITE CODE */}
                      <View>
                        <Text className="text-sm font-semibold text-foreground mb-2">
                          Your invite code
                        </Text>
                        <View
                          className="rounded-lg p-4 items-center gap-2"
                          style={{ backgroundColor: colors.primary + "20" }}
                        >
                          <Text
                            className="font-bold text-primary"
                            style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 23 }}
                          >
                            SOFT42
                          </Text>
                          <Text className="text-xs text-muted">Share this code with your girls</Text>
                        </View>
                      </View>

                      {/* SHARE OPTIONS */}
                      <View>
                        <Text className="text-sm font-semibold text-foreground mb-2">
                          Share via
                        </Text>
                        <View className="flex-row gap-2">
                          {["WhatsApp", "Copy Link", "SMS"].map((option) => (
                            <Pressable
                              key={option}
                              className="flex-1 py-3 rounded-lg items-center border border-border"
                            >
                              <Text className="text-xs font-semibold text-foreground">
                                {option}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      </View>

                      {/* WAITLIST */}
                      <View>
                        <Text className="text-sm font-semibold text-foreground mb-2">
                          Waitlist (0 members)
                        </Text>
                        <View
                          className="rounded-lg p-4 items-center"
                          style={{ backgroundColor: colors.surface }}
                        >
                          <Text className="text-sm text-muted">
                            Members will appear here as they join
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View className="flex-row gap-3">
                      <Pressable
                        onPress={() => setStep(2)}
                        className="flex-1 border border-border rounded-lg py-4 items-center"
                      >
                        <Text className="text-foreground font-bold">Back</Text>
                      </Pressable>
                      <Pressable
                        onPress={handleCompleteCircle}
                        className="flex-1 bg-primary rounded-lg py-4 items-center"
                      >
                        <Text className="text-white font-bold">Launch Circle</Text>
                      </Pressable>
                    </View>
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* JOIN CIRCLE FLOW */}
        <Modal visible={showJoinFlow} transparent animationType="slide">
          <View className="flex-1 bg-black/50 justify-end">
            <View
              className="bg-background rounded-t-3xl p-6 gap-4"
              style={{ backgroundColor: colors.background }}
            >
              <View className="items-center mb-2">
                <View className="w-12 h-1 bg-border rounded-full" />
              </View>

              <Text
                className="font-bold text-foreground mb-4"
                style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 17 }}
              >
                Join with Code
              </Text>

              <TextInput
                placeholder="Enter 6-character code"
                placeholderTextColor={colors.muted}
                value={joinCode}
                onChangeText={(text) => setJoinCode(text.toUpperCase())}
                maxLength={6}
                className="bg-surface rounded-lg px-4 py-4 text-foreground text-center text-lg font-bold mb-6"
              />

              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => setShowJoinFlow(false)}
                  className="flex-1 border border-border rounded-lg py-4 items-center"
                >
                  <Text className="text-foreground font-bold">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleJoinCircle}
                  className="flex-1 bg-primary rounded-lg py-4 items-center"
                >
                  <Text className="text-white font-bold">Join Circle</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* CIRCLE DETAIL MODAL */}
        <Modal visible={!!showDetailView} transparent animationType="slide">
          {selectedCircle && (
            <View className="flex-1 bg-background">
              <ScreenContainer className="bg-background">
                <ScrollView
                  contentContainerStyle={{ flexGrow: 1 }}
                  showsVerticalScrollIndicator={false}
                >
                  <View className="gap-6 pb-8">
                    {/* HEADER */}
                    <View className="flex-row justify-between items-center px-6 pt-4">
                      <Text
                        className="font-bold text-foreground flex-1"
                        style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 17 }}
                      >
                        {selectedCircle.name}
                      </Text>
                      <Pressable onPress={() => setShowDetailView(null)}>
                        <MaterialIcons name="close" size={24} color={colors.foreground} />
                      </Pressable>
                    </View>

                    {/* ─── PAYOUT DAY CELEBRATION BANNER ─── */}
                    {selectedCircle.isPayoutDay && (
                      <View style={{ paddingHorizontal: 24 }}>
                        <LinearGradient
                          colors={["#6B2080", "#8B3FAF", "#7A2898"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={{
                            borderRadius: 20,
                            padding: 24,
                            gap: 6,
                            shadowColor: "#4A1560",
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.3,
                            shadowRadius: 16,
                            elevation: 8,
                          }}
                        >
                          {/* Header label */}
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                            <Text style={{ fontSize: 14 }}>🎉</Text>
                            <Text
                              style={{
                                fontFamily: "DMSans_500Medium",
                                fontSize: 11,
                                color: "rgba(255,255,255,0.75)",
                                letterSpacing: 1.2,
                                textTransform: "uppercase",
                              }}
                            >
                              It's Payout Day!
                            </Text>
                          </View>

                          {/* Recipient name */}
                          <Text
                            style={{
                              fontFamily: "PlayfairDisplay_700Bold",
                              fontSize: 28,
                              color: "#FFFFFF",
                              lineHeight: 34,
                            }}
                          >
                            {selectedCircle.currentRecipient}'s turn!
                          </Text>

                          {/* Payout amount */}
                          <Text
                            style={{
                              fontFamily: "DMSans_700Bold",
                              fontSize: 32,
                              color: "rgba(255,255,255,0.9)",
                              marginBottom: 4,
                              marginTop: 2,
                              textDecorationLine: "line-through",
                              textDecorationColor: "rgba(255,255,255,0.4)",
                            }}
                          >
                            ₦{((selectedCircle.contribution * selectedCircle.members) / 1000).toFixed(0)},000
                          </Text>

                          {/* Tagline */}
                          <Text
                            style={{
                              fontFamily: "DancingScript_400Regular",
                              fontSize: 15,
                              color: "rgba(255,255,255,0.85)",
                              fontStyle: "italic",
                            }}
                          >
                            The circle is blessing her today 👡✨
                          </Text>
                        </LinearGradient>
                      </View>
                    )}

                    {/* CIRCLE INFO */}
                    <View className="px-6 gap-3">
                      <View className="flex-row justify-between items-center">
                        <View>
                          <Text className="text-xs text-muted mb-1">Members</Text>
                          <Text className="text-sm font-bold text-foreground">
                            {selectedCircle.members} people
                          </Text>
                        </View>
                        <View>
                          <Text className="text-xs text-muted mb-1">Round</Text>
                          <Text className="text-sm font-bold text-foreground">
                            {selectedCircle.currentRound}/{selectedCircle.totalRounds}
                          </Text>
                        </View>
                        <View>
                          <Text className="text-xs text-muted mb-1">Contribution</Text>
                          <Text className="text-sm font-bold text-foreground">
                            ₦{(selectedCircle.contribution / 1000).toFixed(0)}k
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* MEMBER LIST */}
                    <View className="px-6 gap-3">
                      <Text
                        className="text-lg font-bold text-foreground"
                        style={{ fontFamily: "PlayfairDisplay_700Bold" }}
                      >
                        Members
                      </Text>
                      {[
                        { name: "Temi", status: "👑", payment: "Paid" },
                        { name: "Chioma", status: "✅", payment: "Paid" },
                        { name: "Zainab", status: "⏳", payment: "Pending" },
                        { name: "Amara", status: "🔒", payment: "Future" },
                        { name: "Ngozi", status: "🔒", payment: "Future" },
                      ].map((member, idx) => (
                        <View
                          key={idx}
                          className="flex-row justify-between items-center bg-surface rounded-lg p-3"
                        >
                          <View className="flex-row items-center gap-3 flex-1">
                            {/* FIX 8 — Branded gradient avatar */}
                            <GradientAvatar name={member.name} size={40} borderColor={ROSE_GOLD} />
                            <View>
                              <Text className="text-sm font-bold text-foreground">
                                {member.name}
                              </Text>
                              <Text className="text-xs text-muted">{member.payment}</Text>
                            </View>
                          </View>
                          <Text className="text-lg">{member.status}</Text>
                        </View>
                      ))}
                    </View>

                    {/* CONTRIBUTION TRACKER */}
                    <View className="px-6 gap-3">
                      <Text
                        className="text-lg font-bold text-foreground"
                        style={{ fontFamily: "PlayfairDisplay_700Bold" }}
                      >
                        Payment Status
                      </Text>
                      <View
                        className="rounded-lg p-4 gap-3"
                        style={{ backgroundColor: colors.surface }}
                      >
                        <Text className="text-xs text-muted">
                          Round 1: ✅ ✅ ✅ ✅ ✅
                        </Text>
                        <Text className="text-xs text-muted">
                          Round 2: ✅ ✅ ⏳ 🔒 🔒
                        </Text>
                        <Text className="text-xs text-muted">
                          Round 3: 👑 ✅ ⏳ 🔒 🔒
                        </Text>
                      </View>
                    </View>

                    {/* MARK AS PAID BUTTON */}
                    <View className="px-6">
                      <Pressable
                        className="rounded-lg items-center overflow-hidden"
                        style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                      >
                        <LinearGradient colors={PLUSH_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="py-4 w-full items-center justify-center">
                          <Text className="text-white font-bold">Mark as Paid</Text>
                        </LinearGradient>
                      </Pressable>
                    </View>
                  </View>
                </ScrollView>
              </ScreenContainer>
            </View>
          )}
        </Modal>
      </PremiumGate>
      <PlushCelebration
        visible={showCelebration}
        onClose={() => {
          setShowCelebration(false);
          if (showCreateFlow) {
            setShowCreateFlow(false);
            setStep(1);
            setCircleName("");
            setContribution("");
            setFrequency("Monthly");
            setMaxMembers("5");
            setStartDate("");
            setPayoutOrder("random");
          }
          if (showJoinFlow) {
            setShowJoinFlow(false);
            setJoinCode("");
          }
        }}
        title={celebrationData.title}
        subtitle={celebrationData.subtitle}
      />

      <PlushModal
        visible={errorModal.visible}
        onClose={() => setErrorModal({ ...errorModal, visible: false })}
        title={errorModal.title}
        message={errorModal.message}
        type="error"
      />
    </ScreenContainer>
  );
}
