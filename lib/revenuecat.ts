import Purchases, { PurchasesOffering } from 'react-native-purchases';
import { Platform } from 'react-native';
import { useState, useEffect } from 'react';
import Constants, { AppOwnership } from 'expo-constants';

// RevenueCat (react-native-purchases) is a native module and 
// is NOT supported in the standard Expo Go app. It requires a 
// development client. We'll check if we're in Expo Go.
const isExpoGo = Constants.appOwnership === AppOwnership.Expo;

// RevenueCat API keys should be provided via environment variables.
const REVENUE_CAT_API_KEY = {
  apple: process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY ?? '',
  google: process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY ?? '',
};

const isTestRevenueCatKey = (key: string) => key.startsWith('test_');

export const initRevenueCat = async () => {
  if (isExpoGo) {
    console.warn(
      'RevenueCat: Skipping initialization in Expo Go (Native module not supported). Use a Development Client for full features.',
    );
    return;
  }

  const key = Platform.OS === 'ios' ? REVENUE_CAT_API_KEY.apple : REVENUE_CAT_API_KEY.google;

  if (!key) {
    console.warn('RevenueCat: No RevenueCat API key found. Skipping initialization.');
    return;
  }

  if (process.env.NODE_ENV === 'production' && isTestRevenueCatKey(key)) {
    console.error(
      'RevenueCat: Test API key detected in production build. Skipping RevenueCat initialization to avoid the app closing on launch.',
    );
    return;
  }

  try {
    await Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
    await Purchases.configure({ apiKey: key });
  } catch (e) {
    console.error('RevenueCat init error:', e);
  }
};

export type RevenueCatSubscriptionState = {
  isPremium: boolean;
  isMember: boolean;
  isAI: boolean;
  isSociety: boolean;
  activeTiers: string[];
  loading: boolean;
  offerings: PurchasesOffering | null;
};

export const useSubscription = (): RevenueCatSubscriptionState => {
  // Bypass for testing
  return {
    isPremium: true,
    isMember: true,
    isAI: true,
    isSociety: true,
    activeTiers: ['plush member', 'plush ai', 'plush society'],
    loading: false,
    offerings: null as PurchasesOffering | null,
  };

  /* Original Logic:
  const [activeTiers, setActiveTiers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);

  const isPremium = activeTiers.length > 0;
  const isMember = activeTiers.includes('plush member');
  const isAI = activeTiers.includes('plush ai');
  const isSociety = activeTiers.includes('plush society');

  useEffect(() => {
    const checkStatus = async () => {
      if (isExpoGo) {
        setLoading(false);
        return;
      }

      try {
        const customerInfo = await Purchases.getCustomerInfo();
        const activeIds = Object.keys(customerInfo.entitlements.active).map(id => id.toLowerCase());
        setActiveTiers(activeIds);
        
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

  return { isPremium, isMember, isAI, isSociety, activeTiers, loading, offerings };
  */
};
