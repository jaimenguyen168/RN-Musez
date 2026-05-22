import { useCallback } from "react";
import { Alert } from "react-native";
import { usePaywallContext } from "@/provider/PaywallProvider";

export interface PaywallOptions {
  showSuccessAlert?: boolean;
  onSuccess?: () => void;
  onCancelled?: () => void;
}

export const usePaywall = () => {
  const { showPaywall } = usePaywallContext();

  const presentPaywall = useCallback(
    (options: PaywallOptions = {}) => {
      const { showSuccessAlert = false, onSuccess } = options;
      showPaywall({
        onPurchased: () => {
          if (showSuccessAlert) {
            Alert.alert(
              "Success!",
              "Welcome to Pro! You now have unlimited access to all features.",
              [{ text: "OK", style: "default" }],
            );
          }
          onSuccess?.();
        },
      });
    },
    [showPaywall],
  );

  const presentUpgradePrompt = useCallback(
    (
      options: {
        title?: string;
        message?: string;
        cancelText?: string;
        upgradeText?: string;
        onUpgrade?: () => void;
        onCancel?: () => void;
      } = {},
    ) => {
      const {
        title = "Upgrade to Pro",
        message = "Get unlimited access to all features with Pro.",
        cancelText = "Cancel",
        upgradeText = "Upgrade to Pro",
        onUpgrade,
        onCancel,
      } = options;

      Alert.alert(title, message, [
        { text: cancelText, style: "cancel", onPress: onCancel },
        {
          text: upgradeText,
          onPress: () => presentPaywall({ showSuccessAlert: true, onSuccess: onUpgrade }),
        },
      ]);
    },
    [presentPaywall],
  );

  return { presentPaywall, presentUpgradePrompt };
};
