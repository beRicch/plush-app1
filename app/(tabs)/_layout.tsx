import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HapticTab } from "@/components/haptic-tab";
import { Platform, View, TouchableOpacity, Text, StyleSheet } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { PLUSH_GRADIENT } from "@/components/plush-gradient";
import { TabBarVisibilityProvider, useTabBarVisibility } from "@/lib/tab-bar-visibility";

// Plush Brand Palette
const BLUSH_PINK = "#F4B8C1";
const DEEP_PLUM = "#4A1560";
const CREAM = "#FAF5EF";
const ROSE_GOLD = "#B76E79";
const NAV_WHITE = "#FAF5EF";

const ACTIVE_ICON = DEEP_PLUM;
const INACTIVE_ICON = `${DEEP_PLUM}66`; // ~40% opacity
const ACTIVE_PILL = `${BLUSH_PINK}22`; // Very light Blush Pink

function TabIcon({ name, color, label, isActive }: {
  name: React.ComponentProps<typeof MaterialIcons>["name"];
  color: string;
  label: string;
  isActive: boolean;
}) {
  return (
    <View style={styles.tabIconGroup}>
      <View style={[styles.iconPill, isActive && styles.iconPillActive]}>
        <MaterialIcons name={name} size={24} color={color} />
      </View>
      <Text style={[styles.tabLabel, { color: isActive ? DEEP_PLUM : INACTIVE_ICON }]}>
        {label}
      </Text>
      {isActive && <View style={styles.activeDot} />}
    </View>
  );
}

function ProfilePlaceholder({ isActive }: { isActive: boolean }) {
  return (
    <View style={styles.tabIconGroup}>
      <View style={[styles.iconPill, isActive && styles.iconPillActive]}>
        <View style={styles.profileCircle}>
          <Text style={styles.profileText}>BR</Text>
        </View>
      </View>
      <Text style={[styles.tabLabel, { color: isActive ? DEEP_PLUM : INACTIVE_ICON }]}>
        Profile
      </Text>
    </View>
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { isTabBarHidden } = useTabBarVisibility();

  if (isTabBarHidden) return null;

  // Tabs in the main pill: Home, Progress, Groups, Profile
  const pillRoutes = ["index", "goals", "community", "profile"];
  const logRoute = state.routes.find((r: any) => r.name === "log");

  return (
    <View style={[styles.tabBarOuter, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      <View style={styles.mainNavPill}>
        {pillRoutes.map((routeName) => {
          const route = state.routes.find((r: any) => r.name === routeName);
          if (!route) return null;

          const { options } = descriptors[route.key];
          const isFocused = state.index === state.routes.indexOf(route);

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          let label = options.title || route.name;
          if (routeName === "goals") label = "Goals";
          if (routeName === "community") label = "Community";
          if (routeName === "index") label = "Home";

          let iconName: React.ComponentProps<typeof MaterialIcons>["name"] = "cottage";
          if (routeName === "goals") iconName = "bar-chart";
          if (routeName === "community") iconName = "people";

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabButtonItem}
              activeOpacity={0.7}
            >
              <View style={styles.tabIconGroup}>
                <View style={[styles.iconPill, isFocused && styles.iconPillActive]}>
                  {routeName === "profile" ? (
                    <LinearGradient
                      colors={PLUSH_GRADIENT}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.profileCircle}
                    >
                      <Text style={styles.profileText}>AO</Text>
                    </LinearGradient>
                  ) : (
                    <MaterialIcons name={iconName} size={20} color={isFocused ? ACTIVE_ICON : INACTIVE_ICON} />
                  )}
                </View>
                <Text style={[styles.tabLabel, { color: isFocused ? DEEP_PLUM : INACTIVE_ICON }]}>
                  {label}
                </Text>
                {isFocused && <View style={styles.activeDot} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Plush "Log" Button — Rose Gold FAB style */}
      <TouchableOpacity
        onPress={() => logRoute && navigation.navigate("log")}
        style={styles.plushLogButton}
        activeOpacity={0.8}
      >
        <MaterialIcons name="add" size={28} color="#FAF5EF" />
      </TouchableOpacity>
    </View>
  );
}

export default function TabLayout() {
  return (
    <TabBarVisibilityProvider>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen name="goals" options={{ title: "Progress" }} />
        <Tabs.Screen name="log" options={{ title: "Log" }} />
        <Tabs.Screen name="community" options={{ title: "Groups" }} />
        <Tabs.Screen name="profile" options={{ title: "Profile" }} />
        <Tabs.Screen name="ajo-circle" options={{ href: null }} />
        <Tabs.Screen name="insights" options={{ href: null }} />
        <Tabs.Screen name="plush-score" options={{ href: null }} />
        <Tabs.Screen name="rituals-hub" options={{ href: null }} />
        <Tabs.Screen name="goal-celebration" options={{ href: null }} />
        <Tabs.Screen name="rituals" options={{ href: null }} />
      </Tabs>
    </TabBarVisibilityProvider>
  );
}

const styles = StyleSheet.create({
  tabBarOuter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: "transparent",
    gap: 12,
  },
  mainNavPill: {
    flexDirection: "row",
    backgroundColor: NAV_WHITE,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 8,
    flex: 1,
    height: 67, // Reduced from 72
    alignItems: "center",
    justifyContent: "space-around",
    shadowColor: DEEP_PLUM,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  tabButtonItem: {
    alignItems: "center",
  },
  tabIconGroup: {
    alignItems: "center",
    justifyContent: "center",
    width: 60, // Reduced from 64
  },
  iconPill: {
    width: 40, // Reduced from 48
    height: 32, // Reduced from 36
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  iconPillActive: {
    backgroundColor: ACTIVE_PILL,
  },
  tabLabel: {
    fontSize: 9, // Reduced from 10
    fontFamily: "DMSans_400Regular",
  },
  activeDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: ROSE_GOLD,
    marginTop: 2,
    position: "absolute",
    bottom: -8,
  },
  plushLogButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: ROSE_GOLD,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: ROSE_GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  profileCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  profileText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontFamily: "DMSans_700Bold",
    fontWeight: "bold",
  },
});
