import {
  ScrollView,
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  FlatList,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { formatNaira } from "@/lib/utils";
import { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Toast, AnimatedPressable } from "@/components/plush-animations";
import { EmptyState } from "@/components/plush-empty-state";
import { LinearGradient } from "expo-linear-gradient";
import { PLUSH_GRADIENT } from "@/components/plush-gradient";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { trpc } from "@/lib/trpc";
import { useAudioRecorder, AudioModule, RecordingOptions } from "expo-audio";
import { useSubscription } from "@/lib/revenuecat";
import { useRouter } from "expo-router";
import { PlushBottomSheet } from "@/components/plush-bottom-sheet";

const BLUSH_PINK = "#F4B8C1";
const DEEP_PLUM = "#4A1560";
const PAID_FEATURE_COLOR = "#EFE6F3";
const MEMBER_FEATURE_COLOR = "#FFFFFF";

// Mock data
const ENTRY_MODES = [
  {
    id: "screenshot",
    icon: "📸",
    name: "Screenshot",
    description: "Snap your bank alert",
    color: PAID_FEATURE_COLOR,
    tier: "ai",
  },
  {
    id: "voice",
    icon: "🎤",
    name: "Voice Note",
    description: "Speak it naturally",
    color: PAID_FEATURE_COLOR,
    tier: "ai",
  },
  {
    id: "camera",
    icon: "📷",
    name: "Camera Scan",
    description: "Point at your receipt",
    color: PAID_FEATURE_COLOR,
    tier: "ai",
  },
  {
    id: "text",
    icon: "✍️",
    name: "Quick Text",
    description: "Type it casually",
    color: MEMBER_FEATURE_COLOR,
    tier: "member",
  },
];

const CATEGORIES = [
  "Beauty",
  "Food",
  "Transport",
  "Savings",
  "Ajo",
  "Owambe",
  "Airtime",
  "Fashion",
  "Health",
  "Family",
  "Shopping",
  "Bills",
  "Entertainment",
  "Income",
  "Other",
];

const CATEGORY_ICONS: Record<string, string> = {
  Beauty: "💄",
  Food: "🍽️",
  Transport: "🚗",
  Savings: "🏦",
  Ajo: "💰",
  Owambe: "🎉",
  Airtime: "📱",
  Fashion: "👗",
  Health: "💊",
  Family: "👨‍👩‍👧",
  Shopping: "🛍️",
  Bills: "💡",
  Entertainment: "🎬",
  Income: "💵",
  Other: "📌",
};

// Mock data removed - using real tRPC queries

const MOCK_EXTRACTED_DATA = {
  merchant: "",
  amount: 0,
  category: "Other",
  date: new Date().toISOString().split("T")[0],
  type: "expense",
  softComment: "Great job logging your expense! 🌸",
};

export default function LogScreen() {
  const colors = useColors();
  const router = useRouter();

  // RevenueCat Hook
  const { isPremium, loading: subLoading } = useSubscription();
  const userTier = isPremium ? "ai" : "free";

  // tRPC Hooks
  const utils = trpc.useUtils();

  const parseScreenshot = trpc.plush.aiEntry.parseScreenshot.useMutation();
  const parseCamera = trpc.plush.aiEntry.parseCamera.useMutation();
  const parseVoice = trpc.plush.aiEntry.parseVoice.useMutation();
  const parseText = trpc.plush.aiEntry.parseText.useMutation();
  const createExpense = trpc.plush.expenses.create.useMutation();

  const expensesQuery = trpc.plush.expenses.list.useQuery();
  const recentEntries = expensesQuery.data || [];

  const params = useLocalSearchParams() as {
    goalName?: string;
    category?: string;
    source?: string;
  };

  const [activeMode, setActiveMode] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showUpgradeSheet, setShowUpgradeSheet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [amountError, setAmountError] = useState("");
  const [aiParseError, setAiParseError] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    merchant: params.goalName ? `Goal deposit: ${params.goalName}` : "",
    amount: "0",
    category: params.category ?? (params.goalName ? "Savings" : "Other"),
    date: new Date().toISOString().split("T")[0],
    type: "expense" as "expense" | "income",
    softComment: params.goalName ? `Deposit toward ${params.goalName}` : "",
  });

  const [selectedCategory, setSelectedCategory] = useState(
    params.category ?? (params.goalName ? "Savings" : "Other")
  );

  const fileToBase64 = async (uri: string) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: "base64",
      });
      return base64;
    } catch (error) {
      console.error("Error reading file:", error);
      throw error;
    }
  };

  const recorder = useAudioRecorder({
    extension: ".m4a",
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
    android: {
      extension: ".m4a",
      sampleRate: 44100,
      outputFormat: "mpeg4",
      audioEncoder: "aac",
    },
    ios: {
      extension: ".m4a",
      sampleRate: 44100,
      audioQuality: 0,
    },
    web: {},
  });
  const [isRecording, setIsRecording] = useState(false);

  const handleModePress = async (modeId: string) => {
    const mode = ENTRY_MODES.find((m) => m.id === modeId);
    if (!mode) return;

    // Check tier access
    if (mode.tier === "ai" && !isPremium) {
      setShowUpgradeSheet(true);
      return;
    }

    if (mode.tier === "member" && !isPremium) {
      setShowUpgradeSheet(true);
      return;
    }

    setActiveMode(modeId);

    try {
      if (modeId === "screenshot") {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
          base64: false, // We'll use FileSystem to be safe with large files
        });

        if (!result.canceled && result.assets[0].uri) {
          setIsLoading(true);
          const base64 = await fileToBase64(result.assets[0].uri);
          const parsed = await parseScreenshot.mutateAsync({
            imageBase64: base64,
          });
          updateFormDataFromAI(parsed);
        } else {
          setActiveMode(null);
        }
      } else if (modeId === "voice") {
        if (isRecording) {
          setIsRecording(false);
          setIsLoading(true);
          await recorder.stop();
          const recordingUri = recorder.uri;
          if (recordingUri) {
            const base64 = await fileToBase64(recordingUri);
            const parsed = await parseVoice.mutateAsync({
              audioBase64: base64,
            });
            updateFormDataFromAI(parsed);
          }
        } else {
          setIsRecording(true);
          recorder.record();
          return; // Stay in recording state
        }
      } else if (modeId === "text") {
        // For text, we'll use the manual entry's merchant field as the "Magic Input"
        // and add a button to trigger the parse.
        if (formData.merchant.trim().length > 5) {
          setIsLoading(true);
          const parsed = await parseText.mutateAsync({
            text: formData.merchant,
          });
          updateFormDataFromAI(parsed);
        } else {
          setAiParseError("Type a bit more for me to parse, queen! 🌸");
          setActiveMode(null);
        }
      }
    } catch (error) {
      console.error("AI Parse Error:", error);
      setAiParseError("Plush couldn't read that properly. Try again? 🌸");
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormDataFromAI = (data: any) => {
    setFormData({
      merchant: data.merchant || "Manual Entry",
      amount: (data.amount || 0).toString(),
      category: data.category || "Other",
      date: data.date || new Date().toISOString().split("T")[0],
      type: data.type || "expense",
      softComment: data.aiSoftComment || "Logged with AI ✨",
    });
    setSelectedCategory(data.category || "Other");
    setShowConfirmation(true);
  };

  const handleConfirmEntry = async () => {
    if (!formData.amount || formData.amount === "0") {
      setAmountError("How much was it, love? Add an amount to log this. 🌸");
      return;
    }

    setIsLoading(true);
    try {
      await createExpense.mutateAsync({
        amount: parseFloat(formData.amount),
        merchant: formData.merchant,
        category: formData.category,
        date: formData.date,
        type: formData.type,
        entryMethod: activeMode || "manual",
        notes: formData.softComment, // or a separate notes field
      });

      setAmountError("");
      setShowConfirmation(false);
      setActiveMode(null);
      setShowToast(true);
      utils.plush.expenses.list.invalidate();

      // Reset form
      setFormData({
        merchant: "",
        amount: "0",
        category: "Other",
        date: new Date().toISOString().split("T")[0],
        type: "expense",
        softComment: "",
      });
    } catch (error) {
      console.error("Save Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgradeTap = () => {
    setShowUpgradeSheet(false);
    router.push("/onboarding/paywall?from=profile");
  };

  return (
    <ScreenContainer className="bg-background">
      {/* #2 — Rose Gold toast */}
      <Toast
        visible={showToast}
        message="Logged. Your vault sees it. 💜"
        onHide={() => setShowToast(false)}
      />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-6 pb-8">
          {/* HEADER */}
          <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
            <Text
              style={{ fontSize: 24, fontWeight: "bold", color: "#1A1A1A", fontFamily: "PlayfairDisplay_700Bold" }}
            >
              Log with AI ✨
            </Text>
            <Text style={{ fontSize: 14, color: "#666666", marginTop: 4 }}>
              Choose how to log your expense
            </Text>
          </View>

          {/* ENTRY MODE SELECTOR - 2x2 GRID */}
          <View style={{ paddingHorizontal: 24, gap: 16, marginTop: 16, width: "100%" }}>
            <View style={{ flexDirection: "row", gap: 16, width: "100%" }}>
              {ENTRY_MODES.slice(0, 2).map((mode) => {
                const isLocked =
                  (mode.tier === "ai" && userTier !== "ai") ||
                  (mode.tier === "member" && userTier === "free");
                const isModeActive = activeMode === mode.id;

                return (
                  <AnimatedPressable
                    key={mode.id}
                    onPress={() => handleModePress(mode.id)}
                    style={{
                      flex: 1,
                      flexDirection: "column",
                      borderRadius: 16,
                      padding: 16,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: isModeActive && mode.id === "voice" && isRecording
                          ? "#B76E79"
                          : mode.color,
                      opacity: isLocked ? 0.45 : 1,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                      gap: 4
                    }}
                  >
                    <Text style={{ fontSize: 32, marginBottom: 4 }}>
                      {mode.id === "voice" && isRecording ? "⏹️" : mode.icon}
                    </Text>
                    <Text 
                      style={{ fontSize: 14, fontWeight: "bold", textAlign: "center", color: DEEP_PLUM }}
                    >
                      {mode.id === "voice" && isRecording
                        ? "Recording..."
                        : mode.name}
                    </Text>
                    <Text 
                      style={{ fontSize: 10, textAlign: "center", color: DEEP_PLUM, opacity: 0.5, lineHeight: 14 }}
                    >
                      {mode.id === "voice" && isRecording
                        ? "Tap to stop"
                        : mode.description}
                    </Text>

                    {isLocked && (
                      <View className="absolute top-2 right-2">
                        <MaterialIcons
                          name="lock"
                          size={14}
                          color={colors.muted}
                        />
                      </View>
                    )}
                  </AnimatedPressable>
                );
              })}
            </View>

            <View style={{ flexDirection: "row", gap: 16, width: "100%" }}>
              {ENTRY_MODES.slice(2, 4).map((mode) => {
                const isLocked =
                  (mode.tier === "ai" && userTier !== "ai") ||
                  (mode.tier === "member" && userTier === "free");

                return (
                  <AnimatedPressable
                    key={mode.id}
                    onPress={() => handleModePress(mode.id)}
                    style={{
                      flex: 1,
                      flexDirection: "column",
                      borderRadius: 16,
                      padding: 16,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: mode.color,
                      opacity: isLocked ? 0.45 : 1,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                      gap: 4
                    }}
                  >
                    <Text style={{ fontSize: 32, marginBottom: 4 }}>{mode.icon}</Text>
                    <Text 
                      style={{ fontSize: 14, fontWeight: "bold", textAlign: "center", color: DEEP_PLUM }}
                    >
                      {mode.name}
                    </Text>
                    <Text 
                      style={{ fontSize: 10, textAlign: "center", color: DEEP_PLUM, opacity: 0.5, lineHeight: 14 }}
                    >
                      {mode.description}
                    </Text>

                    {isLocked && (
                      <View className="absolute top-2 right-2">
                        <MaterialIcons
                          name="lock"
                          size={14}
                          color={colors.muted}
                        />
                      </View>
                    )}
                  </AnimatedPressable>
                );
              })}
            </View>
          </View>

          {/* MANUAL ENTRY FORM */}
          <View className="px-6 gap-4">
            <Text
              className="text-lg font-bold text-foreground"
              style={{ fontFamily: "PlayfairDisplay_700Bold" }}
            >
              Manual Entry
            </Text>

            <View className="gap-3">
              {/* MERCHANT */}
              <View>
                <Text className="text-sm font-semibold text-foreground mb-1">
                  Merchant
                </Text>
                <View className="flex-row items-center gap-2">
                  <TextInput
                    placeholder="e.g. Sephora"
                    placeholderTextColor={colors.muted}
                    value={formData.merchant}
                    onChangeText={(text) =>
                      setFormData({ ...formData, merchant: text })
                    }
                    className="flex-1 bg-surface rounded-lg px-4 py-2 text-foreground"
                  />
                  {formData.merchant.length > 5 && (
                    <Pressable
                      onPress={() => handleModePress("text")}
                      disabled={isLoading}
                      className="rounded-lg overflow-hidden flex-row items-center justify-center p-0.5"
                    >
                      <LinearGradient
                        colors={PLUSH_GRADIENT}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="px-3 py-2 rounded-lg items-center justify-center"
                      >
                        <Text className="text-white font-bold text-xs">
                          ✨ Magic
                        </Text>
                      </LinearGradient>
                    </Pressable>
                  )}
                </View>
              </View>

              {/* AMOUNT */}
              <View>
                <Text className="text-sm font-semibold text-foreground mb-1">
                  Amount (₦)
                </Text>
                <View className="flex-row items-center bg-surface rounded-lg px-3 py-2">
                  <Text className="text-lg font-bold text-muted mr-2">₦</Text>
                  <TextInput
                    placeholder="0"
                    placeholderTextColor={colors.muted}
                    keyboardType="decimal-pad"
                    value={formData.amount}
                    onChangeText={(text) => {
                      setFormData({ ...formData, amount: text });
                      if (amountError) setAmountError("");
                    }}
                    className="flex-1 text-foreground"
                  />
                </View>
                {/* #11 — Warm amount error */}
                {amountError ? (
                  <Text
                    style={{
                      color: "#B76E79",
                      fontSize: 12,
                      marginTop: 4,
                      fontFamily: "DMSans_400Regular",
                    }}
                  >
                    {amountError}
                  </Text>
                ) : null}
              </View>

              {/* CATEGORY */}
              <View>
                <Text className="text-sm font-semibold text-foreground mb-1">
                  Category
                </Text>
                <Pressable
                  onPress={() => setShowCategoryDropdown(true)}
                  className="bg-surface rounded-lg px-4 py-2 flex-row items-center justify-between"
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <View className="flex-row items-center gap-2">
                    <Text className="text-lg">
                      {CATEGORY_ICONS[formData.category] || "📌"}
                    </Text>
                    <Text className="text-foreground font-semibold">
                      {formData.category}
                    </Text>
                  </View>
                  <MaterialIcons
                    name="expand-more"
                    size={20}
                    color={colors.muted}
                  />
                </Pressable>
              </View>

              {/* TYPE TOGGLE */}
              <View>
                <Text className="text-sm font-semibold text-foreground mb-1">
                  Type
                </Text>
                <View className="flex-row gap-2">
                  {["expense", "income"].map((type) => (
                    <Pressable
                      key={type}
                      onPress={() =>
                        setFormData({
                          ...formData,
                          type: type as "expense" | "income",
                        })
                      }
                      style={({ pressed }) => ({
                        flex: 1,
                        height: 48,
                        borderRadius: 16,
                        overflow: "hidden",
                        opacity: pressed ? 0.8 : 1,
                        backgroundColor:
                          formData.type === type
                            ? "transparent"
                            : colors.surface,
                      })}
                    >
                      {formData.type === type ? (
                        <LinearGradient
                          colors={PLUSH_GRADIENT}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={{
                            width: "100%",
                            height: "100%",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text className="font-bold text-sm capitalize text-white">
                            {type}
                          </Text>
                        </LinearGradient>
                      ) : (
                        <View
                          style={{
                            width: "100%",
                            height: "100%",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text
                            className="font-semibold text-sm capitalize"
                            style={{ color: colors.muted }}
                          >
                            {type}
                          </Text>
                        </View>
                      )}
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* SAVE BUTTON */}
              <Pressable
                onPress={handleConfirmEntry}
                className="mt-2"
                style={({ pressed }) => ({
                  opacity: pressed ? 0.8 : 1,
                  height: 52,
                  borderRadius: 16,
                  overflow: "hidden",
                })}
              >
                <LinearGradient
                  colors={PLUSH_GRADIENT}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: "100%",
                    height: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text className="text-white font-bold">Log Entry</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>

          {/* RECENT ENTRIES */}
          <View className="px-6 gap-3">
            <Text
              className="text-lg font-bold text-foreground"
              style={{ fontFamily: "PlayfairDisplay_700Bold" }}
            >
              Recently Logged
            </Text>

            {/* #6 — Warm empty state when no entries logged */}
            {recentEntries.length === 0 ? (
              <EmptyState
                illustration="✨"
                headline="Nothing logged yet."
                body="Your first entry takes 3 seconds. ✨"
              />
            ) : (
              recentEntries.map((entry) => (
                <View
                  key={entry.id}
                  className="flex-row items-center justify-between bg-surface rounded-lg p-3"
                >
                  <View className="flex-row items-center gap-3 flex-1">
                    <Text className="text-2xl">
                      {CATEGORY_ICONS[entry.category] || "📌"}
                    </Text>
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-foreground">
                        {entry.merchant}
                      </Text>
                      <Text className="text-xs text-muted">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 15, color: DEEP_PLUM }}>
                      {formatNaira(entry.amount)}
                    </Text>
                    <Text className="text-xs text-muted">{entry.category}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* LOADING MODAL */}
      <Modal visible={isLoading} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View
            className="rounded-3xl p-8 items-center gap-4"
            style={{ backgroundColor: colors.surface }}
          >
            <View
              className="w-16 h-16 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-3xl">🌸</Text>
            </View>
            <Text className="text-lg font-bold text-foreground text-center">
              Plush is reading your alert...
            </Text>
          </View>
        </View>
      </Modal>

      <PlushBottomSheet visible={showCategoryDropdown} onClose={() => setShowCategoryDropdown(false)}>
            <View className="mb-4">
              <Text
                className="text-xl font-bold text-foreground"
                style={{ fontFamily: "PlayfairDisplay_700Bold" }}
              >
                Select Category
              </Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => {
                    setFormData({ ...formData, category: cat });
                    setSelectedCategory(cat);
                    setShowCategoryDropdown(false);
                  }}
                  className="flex-row items-center gap-3 py-4 border-b border-border"
                >
                  <Text className="text-2xl">
                    {CATEGORY_ICONS[cat] || "📌"}
                  </Text>
                  <Text className="text-base text-foreground font-semibold flex-1">
                    {cat}
                  </Text>
                  {formData.category === cat && (
                    <MaterialIcons
                      name="check"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </Pressable>
              ))}
            </ScrollView>
      </PlushBottomSheet>

      {/* CONFIRMATION MODAL */}
      <PlushBottomSheet visible={showConfirmation} onClose={() => setShowConfirmation(false)}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <Text
                className="text-2xl font-bold text-foreground mb-4"
                style={{ fontFamily: "PlayfairDisplay_700Bold" }}
              >
                Confirm Entry
              </Text>

              <View className="gap-4 mb-6">
                {/* MERCHANT */}
                <View>
                  <Text className="text-xs text-muted mb-1">Merchant</Text>
                  <TextInput
                    value={formData.merchant}
                    onChangeText={(text) =>
                      setFormData({ ...formData, merchant: text })
                    }
                    className="bg-surface rounded-lg px-4 py-3 text-foreground"
                  />
                </View>

                {/* AMOUNT */}
                <View>
                  <Text className="text-xs text-muted mb-1">Amount</Text>
                  <View className="flex-row items-center bg-surface rounded-lg px-3 py-3">
                    <Text className="text-lg font-bold text-muted mr-2">₦</Text>
                    <TextInput
                      keyboardType="decimal-pad"
                      value={formData.amount}
                      onChangeText={(text) =>
                        setFormData({ ...formData, amount: text })
                      }
                      className="flex-1 text-foreground"
                    />
                  </View>
                </View>

                {/* CATEGORY */}
                <View>
                  <Text className="text-xs text-muted mb-1">Category</Text>
                  <Pressable
                    onPress={() => setShowCategoryDropdown(true)}
                    className="bg-surface rounded-lg px-4 py-3 flex-row items-center justify-between"
                  >
                    <View className="flex-row items-center gap-2">
                      <Text className="text-lg">
                        {CATEGORY_ICONS[formData.category] || "📌"}
                      </Text>
                      <Text className="text-foreground font-semibold">
                        {formData.category}
                      </Text>
                    </View>
                    <MaterialIcons
                      name="expand-more"
                      size={20}
                      color={colors.muted}
                    />
                  </Pressable>
                </View>

                {/* SOFT COMMENT */}
                <View>
                  <Text className="text-xs text-muted mb-1">AI Comment</Text>
                  <Text
                    className="text-sm italic text-primary"
                    style={{ fontFamily: "DancingScript_400Regular" }}
                  >
                    "{formData.softComment}"
                  </Text>
                </View>
              </View>

              {/* BUTTONS */}
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => setShowConfirmation(false)}
                  className="flex-1 border border-border rounded-2xl py-0 items-center justify-center"
                  style={{ height: 52, borderRadius: 16 }}
                >
                  <Text className="text-foreground font-bold">
                    Edit Details
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleConfirmEntry}
                  className="flex-1 rounded-2xl"
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.8 : 1,
                    height: 52,
                    borderRadius: 16,
                    overflow: "hidden",
                  })}
                >
                  <LinearGradient
                    colors={PLUSH_GRADIENT}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      width: "100%",
                      height: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text className="text-white font-bold">
                      Log to Plush ✨
                    </Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </ScrollView>
      </PlushBottomSheet>

      {/* UPGRADE SHEET */}
      <PlushBottomSheet visible={showUpgradeSheet} onClose={() => setShowUpgradeSheet(false)}>
            <Text
              className="text-2xl font-bold text-foreground text-center"
              style={{ fontFamily: "PlayfairDisplay_700Bold" }}
            >
              Unlock AI Features
            </Text>

            <View className="gap-3 my-4">
              <View className="bg-primary/5 rounded-2xl p-6 border border-primary/20 items-center gap-4">
                <Text className="text-4xl">✨</Text>
                <View className="items-center">
                  <Text className="text-lg font-bold text-foreground">
                    Unlock Plush AI
                  </Text>
                  <Text className="text-sm text-muted text-center mt-1 px-4">
                    Get access to Screenshot Scanning, Voice Logging, and
                    unlimited AI analysis.
                  </Text>
                </View>

                <Pressable
                  onPress={handleUpgradeTap}
                  className="w-full rounded-2xl overflow-hidden"
                  style={{ height: 56, borderRadius: 16 }}
                >
                  <LinearGradient
                    colors={PLUSH_GRADIENT}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      width: "100%",
                      height: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text className="text-white font-bold text-base">
                      View Plans 🌸
                    </Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>

            <Pressable
              onPress={() => setShowUpgradeSheet(false)}
              className="py-3 items-center"
            >
              <Text className="text-muted font-medium">Maybe later</Text>
            </Pressable>
      </PlushBottomSheet>
    </ScreenContainer>
  );
}
