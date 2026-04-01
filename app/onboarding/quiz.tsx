import { Text, View, Pressable, ScrollView } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { cn } from "@/lib/utils";
import { LinearGradient } from "expo-linear-gradient";
import { PROGRESS_GRADIENT, PLUSH_GRADIENT } from "@/components/plush-gradient";

const QUIZ_QUESTIONS = [
  {
    id: 1,
    type: "question",
    question: "Why are you saving?",
    microcopy: "This tells our AI what to prioritize in your personalized plan.",
    answers: [
      { id: "A", text: "🚨 Build an emergency fund" },
      { id: "B", text: "🛑 Stop living paycheck to paycheck" },
      { id: "C", text: "✈️ Fund my soft life" },
      { id: "D", text: "💸 Pay off debt" },
    ],
  },
  {
    id: 2,
    type: "question",
    question: "How are your savings right now?",
    microcopy: "Be honest. We just need a starting point—no judgment here.",
    answers: [
      { id: "A", text: "🤷‍♀️ What savings?" },
      { id: "B", text: "😅 I save but spend it later" },
      { id: "C", text: "🐢 Consistent but small" },
      { id: "D", text: "📈 Growing steadily" },
    ],
  },
  {
    id: 3,
    type: "interstitial",
    title: "You're not alone.",
    description: "85% of women using Plush felt anxious about their finances before they started. We're about to change that.",
    buttonText: "Keep going",
  },
  {
    id: 4,
    type: "question",
    question: "How does your income come in?",
    microcopy: "This determines how Plush structures saving cycles.",
    answers: [
      { id: "A", text: "📅 Monthly salary" },
      { id: "B", text: "⏳ Weekly income" },
      { id: "C", text: "🔀 Irregular / freelance" },
      { id: "D", text: "🌐 Multiple income sources" },
    ],
  },
  {
    id: 5,
    type: "question",
    question: "Roughly how much do you make each month?",
    microcopy: "This helps Plush set a goal that fits your real income.",
    answers: [
      { id: "A", text: "Under ₦100k" },
      { id: "B", text: "₦100k - ₦250k" },
      { id: "C", text: "₦250k - ₦500k" },
      { id: "D", text: "Over ₦500k" },
    ],
  },
  {
    id: 6,
    type: "question",
    question: "Do you know where your money goes?",
    microcopy: "This helps us decide between budgeting help, spending awareness, or saving discipline.",
    answers: [
      { id: "A", text: "📊 I track everything" },
      { id: "B", text: "🤔 I have an idea" },
      { id: "C", text: "🙈 I honestly don't know" },
      { id: "D", text: "💨 My money disappears" },
    ],
  },
  {
    id: 7,
    type: "question",
    question: "What usually stops you from saving?",
    microcopy: "This helps Plush design nudges and automations that actually work for you.",
    answers: [
      { id: "A", text: "🚨 Unexpected expenses" },
      { id: "B", text: "🛍️ Lifestyle spending" },
      { id: "C", text: "📉 Low income" },
      { id: "D", text: "🧠 I forget to save" },
    ],
  },
  {
    id: 8,
    type: "question",
    question: "What's a realistic savings target for the next 3-6 months?",
    microcopy: "Your target determines the pace of your Plush Plan.",
    answers: [
      { id: "A", text: "🥉 ₦50k - ₦150k" },
      { id: "B", text: "🥈 ₦200k - ₦500k" },
      { id: "C", text: "🥇 ₦500k - ₦1M" },
      { id: "D", text: "💎 ₦1M+" },
    ],
  },
  {
    id: 8,
    type: "interstitial",
    title: "Your goal is highly achievable.",
    description: "Plush members who set concrete targets reach them 2x faster than those using spreadsheets.",
    buttonText: "Build my plan",
  }
];

export default function QuizScreen() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});

  const question = QUIZ_QUESTIONS[currentQuestion];
  const isAnswered = selectedAnswers[question.id] !== undefined;
  const isLastQuestion = currentQuestion === QUIZ_QUESTIONS.length - 1;

  const getArchetypeKey = (answers: Record<number, string>) => {
    const score: Record<string, number> = {
      "bloom-saver": 0,
      "ritual-builder": 0,
      "soft-strategist": 0,
      "vault-visionary": 0,
      balanced: 0,
    };

    const add = (key: string) => {
      score[key] = (score[key] ?? 0) + 1;
    };

    const tagMap: Record<number, Record<string, string>> = {
      1: { A: "bloom-saver", B: "ritual-builder", C: "soft-strategist", D: "vault-visionary" },
      2: { A: "bloom-saver", B: "ritual-builder", C: "balanced", D: "vault-visionary" },
      4: { A: "balanced", B: "ritual-builder", C: "soft-strategist", D: "vault-visionary" },
      5: { A: "balanced", B: "soft-strategist", C: "ritual-builder", D: "vault-visionary" },
      6: { A: "balanced", B: "ritual-builder", C: "bloom-saver", D: "soft-strategist" },
      7: { A: "bloom-saver", B: "ritual-builder", C: "soft-strategist", D: "balanced" },
      8: { A: "bloom-saver", B: "balanced", C: "soft-strategist", D: "vault-visionary" },
    };

    for (const [questionId, answerId] of Object.entries(answers)) {
      const qId = Number(questionId);
      const mapping = tagMap[qId];
      const archetype = mapping?.[answerId];
      if (archetype) {
        add(archetype);
      }
    }

    return Object.entries(score).sort((a, b) => b[1] - a[1])[0][0] || "balanced";
  };

  const getPlanFromAnswers = (answers: Record<number, string>) => {
    const numericValue = (amount: number) => String(amount);
    const goalMap: Record<string, number> = {
      A: 100_000,
      B: 350_000,
      C: 750_000,
      D: 1_500_000,
    };
    const deadlineMap: Record<string, string> = {
      A: "May 2026",
      B: "July 2026",
      C: "September 2026",
      D: "December 2026",
    };
    const monthsMap: Record<string, number> = {
      A: 3,
      B: 5,
      C: 6,
      D: 9,
    };
    const allowanceFactor: Record<string, number> = {
      A: 0.15,
      B: 0.25,
      C: 0.1,
      D: 0.12,
    };

    const targetValue = goalMap[answers[8] ?? "B"] ?? 500_000;
    const baseMonths = monthsMap[answers[8] ?? "C"] ?? 6;
    const incomeModifier = {
      A: 1,
      B: 0.95,
      C: 1.1,
      D: 0.9,
    }[answers[4] ?? "A"] ?? 1;
    const incomeRangeFactor = {
      A: 0.75,
      B: 0.85,
      C: 1,
      D: 1.15,
    }[answers[5] ?? "C"] ?? 1;
    const incomeScale = {
      A: 0.75,
      B: 0.85,
      C: 1,
      D: 1.2,
    }[answers[6] ?? "C"] ?? 1;
    const monthlyValue = Math.max(5_000, Math.round((targetValue / baseMonths) / 5_000) * 5_000);
    const adjustedMonthly = Math.max(
      5_000,
      Math.round((monthlyValue * incomeModifier * incomeScale * incomeRangeFactor) / 5_000) * 5_000,
    );
    const allowanceValue = Math.max(5_000, Math.round((adjustedMonthly * (allowanceFactor[answers[7] ?? "B"] ?? 0.18)) / 5_000) * 5_000);

    const ritual = answers[5] === "C" || answers[5] === "D"
      ? "Weekly money clarity ritual"
      : "Weekly money momentum ritual";
    const ritualDetail = answers[5] === "D"
      ? "Every Sunday at 7 PM with automated reminders"
      : "Every Sunday at 7 PM";

    const planReason = {
      A: "Emergency fund foundation",
      B: "Cashflow stability",
      C: "Soft-life savings structure",
      D: "Debt-free momentum",
    }[answers[1] ?? "C"];

    return {
      targetGoal: numericValue(targetValue),
      targetDate: deadlineMap[answers[7] ?? "C"] ?? "September 2026",
      monthlyTarget: numericValue(adjustedMonthly),
      allowance: numericValue(allowanceValue),
      ritual,
      ritualDetail,
      planReason,
    };
  };

  const handleSelectAnswer = (answerId: string) => {
    const nextAnswers = {
      ...selectedAnswers,
      [question.id]: answerId,
    };

    setSelectedAnswers(nextAnswers);
    
    // Automatically advance after a brief delay for visual feedback
    setTimeout(async () => {
      if (isLastQuestion) {
        const archetype = getArchetypeKey(nextAnswers);
        const plan = getPlanFromAnswers(nextAnswers);
        
        // Save onboarding data for late sync
        try {
          await AsyncStorage.setItem("plush_pending_onboarding", JSON.stringify({
            moneyPersonality: archetype,
            monthlyIncomeRange: nextAnswers[5],
            incomeFrequency: nextAnswers[4],
            weeklyCap: nextAnswers[7],
            targetGoalValue: nextAnswers[8],
          }));
        } catch (e) {
          console.warn("Failed to save pending onboarding data", e);
        }

        router.push({ pathname: "./generating-plan", params: { archetype, ...plan, incomeRange: nextAnswers[5] ?? "C" } });
      } else {
        setCurrentQuestion((prev) => prev + 1);
      }
    }, 300);
  };

  const handleNext = async () => {
    if (isLastQuestion) {
      const archetype = getArchetypeKey(selectedAnswers);
      const plan = getPlanFromAnswers(selectedAnswers);

      // Save onboarding data for late sync
      try {
        await AsyncStorage.setItem("plush_pending_onboarding", JSON.stringify({
          moneyPersonality: archetype,
          monthlyIncomeRange: selectedAnswers[5],
          incomeFrequency: selectedAnswers[4],
          weeklyCap: selectedAnswers[7],
          targetGoalValue: selectedAnswers[8],
        }));
      } catch (e) {
        console.warn("Failed to save pending onboarding data", e);
      }

      router.push({ pathname: "./generating-plan", params: { archetype, ...plan, incomeRange: selectedAnswers[5] ?? "C" } });
    } else {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const progressPercentage = ((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100;

  return (
    <ScreenContainer
      edges={["top", "left", "right"]}
      containerClassName="bg-background"
      className="flex-1"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-6 pb-12 gap-6 flex-1">
          {/* #5 — Progress counter: centred, Deep Plum, DM Sans */}
          <View className="gap-2">
            <Text
              style={{
                fontFamily: "DMSans_400Regular",
                fontSize: 12,
                color: "#4A1560",
                textAlign: "center",
                fontWeight: "600",
                letterSpacing: 0.5,
              }}
            >
              Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}
            </Text>
            <View className="h-2 bg-border rounded-full overflow-hidden">
              <LinearGradient
                colors={PROGRESS_GRADIENT}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  height: "100%",
                  width: `${progressPercentage}%`,
                  borderRadius: 9999,
                }}
              />
            </View>
          </View>

          {/* Interstitial View */}
          {question.type === "interstitial" && (
            <View className="gap-6 flex-1 justify-center py-10">
              <Text
                className="font-bold text-primary text-center leading-tight"
                style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 23 }}
              >
                {question.title}
              </Text>
              <Text className="font-dm-sans text-lg text-muted text-center leading-relaxed">
                {question.description}
              </Text>
              <Pressable
                onPress={handleNext}
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                    borderRadius: 16,
                    overflow: "hidden",
                    marginTop: 32,
                  },
                ]}
              >
                <LinearGradient
                  colors={PLUSH_GRADIENT}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ width: "100%", alignItems: "center", justifyContent: "center", paddingVertical: 16, paddingHorizontal: 24 }}
                >
                  <Text className="text-background font-dm-sans font-semibold text-base flex-1 text-center">
                    {question.buttonText}
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          )}

          {/* Question View */}
          {question.type === "question" && (
            <View className="gap-6 flex-1">
              <View className="gap-2">
                <Text className="font-playfair text-2xl font-bold text-primary leading-tight">
                  {question.question}
                </Text>
                {question.microcopy && (
                  <Text className="font-dm-sans text-sm text-muted leading-relaxed">
                    {question.microcopy}
                  </Text>
                )}
              </View>

              {/* Answer Options */}
              <View className="gap-3 mt-2">
                {question.answers?.map((answer) => (
                  <Pressable
                    key={answer.id}
                    onPress={() => handleSelectAnswer(answer.id)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                    className={cn(
                      "border-2 rounded-2xl p-4 flex-row items-center gap-4 transition-colors",
                      selectedAnswers[question.id] === answer.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-surface"
                    )}
                  >
                    {/* Radio Circle */}
                    <View
                      className={cn(
                        "w-5 h-5 rounded-full border-2 items-center justify-center",
                        selectedAnswers[question.id] === answer.id
                          ? "border-primary bg-primary"
                          : "border-border"
                      )}
                    >
                      {selectedAnswers[question.id] === answer.id && (
                        <Text className="text-accentGold text-[10px] text-center font-bold">✓</Text>
                      )}
                    </View>

                    <Text 
                      className={cn(
                        "font-dm-sans text-base flex-1 leading-relaxed",
                         selectedAnswers[question.id] === answer.id
                          ? "text-primary font-medium"
                          : "text-foreground"
                      )}
                    >
                      {answer.text}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Navigation Buttons */}
          <View className="gap-3 mt-auto">
            {currentQuestion > 0 && (
              <Pressable
                onPress={handleBack}
                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1, paddingVertical: 8 }]}
                className="items-center"
              >
                <Text className="text-primary font-dm-sans font-semibold text-sm">Back</Text>
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
