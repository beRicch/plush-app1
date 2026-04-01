import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import Constants from "expo-constants";

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Constants.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    // Check if we're in Expo Go (Constants.appOwnership is 'expo')
    // Push notifications are not supported in Expo Go for SDK 53+
    if (Constants.appOwnership === 'expo') {
      console.warn("Push notifications are not supported in Expo Go. Use a development build.");
      return;
    }

    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!");
      return;
    }
    
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    // @ts-ignore
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId) {
      console.log("Project ID not found");
    }

    try {
      token = (await Notifications.getExpoPushTokenAsync({
        projectId,
      })).data;
      console.log("Expo Push Token:", token);
    } catch (e) {
      console.log("Error getting push token:", e);
    }
  } else {
    console.log("Must use physical device for Push Notifications");
  }

  return token;
}

export function handleRegistrationError(errorMessage: string) {
  alert(errorMessage);
  throw new Error(errorMessage);
}
