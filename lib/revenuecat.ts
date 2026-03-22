import Purchases, { PurchasesOffering } from 'react-native-purchases';
import { Platform } from 'react-native';
import { useState, useEffect } from 'react';
import Constants, { AppOwnership } from 'expo-constants';

// RevenueCat (react-native-purchases) is a native module and 
// is NOT supported in the standard Expo Go app. It requires a 
// development client. We'll check if we're in Expo Go.
const isExpoGo = Constants.appOwnership === AppOwnership.Expo;

// Replace with your actual RevenueCat API keys
const REVENUE_CAT_API_KEY = {
  apple: process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY || '',
  google: process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY || '',
};

export const initRevenueCat = async () => {
  if (isExpoGo) {
    console.warn('RevenueCat: Skipping initialization in Expo Go (Native module not supported). Use a Development Client for full features.');
    return;
  }

  try {
    if (Platform.OS === 'ios' && REVENUE_CAT_API_KEY.apple) {
      await Purchases.configure({ apiKey: REVENUE_CAT_API_KEY.apple });
    } else if (Platform.OS === 'android' && REVENUE_CAT_API_KEY.google) {
      await Purchases.configure({ apiKey: REVENUE_CAT_API_KEY.google });
    }
  } catch (e) {
    console.error('RevenueCat init error:', e);
  }
};

export const useSubscription = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      if (isExpoGo) {
        setLoading(false);
        return;
      }

      try {
        const customerInfo = await Purchases.getCustomerInfo();
        // Check if user has "premium" entitlement active
        setIsPremium(customerInfo.entitlements.active['premium'] !== undefined);
        
        const currentOfferings = await Purchases.getOfferings();
        if (currentOfferings.current !== null) {
          setOfferings(currentOfferings.current);
        }
      } catch (e) {
        console.error('Error fetching RevenueCat info', e);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, []);

  return { isPremium, loading, offerings };
};
