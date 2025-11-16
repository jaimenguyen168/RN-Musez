import { useCallback } from "react";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import { Alert } from "react-native";

export interface PaywallOptions {
  displayCloseButton?: boolean;
  showSuccessAlert?: boolean;
  showErrorAlert?: boolean;
  onSuccess?: () => void;
  onError?: (error?: string) => void;
  onCancelled?: () => void;
}

export const usePaywall = () => {
  const presentPaywall = useCallback(async (options: PaywallOptions = {}) => {
    const {
      displayCloseButton = true,
      showSuccessAlert = false,
      showErrorAlert = true,
      onSuccess,
      onError,
      onCancelled,
    } = options;

    try {
      const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall({
        displayCloseButton,
      });

      console.log("Paywall result:", paywallResult);

      switch (paywallResult) {
        case PAYWALL_RESULT.PURCHASED:
        case PAYWALL_RESULT.RESTORED:
          if (showSuccessAlert) {
            Alert.alert(
              "Success!",
              "Welcome to Pro! You now have unlimited access to all features.",
              [{ text: "OK", style: "default" }],
            );
          }
          onSuccess?.();
          return true;

        case PAYWALL_RESULT.CANCELLED:
          onCancelled?.();
          return false;

        case PAYWALL_RESULT.NOT_PRESENTED:
          if (showErrorAlert) {
            Alert.alert(
              "Error",
              "Unable to show upgrade options. Please try again.",
              [{ text: "OK", style: "default" }],
            );
          }
          onError?.("Paywall not presented");
          return false;

        case PAYWALL_RESULT.ERROR:
          if (showErrorAlert) {
            Alert.alert(
              "Error",
              "Something went wrong. Please try again later.",
              [{ text: "OK", style: "default" }],
            );
          }
          onError?.("Paywall error");
          return false;

        default:
          onError?.("Unknown paywall result");
          return false;
      }
    } catch (error) {
      console.error("Paywall error:", error);
      if (showErrorAlert) {
        Alert.alert(
          "Error",
          "Unable to show upgrade options. Please try again.",
          [{ text: "OK", style: "default" }],
        );
      }
      onError?.(error instanceof Error ? error.message : "Unknown error");
      return false;
    }
  }, []);

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
        {
          text: cancelText,
          style: "cancel",
          onPress: onCancel,
        },
        {
          text: upgradeText,
          onPress: async () => {
            return await presentPaywall({
              showSuccessAlert: true,
              onSuccess: onUpgrade,
            });
          },
        },
      ]);
    },
    [presentPaywall],
  );

  return {
    presentPaywall,
    presentUpgradePrompt,
  };
};
