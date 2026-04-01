import {
  ScrollView,
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/lib/revenuecat";
import { PremiumGate } from "@/components/premium-gate";
import { PlushCelebration } from "@/components/plush-celebration";
import { PlushModal } from "@/components/plush-modal";
import { LinearGradient } from "expo-linear-gradient";
import { GradientAvatar, PLUSH_GRADIENT } from "@/components/plush-gradient";
import { trpc } from "@/lib/trpc";
import { PlushBottomSheet } from "@/components/plush-bottom-sheet";
import { useAuth } from "@/hooks/use-auth";
import * as Auth from "@/lib/_core/auth";

// Brand colours
const ROSE_GOLD = "#B76E79";
const DEEP_PLUM = "#4A1560";
const CREAM = "#FAF5EF";
const BLUSH_PINK = "#F4B8C1";

// Mock data removed - using real tRPC queries

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
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");

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
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(new Date());
  const [sliderWidth, setSliderWidth] = useState(0);
  const [errorModal, setErrorModal] = useState<{ visible: boolean; title: string; message: string }>({
    visible: false,
    title: "",
    message: "",
  });
  const { isPremium, loading: subLoading } = useSubscription();

  const minCircleMembers = 2;
  const maxCircleMembers = 20;
  const memberCount = Math.max(minCircleMembers, Math.min(maxCircleMembers, Number(maxMembers) || minCircleMembers));

  const formatIsoDate = (date: Date) => date.toISOString().slice(0, 10);
  const getDateOnly = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayOnly = getDateOnly(new Date());
  const isSameDay = (a: Date, b: Date | null) =>
    b !== null &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const getCalendarDays = () => {
    const month = new Date(pickerMonth.getFullYear(), pickerMonth.getMonth(), 1);
    const firstWeekday = month.getDay();
    const daysInMonth = new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() + 1, 0).getDate();
    const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

    return Array.from({ length: totalCells }, (_, index) => {
      const dayNumber = index - firstWeekday + 1;
      const date = new Date(pickerMonth.getFullYear(), pickerMonth.getMonth(), dayNumber);
      return {
        dayNumber,
        date,
        isValid: dayNumber >= 1 && dayNumber <= daysInMonth,
        isFutureOrToday:
          dayNumber >= 1 &&
          dayNumber <= daysInMonth &&
          getDateOnly(date) >= todayOnly,
      };
    });
  };

  const handleStartDateSelect = (date: Date) => {
    setStartDate(formatIsoDate(date));
    setShowStartDatePicker(false);
  };

  const selectedStartDate = startDate ? new Date(startDate) : null;

  const goToMonth = (delta: number) => {
    setPickerMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  };

  // tRPC Hooks
  const { user, loading: authLoading } = useAuth();
  const utils = trpc.useContext();
  const { data: circles, isLoading: circlesLoading, error: circlesError } = trpc.plush.ajo.list.useQuery(undefined, {
    enabled: !!user,
  });
  const createMutation = trpc.plush.ajo.create.useMutation({
    onSuccess: () => {
      utils.plush.ajo.list.invalidate();
    },
  });
  const joinMutation = trpc.plush.ajo.join.useMutation({
    onSuccess: () => {
      utils.plush.ajo.list.invalidate();
    },
  });
  const contributeMutation = trpc.plush.ajo.contribute.useMutation({
    onSuccess: () => {
      utils.plush.ajo.details.invalidate({ circleId: showDetailView || "" });
    },
  });

  const { data: selectedCircleDetails, isLoading: detailsLoading } = trpc.plush.ajo.details.useQuery(
    { circleId: showDetailView || "" },
    { enabled: !!showDetailView }
  );

  const { data: chatHistoryData, refetch: refetchChat } = trpc.plush.ajo.getMessages.useQuery(
    { circleId: showDetailView || "" },
    { enabled: !!showDetailView && showChat, placeholderData: [] }
  );

  const sendMessageMutation = trpc.plush.ajo.sendMessage.useMutation({
    onSuccess: () => {
      refetchChat();
    },
  });

  const chatHistory = chatHistoryData || [];

  const isUnauthorized = Boolean(
    circlesError?.data?.code === "UNAUTHORIZED" ||
    circlesError?.message?.toLowerCase().includes("unauthorized")
  );

  const handleUnlock = () => {
    setErrorModal({
      visible: true,
      title: "Premium Feature",
      message: "Ajo Circles are a premium feature. Unlock to save with your girls! 🌸",
    });
  };

  const selectedCircle = circles?.find((c) => c.id === showDetailView);

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

  const handleCompleteCircle = async () => {
    if (!user) {
      setErrorModal({
        visible: true,
        title: "Sign in required",
        message: "You need to be signed in to create an Ajo Circle. Please sign in and try again.",
      });
      return;
    }

    const contributionAmt = parseInt(contribution);
    const maxMems = parseInt(maxMembers);

    if (isNaN(contributionAmt) || contributionAmt <= 0) {
      setErrorModal({
        visible: true,
        title: "Invalid Amount",
        message: "Please enter a valid contribution amount. It must be a number greater than 0. 🌸",
      });
      return;
    }

    if (isNaN(maxMems) || maxMems < 2) {
      setErrorModal({
        visible: true,
        title: "Invalid Members",
        message: "A circle needs at least 2 members. 🌸",
      });
      return;
    }

    try {
      const newCircle = await createMutation.mutateAsync({
        name: circleName,
        contributionAmount: contributionAmt,
        frequency: frequency,
        maxMembers: maxMems,
        payoutOrder: payoutOrder,
        totalRounds: maxMems,
      });

      setCelebrationData({
        title: "Circle Created! 🎉",
        subtitle: `Your Ajo Circle "${circleName}" is ready!\n\nInvite Code: ${newCircle.inviteCode}`,
      });
      setShowCelebration(true);
      setShowCreateFlow(false);
      setStep(1);
    } catch (err: any) {
      setErrorModal({
        visible: true,
        title: "Creation Error",
        message:
          err?.message?.includes("Unauthorized") || err?.data?.code === "UNAUTHORIZED"
            ? "Your session expired. Please sign in again."
            : err.message || "Something went wrong, sis 🌸",
      });
    }
  };

  const handleJoinCircle = async () => {
    if (!joinCode) {
      setErrorModal({
        visible: true,
        title: "Missing Code",
        message: "Please enter a valid invite code to join your girls! 🌸",
      });
      return;
    }
    try {
      await joinMutation.mutateAsync({ inviteCode: joinCode });
      setCelebrationData({
        title: "✨ Joined!",
        subtitle: `You've joined the Ajo Circle!\n\nYou'll be notified when it's your turn.`,
      });
      setShowCelebration(true);
      setShowJoinFlow(false);
    } catch (err: any) {
      setErrorModal({
        visible: true,
        title: "Join Error",
        message: err.message || "Invalid code or circle is full, sis 🌸",
      });
    }
  };

  if (authLoading) {
    return (
      <ScreenContainer className="bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#4A1560" />
      </ScreenContainer>
    );
  }

  if (!user) {
    return (
      <ScreenContainer className="bg-background items-center justify-center px-6">
        <Text className="text-xl font-bold text-foreground text-center">
          You need to sign in to use Ajo Circles.
        </Text>
        <Text className="text-sm text-muted text-center mt-3">
          Sign in and come back to create or join a circle with your girls.
        </Text>
        <Pressable
          onPress={() => router.push("/auth")}
          className="mt-6 rounded-full overflow-hidden"
        >
          <LinearGradient
            colors={PLUSH_GRADIENT}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="py-4 px-8 items-center justify-center"
          >
            <Text className="text-white font-bold">Sign in to continue</Text>
          </LinearGradient>
        </Pressable>
      </ScreenContainer>
    );
  }

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
            {!circlesLoading && (!circles || circles.length === 0) ? (
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
                    className="flex-1 rounded-lg items-center overflow-hidden"
                  >
                    <LinearGradient colors={PLUSH_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="py-4 w-full items-center justify-center">
                      <Text className="text-white font-bold">Create a Circle</Text>
                    </LinearGradient>
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
                  {circlesLoading && (
                    <Text className="text-center text-muted py-4">Loading your circles... 🌸</Text>
                  )}
                  {circles?.map((circle) => (
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
                            ₦{(circle.contributionAmount / 1000).toFixed(0)}k
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
                            Current recipient: Round {circle.currentRound + 1} 👑
                          </Text>
                        </View>
                        <View className="flex-row justify-between items-center">
                          <Text className="text-xs text-muted">
                            Status: {circle.status}
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
        <PlushBottomSheet visible={showCreateFlow} onClose={() => setShowCreateFlow(false)}>
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
                        <View style={{ flexDirection: "row" }}>
                          {["Weekly", "Biweekly", "Monthly"].map((freq, index) => (
                            <Pressable
                              key={freq}
                              onPress={() => setFrequency(freq)}
                              style={{
                                flex: 1,
                                minHeight: 48,
                                borderRadius: 16,
                                overflow: "hidden",
                                marginRight: index < 2 ? 8 : 0,
                              }}
                            >
                              {frequency === freq ? (
                                <LinearGradient
                                  colors={PLUSH_GRADIENT}
                                  start={{ x: 0, y: 0 }}
                                  end={{ x: 1, y: 1 }}
                                  style={{
                                    flex: 1,
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Text className="font-semibold text-sm text-white">{freq}</Text>
                                </LinearGradient>
                              ) : (
                                <View
                                  style={{
                                    flex: 1,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: colors.surface,
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                  }}
                                >
                                  <Text className="font-semibold text-sm text-muted">{freq}</Text>
                                </View>
                              )}
                            </Pressable>
                          ))}
                        </View>
                      </View>

                      {/* MINIMUM MEMBERS */}
                      <View>
                        <Text className="text-sm font-semibold text-foreground mb-1">
                          Minimum members: {memberCount}
                        </Text>
                        <View className="bg-surface rounded-2xl px-3 py-3">
                          <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-xs text-muted">2</Text>
                            <Text className="text-xs text-muted">{memberCount}</Text>
                            <Text className="text-xs text-muted">20</Text>
                          </View>
                          <View
                            className="rounded-full"
                            onLayout={(event) => setSliderWidth(event.nativeEvent.layout.width)}
                            style={{
                              backgroundColor: colors.border,
                              height: 10,
                              overflow: "hidden",
                            }}
                          >
                            <Pressable
                              onPress={(event) => {
                                if (!sliderWidth) return;
                                const x = event.nativeEvent.locationX;
                                const ratio = Math.max(0, Math.min(1, x / sliderWidth));
                                const value = Math.round(minCircleMembers + ratio * (maxCircleMembers - minCircleMembers));
                                setMaxMembers(String(value));
                              }}
                              style={{ width: "100%", height: "100%" }}
                            >
                              <View
                                style={{
                                  width: `${((memberCount - minCircleMembers) / (maxCircleMembers - minCircleMembers)) * 100}%`,
                                  height: "100%",
                                  backgroundColor: colors.primary,
                                }}
                              />
                              <View
                                style={{
                                  position: "absolute",
                                  left: `${((memberCount - minCircleMembers) / (maxCircleMembers - minCircleMembers)) * 100}%`,
                                  top: -7,
                                  transform: [{ translateX: -12 }],
                                }}
                              >
                                <View
                                  style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: 12,
                                    backgroundColor: colors.primary,
                                    borderWidth: 3,
                                    borderColor: colors.background,
                                  }}
                                />
                              </View>
                            </Pressable>
                          </View>
                        </View>
                      </View>

                      {/* START DATE */}
                      <View>
                        <Text className="text-sm font-semibold text-foreground mb-1">
                          Start date
                        </Text>
                        <Pressable
                          onPress={() => setShowStartDatePicker(true)}
                          className="flex-row items-center justify-between bg-surface rounded-lg px-4 py-3"
                          style={{ borderWidth: 1, borderColor: colors.border }}
                        >
                          <Text className="text-foreground">
                            {startDate || "Choose a start date"}
                          </Text>
                          <MaterialIcons name="calendar-today" size={20} color={colors.muted} />
                        </Pressable>
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
                        className="flex-1 rounded-lg items-center overflow-hidden"
                      >
                        <LinearGradient colors={PLUSH_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="py-4 w-full items-center justify-center">
                          <Text className="text-white font-bold">Next</Text>
                        </LinearGradient>
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
                        className="flex-1 rounded-lg items-center overflow-hidden"
                      >
                        <LinearGradient colors={PLUSH_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="py-4 w-full items-center justify-center">
                          <Text className="text-white font-bold">Launch Circle</Text>
                        </LinearGradient>
                      </Pressable>
                    </View>
                  </>
                )}
              </ScrollView>
              {/* START DATE PICKER SECTION (previously a modal, now part of create flow or a sibling sheet) */}
              {showStartDatePicker && (
                <View className="mt-4 p-4 border-t border-border">
                  <View className="flex-row items-center justify-between mb-4">
                    <Pressable onPress={() => goToMonth(-1)} className="px-3 py-2 rounded-full border border-border">
                      <MaterialIcons name="chevron-left" size={20} color={colors.foreground} />
                    </Pressable>
                    <Text className="font-bold text-foreground">
                      {pickerMonth.toLocaleString("default", { month: "long" })} {pickerMonth.getFullYear()}
                    </Text>
                    <Pressable onPress={() => goToMonth(1)} className="px-3 py-2 rounded-full border border-border">
                      <MaterialIcons name="chevron-right" size={20} color={colors.foreground} />
                    </Pressable>
                  </View>

                  <View className="flex-row justify-between mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => (
                      <Text key={label} className="text-[10px] text-muted text-center flex-1">
                        {label}
                      </Text>
                    ))}
                  </View>

                  <View className="flex-wrap flex-row">
                    {getCalendarDays().map((item) => {
                      const isSelected = item.isValid && isSameDay(item.date, selectedStartDate);
                      return (
                        <Pressable
                          key={`${item.date.toISOString()}-${item.dayNumber}`}
                          onPress={() => item.isFutureOrToday && handleStartDateSelect(item.date)}
                          disabled={!item.isFutureOrToday}
                          className="w-[14.28%] h-12 items-center justify-center rounded-full mb-2"
                          style={{
                            backgroundColor: item.isValid
                              ? isSelected
                                ? colors.primary
                                : item.isFutureOrToday
                                  ? colors.surface
                                  : "transparent"
                              : "transparent",
                          }}
                        >
                          <Text
                            className="text-xs"
                            style={{
                              color: item.isValid
                                ? isSelected
                                  ? "white"
                                  : item.isFutureOrToday
                                    ? colors.foreground
                                    : colors.muted
                                : "transparent",
                            }}
                          >
                            {item.isValid ? item.dayNumber : ""}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <Pressable
                    onPress={() => setShowStartDatePicker(false)}
                    className="mt-4 rounded-lg items-center overflow-hidden"
                  >
                    <LinearGradient colors={PLUSH_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="py-3 w-full items-center justify-center">
                      <Text className="text-white font-bold">Done</Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              )}
          </PlushBottomSheet>

        {/* JOIN CIRCLE FLOW */}
        <PlushBottomSheet visible={showJoinFlow} onClose={() => setShowJoinFlow(false)}>
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
                  className="flex-1 rounded-lg items-center overflow-hidden"
                >
                  <LinearGradient colors={PLUSH_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="py-4 w-full items-center justify-center">
                    <Text className="text-white font-bold">Join Circle</Text>
                  </LinearGradient>
                </Pressable>
              </View>
        </PlushBottomSheet>

        {/* CIRCLE DETAIL MODAL */}
        <PlushBottomSheet visible={!!showDetailView} onClose={() => setShowDetailView(null)}>
          {selectedCircle && (
            <View className="bg-background">
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
                      <View className="flex-row gap-2">
                        <Pressable 
                          onPress={() => setShowChat(true)}
                          className="w-12 h-12 bg-surface rounded-full items-center justify-center border border-border"
                        >
                          <MaterialIcons name="chat-bubble-outline" size={20} color={colors.primary} />
                        </Pressable>
                        <Pressable onPress={() => setShowDetailView(null)}>
                          <MaterialIcons name="close" size={24} color={colors.foreground} />
                        </Pressable>
                      </View>
                    </View>

                    {/* ─── PAYOUT DAY CELEBRATION BANNER ─── */}
                    {selectedCircle.status === "active" && (
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
                            {selectedCircleDetails?.members[selectedCircle.currentRound]?.name || "Upcoming"}'s turn!
                          </Text>

                          {/* Payout amount */}
                          <Text
                            style={{
                              fontFamily: "DMSans_700Bold",
                              fontSize: 32,
                              color: "rgba(255,255,255,0.9)",
                              marginBottom: 4,
                              marginTop: 2,
                            }}
                          >
                            ₦{((selectedCircle.contributionAmount * selectedCircle.maxMembers) / 1000).toFixed(0)},000
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
                            {selectedCircleDetails?.members.length || 0}/{selectedCircle.maxMembers}
                          </Text>
                        </View>
                        <View>
                          <Text className="text-xs text-muted mb-1">Round</Text>
                          <Text className="text-sm font-bold text-foreground">
                            {selectedCircle.currentRound + 1}/{selectedCircle.totalRounds}
                          </Text>
                        </View>
                        <View>
                          <Text className="text-xs text-muted mb-1">Contribution</Text>
                          <Text className="text-sm font-bold text-foreground">
                            ₦{(selectedCircle.contributionAmount / 1000).toFixed(0)}k
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
                      {detailsLoading && <Text className="text-muted text-xs">Fetching sisters... 🌸</Text>}
                      {selectedCircleDetails?.members.map((member: any) => {
                        const hasPaid = selectedCircleDetails.contributions.some(
                          (c: any) => c.userId === member.id && c.roundNumber === (selectedCircle as any).currentRound
                        );
                        return (
                          <View
                            key={member.id}
                            className="flex-row justify-between items-center bg-surface rounded-lg p-3"
                          >
                            <View className="flex-row items-center gap-3 flex-1">
                              <GradientAvatar name={member.name || "Sister"} size={40} borderColor={ROSE_GOLD} />
                              <View>
                                <Text className="text-sm font-bold text-foreground">
                                  {member.name}
                                </Text>
                                <Text className="text-xs text-muted">
                                  {hasPaid ? "Paid for this round" : "Pending payment"}
                                </Text>
                              </View>
                            </View>
                            <Text className="text-lg">{hasPaid ? "✅" : "⏳"}</Text>
                          </View>
                        );
                      })}
                      {(!selectedCircleDetails?.members || selectedCircleDetails.members.length === 0) && !detailsLoading && (
                        <Text className="text-muted text-center py-4 text-xs italic">Just you so far, sis! Invite the girls 🌸</Text>
                      )}
                    </View>

                    {/* RECENT ACTIVITY / TRANSPARENCY */}
                    <View className="px-6 gap-3">
                      <Text
                        className="text-lg font-bold text-foreground"
                        style={{ fontFamily: "PlayfairDisplay_700Bold" }}
                      >
                        Recent Activity
                      </Text>
                      <View className="bg-surface rounded-lg p-4 gap-4">
                        {selectedCircleDetails?.contributions.slice(0, 3).map((activity: any) => (
                          <View key={activity.id} className="flex-row items-center gap-3">
                            <View className="w-8 h-8 bg-success/10 rounded-full items-center justify-center">
                              <Text className="text-[10px]">✅</Text>
                            </View>
                            <View className="flex-1">
                              <Text className="text-xs font-bold text-foreground">
                                Member paid ₦{(activity.amount / 1000).toFixed(0)}k
                              </Text>
                              <Text className="text-[10px] text-muted">Round {activity.roundNumber}</Text>
                            </View>
                          </View>
                        ))}
                        {(!selectedCircleDetails?.contributions || selectedCircleDetails.contributions.length === 0) && (
                          <Text className="text-muted text-xs italic text-center">No contributions yet this round 🌸</Text>
                        )}
                      </View>
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
                        onPress={async () => {
                          try {
                            await contributeMutation.mutateAsync({
                              circleId: selectedCircle.id,
                              roundNumber: selectedCircle.currentRound,
                              amount: selectedCircle.contributionAmount,
                            });
                            Alert.alert("Beautiful! ✨", "Your contribution has been recorded, sister.");
                          } catch (err: any) {
                            Alert.alert("Oops!", err.message || "Something went wrong.");
                          }
                        }}
                        disabled={contributeMutation.isPending}
                        className="rounded-lg items-center overflow-hidden"
                        style={({ pressed }) => ({ opacity: pressed || contributeMutation.isPending ? 0.8 : 1 })}
                      >
                        <LinearGradient colors={PLUSH_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="py-4 w-full items-center justify-center">
                          <Text className="text-white font-bold">
                            {contributeMutation.isPending ? "Blessing the circle..." : "Mark as Paid"}
                          </Text>
                        </LinearGradient>
                      </Pressable>
                    </View>
                  </View>
                </ScrollView>
              </View>
            )}
          </PlushBottomSheet>

          {/* CHAT MODAL */}
          <PlushBottomSheet visible={showChat} onClose={() => setShowChat(false)} maxHeight="80%">
                {/* Chat Header */}
                <View className="flex-row justify-between items-center p-6 border-b border-border">
                  <View className="flex-row items-center gap-3">
                    <Text className="text-xl">🌸</Text>
                    <View>
                      <Text className="font-bold text-foreground">Circle Chat</Text>
                      <Text className="text-[10px] text-success">5 members online</Text>
                    </View>
                  </View>
                  <Pressable onPress={() => setShowChat(false)}>
                    <MaterialIcons name="close" size={24} color={colors.foreground} />
                  </Pressable>
                </View>

                {/* Messages */}
                <ScrollView className="flex-1 p-6 gap-4">
                  {chatHistory.map((msg) => (
                    <View 
                      key={msg.id} 
                      className={cn(
                        "max-w-[80%] rounded-2xl p-3 mb-4",
                        msg.isSystem ? "bg-primary/10 self-center" : "bg-surface self-start"
                      )}
                    >
                      {!msg.isSystem && (
                        <Text className="text-[10px] font-bold text-primary mb-1">{msg.sender}</Text>
                      )}
                      <Text className={cn("text-sm", msg.isSystem ? "text-primary italic text-center text-xs" : "text-foreground")}>
                        {msg.message}
                      </Text>
                      <Text className="text-[8px] text-muted mt-1 text-right">
                        {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  ))}
                </ScrollView>

                {/* Input */}
                <View className="p-6 border-t border-border flex-row gap-3 items-center">
                  <TextInput
                    placeholder="Type a message..."
                    placeholderTextColor={colors.muted}
                    value={chatMessage}
                    onChangeText={setChatMessage}
                    className="flex-1 bg-surface rounded-full px-4 py-3 text-sm text-foreground"
                  />
                  <Pressable 
                    onPress={async () => {
                      if (chatMessage.trim() && showDetailView) {
                        const msg = chatMessage;
                        setChatMessage("");
                        try {
                          await sendMessageMutation.mutateAsync({
                            circleId: showDetailView,
                            message: msg,
                          });
                        } catch (err) {
                          Alert.alert("Error", "Could not send message 🌸");
                        }
                      }
                    }}
                    disabled={sendMessageMutation.isPending}
                    className="w-12 h-12 rounded-full overflow-hidden items-center justify-center"
                  >
                    <LinearGradient colors={PLUSH_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="w-full h-full items-center justify-center">
                      <MaterialIcons name="send" size={20} color="white" />
                    </LinearGradient>
                  </Pressable>
                </View>
          </PlushBottomSheet>
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
