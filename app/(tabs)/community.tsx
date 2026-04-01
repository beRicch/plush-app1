import {
  ScrollView,
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  FlatList,
  Animated,
  Share,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useRouter } from "expo-router";
import { useState, useRef } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { EmptyState } from "@/components/plush-empty-state";
import { TooltipModal } from "@/components/plush-tooltip";
import { LinearGradient } from "expo-linear-gradient";
import { GradientAvatar, GradientBadge, PLUSH_GRADIENT, PROGRESS_GRADIENT } from "@/components/plush-gradient";
import { PlushBottomSheet } from "@/components/plush-bottom-sheet";

const ROSE_GOLD = "#B76E79";
const DEEP_PLUM = "#4A1560";
const BLUSH_PINK = "#F4B8C1";
const CREAM = "#FAF5EF";

// FIX 8 — Branded user initials avatar (gradient)
function BrandedAvatar({ name, size = 40, borderSize = 2.5 }: { name: string; size?: number; borderSize?: number }) {
  return <GradientAvatar name={name} size={size} borderColor={ROSE_GOLD} />;
}

// FIX 7 — Branded reaction button with scale pop animation
function ReactionButton({
  emoji, count, reacted, onPress,
}: { emoji: string; count: number; reacted: boolean; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1.0, duration: 100, useNativeDriver: true }),
    ]).start();
    onPress();
  };
  return (
    <Pressable
      onPress={handlePress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 16,
        backgroundColor: reacted ? `${ROSE_GOLD}25` : "transparent",
      }}
    >
      <Animated.Text style={{ fontSize: 14, transform: [{ scale }] }}>{emoji}</Animated.Text>
      <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 12, color: reacted ? ROSE_GOLD : `${DEEP_PLUM}B3` }}>
        {count + (reacted ? 1 : 0)}
      </Text>
    </Pressable>
  );
}



// FIX 3 — Compact tier badge pill (gradient for Society)
function TierBadge({ tier }: { tier: string }) {
  if (tier === "Society") {
    return <GradientBadge label="👑 Plush Society" />;
  }
  if (tier === "AI") {
    return (
      <View style={{ backgroundColor: `${ROSE_GOLD}33`, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 }}>
        <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 10, color: ROSE_GOLD }}>💜 Plush AI</Text>
      </View>
    );
  }
  return (
    <View style={{ backgroundColor: BLUSH_PINK, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 }}>
      <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 10, color: DEEP_PLUM }}>🌸 Plush Member</Text>
    </View>
  );
}

// FIX 8 — Dynamic ritual banner data
const getRitualBanner = () => {
  const day = new Date().getDay();
  if (day === 0) return { title: "Soft Money Sunday 🌅", subtitle: "Drop your weekly audit below" };
  if (day === 3) return { title: "Naira Wins Wednesday 💰", subtitle: "What are you celebrating?" };
  if (day === 5) return { title: "Plush Vision Friday 🌟", subtitle: "Set your intentions for next week" };
  return null; // show affirmation on other days
};

// Mock data
const POSTS = [
  {
    id: "1",
    author: "Amara",
    tier: "Member",
    avatar: "👩‍🦱",
    timeAgo: "2h ago",
    content: "Just completed my Soft Audit! 🌅 Realized I spent ₦8,500 on food this week. Setting a goal to reduce it to ₦6,000 next week. Accountability check-in: who's with me? 🌸",
    reactions: { "🌸": 24, "💜": 12, "💰": 8, "👑": 3 },
    comments: 5,
    goalCard: { name: "Emergency Fund", progress: 45 },
  },
  {
    id: "2",
    author: "Zainab",
    tier: "AI",
    avatar: "👩‍🦱",
    timeAgo: "4h ago",
    content: "Naira Wins Wednesday! 💰 Hit my ₦50k savings milestone this month. The Plush AI screenshot scanner saved me SO much time. No more manual entry. Just snap and done. Feeling soft AND secure 💜",
    reactions: { "🌸": 42, "💜": 31, "💰": 28, "👑": 15 },
    comments: 12,
  },
  {
    id: "3",
    author: "Chiamaka",
    tier: "Society",
    avatar: "👩",
    timeAgo: "6h ago",
    content: "Plush Vision Friday 🌟 My intention for next week: I will spend intentionally and save fearlessly. No more guilt. Just clarity. Who's setting an intention with me?",
    reactions: { "🌸": 18, "💜": 25, "💰": 5, "👑": 8 },
    comments: 7,
  },
];

const CHALLENGES = [
  {
    id: "1",
    title: "No Impulse Buy Week 💪",
    startDate: "Mar 24",
    endDate: "Mar 30",
    participants: 847,
    joined: true,
  },
  {
    id: "2",
    title: "Save ₦5k This Week 🎯",
    startDate: "Mar 24",
    endDate: "Mar 30",
    participants: 1203,
    joined: false,
  },
];

const VAULT_TWINS = [
  {
    id: "1",
    name: "Zainab",
    streak: 12,
    goals: ["Emergency Fund", "Dream Vacation"],
    ritualScore: 92,
  },
];

export default function CommunityScreen() {
  const colors = useColors();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"for-you" | "ajo">("for-you");
  const [showComposer, setShowComposer] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [selectedPost, setSelectedPost] = useState<typeof POSTS[0] | null>(null);
  const [postText, setPostText] = useState("");
  const [selectedAttachment, setSelectedAttachment] = useState<string | null>(null);
  const [userReactions, setUserReactions] = useState<Record<string, boolean>>({});
  // #9 — Inline reply threads: track expanded post and reply text per post
  const [expandedReplyPost, setExpandedReplyPost] = useState<string | null>(null);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [inlineReplies, setInlineReplies] = useState<Record<string, { author: string; text: string }[]>>({});

  const getTodayRitual = () => {
    const day = new Date().getDay();
    if (day === 0) return { emoji: "🌅", title: "Soft Money Sunday", subtitle: "Drop your wins below" };
    if (day === 3) return { emoji: "💰", title: "Naira Wins Wednesday", subtitle: "What are you celebrating?" };
    if (day === 5) return { emoji: "🌟", title: "Plush Vision Friday", subtitle: "Set your intentions" };
    return { emoji: "💜", title: "Soft Money Ritual", subtitle: "What's your money win today?" };
  };

  const ritual = getTodayRitual();

  const handleReact = (postId: string, emoji: string) => {
    const key = `${postId}-${emoji}`;
    setUserReactions({ ...userReactions, [key]: !userReactions[key] });
  };

  const handleCreatePost = () => {
    if (postText.trim()) {
      setPostText("");
      setSelectedAttachment(null);
      setShowComposer(false);
    }
  };

  const handleSharePost = async (message: string) => {
    try {
      await Share.share({ message });
    } catch (error) {
      console.error("Share failed", error);
    }
  };

  // #9 — Submit an inline reply
  const handleSubmitReply = (postId: string) => {
    const text = replyTexts[postId]?.trim();
    if (!text) return;
    setInlineReplies(prev => ({
      ...prev,
      [postId]: [...(prev[postId] ?? []), { author: "You", text }],
    }));
    setReplyTexts(prev => ({ ...prev, [postId]: "" }));
  };

  return (
    <ScreenContainer className="bg-background">
      {/* #10 — Ajo Circle first-time tooltip (shown when Ajo tab is active first time) */}
      {activeTab === "ajo" && (
        <TooltipModal
          storageKey="ajo_circle"
          title="What is an Ajo Circle? 💜"
          message="A digital rotating savings group. Create one for your girls or join an existing circle."
        />
      )}

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
              if (tab.key === "ajo") {
                router.replace("/ajo-circle");
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

      {/* HEADER */}
      <View className="px-6 pt-4 pb-4 border-b border-border">
        <Text
          className="font-bold text-foreground"
          style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 23 }}
        >
          The Vault 👯
        </Text>
        <Text className="text-sm text-muted mt-1">Your sisterhood of secured soft girls</Text>
      </View>

      {/* MAIN FEED */}
      <FlatList
        data={POSTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 16, paddingHorizontal: 24, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View className="mb-4 gap-4">
            {/* FIX 8 — Dynamic branded ritual banner */}
            {item.id === "1" && (() => {
              const banner = getRitualBanner();
              if (!banner) return null;
              return (
                <LinearGradient
                  colors={PLUSH_GRADIENT}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    borderRadius: 16, padding: 20, gap: 12, marginBottom: 16,
                    overflow: "hidden",
                    borderWidth: 1.5,
                    borderColor: "rgba(183,110,121,0.3)",
                  }}
                >
                  {/* Subtle lighter right gradient overlay */}
                  <View style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "40%", backgroundColor: "rgba(255,255,255,0.06)", borderTopRightRadius: 16, borderBottomRightRadius: 16 }} />
                  <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 18, color: CREAM }}>
                    {banner.title}
                  </Text>
                  <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 12, color: `${CREAM}B3` }}>
                    Share your win with the sisterhood today
                  </Text>
                  <Pressable
                    onPress={() => router.replace("/rituals-hub")}
                    style={{
                      alignSelf: "flex-start",
                      backgroundColor: ROSE_GOLD, borderRadius: 16,
                      paddingHorizontal: 16, height: 52,
                      alignItems: "center", justifyContent: "center",
                      borderWidth: 1.5, borderColor: DEEP_PLUM,
                    }}
                  >
                    <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 12, color: CREAM }}>Join Today's Ritual →</Text>
                  </Pressable>
                </LinearGradient>
              );
            })()}

            {/* POST CARD */}
            <View
              className="rounded-2xl p-4 gap-3"
              style={{ backgroundColor: colors.surface }}
            >
              {/* POST HEADER */}
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3 flex-1">
                  <BrandedAvatar name={item.author} size={40} />
                  <View className="flex-1">
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 14, color: colors.foreground }}>{item.author}</Text>
                      {/* FIX 3 — Compact tier badge */}
                      <TierBadge tier={item.tier} />
                    </View>
                    <Text className="text-xs text-muted">{item.timeAgo}</Text>
                  </View>
                </View>
                <Pressable>
                  <MaterialIcons name="more-vert" size={16} color={colors.muted} />
                </Pressable>
              </View>

              {/* POST CONTENT */}
              <Text className="text-sm text-foreground leading-relaxed">{item.content}</Text>

              {/* GOAL PROGRESS CARD — Fix 4 progress bar */}
              {item.goalCard && (
                <View
                  style={{ borderRadius: 8, padding: 12, gap: 8, backgroundColor: colors.background }}
                >
                  <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
                    {item.goalCard.name}
                  </Text>
                  <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: "hidden" }}>
                    <LinearGradient
                      colors={PROGRESS_GRADIENT}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        height: "100%",
                        width: `${item.goalCard.progress}%`,
                        borderRadius: 3,
                      }}
                    />
                  </View>
                  <Text style={{ fontSize: 12, color: colors.muted }}>{item.goalCard.progress}% complete</Text>
                </View>
              )}

              {/* FIX 7 — Branded reaction set */}
              <View style={{ flexDirection: "row", gap: 4, paddingTop: 8, borderTopWidth: 1, borderTopColor: "rgba(74,21,96,0.08)" }}>
                {(["🌸", "💜", "💰", "👑"] as const).map((emoji) => {
                  const count = item.reactions[emoji as keyof typeof item.reactions] || 0;
                  const isReacted = userReactions[`${item.id}-${emoji}`];
                  return (
                    <ReactionButton
                      key={emoji}
                      emoji={emoji}
                      count={count}
                      reacted={!!isReacted}
                      onPress={() => handleReact(item.id, emoji)}
                    />
                  );
                })}
              </View>

              {/* #9 — COMMENTS & SHARE with inline reply toggle */}
              <View className="flex-row gap-2 pt-2 border-t border-border">
                <Pressable
                  onPress={() => {
                    setExpandedReplyPost(
                      expandedReplyPost === item.id ? null : item.id
                    );
                  }}
                  className="flex-1 flex-row items-center justify-center gap-1 py-2"
                >
                  <MaterialIcons name="chat-bubble-outline" size={14} color={expandedReplyPost === item.id ? colors.primary : colors.muted} />
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: expandedReplyPost === item.id ? colors.primary : colors.muted }}
                  >
                    {item.comments + (inlineReplies[item.id]?.length ?? 0)}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => handleSharePost(item.content)}
                  className="flex-1 flex-row items-center justify-center gap-1 py-2"
                >
                  <MaterialIcons name="share" size={14} color={colors.muted} />
                  <Text className="text-xs text-muted font-semibold">Share</Text>
                </Pressable>
              </View>

              {/* #9 — Inline reply thread (expands below post) */}
              {expandedReplyPost === item.id && (
                <View
                  className="mt-2 gap-3 pt-3 border-t border-border"
                >
                  {/* Existing inline replies */}
                  {(inlineReplies[item.id] ?? []).map((reply, idx) => (
                    <View key={idx} className="flex-row gap-2 items-start">
                      <BrandedAvatar name={reply.author} size={28} borderSize={1.5} />
                      <View className="flex-1 bg-background rounded-xl px-3 py-2">
                        <Text className="text-xs font-bold text-foreground mb-1">{reply.author}</Text>
                        <Text className="text-xs text-foreground">{reply.text}</Text>
                      </View>
                    </View>
                  ))}

                  {/* Reply input */}
                  <View className="flex-row items-center gap-2">
                    <View
                      className="flex-1 flex-row items-center bg-background rounded-full px-4 py-2"
                      style={{ borderWidth: 1, borderColor: colors.border }}
                    >
                      <TextInput
                        placeholder="Say something kind... 🌸"
                        placeholderTextColor={colors.muted}
                        value={replyTexts[item.id] ?? ""}
                        onChangeText={(text) =>
                          setReplyTexts(prev => ({ ...prev, [item.id]: text }))
                        }
                        className="flex-1 text-foreground"
                        style={{ fontSize: 13 }}
                      />
                    </View>
                    <Pressable
                      onPress={() => handleSubmitReply(item.id)}
                      className="w-9 h-9 rounded-full items-center justify-center"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <MaterialIcons name="send" size={16} color="white" />
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}
        ListFooterComponent={
          <View className="gap-4 mt-4">
            {/* EMPTY STATE — Wins from the Sisterhood */}
            {POSTS.length === 0 && (
              <EmptyState
                illustration="🌸"
                headline="Be the first to share a win today."
                body="The sisterhood is waiting. 🌸"
                style={{ marginHorizontal: 24 }}
              />
            )}

            {/* VAULT TWINS SECTION */}
            <View className="gap-3">
              <Text
                className="text-lg font-bold text-foreground px-6"
                style={{ fontFamily: "PlayfairDisplay_700Bold" }}
              >
                Your Accountability Sisters 👯
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 24 }}
                className="gap-3"
              >
                {VAULT_TWINS.map((twin) => (
                  <View
                    key={twin.id}
                    className="rounded-2xl p-4 gap-3 w-64"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2">
                        <BrandedAvatar name={twin.name} size={40} />
                        <Text className="font-bold text-foreground">{twin.name}</Text>
                      </View>
                      <Text className="text-sm font-bold text-primary">🔥 {twin.streak}w</Text>
                    </View>

                    <View className="gap-1">
                      <Text className="text-xs text-muted font-semibold">Active Goals</Text>
                      {twin.goals.map((goal) => (
                        <Text key={goal} className="text-xs text-foreground">
                          • {goal}
                        </Text>
                      ))}
                    </View>

                    <View className="flex-row justify-between items-center pt-2 border-t border-border">
                      <Text className="text-xs text-muted">Ritual Score</Text>
                      <Text className="text-sm font-bold text-foreground">{twin.ritualScore}%</Text>
                    </View>

                    <Pressable onPress={() => setShowComposer(true)} className="rounded-lg items-center overflow-hidden">
                      <LinearGradient colors={PLUSH_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="w-full py-2 items-center justify-center">
                        <Text className="text-white text-xs font-bold">Send 💜</Text>
                      </LinearGradient>
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* SOFT MONEY CHALLENGES */}
            <View className="gap-3 px-6">
              <Text
                className="text-lg font-bold text-foreground"
                style={{ fontFamily: "PlayfairDisplay_700Bold" }}
              >
                Soft Money Challenges
              </Text>

              {CHALLENGES.map((challenge) => (
                <View
                  key={challenge.id}
                  className="rounded-2xl p-4 gap-3"
                  style={{ backgroundColor: colors.surface }}
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-foreground">
                        {challenge.title}
                      </Text>
                      <Text className="text-xs text-muted mt-1">
                        {challenge.startDate} - {challenge.endDate}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-xs font-semibold text-primary">
                        {challenge.participants} soft girls
                      </Text>
                    </View>
                  </View>

                  {/* FIX 9 — Branded challenge buttons, 16px radius, no layout shift */}
                  {challenge.joined ? (
                    <View
                      style={{
                        height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center",
                        backgroundColor: BLUSH_PINK,
                        borderWidth: 1.5,
                        borderColor: ROSE_GOLD,
                      }}
                    >
                      <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 13, color: DEEP_PLUM }}>✓ Joined</Text>
                    </View>
                  ) : (
                    <Pressable style={{ borderRadius: 16, overflow: "hidden" }}>
                      <LinearGradient
                        colors={PLUSH_GRADIENT}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ height: 52, alignItems: "center", justifyContent: "center" }}
                      >
                        <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 13, color: CREAM }}>Join Challenge</Text>
                      </LinearGradient>
                    </Pressable>
                  )}
                </View>
              ))}
            </View>
          </View>
        }
      />

      {/* FIX 5 — Rose Gold FAB with radial highlight + branded shadow */}
      <Pressable
        onPress={() => setShowComposer(true)}
        style={{
          position: "absolute", bottom: 80, right: 24,
          width: 56, height: 56, borderRadius: 28,
          alignItems: "center", justifyContent: "center",
          backgroundColor: ROSE_GOLD,
          shadowColor: ROSE_GOLD,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 16,
          elevation: 8,
          overflow: "hidden",
        }}
      >
        {/* Radial centre highlight */}
        <View style={{ position: "absolute", width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.15)" }} />
        <MaterialIcons name="add" size={22} color="white" />
      </Pressable>

      {/* POST COMPOSER BOTTOM SHEET */}
      <PlushBottomSheet visible={showComposer} onClose={() => setShowComposer(false)}>
        <View style={{ gap: 16, paddingBottom: 24 }}>
          {/* HEADER */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 20, color: colors.foreground }}>Share Your Win</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ gap: 16 }}>
              {/* TEXT AREA */}
              <TextInput
                placeholder="Share your win, sis... 🌸"
                placeholderTextColor={colors.muted}
                value={postText}
                onChangeText={setPostText}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 16,
                  padding: 16,
                  color: colors.foreground,
                  minHeight: 120,
                  textAlignVertical: "top",
                  fontFamily: "DMSans_400Regular",
                }}
                multiline
                maxLength={280}
              />

              {/* ATTACHMENT OPTIONS */}
              <View style={{ gap: 12 }}>
                <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 13, color: colors.muted }}>Attach:</Text>
                <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                  {[
                    { id: "goal", label: "Goal Progress", icon: "flag" },
                    { id: "savings", label: "Savings Milestone", icon: "trending-up" },
                    { id: "ritual", label: "Ritual Completion", icon: "check-circle" },
                    { id: "badge", label: "Vault Score", icon: "star" },
                  ].map((option) => (
                    <Pressable
                      key={option.id}
                      onPress={() => setSelectedAttachment(option.id)}
                      style={{
                        flex: 1,
                        minWidth: "45%",
                        borderRadius: 12,
                        padding: 12,
                        alignItems: "center",
                        gap: 4,
                        backgroundColor: selectedAttachment === option.id ? colors.primary + "15" : colors.surface,
                        borderWidth: 1.5,
                        borderColor: selectedAttachment === option.id ? colors.primary : colors.border,
                      }}
                    >
                      <MaterialIcons
                        name={option.icon as any}
                        size={18}
                        color={selectedAttachment === option.id ? colors.primary : colors.muted}
                      />
                      <Text
                        style={{
                          fontFamily: "DMSans_500Medium",
                          fontSize: 11,
                          color: selectedAttachment === option.id ? colors.primary : colors.muted,
                        }}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* POST TO OPTIONS */}
              <View style={{ gap: 12 }}>
                <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 13, color: colors.muted }}>Post to:</Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {["All Vaults", "Ritual Wins", "Naira Wins"].map((option) => (
                    <Pressable
                      key={option}
                      style={{
                        flex: 1,
                        borderRadius: 12,
                        paddingVertical: 10,
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                    >
                      <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 11, color: colors.foreground }}>{option}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* ACTION BUTTONS */}
              <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
                <Pressable
                  onPress={() => setShowComposer(false)}
                  style={{
                    flex: 1,
                    height: 52,
                    borderRadius: 16,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1.5,
                    borderColor: colors.border,
                  }}
                >
                  <Text style={{ fontFamily: "DMSans_700Bold", color: colors.foreground }}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleCreatePost}
                  style={{ flex: 1, height: 52, borderRadius: 16, overflow: "hidden" }}
                >
                  <LinearGradient
                    colors={PLUSH_GRADIENT}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
                  >
                    <Text style={{ fontFamily: "DMSans_700Bold", color: CREAM }}>Post 🌸</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      </PlushBottomSheet>

      {/* COMMENTS BOTTOM SHEET */}
      <PlushBottomSheet visible={showComments} onClose={() => setShowComments(false)}>
        {selectedPost && (
          <View style={{ gap: 16, paddingBottom: 24 }}>
            {/* HEADER */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontFamily: "PlayfairDisplay_700Bold", fontSize: 20, color: colors.foreground }}>Comments</Text>
            </View>

            {/* ORIGINAL POST */}
            <View
              style={{
                borderRadius: 16, padding: 16, gap: 8,
                backgroundColor: colors.surface,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <BrandedAvatar name={selectedPost.author} size={32} borderSize={2} />
                <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 13, color: colors.foreground }}>{selectedPost.author}</Text>
              </View>
              <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 14, color: colors.foreground, lineHeight: 20 }}>
                {selectedPost.content}
              </Text>
            </View>

            {/* COMMENTS LIST */}
            <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
              <View style={{ gap: 12 }}>
                {[
                  {
                    id: "c1",
                    author: "Zainab",
                    text: "Yesss! I'm doing the same. Let's keep each other accountable 💪",
                    avatar: "👩‍🦱",
                  },
                  {
                    id: "c2",
                    author: "Chiamaka",
                    text: "This is so inspiring! I need to start tracking my food spending too.",
                    avatar: "👩",
                  },
                ].map((comment) => (
                  <View
                    key={comment.id}
                    style={{
                      borderRadius: 12, padding: 12, gap: 6,
                      backgroundColor: colors.surface,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <BrandedAvatar name={comment.author} size={24} borderSize={1.5} />
                      <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 12, color: colors.foreground }}>{comment.author}</Text>
                    </View>
                    <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 12, color: colors.foreground }}>{comment.text}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>

            {/* COMMENT INPUT */}
            <View
              style={{
                flexDirection: "row", alignItems: "center", gap: 12,
                backgroundColor: colors.surface,
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <TextInput
                placeholder="Add a comment..."
                placeholderTextColor={colors.muted}
                style={{ flex: 1, color: colors.foreground, fontSize: 14, fontFamily: "DMSans_400Regular" }}
              />
              <Pressable
                style={{
                  width: 40, height: 40, borderRadius: 20,
                  backgroundColor: colors.primary,
                  alignItems: "center", justifyContent: "center",
                }}
              >
                <MaterialIcons name="send" size={18} color="white" />
              </Pressable>
            </View>
          </View>
        )}
      </PlushBottomSheet>
    </ScreenContainer>
  );
}
