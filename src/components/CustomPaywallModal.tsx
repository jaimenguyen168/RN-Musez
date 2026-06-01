import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Dimensions,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Purchases from "react-native-purchases";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Colors } from "@/constants/colors";
import { useTheme } from "@/provider/ThemeProvider";
import scream from "../../assets/images/scream.png";

const { height: SH } = Dimensions.get("window");
const HERO_HEIGHT = SH * 0.36;
const PRIMARY = Colors.Primary;

const FEATURES: { label: string; free: boolean }[] = [
  { label: "Nearby Museums Discovery", free: true },
  { label: "Personal Art Collection", free: true },
  { label: "AI Artwork Analysis", free: true },
  { label: "Unlimited AI Features", free: false },
  { label: "Location Search Support", free: false },
];

interface CustomPaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onPurchased?: () => void;
}

export const CustomPaywallModal = ({
  visible,
  onClose,
  onPurchased,
}: CustomPaywallModalProps) => {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const setProStatus = useMutation(api.function.credits.setProStatus);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      await setProStatus({ isPro: true });
      onPurchased?.();
      onClose();
    } catch {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const info = await Purchases.restorePurchases();
      if (info.entitlements.active["Musez Pro"]) {
        await setProStatus({ isPro: true });
        Alert.alert("Restored!", "Your Pro subscription has been restored.", [
          { text: "OK", onPress: () => { onPurchased?.(); onClose(); } },
        ]);
      } else {
        Alert.alert("No Purchases Found", "We couldn't find any previous purchases to restore.");
      }
    } catch {
      Alert.alert("Restore Failed", "Something went wrong. Please try again.");
    } finally {
      setRestoring(false);
    }
  };


  // PRO column amber bg — no semantic token, keep as isDark ternary
  const proColBg = isDark ? "bg-[#2D1F00]" : "bg-[#FFF4E0]";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-app">
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={{ paddingBottom: 220 }}
        >
          {/* ── Hero ─────────────────────────────────────────────────────── */}
          <View style={{ height: HERO_HEIGHT }}>
            <Image
              source={scream}
              className="w-full h-full rounded-b-[32px]"
              resizeMode="cover"
            />
            <LinearGradient
              colors={["transparent", isDark ? "#111827" : "#ffffff"]}
              start={{ x: 0, y: 0.55 }}
              end={{ x: 0, y: 1 }}
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: HERO_HEIGHT * 0.45,
                borderBottomLeftRadius: 32,
                borderBottomRightRadius: 32,
              }}
            />
            <TouchableOpacity
              onPress={onClose}
              className="absolute right-4 rounded-full p-2"
              style={{ top: insets.top + 12, backgroundColor: "rgba(0,0,0,0.35)" }}
            >
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* ── Title ────────────────────────────────────────────────────── */}
          <Text className="text-[24px] font-extrabold text-main text-center px-7 mt-7 mb-7 leading-[33px] -tracking-[0.3px]">
            Become a Pro to access{"\n"}Unlimited Features
          </Text>

          {/* ── Feature table ────────────────────────────────────────────── */}
          <View className="mx-5">
            {/* Header row */}
            <View className="flex-row items-center">
              <View className="flex-1" />
              <View className="w-16 items-center">
                <Text className="text-[11px] font-bold text-secondary tracking-wider">
                  FREE
                </Text>
              </View>
              <View className={`w-20 items-center justify-center py-4 ${proColBg} rounded-t-2xl`}>
                <View className="bg-primary rounded-lg px-3.5 py-1.5">
                  <Text className="text-white font-extrabold text-[13px] tracking-wide">
                    PRO
                  </Text>
                </View>
              </View>
            </View>

            {/* Feature rows */}
            {FEATURES.map((f, i) => {
              const isLast = i === FEATURES.length - 1;
              return (
                <View key={i} className="flex-row items-center border-t border-soft">
                  <View className="flex-1 py-3.5 pr-2">
                    <Text className="text-sm text-main leading-5">{f.label}</Text>
                  </View>
                  <View className="w-16 items-center">
                    {f.free ? (
                      <Ionicons name="checkmark" size={18} color="#9CA3AF" />
                    ) : (
                      <Text className="text-base text-secondary font-semibold">—</Text>
                    )}
                  </View>
                  <View className={`w-20 items-center justify-center py-3.5 ${proColBg} ${isLast ? "rounded-b-2xl" : ""}`}>
                    <Ionicons name="checkmark" size={18} color={PRIMARY} />
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* ── Sticky footer ────────────────────────────────────────────────── */}
        <View
          className="absolute bottom-0 left-0 right-0 bg-app px-6 pt-4 border-t border-soft gap-3"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <TouchableOpacity
            onPress={handlePurchase}
            disabled={purchasing}
            activeOpacity={0.85}
            className="bg-primary rounded-2xl py-4 items-center justify-center"
            style={{ opacity: purchasing ? 0.6 : 1 }}
          >
            {purchasing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text className="text-white text-[17px] font-bold">Continue</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleRestore}
            disabled={restoring}
            className="items-center py-1"
          >
            <Text className="text-sm text-secondary">
              {restoring ? "Restoring..." : "Restore purchases"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
