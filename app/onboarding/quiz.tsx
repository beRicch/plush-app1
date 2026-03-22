import { Text, View, Pressable, ScrollView } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useState } from "react";
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
    id: 6,
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
    id: 7,
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

  const handleSelectAnswer = (answerId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [question.id]: answerId,
    }));
    
    // Automatically advance after a brief delay for visual feedback
    setTimeout(() => {
      if (isLastQuestion) {
        router.push("./generating-plan");
      } else {
        setCurrentQuestion((prev) => prev + 1);
      }
    }, 300);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      router.push("./generating-plan");
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
