import { Redirect } from "expo-router";
import { trpc } from "@/lib/trpc";
import { ActivityIndicator, View } from "react-native";
import { useColors } from "@/hooks/use-colors";

export default function Index() {
  const colors = useColors();
  const { data: user, isLoading } = trpc.auth.me.useQuery();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // If user is logged in, go to home tabs. Otherwise, start onboarding/splash.
  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/onboarding/splash" />;
}
