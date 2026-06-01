import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { CustomPaywallModal } from "@/components/CustomPaywallModal";

interface PaywallContextValue {
  showPaywall: (options?: { onPurchased?: () => void }) => void;
}

const PaywallContext = createContext<PaywallContextValue>({ showPaywall: () => {} });

export const PaywallProvider = ({ children }: { children: React.ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const onPurchasedRef = useRef<(() => void) | undefined>(undefined);

  const showPaywall = useCallback((options?: { onPurchased?: () => void }) => {
    onPurchasedRef.current = options?.onPurchased;
    setVisible(true);
  }, []);

  return (
    <PaywallContext.Provider value={{ showPaywall }}>
      {children}
      <CustomPaywallModal
        visible={visible}
        onClose={() => setVisible(false)}
        onPurchased={onPurchasedRef.current}
      />
    </PaywallContext.Provider>
  );
};

export const usePaywallContext = () => useContext(PaywallContext);
