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
import { useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Toast, AnimatedPressable } from "@/components/plush-animations";
import { EmptyState } from "@/components/plush-empty-state";
import { LinearGradient } from "expo-linear-gradient";
import { PLUSH_GRADIENT } from "@/components/plush-gradient";

// Mock data
const ENTRY_MODES = [
  {
    id: "screenshot",
    icon: "📸",
    name: "Screenshot",
    description: "Snap your bank alert",
    color: "#F5D5E3",
    tier: "ai",
  },
  {
    id: "voice",
    icon: "🎤",
    name: "Voice Note",
    description: "Speak it naturally",
    color: "#E8D5F5",
    tier: "ai",
  },
  {
    id: "camera",
    icon: "📷",
    name: "Camera Scan",
    description: "Point at your receipt",
    color: "#D5F0E8",
    tier: "ai",
  },
  {
    id: "text",
    icon: "✍️",
    name: "Quick Text",
    description: "Type it casually",
    color: "#F5F0E8",
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

const RECENT_ENTRIES = [
  {
    id: "1",
    merchant: "Sephora",
    amount: 12000,
    category: "Beauty",
    time: "2h ago",
  },
  {
    id: "2",
    merchant: "Shoprite",
    amount: 8500,
    category: "Food",
    time: "4h ago",
  },
  {
    id: "3",
    merchant: "Uber",
    amount: 3500,
    category: "Transport",
    time: "6h ago",
  },
  {
    id: "4",
    merchant: "Ajo Circle",
    amount: 10000,
    category: "Ajo",
    time: "1d ago",
  },
  {
    id: "5",
    merchant: "MTN Airtime",
    amount: 1000,
    category: "Airtime",
    time: "2d ago",
  },
];

const MOCK_EXTRACTED_DATA = {
  merchant: "Sephora Nigeria",
  amount: 12500,
  category: "Beauty",
  date: new Date().toISOString().split("T")[0],
  type: "expense",
  softComment: "Your skin is your crown, invest wisely 💜",
};

export default function LogScreen() {
  const colors = useColors();
  const [userTier, setUserTier] = useState<"free" | "member" | "ai">("member");
  const [activeMode, setActiveMode] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showUpgradeSheet, setShowUpgradeSheet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // #2 — Toast state
  const [showToast, setShowToast] = useState(false);
  // #11 — Warm error messages
  const [amountError, setAmountError] = useState("");
  const [aiParseError, setAiParseError] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    merchant: MOCK_EXTRACTED_DATA.merchant,
    amount: MOCK_EXTRACTED_DATA.amount.toString(),
    category: MOCK_EXTRACTED_DATA.category,
    date: MOCK_EXTRACTED_DATA.date,
    type: MOCK_EXTRACTED_DATA.type as "expense" | "income",
    softComment: MOCK_EXTRACTED_DATA.softComment,
  });

  const [selectedCategory, setSelectedCategory] = useState(
    MOCK_EXTRACTED_DATA.category
  );

  const handleModePress = (modeId: string) => {
    const mode = ENTRY_MODES.find((m) => m.id === modeId);
    if (!mode) return;

    // Check tier access
    if (mode.tier === "ai" && userTier !== "ai") {
      setShowUpgradeSheet(true);
      return;
    }

    if (mode.tier === "member" && userTier === "free") {
      setShowUpgradeSheet(true);
      return;
    }

    setActiveMode(modeId);
    simulateExtraction();
  };

  const simulateExtraction = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    setShowConfirmation(true);
  };

  const handleConfirmEntry = () => {
    // #11 — Validate amount with warm error
    if (!formData.amount || formData.amount === "0") {
      setAmountError("How much was it, love? Add an amount to log this. 🌸");
      return;
    }
    setAmountError("");
    setShowConfirmation(false);
    setActiveMode(null);
    // #2 — Show Rose Gold toast instead of Alert
    setShowToast(true);
    setFormData({
      merchant: MOCK_EXTRACTED_DATA.merchant,
      amount: MOCK_EXTRACTED_DATA.amount.toString(),
      category: MOCK_EXTRACTED_DATA.category,
      date: MOCK_EXTRACTED_DATA.date,
      type: "expense",
      softComment: MOCK_EXTRACTED_DATA.softComment,
    });
  };

  const handleUpgradeTap = (tier: string) => {
    setUserTier(tier as "free" | "member" | "ai");
    setShowUpgradeSheet(false);
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
          <View className="px-6 pt-2">
            <Text
              className="text-2xl font-bold text-foreground"
              style={{ fontFamily: "PlayfairDisplay_700Bold" }}
            >
              Log with AI ✨
            </Text>
            <Text className="text-sm text-muted mt-1">
              Choose how to log your expense
            </Text>
          </View>

          {/* ENTRY MODE SELECTOR - 2x2 GRID */}
          <View className="px-6 gap-2">
            <View className="flex-row gap-2">
              {ENTRY_MODES.slice(0, 2).map((mode) => {
                const isLocked =
                  (mode.tier === "ai" && userTier !== "ai") ||
                  (mode.tier === "member" && userTier === "free");

                return (
                  <Pressable
                    key={mode.id}
                    onPress={() => handleModePress(mode.id)}
                    className="flex flex-col flex-1 rounded-2xl p-3 items-center justify-center gap-1 relative"
                    style={{
                      backgroundColor: isLocked ? colors.border : mode.color,
                      opacity: isLocked ? 0.6 : 1,
                    }}
                  >
                    <Text className="text-3xl">{mode.icon}</Text>
                    <Text className="text-sm font-bold text-foreground text-center">
                      {mode.name}
                    </Text>
                    <Text className="text-xs text-muted text-center">
                      {mode.description}
                    </Text>

                    {isLocked && (
                      <View className="absolute top-2 right-2">
                        <MaterialIcons
                          name="lock"
                          size={16}
                          color={colors.muted}
                        />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>

            <View className="flex-row gap-2">
              {ENTRY_MODES.slice(2, 4).map((mode) => {
                const isLocked =
                  (mode.tier === "ai" && userTier !== "ai") ||
                  (mode.tier === "member" && userTier === "free");

                return (
                  <Pressable
                    key={mode.id}
                    onPress={() => handleModePress(mode.id)}
                    className="flex flex-col flex-1 rounded-2xl p-3 items-center justify-center gap-1 relative"
                    style={{
                      backgroundColor: isLocked ? colors.border : mode.color,
                      opacity: isLocked ? 0.6 : 1,
                    }}
                  >
                    <Text className="text-3xl">{mode.icon}</Text>
                    <Text className="text-sm font-bold text-foreground text-center">
                      {mode.name}
                    </Text>
                    <Text className="text-xs text-muted text-center">
                      {mode.description}
                    </Text>

                    {isLocked && (
                      <View className="absolute top-2 right-2">
                        <MaterialIcons
                          name="lock"
                          size={16}
                          color={colors.muted}
                        />
                      </View>
                    )}
                  </Pressable>
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
                <TextInput
                  placeholder="e.g. Sephora"
                  placeholderTextColor={colors.muted}
                  value={formData.merchant}
                  onChangeText={(text) =>
                    setFormData({ ...formData, merchant: text })
                  }
                  className="bg-surface rounded-lg px-4 py-2 text-foreground"
                />
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
                  <Text style={{ color: "#B76E79", fontSize: 12, marginTop: 4, fontFamily: "DMSans_400Regular" }}>
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
                          formData.type === type ? "transparent" : colors.surface,
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
                  overflow: "hidden"
                })}
              >
                <LinearGradient
                  colors={PLUSH_GRADIENT}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}
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
            {RECENT_ENTRIES.length === 0 ? (
              <EmptyState
                illustration="✨"
                headline="Nothing logged yet."
                body="Your first entry takes 3 seconds. ✨"
              />
            ) : (
              RECENT_ENTRIES.map((entry) => (
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
                      <Text className="text-xs text-muted">{entry.time}</Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm font-bold text-foreground">
                      ₦{(entry.amount / 1000).toFixed(0)}k
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

      {/* CATEGORY DROPDOWN MODAL */}
      <Modal visible={showCategoryDropdown} transparent animationType="slide">
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View 
            style={{ backgroundColor: colors.background }} 
            className="rounded-t-3xl p-6 max-h-[80%]"
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-foreground" style={{ fontFamily: "PlayfairDisplay_700Bold" }}>
                Select Category
              </Text>
              <Pressable onPress={() => setShowCategoryDropdown(false)}>
                <MaterialIcons name="close" size={24} color={colors.foreground} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {CATEGORIES.map(cat => (
                <Pressable
                  key={cat}
                  onPress={() => {
                    setFormData({ ...formData, category: cat });
                    setSelectedCategory(cat);
                    setShowCategoryDropdown(false);
                  }}
                  className="flex-row items-center gap-3 py-4 border-b border-border"
                >
                  <Text className="text-2xl">{CATEGORY_ICONS[cat] || "📌"}</Text>
                  <Text className="text-base text-foreground font-semibold flex-1">{cat}</Text>
                  {formData.category === cat && (
                    <MaterialIcons name="check" size={20} color={colors.primary} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* CONFIRMATION MODAL */}
      <Modal visible={showConfirmation} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View
            className="bg-background rounded-t-3xl p-6 gap-4 max-h-[90%]"
            style={{ backgroundColor: colors.background }}
          >
            <View className="items-center mb-2">
              <View className="w-12 h-1 bg-border rounded-full" />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
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
                    <MaterialIcons name="expand-more" size={20} color={colors.muted} />
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
                  <Text className="text-foreground font-bold">Edit Details</Text>
                </Pressable>
                <Pressable
                  onPress={handleConfirmEntry}
                  className="flex-1 rounded-2xl"
                  style={({ pressed }) => ({ 
                    opacity: pressed ? 0.8 : 1,
                    height: 52,
                    borderRadius: 16,
                    overflow: "hidden"
                  })}
                >
                  <LinearGradient
                    colors={PLUSH_GRADIENT}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}
                  >
                    <Text className="text-white font-bold">Log to Plush ✨</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* UPGRADE SHEET */}
      <Modal visible={showUpgradeSheet} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View
            className="bg-background rounded-t-3xl p-6 gap-4"
            style={{ backgroundColor: colors.background }}
          >
            <View className="items-center mb-2">
              <View className="w-12 h-1 bg-border rounded-full" />
            </View>

            <Text
              className="text-2xl font-bold text-foreground text-center"
              style={{ fontFamily: "PlayfairDisplay_700Bold" }}
            >
              Unlock AI Features
            </Text>

            <View className="gap-3 my-4">
              {/* FREE TIER */}
              <Pressable
                className="rounded-2xl p-4 border-2 border-border"
                style={{
                  borderColor:
                    userTier === "free" ? colors.primary : colors.border,
                }}
              >
                <View className="flex-row justify-between items-start mb-2">
                  <Text className="font-bold text-foreground">Plush Free</Text>
                  {userTier === "free" && (
                    <MaterialIcons name="check-circle" size={20} color={colors.primary} />
                  )}
                </View>
                <Text className="text-xs text-muted mb-3">
                  • Manual entry only
                </Text>
              </Pressable>

              {/* MEMBER TIER */}
              <Pressable
                onPress={() => handleUpgradeTap("member")}
                className="rounded-2xl p-4 border-2"
                style={{
                  backgroundColor:
                    userTier === "member" ? colors.primary + "20" : "transparent",
                  borderColor:
                    userTier === "member" ? colors.primary : colors.border,
                }}
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View>
                    <Text className="font-bold text-foreground">
                      Plush Member
                    </Text>
                    <Text className="text-sm font-bold text-primary">
                      ₦1,200/month
                    </Text>
                  </View>
                  {userTier === "member" && (
                    <MaterialIcons name="check-circle" size={20} color={colors.primary} />
                  )}
                </View>
                <Text className="text-xs text-muted">
                  • Quick Text entry
                  {"\n"}• Manual entry
                </Text>
              </Pressable>

              {/* AI TIER */}
              <Pressable
                onPress={() => handleUpgradeTap("ai")}
                className="rounded-2xl p-4 border-2"
                style={{
                  backgroundColor:
                    userTier === "ai" ? colors.primary + "20" : "transparent",
                  borderColor:
                    userTier === "ai" ? colors.primary : colors.border,
                }}
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View>
                    <Text className="font-bold text-foreground">
                      Plush AI ✨
                    </Text>
                    <Text className="text-sm font-bold text-primary">
                      ₦3,000/month
                    </Text>
                  </View>
                  {userTier === "ai" && (
                    <MaterialIcons name="check-circle" size={20} color={colors.primary} />
                  )}
                </View>
                <Text className="text-xs text-muted">
                  • Screenshot scanning
                  {"\n"}• Voice transcription
                  {"\n"}• Camera receipt OCR
                  {"\n"}• Quick Text
                </Text>
              </Pressable>
            </View>

            <Pressable
              onPress={() => setShowUpgradeSheet(false)}
              className="rounded-2xl"
              style={{ height: 52, borderRadius: 16, overflow: "hidden" }}
            >
              <LinearGradient
                colors={PLUSH_GRADIENT}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}
              >
                <Text className="text-white font-bold">Continue</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
