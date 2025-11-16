import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface CreditsData {
  credits: number;
  lastResetDate: string;
}

const CREDITS_KEY = "@user_credits";
const DAILY_CREDIT_LIMIT = 5;

export const useCredits = (isProUser: boolean) => {
  const [credits, setCredits] = useState<number>(DAILY_CREDIT_LIMIT);
  const [loading, setLoading] = useState(true);

  // Get today's date as string (YYYY-MM-DD)
  const getTodayDateString = (): string => {
    return new Date().toISOString().split("T")[0];
  };

  // Load credits from storage
  const loadCredits = async () => {
    try {
      if (isProUser) {
        setCredits(Infinity); // Unlimited for pro users
        setLoading(false);
        return;
      }

      const stored = await AsyncStorage.getItem(CREDITS_KEY);
      const today = getTodayDateString();

      if (stored) {
        const creditsData: CreditsData = JSON.parse(stored);

        // Check if we need to reset (new day)
        if (creditsData.lastResetDate !== today) {
          // Reset credits for new day
          const newCreditsData: CreditsData = {
            credits: DAILY_CREDIT_LIMIT,
            lastResetDate: today,
          };

          await AsyncStorage.setItem(
            CREDITS_KEY,
            JSON.stringify(newCreditsData),
          );
          setCredits(DAILY_CREDIT_LIMIT);
        } else {
          // Use stored credits from today
          setCredits(creditsData.credits);
        }
      } else {
        // First time - initialize credits
        const newCreditsData: CreditsData = {
          credits: DAILY_CREDIT_LIMIT,
          lastResetDate: today,
        };

        await AsyncStorage.setItem(CREDITS_KEY, JSON.stringify(newCreditsData));
        setCredits(DAILY_CREDIT_LIMIT);
      }
    } catch (error) {
      console.error("Error loading credits:", error);
      setCredits(DAILY_CREDIT_LIMIT); // Fallback
    } finally {
      setLoading(false);
    }
  };

  // Use a credit
  const consumeCredit = async (): Promise<boolean> => {
    if (isProUser) return true; // Pro users have unlimited credits

    if (credits <= 0) return false; // No credits left

    try {
      const newCredits = credits - 1;
      const today = getTodayDateString();

      const creditsData: CreditsData = {
        credits: newCredits,
        lastResetDate: today,
      };

      await AsyncStorage.setItem(CREDITS_KEY, JSON.stringify(creditsData));
      setCredits(newCredits);
      return true;
    } catch (error) {
      console.error("Error using credit:", error);
      return false;
    }
  };

  // Check if user has credits available
  const hasCredits = (): boolean => {
    if (isProUser) return true;
    return credits > 0;
  };

  // Get time until next reset (for UI display)
  const getTimeUntilReset = (): Date => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  };

  // Reset credits manually (for testing or admin purposes)
  const resetCredits = async () => {
    if (isProUser) return;

    try {
      const today = getTodayDateString();
      const creditsData: CreditsData = {
        credits: DAILY_CREDIT_LIMIT,
        lastResetDate: today,
      };

      await AsyncStorage.setItem(CREDITS_KEY, JSON.stringify(creditsData));
      setCredits(DAILY_CREDIT_LIMIT);
    } catch (error) {
      console.error("Error resetting credits:", error);
    }
  };

  // Load credits when hook mounts or when pro status changes
  useEffect(() => {
    loadCredits();
  }, [isProUser]);

  return {
    credits: isProUser ? Infinity : credits,
    loading,
    consumeCredit,
    hasCredits,
    getTimeUntilReset,
    resetCredits,
  };
};
