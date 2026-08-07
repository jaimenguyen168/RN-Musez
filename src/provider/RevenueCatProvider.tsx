import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
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

  useEffect(() => {
    if (user?.id) {
      init(user.id).then((r) => console.log(r));
    }
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

    Purchases.addCustomerInfoUpdateListener((customerInfo) => {
      console.log("Customer info updated", customerInfo);
      updateCustomerInfo(customerInfo);
    });
  };

  const updateCustomerInfo = async (customerInfo: CustomerInfo) => {
    const hasPro = !!customerInfo.entitlements.active["Musez Pro"];
    setIsProUser(hasPro);
    setIsReady(true);

    // RevenueCat's SDK already correctly aggregates every active
    // subscription/product into this one boolean, so this is always the
    // authoritative answer — unlike the webhook, which only sees one event
    // (one product) at a time and can't safely infer the overall state.
    try {
      await setProStatus({ isPro: hasPro });
    } catch (error) {
      console.error("Failed to sync pro status to Convex:", error);
    }
  };

  const logOut = async () => {
    try {
      console.log("Logging out from RevenueCat...");
      await Purchases.logOut();

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
