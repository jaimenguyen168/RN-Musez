import React, { useState } from "react";
import { Image, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useRouter } from "expo-router";
import { useTheme } from "@/provider/ThemeProvider";
import { useOrganicTheme } from "@/constants/organicTheme";
import { usePaywall } from "@/hooks/usePaywall";
import { useCredits } from "@/modules/snap/hooks/useCredits";

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter((w) => /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("") || name.slice(0, 2).toUpperCase();

const PRO_PERKS = [
  "Unlimited AI analysis credits",
  "Search museums worldwide",
  "Priority support",
  "Early access to new features",
];
const PRO_ACTIVE = ["Unlimited AI analysis credits", "Worldwide museum search", "Priority support"];

const ProfileView = () => {
  const router = useRouter();
  const { signOut } = useAuth();
  const { setTheme, isDark } = useTheme();
  const c = useOrganicTheme();
  const insets = useSafeAreaInsets();
  const { isProUser, credits, getTimeUntilReset } = useCredits();
  const { presentPaywall } = usePaywall();

  const [signOutOpen, setSignOutOpen] = useState(false);

  const user = useQuery(api.function.users.getCurrentUser);
  const savedMuseumIds = useQuery(api.function.museums.getSavedMuseumIds);
  const savedArtworks = useQuery(api.function.artworks.getAllArtworks);
  const reviewCount = useQuery(api.function.reviews.getMyReviewCount);

  if (!user) {
    return (
      <View className="flex-1 bg-organic">
        <StatusBar style={isDark ? "light" : "dark"} />
      </View>
    );
  }

  const memberSince = new Date(user._creationTime).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
  const resetHour = getTimeUntilReset().toLocaleTimeString([], { hour: "numeric" });

  const stats = [
    { n: savedMuseumIds?.length ?? 0, l: "Museums" },
    { n: savedArtworks?.length ?? 0, l: "Artworks" },
    { n: reviewCount ?? 0, l: "Reviews" },
  ];

  const handleUpgrade = () => presentPaywall({ showSuccessAlert: true });
  const handleManagePlan = () => router.push("/users/subscriptions");
  const handleSignOut = () => {
    setSignOutOpen(false);
    signOut();
  };

  return (
    <View className="flex-1 bg-organic">
      <StatusBar style={isDark ? "light" : "dark"} />

      <View className="px-5" style={{ paddingTop: insets.top + 8, paddingBottom: 8 }}>
        <Text className="font-heading text-organic text-[28px] leading-none">Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="gap-[18px]">
          {/* ── Identity plaque ─────────────────────────────────────────── */}
          <View className="mx-5 bg-organic-surface rounded-2xl p-4 gap-3.5">
            <View className="flex-row gap-3.5 items-center">
              <View
                className="w-16 h-16 rounded-full overflow-hidden items-center justify-center"
                style={{ backgroundColor: "#8c491a" }}
              >
                {user.imageUrl ? (
                  <Image source={{ uri: user.imageUrl }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <Text className="font-heading text-2xl" style={{ color: "#ffe1d0" }}>
                    {initialsOf(user.username)}
                  </Text>
                )}
              </View>
              <View className="flex-1 gap-0.5">
                <Text className="font-heading text-organic text-xl leading-6" numberOfLines={1}>
                  {user.username}
                </Text>
                <Text className="font-figtree text-organic-muted text-[12.5px]" numberOfLines={1}>
                  {user.email}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/users/edit")}
                className="border border-organic-divider bg-organic-surface-alt rounded-full px-3.5 py-2"
              >
                <Text className="font-heading text-organic text-[12.5px]">Edit</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-2">
              {stats.map((s) => (
                <View key={s.l} className="flex-1 bg-organic-surface-alt rounded-xl py-2.5 items-center gap-0.5">
                  <Text className="font-heading text-organic text-[19px] leading-5">{s.n}</Text>
                  <Text className="font-figtree text-organic-muted text-[11px]">{s.l}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── Plan card ────────────────────────────────────────────────── */}
          {isProUser ? (
            <View className="mx-5 bg-organic-accent2-soft rounded-2xl p-[17px] gap-2.5">
              <View className="flex-row justify-between items-center gap-2.5">
                <Text className="font-figtree-bold text-organic-accent2 text-[11px] tracking-[1.1px] uppercase">
                  Member since {memberSince}
                </Text>
                <View className="bg-organic-accent2 rounded-full px-2.5 py-1">
                  <Text className="font-figtree-bold text-[11px]" style={{ color: isDark ? "#2c3320" : "#f0fae1" }}>
                    Pro · Unlimited
                  </Text>
                </View>
              </View>
              <Text className="font-heading text-organic text-[22px] leading-6">Everything&apos;s unlocked</Text>
              <View className="gap-1.5">
                {PRO_ACTIVE.map((p) => (
                  <View key={p} className="flex-row gap-2 items-start">
                    <Text className="text-organic-accent2 font-figtree-bold text-[13px]">◆</Text>
                    <Text className="font-figtree text-organic text-[13px] leading-[18px] flex-1">{p}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                onPress={handleManagePlan}
                className="mt-1 py-3.5 rounded-full items-center border"
                style={{ borderColor: isDark ? "rgba(204,219,178,0.4)" : c.accent2 }}
              >
                <Text className="font-heading text-organic text-[14px]">Manage plan</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="mx-5 rounded-2xl p-[17px] gap-2.5" style={{ backgroundColor: "#8c491a" }}>
              <View className="flex-row justify-between items-center gap-2.5">
                <Text className="font-figtree-bold text-[11px] tracking-[1.1px] uppercase" style={{ color: "#ffe1d0" }}>
                  Member since {memberSince}
                </Text>
                <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: "#643312" }}>
                  <Text className="font-figtree-bold text-[11px]" style={{ color: "#fff2eb" }}>
                    Limited
                  </Text>
                </View>
              </View>
              <Text className="font-heading text-[22px] leading-6" style={{ color: "#fff2eb" }}>
                Go Pro, lose the limits
              </Text>
              <Text className="font-figtree text-[12.5px]" style={{ color: "#ffe1d0" }}>
                {credits} of 3 daily credits left · resets at {resetHour}
              </Text>
              <View className="gap-1.5 mt-0.5">
                {PRO_PERKS.map((p) => (
                  <View key={p} className="flex-row gap-2 items-start">
                    <Text className="font-figtree-bold text-[13px]" style={{ color: "#ffc6a5" }}>
                      ◆
                    </Text>
                    <Text className="font-figtree text-[13px] leading-[18px] flex-1" style={{ color: "#fff2eb" }}>
                      {p}
                    </Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                onPress={handleUpgrade}
                className="mt-1 py-3.5 rounded-full items-center"
                style={{ backgroundColor: isDark ? "#f6a06b" : c.bg }}
              >
                <Text className="font-heading text-[15px]" style={{ color: isDark ? "#402310" : "#643312" }}>
                  Upgrade to Pro
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Settings: General ────────────────────────────────────────── */}
          <View className="gap-2">
            <Text className="font-figtree-bold text-organic-muted text-[11px] tracking-[1.1px] uppercase px-5">
              General
            </Text>
            <View className="mx-5 bg-organic-surface rounded-2xl overflow-hidden">
              <TouchableOpacity
                onPress={() => router.push("/users/languages")}
                className="px-4 py-3.5 flex-row items-center gap-3 border-b border-organic-divider"
              >
                <Text className="flex-1 font-figtree text-organic text-sm">Language</Text>
                <Text className="font-figtree text-organic-muted text-[13px]">English</Text>
                <Ionicons name="chevron-forward" size={16} color={c.textFaint} />
              </TouchableOpacity>
              <View className="px-4 py-3.5 flex-row items-center gap-3">
                <Text className="flex-1 font-figtree text-organic text-sm">Dark appearance</Text>
                <Switch
                  value={isDark}
                  onValueChange={() => setTheme(isDark ? "light" : "dark")}
                  trackColor={{ false: c.divider, true: c.accent }}
                  thumbColor={c.bg}
                  ios_backgroundColor={c.divider}
                />
              </View>
            </View>
          </View>

          {/* ── Settings: Preferences ────────────────────────────────────── */}
          <View className="gap-2">
            <Text className="font-figtree-bold text-organic-muted text-[11px] tracking-[1.1px] uppercase px-5">
              Preferences
            </Text>
            <View className="mx-5 bg-organic-surface rounded-2xl overflow-hidden">
              <TouchableOpacity
                onPress={() => router.push("/users/legal-policies")}
                className="px-4 py-3.5 flex-row items-center gap-3 border-b border-organic-divider"
              >
                <Text className="flex-1 font-figtree text-organic text-sm">Legal & policies</Text>
                <Ionicons name="chevron-forward" size={16} color={c.textFaint} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push("/users/help-support")}
                className="px-4 py-3.5 flex-row items-center gap-3 border-b border-organic-divider"
              >
                <Text className="flex-1 font-figtree text-organic text-sm">Help & support</Text>
                <Text className="font-figtree text-organic-muted text-[12.5px]">FAQ</Text>
                <Ionicons name="chevron-forward" size={16} color={c.textFaint} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSignOutOpen(true)} className="px-4 py-3.5">
                <Text className="font-figtree-bold text-organic-accent-strong text-sm">Sign out</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text className="font-figtree text-organic-faint text-[11.5px] text-center">
            Musez {Constants.expoConfig?.version ?? "1.0.0"}
          </Text>
        </View>
      </ScrollView>

      {signOutOpen && (
        <View className="absolute inset-0 items-center justify-center px-[26px]">
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setSignOutOpen(false)}
            className="absolute inset-0 bg-organic-overlay"
          />
          <View className="bg-organic rounded-2xl p-5 gap-2.5 w-full" style={{ shadowColor: c.shadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 }}>
            <Text className="font-heading text-organic text-[21px] leading-6">Sign out of Musez?</Text>
            <Text className="font-figtree text-organic-muted text-[13.5px] leading-5">
              Your saved museums and artworks stay on your account — you&apos;ll just need to sign back in.
            </Text>
            <View className="flex-row gap-2 mt-1">
              <TouchableOpacity
                onPress={() => setSignOutOpen(false)}
                className="flex-1 py-3.5 rounded-full items-center border border-organic-divider"
              >
                <Text className="font-heading text-organic text-sm">Stay</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSignOut}
                className="flex-1 py-3.5 rounded-full items-center bg-organic-accent"
              >
                <Text className="font-heading text-organic-accent-soft text-sm">Sign out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default ProfileView;
