import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

const DAILY_LIMIT = 3;

/**
 * Returns the YYYY-MM-DD key for the current 8am reset window.
 * If it's before 8am, the active window started yesterday at 8am.
 */
const getResetPeriodKey = (): string => {
  const now = new Date();
  if (now.getHours() < 8) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split("T")[0];
  }
  return now.toISOString().split("T")[0];
};

/**
 * Returns the next 8am reset time as a Date object.
 */
const getNextResetTime = (): Date => {
  const now = new Date();
  const next = new Date(now);
  next.setHours(8, 0, 0, 0);
  if (now.getHours() >= 8) {
    next.setDate(next.getDate() + 1);
  }
  return next;
};

export const useCredits = () => {
  const resetPeriodKey = getResetPeriodKey();

  const result = useQuery(api.function.credits.getCredits, { resetPeriodKey });
  const consumeCreditMutation = useMutation(api.function.credits.consumeCredit);

  const loading = result === undefined;
  const credits = result?.credits ?? DAILY_LIMIT;
  const isProUser = result?.isProUser ?? false;

  const consumeCredit = async (): Promise<boolean> => {
    const res = await consumeCreditMutation({ resetPeriodKey });
    return res.success;
  };

  const hasCredits = (): boolean => {
    if (isProUser) return true;
    return (credits ?? 0) > 0;
  };

  const getTimeUntilReset = (): Date => getNextResetTime();

  return {
    credits: isProUser ? Infinity : credits,
    loading,
    isProUser,
    consumeCredit,
    hasCredits,
    getTimeUntilReset,
  };
};
