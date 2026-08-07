import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "@/provider/ThemeProvider";
import { useOrganicTheme } from "@/constants/organicTheme";
import { usePaywall } from "@/hooks/usePaywall";
import { useCredits } from "@/modules/snap/hooks/useCredits";
import Purchases from "react-native-purchases";

const MANAGE_URL =
  Platform.OS === "ios"
    ? "itms-apps://apps.apple.com/account/subscriptions"
    : "https://play.google.com/store/account/subscriptions";

const FEATURES_FREE = ["Nearby museums discovery", "Personal art collection", "AI artwork analysis"];
const FEATURES_PRO = ["Everything in Free", "Unlimited AI features", "Search museums anywhere"];

const SubscriptionsView = () => {
  const router = useRouter();
  const { isDark } = useTheme();
  const c = useOrganicTheme();
  const insets = useSafeAreaInsets();
  const { isProUser } = useCredits();
  const { presentPaywall } = usePaywall();
  const [restoring, setRestoring] = useState(false);

  const handleManage = () => {
    Linking.openURL(MANAGE_URL).catch(() =>
      Alert.alert("Error", "Could not open subscription settings."),
    );
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const info = await Purchases.restorePurchases();
      if (info.entitlements.active["Musez Pro"]) {
        Alert.alert("Restored!", "Your Pro subscription has been restored.");
      } else {
        Alert.alert("No Purchases Found", "We couldn't find any previous purchases to restore.");
      }
    } catch {
      Alert.alert("Restore Failed", "Something went wrong. Please try again.");
    } finally {
      setRestoring(false);
    }
  };

  const features = isProUser ? FEATURES_PRO : FEATURES_FREE;

  return (
    <View className="flex-1 bg-organic">
      <StatusBar style={isDark ? "light" : "dark"} />

      <View className="px-5 flex-row items-center gap-3" style={{ paddingTop: insets.top + 8, paddingBottom: 8 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-[38px] h-[38px] rounded-full items-center justify-center bg-organic-surface border border-organic-divider"
        >
          <Ionicons name="chevron-back" size={19} color={c.text} />
        </TouchableOpacity>
        <Text className="font-heading text-organic text-2xl leading-6">Subscription</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}>
        <View className="gap-5">
          {/* ── Plan card ────────────────────────────────────────────────── */}
          {isProUser ? (
            <View className="mx-5 bg-organic-accent2-soft rounded-2xl p-[17px] gap-2.5">
              <View className="flex-row justify-between items-center gap-2.5">
                <Text className="font-figtree-bold text-organic-accent2 text-[11px] tracking-[1.1px] uppercase">
                  Current Plan
                </Text>
                <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: c.accent2 }}>
                  <Text className="font-figtree-bold text-[11px]" style={{ color: isDark ? "#2c3320" : "#f0fae1" }}>
                    Pro · Unlimited
                  </Text>
                </View>
              </View>
              <Text className="font-heading text-organic text-[22px] leading-6">Musez Pro</Text>
            </View>
          ) : (
            <View className="mx-5 rounded-2xl p-[17px] gap-2.5" style={{ backgroundColor: "#8c491a" }}>
              <View className="flex-row justify-between items-center gap-2.5">
                <Text className="font-figtree-bold text-[11px] tracking-[1.1px] uppercase" style={{ color: "#ffe1d0" }}>
                  Current Plan
                </Text>
                <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: "#643312" }}>
                  <Text className="font-figtree-bold text-[11px]" style={{ color: "#fff2eb" }}>
                    Free
                  </Text>
                </View>
              </View>
              <Text className="font-heading text-[22px] leading-6" style={{ color: "#fff2eb" }}>
                No active subscription
              </Text>
            </View>
          )}

          {/* ── Feature list ─────────────────────────────────────────────── */}
          <View className="mx-5 bg-organic-surface rounded-2xl overflow-hidden">
            <View className="flex-row items-center gap-2.5 px-4 pt-3.5 pb-3 border-b border-organic-divider">
              <View className="w-[30px] h-[30px] rounded-lg items-center justify-center bg-organic-accent-soft">
                <Ionicons name="star-outline" size={15} color={c.accentStrong} />
              </View>
              <Text className="font-heading text-organic text-[15px]">
                {isProUser ? "Your Pro benefits" : "What's included"}
              </Text>
            </View>
            {features.map((f, i) => (
              <View
                key={f}
                className={`flex-row items-center gap-3 px-4 py-3.5 ${i < features.length - 1 ? "border-b border-organic-divider" : ""}`}
              >
                <Ionicons name="checkmark-circle" size={18} color={c.accentStrong} />
                <Text className="flex-1 font-figtree text-organic text-sm">{f}</Text>
              </View>
            ))}
          </View>

          {/* ── Actions ──────────────────────────────────────────────────── */}
          <View className="px-5 gap-2.5">
            {isProUser ? (
              <TouchableOpacity
                onPress={handleManage}
                activeOpacity={0.85}
                className="flex-row items-center gap-3 rounded-2xl p-4 bg-organic-surface border border-organic-divider"
              >
                <View
                  className="w-9 h-9 rounded-xl items-center justify-center"
                  style={{ backgroundColor: isDark ? "rgba(255,198,165,0.14)" : "#fff2eb" }}
                >
                  <Ionicons name="close-circle-outline" size={19} color={c.accentStrong} />
                </View>
                <View className="flex-1">
                  <Text className="font-heading text-organic text-[15px]">Manage subscription</Text>
                  <Text className="font-figtree text-organic-muted text-xs mt-0.5">
                    Cancel or change plan in the App Store
                  </Text>
                </View>
                <Ionicons name="open-outline" size={16} color={c.textFaint} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => presentPaywall({})}
                activeOpacity={0.85}
                className="flex-row items-center justify-center gap-2 rounded-full py-4 bg-organic-accent"
              >
                <Ionicons name="star" size={16} color={c.accentSoft} />
                <Text className="font-heading text-organic-accent-soft text-[15.5px]">Upgrade to Pro</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleRestore}
              disabled={restoring}
              activeOpacity={0.7}
              className="items-center py-2.5"
            >
              {restoring ? (
                <ActivityIndicator size="small" color={c.accent} />
              ) : (
                <Text className="font-figtree-bold text-organic-muted text-[13px]">Restore purchases</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default SubscriptionsView;
