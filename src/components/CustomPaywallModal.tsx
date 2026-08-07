import React, { useEffect, useState } from "react";
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
import Purchases, { PurchasesOffering } from "react-native-purchases";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useOrganicTheme } from "@/constants/organicTheme";
import scream from "../../assets/images/scream.png";

const { height: SH } = Dimensions.get("window");
const HERO_HEIGHT = SH * 0.28;
const PRO_OFFERING_ID = "musez";

const FEATURES: { label: string; free: boolean }[] = [
  { label: "Nearby museums discovery", free: true },
  { label: "Personal art collection", free: true },
  { label: "AI artwork analysis", free: true },
  { label: "Unlimited AI features", free: false },
  { label: "Search museums anywhere", free: false },
];

type Plan = "year" | "month";

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
  const c = useOrganicTheme();
  const setProStatus = useMutation(api.function.credits.setProStatus);
  const [plan, setPlan] = useState<Plan>("year");
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    Purchases.getOfferings()
      .then((offerings) => {
        if (!cancelled) setOffering(offerings.all[PRO_OFFERING_ID] ?? null);
      })
      .catch((error) => console.error("Failed to load offerings:", error));
    return () => {
      cancelled = true;
    };
  }, [visible]);

  const yearPkg = offering?.annual ?? null;
  const monthPkg = offering?.monthly ?? null;
  const yearPrice = yearPkg?.product.priceString ?? "$39.99";
  const monthPrice = monthPkg?.product.priceString ?? "$4.99";
  const yearPerMonth = yearPkg?.product.pricePerMonthString ?? "$3.33/mo";

  const ctaLabel = purchasing
    ? "Opening App Store…"
    : plan === "year"
      ? "Start 7 days free"
      : "Continue with monthly";

  const fineText =
    plan === "year"
      ? `Then ${yearPrice}/year. Cancel any time before the trial ends.`
      : `${monthPrice}/month, billed monthly. Cancel any time.`;

  const handlePurchase = async () => {
    const pkg = plan === "year" ? yearPkg : monthPkg;
    if (!pkg) {
      Alert.alert("Error", "Plans are still loading. Please try again in a moment.");
      return;
    }
    setPurchasing(true);
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      if (customerInfo.entitlements.active["Musez Pro"]) {
        await setProStatus({ isPro: true });
        onPurchased?.();
        onClose();
      }
    } catch (error: any) {
      if (!error.userCancelled) {
        Alert.alert("Error", "Something went wrong. Please try again.");
      }
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-organic">
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={{ paddingBottom: 240 }}
        >
          {/* ── Hero ─────────────────────────────────────────────────────── */}
          <View style={{ height: HERO_HEIGHT }}>
            <Image source={scream} className="w-full h-full" resizeMode="cover" style={{ opacity: 0.92 }} />
            <LinearGradient
              colors={["transparent", c.bg]}
              start={{ x: 0, y: 0.4 }}
              end={{ x: 0, y: 1 }}
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: HERO_HEIGHT * 0.6,
              }}
            />
            <TouchableOpacity
              onPress={onClose}
              className="absolute rounded-full items-center justify-center bg-organic-photo-btn"
              style={{ top: insets.top + 12, right: 14, width: 36, height: 36 }}
            >
              <Ionicons name="close" size={18} color={c.text} />
            </TouchableOpacity>
          </View>

          {/* ── Title ────────────────────────────────────────────────────── */}
          <View className="px-5 gap-1.5" style={{ marginTop: -14 }}>
            <Text
              className="text-[11px] font-figtree-bold uppercase"
              style={{ color: c.accentStrong, letterSpacing: 1.4 }}
            >
              Musez Pro
            </Text>
            <Text className="font-heading text-[28px] leading-[32px]" style={{ color: c.text }}>
              Every artwork, no daily ceiling
            </Text>
          </View>

          {/* ── Feature comparison ──────────────────────────────────────── */}
          <View className="mx-5 mt-5 relative">
            <View
              className="absolute top-0 bottom-0 right-0 rounded-2xl"
              style={{ width: 74, backgroundColor: c.accentSoft, borderWidth: 1.5, borderColor: c.accent }}
            />
            <View>
              <View className="flex-row items-center pt-2.5 pb-3">
                <View className="flex-1" />
                <View style={{ width: 64 }} className="items-center">
                  <Text
                    className="text-[11px] font-figtree-bold uppercase"
                    style={{ color: c.textMuted, letterSpacing: 1 }}
                  >
                    Free
                  </Text>
                </View>
                <View style={{ width: 74 }} className="items-center justify-center">
                  <View className="rounded-full px-3.5 py-1" style={{ backgroundColor: c.accentStrong }}>
                    <Text
                      className="text-[11px] font-figtree-bold uppercase"
                      style={{ color: c.bg, letterSpacing: 1 }}
                    >
                      Pro
                    </Text>
                  </View>
                </View>
              </View>
              {FEATURES.map((f, i) => (
                <View
                  key={i}
                  className="flex-row items-center py-3.5"
                  style={{ borderTopWidth: 1, borderTopColor: c.divider }}
                >
                  <Text className="flex-1 text-[13.5px] leading-[17px] pr-2" style={{ color: c.text }}>
                    {f.label}
                  </Text>
                  <View style={{ width: 64 }} className="items-center">
                    <Text className="text-[15px] font-bold" style={{ color: c.textMuted }}>
                      {f.free ? "✓" : "—"}
                    </Text>
                  </View>
                  <View style={{ width: 74 }} className="items-center">
                    <Text className="text-[15px] font-figtree-bold" style={{ color: c.accentStrong }}>
                      ✓
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* ── Plan picker ──────────────────────────────────────────────── */}
          <View className="flex-row gap-2.5 px-5 mt-5">
            <TouchableOpacity
              onPress={() => setPlan("year")}
              activeOpacity={0.85}
              className="flex-1 rounded-2xl p-3 gap-1"
              style={{
                borderWidth: 1.5,
                borderColor: plan === "year" ? c.accentStrong : c.divider,
                backgroundColor: plan === "year" ? c.accentSoft : c.surface,
              }}
            >
              <View className="flex-row items-center justify-between">
                <Text
                  className="text-[11px] font-figtree-bold uppercase"
                  style={{ color: c.textMuted, letterSpacing: 0.8 }}
                >
                  Yearly
                </Text>
                <View
                  className="items-center justify-center rounded-full"
                  style={{
                    width: 19,
                    height: 19,
                    borderWidth: 2,
                    borderColor: plan === "year" ? c.accentStrong : c.textFaint,
                    backgroundColor: plan === "year" ? c.accentStrong : "transparent",
                  }}
                >
                  {plan === "year" && (
                    <Text className="text-[10px] font-extrabold" style={{ color: c.bg }}>
                      ✓
                    </Text>
                  )}
                </View>
              </View>
              <Text className="font-heading text-[19px] leading-[22px]" style={{ color: c.text }}>
                {yearPrice}
              </Text>
              <Text className="text-[11.5px]" style={{ color: c.textMuted }}>
                7 days free · {yearPerMonth}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setPlan("month")}
              activeOpacity={0.85}
              className="flex-1 rounded-2xl p-3 gap-1"
              style={{
                borderWidth: 1.5,
                borderColor: plan === "month" ? c.accentStrong : c.divider,
                backgroundColor: plan === "month" ? c.accentSoft : c.surface,
              }}
            >
              <View className="flex-row items-center justify-between">
                <Text
                  className="text-[11px] font-figtree-bold uppercase"
                  style={{ color: c.textMuted, letterSpacing: 0.8 }}
                >
                  Monthly
                </Text>
                <View
                  className="items-center justify-center rounded-full"
                  style={{
                    width: 19,
                    height: 19,
                    borderWidth: 2,
                    borderColor: plan === "month" ? c.accentStrong : c.textFaint,
                    backgroundColor: plan === "month" ? c.accentStrong : "transparent",
                  }}
                >
                  {plan === "month" && (
                    <Text className="text-[10px] font-extrabold" style={{ color: c.bg }}>
                      ✓
                    </Text>
                  )}
                </View>
              </View>
              <Text className="font-heading text-[19px] leading-[22px]" style={{ color: c.text }}>
                {monthPrice}
              </Text>
              <Text className="text-[11.5px]" style={{ color: c.textMuted }}>
                billed monthly
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* ── Sticky footer ────────────────────────────────────────────────── */}
        <View
          className="absolute bottom-0 left-0 right-0 px-5 pt-3.5 gap-2.5"
          style={{
            paddingBottom: insets.bottom + 16,
            backgroundColor: c.bg,
            borderTopWidth: 1,
            borderTopColor: c.divider,
          }}
        >
          <TouchableOpacity
            onPress={handlePurchase}
            disabled={purchasing}
            activeOpacity={0.85}
            className="rounded-full py-4 flex-row items-center justify-center gap-2.5"
            style={{ backgroundColor: c.accentStrong, opacity: purchasing ? 0.7 : 1 }}
          >
            {purchasing && <ActivityIndicator color={c.bg} size="small" />}
            <Text className="font-heading text-[16px]" style={{ color: c.bg }}>
              {ctaLabel}
            </Text>
          </TouchableOpacity>

          <Text className="text-center text-[11.5px]" style={{ color: c.textMuted }}>
            {fineText}
          </Text>

          <TouchableOpacity onPress={handleRestore} disabled={restoring} className="items-center py-1">
            <Text className="text-[13px] font-figtree-bold" style={{ color: c.textMuted }}>
              {restoring ? "Restoring..." : "Restore purchases"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
