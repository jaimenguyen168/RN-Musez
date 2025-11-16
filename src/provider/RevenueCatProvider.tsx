import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import Purchases, { CustomerInfo, LOG_LEVEL } from "react-native-purchases";
import { Platform } from "react-native";
import { useUser } from "@clerk/clerk-expo";

const apiKey = {
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY!,
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY!,
};

interface RevenueCatProviderProps {
  isProUser: boolean;
  logOut: () => Promise<void>;
}

const RevenueCatContext = createContext<Partial<RevenueCatProviderProps>>({});

export const RevenueCatProvider = ({ children }: { children: ReactNode }) => {
  const [isProUser, setIsProUser] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const { user } = useUser();

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
    setIsProUser(!!customerInfo.entitlements.active["Musez Pro"]);
    setIsReady(true);
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
