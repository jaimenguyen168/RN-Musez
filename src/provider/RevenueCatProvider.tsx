import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Purchases, { CustomerInfo, LOG_LEVEL } from "react-native-purchases";
import { LogBox, Platform } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const apiKey = {
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY!,
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY!,
};

LogBox.ignoreLogs([
  "[RevenueCat] 🍎‼️ Purchase was cancelled.",
  "Purchase failure simulated successfully in Test Store",
]);

interface RevenueCatProviderProps {
  isProUser: boolean;
  logOut: () => Promise<void>;
}

const RevenueCatContext = createContext<Partial<RevenueCatProviderProps>>({});

export const RevenueCatProvider = ({ children }: { children: ReactNode }) => {
  const [isProUser, setIsProUser] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const { user } = useUser();
  const setProStatus = useMutation(api.function.credits.setProStatus);
  const isProUserRef = useRef(false);
  const listenerRef = useRef<((customerInfo: CustomerInfo) => void) | null>(
    null,
  );

  useEffect(() => {
    if (user?.id) {
      init(user.id).then((r) => console.log(r));
    }
    return () => {
      if (listenerRef.current) {
        Purchases.removeCustomerInfoUpdateListener(listenerRef.current);
        listenerRef.current = null;
      }
    };
  }, [user?.id]);

  const init = async (userId: string) => {
    Purchases.configure({
      apiKey: apiKey[Platform.OS as keyof typeof apiKey],
      appUserID: userId,
    });

    await Purchases.setLogLevel(LOG_LEVEL.ERROR);
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      await updateCustomerInfo(customerInfo);
    } catch (error) {
      console.error("Error getting initial customer info:", error);
      setIsReady(true);
    }

    if (listenerRef.current) {
      Purchases.removeCustomerInfoUpdateListener(listenerRef.current);
    }
    listenerRef.current = (customerInfo) => {
      console.log("Customer info updated", customerInfo);
      updateCustomerInfo(customerInfo);
    };
    Purchases.addCustomerInfoUpdateListener(listenerRef.current);
  };

  const updateCustomerInfo = async (customerInfo: CustomerInfo) => {
    const hasPro = !!customerInfo.entitlements.active["Musez Pro"];

    // Granting off any signal is safe — RevenueCat's SDK already correctly
    // aggregates every active subscription/product into this one boolean.
    if (hasPro) {
      isProUserRef.current = true;
      setIsProUser(true);
      setIsReady(true);
      try {
        await setProStatus({ isPro: true });
      } catch (error) {
        console.error("Failed to sync pro status to Convex:", error);
      }
      return;
    }

    if (!isProUserRef.current) {
      // Already not-Pro — nothing to revoke, no need to hit the network
      // just to reconfirm a listener firing that changes nothing.
      setIsReady(true);
      return;
    }

    // Going from Pro -> not-Pro: the listener can fire with a stale cached
    // CustomerInfo (cold start, reconnects, Test Store's fast expire/renew
    // cycles) rather than a real cancellation. Force a fresh network fetch
    // before writing a revocation to Convex, since revoking off a false
    // read isn't safe the way granting is.
    try {
      await Purchases.invalidateCustomerInfoCache();
      const fresh = await Purchases.getCustomerInfo();
      const confirmedHasPro = !!fresh.entitlements.active["Musez Pro"];
      isProUserRef.current = confirmedHasPro;
      setIsProUser(confirmedHasPro);
      await setProStatus({ isPro: confirmedHasPro });
    } catch (error) {
      console.error("Failed to confirm pro status revocation:", error);
    } finally {
      setIsReady(true);
    }
  };

  const logOut = async () => {
    try {
      console.log("Logging out from RevenueCat...");
      await Purchases.logOut();

      isProUserRef.current = false;
      setIsProUser(false);

      const customerInfo = await Purchases.getCustomerInfo();
      console.log("New anonymous user:", customerInfo.originalAppUserId);
      await updateCustomerInfo(customerInfo);

      console.log("RevenueCat logout successful");
    } catch (error) {
      console.error("Error logging out from RevenueCat:", error);
    }
  };

  if (!isReady) return null;

  return (
    <RevenueCatContext.Provider value={{ isProUser, logOut }}>
      {children}
    </RevenueCatContext.Provider>
  );
};

export const useRevenueCat = () => {
  return useContext(RevenueCatContext);
};
