import * as Updates from "expo-updates";
import { useEffect } from "react";
import { Platform } from "react-native";

/**
 * Checks for and applies Expo OTA updates on app startup.
 * Runs silently — errors are caught so the app always launches normally.
 * Skipped entirely in development and on web.
 */
export function useAppUpdate() {
  useEffect(() => {
    if (Platform.OS === "web") return;
    if (__DEV__) return;

    let cancelled = false;

    async function checkForUpdate() {
      try {
        // Only run if updates are enabled and initialized
        if (!Updates.isEnabled) return;

        const check = await Updates.checkForUpdateAsync();
        if (cancelled || !check.isAvailable) return;

        await Updates.fetchUpdateAsync();
        if (cancelled) return;

        await Updates.reloadAsync();
      } catch (e) {
        console.warn("[Updates] Failed to check for updates:", e);
      }
    }

    checkForUpdate();

    return () => {
      cancelled = true;
    };
  }, []);
}
