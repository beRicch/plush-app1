import {
  ScrollView,
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { EmptyState } from "@/components/plush-empty-state";
import { TooltipModal } from "@/components/plush-tooltip";
import { LinearGradient } from "expo-linear-gradient";
import { PLUSH_GRADIENT, PROGRESS_GRADIENT } from "@/components/plush-gradient";
import { PlushCelebration } from "@/components/plush-celebration";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";

interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  targetDate: string;
  monthlyContribution: number;
  motivation: string;
  coverColor: string;
}

const INITIAL_GOAL_PREFIX = "plush_goals_";

const DEFAULT_GOAL: Omit<Goal, "id"> = {
  name: "Plush Savings Target",
  target: 100000,
  current: 0,
  targetDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().slice(0, 10),
  monthlyContribution: 20000,
  motivation: "A custom target to kickstart your Plush journey.",
  coverColor: "#E8D5F5",
};

const GOAL_SUGGESTIONS = [
  "Emergency Fund",
  "Vacation",
  "Owambe Outfit",
  "New Phone",
  "Rent",
  "Business",
  "School Fees",
  "Just Because ✨",
];

const COVER_VIBES = [
  { id: "1", color: "#F5D5E3", name: "Blush" },
  { id: "2", color: "#E8D5F5", name: "Lavender" },
  { id: "3", color: "#D5F0E8", name: "Mint" },
  { id: "4", color: "#F5F0E8", name: "Cream" },
  { id: "5", color: "#FFE8D5", name: "Peach" },
  { id: "6", color: "#E8F5F0", name: "Sage" },
];

export default function GoalsScreen() {
  const colors = useColors();
  const { user, loading: authLoading } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loadingGoals, setLoadingGoals] = useState(true);
  const hasGoals = goals.length > 0;
  const [showCreateFlow, setShowCreateFlow] = useState(false);
  const [showDetailView, setShowDetailView] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  // #8 — Track which goal is selected for the floating FAB
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [showAddToGoal, setShowAddToGoal] = useState(false);
  const [addAmount, setAddAmount] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(new Date());
  // #11 — Warm error states
  const [goalNameError, setGoalNameError] = useState("");
  // #12 — Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  // #Milestone Celebration state
  const [showMilestoneCelebration, setShowMilestoneCelebration] = useState(false);
  const [milestoneData, setMilestoneData] = useState({ title: "", subtitle: "", emoji: "🎉" });

  // Form state
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [monthlyAmount, setMonthlyAmount] = useState("");
  const [selectedCover, setSelectedCover] = useState(COVER_VIBES[0].id);
  const [motivationNote, setMotivationNote] = useState("");
  const [quizData, setQuizData] = useState<{
    incomeFrequency?: string;
    monthlyIncomeRange?: string;
    targetGoalValue?: string;
  } | null>(null);

  const selectedGoal = goals.find((g) => g.id === showDetailView);

  const router = useRouter();
  const storageKey = user?.openId ? `${INITIAL_GOAL_PREFIX}${user.openId}` : null;

  const formatIsoDate = (date: Date) => date.toISOString().slice(0, 10);
  const today = new Date();
  const getDateOnly = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayOnly = getDateOnly(today);

  const isSameDay = (a: Date, b: Date) =>
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
        isFutureOrToday: dayNumber >= 1 && dayNumber <= daysInMonth && getDateOnly(date) >= todayOnly,
      };
    });
  };

  const handleDateSelect = (date: Date) => {
    setTargetDate(formatIsoDate(date));
    setShowDatePicker(false);
  };

  const goToMonth = (delta: number) => {
    setPickerMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  };

  const calculateDaysRemaining = (date: string) => {
    const target = new Date(date);
    const today = new Date();
    const diff = target.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days > 0 ? days : 0;
  };

  const estimateMonthsToTarget = (current: number, target: number, monthly: number) => {
    if (!monthly || monthly <= 0) return null;
    const remaining = Math.max(0, target - current);
    return Math.ceil(remaining / monthly);
  };

  const formatMonthText = (months: number | null) => {
    if (months === null) return "Set a monthly saving plan to estimate completion.";
    if (months <= 1) return "Less than 1 month";
    return `${months} months`;
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.round((current / target) * 100);
  };

  const persistGoals = async (nextGoals: Goal[]) => {
    if (!storageKey) return;
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(nextGoals));
    } catch (error) {
      console.error("Failed to persist goals", error);
    }
  };

  const createDefaultGoal = (): Goal => {
    return {
      id: `plush_default_goal_${user?.openId ?? Date.now()}`,
      ...DEFAULT_GOAL,
    };
  };

  const handleCreateGoal = () => {
    if (!goalName || !targetAmount || !targetDate) {
      setGoalNameError("Give your goal a name first — it needs one to hold space for you.");
      return;
    }

    createGoalMutation.mutate({
      name: goalName,
      targetAmount: Number(targetAmount),
      targetDate,
      motivation: motivationNote || "Your Plush is holding space for this goal.",
      coverColor: COVER_VIBES.find((v) => v.id === selectedCover)?.color ?? COVER_VIBES[0].color,
    });

    setGoalNameError("");
    setShowCreateFlow(false);
    // Navigate to the beautiful full-screen celebration page
    router.push(`/goal-celebration?goalName=${encodeURIComponent(goalName)}`);
    
    // Reset state after a short delay to avoid flickering
    setTimeout(() => {
      setStep(1);
      setGoalName("");
      setTargetAmount("");
      setTargetDate("");
    }, 500);
  };

  const handleCompleteGoal = () => {
    setShowCreateFlow(false);
    setStep(1);
    setGoalName("");
    setTargetAmount("");
    setTargetDate("");
    setMonthlyAmount("");
    setSelectedCover(COVER_VIBES[0].id);
    setMotivationNote("");
    setGoalNameError("");
  };

  const dashboardQuery = trpc.plush.analytics.dashboard.useQuery();
  const savingsRate = dashboardQuery.data?.totalSaved && dashboardQuery.data?.safeToSpend 
    ? Math.round((dashboardQuery.data.totalSaved / (dashboardQuery.data.totalSaved + dashboardQuery.data.safeToSpend)) * 100) 
    : 18; // Default to 18 if no data

  // tRPC Hooks
  const utils = trpc.useUtils();
  const { data: dbGoals, isLoading: loadingGoalsDb } = trpc.plush.savings.listGoals.useQuery(undefined, {
    enabled: !!user,
  });
  
  const createGoalMutation = trpc.plush.savings.createGoal.useMutation({
    onSuccess: () => {
      utils.plush.savings.listGoals.invalidate();
    },
  });

  const addDepositMutation = trpc.plush.savings.addDeposit.useMutation({
    onSuccess: () => {
      utils.plush.savings.listGoals.invalidate();
      if (selectedGoalId) {
        utils.plush.savings.listDeposits.invalidate({ goalId: selectedGoalId });
      }
    },
  });

  const { data: dbDeposits } = trpc.plush.savings.listDeposits.useQuery(
    { goalId: showDetailView || "" },
    { enabled: !!showDetailView }
  );

  useEffect(() => {
    if (dbGoals) {
      // Map DB goals to frontend Goal interface if needed
      const mappedGoals: Goal[] = dbGoals.map((g: any) => ({
        id: g.id,
        name: g.name,
        target: g.targetAmount,
        current: g.currentAmount,
        targetDate: g.targetDate,
        monthlyContribution: 0, // Not in schema yet, but can be added if needed
        motivation: g.motivationNote || "",
        coverColor: g.coverTheme || COVER_VIBES[0].color,
      }));
      setGoals(mappedGoals);
      setLoadingGoals(false);
    } else if (!loadingGoalsDb) {
      setLoadingGoals(false);
    }
  }, [dbGoals, loadingGoalsDb]);

  useEffect(() => {
    const loadQuizData = async () => {
      try {
        const raw = await AsyncStorage.getItem("plush_pending_onboarding");
        if (raw) setQuizData(JSON.parse(raw));
      } catch (e) {
        console.warn("Failed to load quiz data for suggestion", e);
      }
    };
    loadQuizData();
  }, []);

  const getDynamicSuggestion = () => {
    const incomeRange = user?.monthlyIncomeRange || quizData?.monthlyIncomeRange || "C";
    const frequency = quizData?.incomeFrequency || "A"; // Default to monthly
    
    const incomeValue = {
      A: 75000,
      B: 175000,
      C: 375000,
      D: 750000,
    }[incomeRange as "A" | "B" | "C" | "D"] ?? 375000;

    const recommendedRatio = 0.2; // 20%
    const monthlyRec = Math.round((incomeValue * recommendedRatio) / 5000) * 5000;
    
    if (frequency === "B") { // Weekly
      const weeklyRec = Math.round((monthlyRec / 4) / 1000) * 1000;
      const months = targetAmount ? Math.ceil(Number(targetAmount) / monthlyRec) : 6;
      return `Based on your weekly income, saving ₦${weeklyRec.toLocaleString()}/week gets you there in ${months} months. You've got this. 🌸`;
    }

    const months = targetAmount ? Math.ceil(Number(targetAmount) / monthlyRec) : 6;
    return `Based on your income, saving ₦${monthlyRec.toLocaleString()}/month gets you there in ${months} months. You've got this. 🌸`;
  };

  if (authLoading || loadingGoals) {
    return (
      <ScreenContainer className="bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#4A1560" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="bg-background">
      {/* #10 — Naira Naming Ceremony first-time tooltip */}
      <TooltipModal
        storageKey={storageKey ? `welcome_goal_prompt_${storageKey}` : "welcome_goal_prompt"}
        title="Your first Plush goal is ready"
        message="We created a goal for you on Goals. Tap it to start saving and make it real."
      />
      <TooltipModal
        storageKey="naira_naming"
        title="Naira Naming Ceremony 🌸"
        message="Give your savings goal a name. Money moves differently when it has a purpose."
      />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-6 pb-8">
          {/* HEADER */}
          <View className="px-6 pt-4">
            <Text
              className="font-bold text-foreground"
              style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 23 }}
            >
              Naira Naming Ceremonies 🌸
            </Text>
            <Text className="text-sm text-muted mt-1">
              Name your goals, secure the bag
            </Text>
          </View>

          {/* #6 — Warm empty state */}
          {!goals.length ? (
            <EmptyState
              illustration="🌸"
              headline="Name your first goal, sis"
              body="Money moves differently when it has a purpose."
            >
              <Pressable
                onPress={() => setShowCreateFlow(true)}
                className="rounded-full mt-4 overflow-hidden"
              >
                <LinearGradient colors={PLUSH_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="py-4 px-8 items-center justify-center">
                  <Text className="text-white font-bold">Create My First Ceremony ✨</Text>
                </LinearGradient>
              </Pressable>
            </EmptyState>
          ) : (
            <>
              {/* ACTIVE GOALS LIST */}
              <View className="px-6 gap-4">
                {goals.map((goal) => {
                  const percentage = getProgressPercentage(goal.current, goal.target);
                  const daysRemaining = calculateDaysRemaining(goal.targetDate);

                  return (
                    <View
                      key={goal.id}
                      className="rounded-2xl p-4 gap-3"
                      style={{ backgroundColor: colors.surface }}
                    >
                      {/* GOAL NAME */}
                      <Text className="text-base font-bold text-foreground">
                        {goal.name}
                      </Text>

                      {/* AMOUNTS */}
                      <View className="flex-row justify-between items-center">
                        <View>
                          <Text className="text-xs text-muted mb-1">Target</Text>
                          <Text className="text-sm font-bold text-foreground">
                            ₦{(goal.target / 1000).toFixed(0)}k
                          </Text>
                        </View>
                        <View>
                          <Text className="text-xs text-muted mb-1">Saved</Text>
                          <Text className="text-sm font-bold text-foreground">
                            ₦{(goal.current / 1000).toFixed(0)}k
                          </Text>
                        </View>
                        <View className="items-center">
                          <Text
                            className="text-2xl font-bold text-primary"
                            style={{ fontFamily: "PlayfairDisplay_700Bold" }}
                          >
                            {percentage}%
                          </Text>
                        </View>
                      </View>

                      {/* PROGRESS BAR */}
                      <View
                        style={{ height: 8, borderRadius: 999, overflow: "hidden", backgroundColor: "rgba(244,184,193,0.4)" }}
                      >
                        <LinearGradient
                          colors={PROGRESS_GRADIENT}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={{
                            height: "100%",
                            width: `${percentage}%`,
                            borderRadius: 999,
                          }}
                        />
                      </View>

                      {/* DATE & MOTIVATION */}
                      <View className="gap-2">
                        <Text className="text-xs text-muted">
                          {daysRemaining} days remaining
                        </Text>
                        <Text
                          className="text-xs italic text-primary"
                          style={{ fontFamily: "DancingScript_400Regular" }}
                        >
                          {goal.motivation}
                        </Text>
                      </View>

                      {/* BUTTONS — #8: removed "Add to Goal" from here, moved to floating FAB */}
                      <View className="flex-row gap-2 mt-2">
                        <Pressable
                          onPress={() => setSelectedGoalId(goal.id === selectedGoalId ? null : goal.id)}
                          className="flex-1 rounded-lg py-3 items-center"
                          style={{
                            borderWidth: 1.5,
                            borderColor: selectedGoalId === goal.id ? "#B76E79" : colors.border,
                            backgroundColor: selectedGoalId === goal.id ? "#B76E7915" : "transparent",
                          }}
                        >
                          <Text
                            className="font-bold text-sm"
                            style={{ color: selectedGoalId === goal.id ? "#B76E79" : colors.foreground }}
                          >
                            {selectedGoalId === goal.id ? "✓ Selected" : "Select Goal"}
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => setShowDetailView(goal.id)}
                          className="flex-1 border border-primary rounded-lg py-3 items-center"
                        >
                          <Text className="text-primary font-bold text-sm">
                            View Details
                          </Text>
                        </Pressable>
                        {/* #12 — Soft delete trigger */}
                        <Pressable
                          onPress={() => setShowDeleteConfirm(goal.id)}
                          className="w-11 h-11 items-center justify-center rounded-lg"
                          style={{ backgroundColor: colors.surface }}
                        >
                          <MaterialIcons name="delete-outline" size={18} color={colors.muted} />
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>

          {/* CREATE NEW GOAL BUTTON */}
          <View className="px-6">
            <Pressable
              onPress={() => setShowCreateFlow(true)}
              className="items-center justify-center"
              style={({ pressed }) => ({
                height: 52,
                borderRadius: 16,
                opacity: pressed ? 0.8 : 1,
                overflow: "hidden",
              })}
            >
              <LinearGradient
                colors={PLUSH_GRADIENT}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}
              >
                <Text className="text-white font-bold">Create New Ceremony</Text>
              </LinearGradient>
            </Pressable>
          </View>

              {/* SAVINGS RATE WIDGET */}
              <View className="px-6">
                <View
                  className="rounded-2xl p-4 gap-3"
                  style={{ backgroundColor: colors.surface }}
                >
                  <Text
                    className="text-lg font-bold text-foreground"
                    style={{ fontFamily: "PlayfairDisplay_700Bold" }}
                  >
                    Your Soft Savings Rate
                  </Text>
                  <View className="flex-row items-end gap-2">
                    <Text className="text-4xl font-bold text-primary">
                      {savingsRate}%
                    </Text>
                    <Text className="text-sm text-muted mb-1">
                      of monthly income
                    </Text>
                  </View>
                  <Text className="text-xs text-muted">
                    Financial experts suggest 20%. You're at {savingsRate}%. Almost there! 💜
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* #8 — Floating Rose Gold "Add to Goal" FAB */}
      {hasGoals && (
        <Pressable
          onPress={() => selectedGoalId ? setShowAddToGoal(true) : null}
          className="absolute right-6 bottom-24 w-16 h-16 rounded-full items-center justify-center"
          style={{
            backgroundColor: "#B76E79",
            opacity: selectedGoalId ? 1 : 0.5,
            shadowColor: "#B76E79",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <MaterialIcons name="add" size={28} color="#FAF5EF" />
        </Pressable>
      )}

      {/* #8 — Add to Goal bottom sheet */}
      <Modal visible={showAddToGoal} transparent animationType="slide">
        <View className="flex-1 bg-black/40 justify-end">
          <View
            className="rounded-t-3xl p-6 gap-4"
            style={{ backgroundColor: colors.background }}
          >
            <View className="items-center mb-2">
              <View className="w-12 h-1 bg-border rounded-full" />
            </View>
            <Text
              className="text-xl font-bold text-foreground"
              style={{ fontFamily: "PlayfairDisplay_700Bold" }}
            >
              Add to Goal 🌸
            </Text>
            <Text className="text-sm text-muted">
              {goals.find((g) => g.id === selectedGoalId)?.name}
            </Text>
            <View className="flex-row items-center bg-surface rounded-lg px-3 py-3">
              <Text className="text-lg font-bold text-muted mr-2">₦</Text>
              <TextInput
                placeholder="Enter amount"
                placeholderTextColor={colors.muted}
                keyboardType="decimal-pad"
                value={addAmount}
                onChangeText={setAddAmount}
                className="flex-1 text-foreground"
                autoFocus
              />
            </View>
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => { setShowAddToGoal(false); setAddAmount(""); }}
                className="flex-1 border border-border rounded-full py-4 items-center"
              >
                <Text className="text-foreground font-semibold">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={async () => { 
                  const amount = parseInt(addAmount);
                  if (!isNaN(amount) && selectedGoalId) {
                    try {
                      await addDepositMutation.mutateAsync({
                        goalId: selectedGoalId,
                        amount: amount,
                        date: new Date().toISOString().split("T")[0],
                      });

                      if (selectedGoal) {
                        const newCurrent = selectedGoal.current + amount;
                        const oldPercentage = getProgressPercentage(selectedGoal.current, selectedGoal.target);
                        const newPercentage = getProgressPercentage(newCurrent, selectedGoal.target);
                        
                        // Check for milestones
                        const milestones = [25, 50, 75, 100];
                        const hitMilestone = milestones.find(m => oldPercentage < m && newPercentage >= m);
                        
                        if (hitMilestone) {
                          setMilestoneData({
                            title: hitMilestone === 100 ? "Goal Achieved! 👑" : `${hitMilestone}% Complete! ✨`,
                            subtitle: hitMilestone === 100 
                              ? `You've fully funded ${selectedGoal.name}! Time to shine, sis! 🌸`
                              : `You've reached the ${hitMilestone}% milestone for ${selectedGoal.name}. Keep that energy! 💜`,
                            emoji: hitMilestone === 100 ? "👑" : "✨"
                          });
                          setShowMilestoneCelebration(true);
                        }
                      }
                    } catch (err) {
                      console.error("Failed to add deposit", err);
                    }
                  }
                  setShowAddToGoal(false); 
                  setAddAmount(""); 
                }}
                className="flex-1 rounded-full py-4 items-center"
                style={{ backgroundColor: "#B76E79" }}
              >
                <Text className="font-bold" style={{ color: "#FAF5EF" }}>Add 🌸</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showDatePicker} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View
            className="bg-background rounded-t-3xl p-6 gap-4 max-h-[90%]"
            style={{ backgroundColor: colors.background }}
          >
            <View className="items-center mb-2">
              <View className="w-12 h-1 bg-border rounded-full" />
            </View>

            <View>
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
                  const isSelected = item.isValid && targetDate === formatIsoDate(item.date);
                  return (
                    <Pressable
                      key={`${item.date.toISOString()}-${item.dayNumber}`}
                      onPress={() => item.isFutureOrToday && handleDateSelect(item.date)}
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
            </View>

            <View className="flex-row gap-3 mt-4">
              <Pressable
                onPress={() => setShowDatePicker(false)}
                className="flex-1 border border-border rounded-lg py-4 items-center"
              >
                <Text className="text-foreground font-bold">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => setShowDatePicker(false)}
                className="flex-1 rounded-lg items-center overflow-hidden"
              >
                <LinearGradient colors={PLUSH_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="py-4 w-full items-center justify-center">
                  <Text className="text-white font-bold">Done</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <PlushCelebration 
        visible={showMilestoneCelebration}
        onClose={() => setShowMilestoneCelebration(false)}
        title={milestoneData.title}
        subtitle={milestoneData.subtitle}
        emoji={milestoneData.emoji}
      />

      {/* #12 — Delete goal confirmation bottom sheet */}
      <Modal visible={!!showDeleteConfirm} transparent animationType="slide">
        <View className="flex-1 bg-black/40 justify-end">
          <View
            className="rounded-t-3xl p-6 gap-4"
            style={{ backgroundColor: colors.background }}
          >
            <View className="items-center mb-2">
              <View className="w-12 h-1 bg-border rounded-full" />
            </View>
            <Text
              className="text-xl font-bold text-foreground"
              style={{ fontFamily: "PlayfairDisplay_700Bold" }}
            >
              Delete this goal? 💔
            </Text>
            <Text className="text-sm text-muted">
              Are you sure you want to delete this goal? This can't be undone. 💔
            </Text>
            <View className="flex-row gap-3 mt-2">
              <Pressable
                onPress={() => setShowDeleteConfirm(null)}
                className="flex-1 rounded-full overflow-hidden"
              >
                <LinearGradient
                  colors={PLUSH_GRADIENT}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ paddingVertical: 16, alignItems: "center" }}
                >
                  <Text className="font-bold" style={{ color: "#FAF5EF" }}>Keep my goal 🌸</Text>
                </LinearGradient>
              </Pressable>
              <Pressable
                onPress={() => { setShowDeleteConfirm(null); }}
                className="flex-1 border border-border rounded-full py-4 items-center"
              >
                <Text className="font-semibold text-muted">Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* CREATE GOAL FLOW - BOTTOM SHEET */}
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
              {/* STEP 1: NAME YOUR GOAL */}
              {step === 1 && (
                <>
                  <Text
                    className="text-2xl font-bold text-foreground mb-4"
                    style={{ fontFamily: "PlayfairDisplay_700Bold" }}
                  >
                    What are you saving for, love?
                  </Text>

                  <TextInput
                    placeholder="e.g. My Soft Life Safety Net"
                    placeholderTextColor={colors.muted}
                    value={goalName}
                    onChangeText={setGoalName}
                    className="bg-surface rounded-lg px-4 py-3 text-foreground mb-4"
                  />

                  <Text className="text-xs text-muted mb-2">Quick suggestions:</Text>
                  <View className="flex-row flex-wrap gap-2 mb-6">
                    {GOAL_SUGGESTIONS.map((suggestion) => (
                      <Pressable
                        key={suggestion}
                        onPress={() => setGoalName(suggestion)}
                        className="px-3 py-2 rounded-full border border-primary"
                      >
                        <Text className="text-xs text-primary">{suggestion}</Text>
                      </Pressable>
                    ))}
                  </View>

                  <View style={{ flexDirection: "row", gap: 10, marginBottom: 8 }}>
                    <Pressable
                      onPress={() => { setShowCreateFlow(false); setStep(1); }}
                      style={{
                        flex: 1,
                        height: 54,
                        borderRadius: 16,
                        borderWidth: 1.5,
                        borderColor: colors.border,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 15, color: colors.muted }}>Cancel</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setStep(2)}
                      style={{ flex: 1.6, borderRadius: 16, overflow: "hidden" }}
                    >
                      <LinearGradient
                        colors={PLUSH_GRADIENT}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ height: 54, alignItems: "center", justifyContent: "center" }}
                      >
                        <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 15, color: "#FAF5EF" }}>Next</Text>
                      </LinearGradient>
                    </Pressable>
                  </View>
                </>
              )}

              {/* STEP 2: SET THE NUMBERS */}
              {step === 2 && (
                <>
                  <Text
                    className="text-2xl font-bold text-foreground mb-4"
                    style={{ fontFamily: "PlayfairDisplay_700Bold" }}
                  >
                    Set the Numbers
                  </Text>

                  <View className="gap-4 mb-6">
                    {/* AMOUNT */}
                    <View>
                      <Text className="text-sm font-semibold text-foreground mb-1">
                        How much do you need? (₦)
                      </Text>
                      <View className="flex-row items-center bg-surface rounded-lg px-3 py-3">
                        <Text className="text-lg font-bold text-muted mr-2">₦</Text>
                        <TextInput
                          placeholder="0"
                          placeholderTextColor={colors.muted}
                          keyboardType="decimal-pad"
                          value={targetAmount}
                          onChangeText={setTargetAmount}
                          className="flex-1 text-foreground"
                        />
                      </View>
                    </View>

                    {/* DATE */}
                    <View>
                      <Text className="text-sm font-semibold text-foreground mb-1">
                        By when?
                      </Text>
                      <Pressable
                        onPress={() => {
                          setShowDatePicker(true);
                          setPickerMonth(new Date());
                        }}
                        className="bg-surface rounded-lg px-4 py-3 flex-row items-center justify-between"
                        style={{ minHeight: 54 }}
                      >
                        <Text
                          style={{ color: targetDate ? colors.foreground : colors.muted }}
                        >
                          {targetDate || "YYYY-MM-DD"}
                        </Text>
                        <MaterialIcons name="calendar-today" size={20} color={colors.muted} />
                      </Pressable>
                    </View>

                    {/* MONTHLY AMOUNT */}
                    <View>
                      <Text className="text-sm font-semibold text-foreground mb-1">
                        Monthly contribution (₦, optional)
                      </Text>
                      <View className="flex-row items-center bg-surface rounded-lg px-3 py-3">
                        <Text className="text-lg font-bold text-muted mr-2">₦</Text>
                        <TextInput
                          placeholder="Auto-calculated"
                          placeholderTextColor={colors.muted}
                          keyboardType="decimal-pad"
                          value={monthlyAmount}
                          onChangeText={setMonthlyAmount}
                          className="flex-1 text-foreground"
                        />
                      </View>
                    </View>

                    {/* AI SUGGESTION */}
                    <View
                      className="rounded-lg p-3"
                      style={{ backgroundColor: colors.primary + "20" }}
                    >
                      <Text className="text-xs text-primary">
                        💡 {getDynamicSuggestion()}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: "row", gap: 10, marginBottom: 8 }}>
                    <Pressable
                      onPress={() => setStep(1)}
                      style={{
                        flex: 1,
                        height: 54,
                        borderRadius: 16,
                        borderWidth: 1.5,
                        borderColor: colors.border,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 15, color: colors.muted }}>Back</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setStep(3)}
                      style={{ flex: 1.6, borderRadius: 16, overflow: "hidden" }}
                    >
                      <LinearGradient
                        colors={PLUSH_GRADIENT}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ height: 54, alignItems: "center", justifyContent: "center" }}
                      >
                        <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 15, color: "#FAF5EF" }}>Next</Text>
                      </LinearGradient>
                    </Pressable>
                  </View>
                </>
              )}

              {/* STEP 3: MAKE IT REAL */}
              {step === 3 && (
                <>
                  <Text
                    className="text-2xl font-bold text-foreground mb-4"
                    style={{ fontFamily: "PlayfairDisplay_700Bold" }}
                  >
                    Make It Real
                  </Text>

                  <Text className="text-sm font-semibold text-foreground mb-3">
                    Choose a cover vibe
                  </Text>
                  <View className="flex-row flex-wrap gap-2 mb-6">
                    {COVER_VIBES.map((vibe) => (
                      <Pressable
                        key={vibe.id}
                        onPress={() => setSelectedCover(vibe.id)}
                        className="w-16 h-16 rounded-lg border-2"
                        style={{
                          backgroundColor: vibe.color,
                          borderColor:
                            selectedCover === vibe.id ? colors.primary : "transparent",
                          borderWidth: selectedCover === vibe.id ? 2 : 0,
                        }}
                      />
                    ))}
                  </View>

                  <View>
                    <Text className="text-sm font-semibold text-foreground mb-1">
                      Add a motivation note (optional)
                    </Text>
                    <TextInput
                      placeholder="Max 100 characters"
                      placeholderTextColor={colors.muted}
                      value={motivationNote}
                      onChangeText={(text) =>
                        setMotivationNote(text.substring(0, 100))
                      }
                      maxLength={100}
                      multiline
                      className="bg-surface rounded-lg px-4 py-3 text-foreground mb-6"
                      style={{ minHeight: 80 }}
                    />
                  </View>

                  <View style={{ flexDirection: "row", gap: 10, marginBottom: 8 }}>
                    {/* Cancel — dismisses entire flow */}
                    <Pressable
                      onPress={() => { setShowCreateFlow(false); setStep(1); }}
                      style={{
                        flex: 1,
                        height: 54,
                        borderRadius: 16,
                        borderWidth: 1.5,
                        borderColor: colors.border,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 15, color: colors.muted }}>Cancel</Text>
                    </Pressable>

                    {/* Create Goal — gradient CTA */}
                    <Pressable
                      onPress={handleCreateGoal}
                      style={{ flex: 1.6, borderRadius: 16, overflow: "hidden" }}
                    >
                      <LinearGradient
                        colors={PLUSH_GRADIENT}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ height: 54, alignItems: "center", justifyContent: "center" }}
                      >
                        <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 15, color: "#FAF5EF" }}>Create Goal</Text>
                      </LinearGradient>
                    </Pressable>
                  </View>
                </>
              )}

              {/* STEP 4: CELEBRATION */}
              {step === 4 && (
                <View className="items-center justify-center py-8 gap-4">
                  <Text className="text-5xl">🎉</Text>
                  <Text
                    className="text-2xl font-bold text-foreground text-center"
                    style={{ fontFamily: "PlayfairDisplay_700Bold" }}
                  >
                    Your Naira Naming Ceremony is complete!
                  </Text>
                  <Text className="text-sm text-muted text-center">
                    Your Plush is holding space for {goalName}. Now let's fill it.
                  </Text>

                  <Pressable
                    onPress={handleCompleteGoal}
                    className="rounded-lg mt-4 overflow-hidden"
                  >
                    <LinearGradient colors={PLUSH_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="py-4 px-8 items-center justify-center">
                      <Text className="text-white font-bold text-center">
                        Done ✨
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* GOAL DETAIL MODAL */}
      <Modal visible={!!showDetailView} transparent animationType="slide">
        {selectedGoal && (
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
                      className="text-2xl font-bold text-foreground flex-1"
                      style={{ fontFamily: "PlayfairDisplay_700Bold" }}
                    >
                      {selectedGoal.name}
                    </Text>
                    <Pressable onPress={() => setShowDetailView(null)}>
                      <MaterialIcons name="close" size={24} color={colors.foreground} />
                    </Pressable>
                  </View>

                  {/* PROGRESS VISUALIZATION */}
                  <View className="px-6 gap-3">
                    <View className="gap-2">
                      <View className="flex-row justify-between items-center">
                        <Text className="text-sm font-semibold text-foreground">
                          Progress
                        </Text>
                        <Text className="text-sm font-bold text-primary">
                          {getProgressPercentage(
                            selectedGoal.current,
                            selectedGoal.target
                          )}%
                        </Text>
                      </View>
                      <View
                        style={{ height: 8, borderRadius: 999, overflow: "hidden", backgroundColor: "rgba(244,184,193,0.4)" }}
                      >
                        <LinearGradient
                          colors={PROGRESS_GRADIENT}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={{
                            height: "100%",
                            width: `${getProgressPercentage(
                              selectedGoal.current,
                              selectedGoal.target
                            )}%`,
                            borderRadius: 999,
                          }}
                        />
                      </View>
                      <View className="gap-1">
                        <Text className="text-xs text-foreground font-semibold">
                          ₦{(selectedGoal.current / 1000).toFixed(0)}k of ₦
                          {(selectedGoal.target / 1000).toFixed(0)}k
                        </Text>
                        <Text className="text-xs text-muted">
                          {calculateDaysRemaining(selectedGoal.targetDate)} days remaining
                        </Text>
                      </View>
                    </View>

                    <View className="mt-4 rounded-3xl border border-border bg-surface p-4">
                      <Text className="text-sm font-semibold text-foreground mb-3">
                        Goal Timeline
                      </Text>
                      <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-xs text-muted">Target to save</Text>
                        <Text className="text-sm font-bold text-foreground">
                          ₦{(selectedGoal.target / 1000).toFixed(0)}k
                        </Text>
                      </View>
                      <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-xs text-muted">Monthly savings</Text>
                        <Text className="text-sm font-bold text-foreground">
                          ₦{(selectedGoal.monthlyContribution / 1000).toFixed(0)}k
                        </Text>
                      </View>
                      <View className="flex-row justify-between items-center">
                        <Text className="text-xs text-muted">Estimated completion</Text>
                        <Text className="text-sm font-bold text-foreground">
                          {formatMonthText(
                            estimateMonthsToTarget(
                              selectedGoal.current,
                              selectedGoal.target,
                              selectedGoal.monthlyContribution,
                            ),
                          )}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* TRANSACTION HISTORY */}
                  <View className="px-6 gap-3">
                    <Text
                      className="text-lg font-bold text-foreground"
                      style={{ fontFamily: "PlayfairDisplay_700Bold" }}
                    >
                      Deposits
                    </Text>
                    {dbDeposits && dbDeposits.length > 0 ? (
                      dbDeposits.map((deposit: any, idx: number) => (
                        <View
                          key={deposit.id}
                          className="flex-row justify-between items-center bg-surface rounded-lg p-3"
                        >
                          <View>
                            <Text className="text-sm font-bold text-foreground">
                              Deposit
                            </Text>
                            <Text className="text-xs text-muted">{deposit.date}</Text>
                          </View>
                          <Text className="text-sm font-bold text-foreground">
                            +₦{(deposit.amount / 1000).toFixed(0)}k
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text className="text-xs text-muted italic">No deposits yet. Start filling your goal! 🌸</Text>
                    )}
                  </View>

                  <View className="px-6">
                    <Pressable
                      onPress={() => {
                        if (!selectedGoal) return;
                        const params = new URLSearchParams({
                          goalName: selectedGoal.name,
                          category: "Savings",
                          source: "goal",
                        }).toString();
                        router.push(`/log?${params}`);
                      }}
                      style={({ pressed }) => ({ 
                        opacity: pressed ? 0.8 : 1,
                        borderRadius: 16,
                        overflow: "hidden"
                      })}
                    >
                      <LinearGradient
                        colors={PLUSH_GRADIENT}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ paddingVertical: 16, alignItems: "center" }}
                      >
                        <Text className="text-white font-bold">Add Money to Goal</Text>
                      </LinearGradient>
                    </Pressable>
                  </View>
                </View>
              </ScrollView>
            </ScreenContainer>
          </View>
        )}
      </Modal>
    </ScreenContainer>
  );
}
