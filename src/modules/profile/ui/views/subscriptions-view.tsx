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
import { useRouter } from "expo-router";
import { useTheme } from "@/provider/ThemeProvider";
import BlurNavigationHeader from "@/components/BlurNavigationHeader";
import BackButton from "@/components/BackButton";
import { useRevenueCat } from "@/provider/RevenueCatProvider";
import { usePaywall } from "@/hooks/usePaywall";
import Purchases from "react-native-purchases";
import { Colors } from "@/constants/colors";

const MANAGE_URL =
  Platform.OS === "ios"
    ? "itms-apps://apps.apple.com/account/subscriptions"
    : "https://play.google.com/store/account/subscriptions";

const FEATURES_FREE = [
  "Museum Discovery",
  "Location-Based Search",
  "AI Artwork Analysis (5/day)",
  "Personal Art Collection",
];

const FEATURES_PRO = [
  "Everything in Free",
  "Unlimited AI Artwork Analysis",
  "Priority Support",
];

const SubscriptionsView = () => {
  const router = useRouter();
  const { isDark } = useTheme();
  const { isProUser } = useRevenueCat();
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

  return (
    <View className={`flex-1 ${isDark ? "bg-gray-900" : "bg-[#FAFAFA]"}`}>
      <BlurNavigationHeader
        title="Subscription"
        leftComponent={<BackButton onPress={() => router.back()} />}
        blurType={isDark ? "dark" : "light"}
        statusBarStyle={isDark ? "light" : "dark"}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 100, paddingBottom: 40 }}
      >
        {/* Current plan banner */}
        <View className="px-5 mb-6">
          <View
            className={`rounded-2xl p-5 flex-row items-center justify-between ${isDark ? "bg-gray-800" : "bg-white"}`}
            style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 }}
          >
            <View className="gap-0.5">
              <Text className={`text-[13px] font-semibold ${isDark ? "text-gray-400" : "text-gray-500"}`}>Current Plan</Text>
              <Text className={`text-[22px] font-extrabold -tracking-[0.3px] ${isDark ? "text-gray-50" : "text-gray-900"}`}>
                {isProUser ? "Musez Pro" : "Free"}
              </Text>
            </View>
            <View
              className={`px-3.5 py-1.5 rounded-full ${isProUser ? "bg-[#FFF4E0]" : isDark ? "bg-gray-700" : "bg-gray-100"}`}
            >
              <Text className={`text-[13px] font-bold ${isProUser ? "text-[#FF9900]" : isDark ? "text-gray-400" : "text-gray-500"}`}>
                {isProUser ? "PRO" : "FREE"}
              </Text>
            </View>
          </View>
        </View>

        {/* Feature list */}
        <View className="px-5 mb-6">
          <View
            className={`rounded-2xl overflow-hidden ${isDark ? "bg-gray-800" : "bg-white"}`}
            style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 }}
          >
            <View className={`flex-row items-center gap-2.5 px-5 pt-5 pb-3.5 border-b ${isDark ? "border-gray-700" : "border-gray-100"}`}>
              <View className={`w-[30px] h-[30px] rounded-lg items-center justify-center ${isDark ? "bg-gray-700" : "bg-orange-50"}`}>
                <Ionicons name="star-outline" size={15} color={Colors.Primary} />
              </View>
              <Text className={`text-[15px] font-bold ${isDark ? "text-gray-50" : "text-gray-900"}`}>
                {isProUser ? "Your Pro Benefits" : "What's Included"}
              </Text>
            </View>
            {(isProUser ? FEATURES_PRO : FEATURES_FREE).map((f, i) => (
              <View
                key={i}
                className={`flex-row items-center gap-3 px-5 py-3.5 ${i < (isProUser ? FEATURES_PRO : FEATURES_FREE).length - 1 ? `border-b ${isDark ? "border-gray-700" : "border-gray-100"}` : ""}`}
              >
                <Ionicons name="checkmark-circle" size={18} color={Colors.Primary} />
                <Text className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>{f}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View className="px-5 gap-3">
          {isProUser ? (
            <>
              <TouchableOpacity
                onPress={handleManage}
                activeOpacity={0.85}
                className={`flex-row items-center gap-3 rounded-2xl p-4 border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
              >
                <View className={`w-9 h-9 rounded-xl items-center justify-center ${isDark ? "bg-gray-700" : "bg-red-50"}`}>
                  <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
                </View>
                <View className="flex-1">
                  <Text className={`text-[15px] font-semibold ${isDark ? "text-gray-50" : "text-gray-900"}`}>Manage Subscription</Text>
                  <Text className={`text-xs mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Cancel or change plan in the App Store</Text>
                </View>
                <Ionicons name="open-outline" size={16} color={isDark ? "#4B5563" : "#D1D5DB"} />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              onPress={() => presentPaywall({})}
              activeOpacity={0.85}
              className="flex-row items-center justify-center gap-2 rounded-2xl py-4 bg-primary"
            >
              <Ionicons name="star" size={17} color="#fff" />
              <Text className="text-white text-[16px] font-bold">Upgrade to Pro</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleRestore}
            disabled={restoring}
            activeOpacity={0.7}
            className="items-center py-3"
          >
            {restoring ? (
              <ActivityIndicator size="small" color={Colors.Primary} />
            ) : (
              <Text className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Restore Purchases</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default SubscriptionsView;
