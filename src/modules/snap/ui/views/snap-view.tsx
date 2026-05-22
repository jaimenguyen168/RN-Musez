import React, { useState } from "react";
import { View, Text, Alert, TouchableOpacity, ActivityIndicator, Dimensions, Image } from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useArtworkStore } from "@/stores/artworkStore";
import { analyzeArtwork } from "@/services/geminiService";
import { Ionicons } from "@expo/vector-icons";
import { Artwork } from "@/types/artwork";
import ImagePicker, { ImageAsset } from "@/components/ImagePicker";
import { useTheme } from "@/provider/ThemeProvider";
import { useRevenueCat } from "@/provider/RevenueCatProvider";
import { Colors } from "@/constants/colors";
import { useCredits } from "@/modules/snap/hooks/useCredits";
import { usePaywall } from "@/hooks/usePaywall";

const { width: SW, height: SH } = Dimensions.get("window");
const IMAGE_HEIGHT = SH * 0.54;
const PRIMARY = Colors.Primary;

const SnapView = () => {
  const [selectedImage, setSelectedImage] = useState<ImageAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setCurrentArtwork } = useArtworkStore();
  const { isDark } = useTheme();
  const { isProUser } = useRevenueCat();
  const { presentPaywall, presentUpgradePrompt } = usePaywall();
  const insets = useSafeAreaInsets();

  const { credits, loading: creditsLoading, consumeCredit, hasCredits, getTimeUntilReset } =
    useCredits(isProUser || false);

  const handleImageSelected = (image: ImageAsset) => setSelectedImage(image);
  const handleImageError = (error: string) => Alert.alert("Error", `Failed to select image: ${error}`);
  const resetImage = () => setSelectedImage(null);

  const showUpgradePrompt = () => {
    const resetTime = getTimeUntilReset();
    const hoursUntilReset = Math.ceil((resetTime.getTime() - Date.now()) / (1000 * 60 * 60));
    presentUpgradePrompt({
      title: "No Credits Remaining",
      message: `You've used all your daily credits. They'll reset in ${hoursUntilReset} hours, or upgrade to Pro for unlimited access.`,
      cancelText: "Cancel",
      upgradeText: "Upgrade to Pro",
    });
  };

  const handleGenerate = async () => {
    if (!selectedImage) return;
    if (!hasCredits()) { showUpgradePrompt(); return; }
    setLoading(true);
    try {
      const creditUsed = await consumeCredit();
      if (!creditUsed) { showUpgradePrompt(); return; }
      const result = await analyzeArtwork(selectedImage.uri);
      const artworkData: Artwork = { ...result, imageUri: selectedImage.uri };
      setCurrentArtwork(artworkData);
      router.push("/artworks/new");
    } catch {
      Alert.alert("Error", "Failed to analyze artwork. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (creditsLoading) {
    return (
      <View className={`flex-1 justify-center items-center ${isDark ? "bg-gray-900" : "bg-[#FAFAFA]"}`}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  // ── Credits pill ─────────────────────────────────────────────────────────────
  const CreditsPill = () => {
    if (isProUser) {
      return (
        <View
          className="flex-row items-center gap-1.5 px-3.5 py-1.5 rounded-full"
          style={{ backgroundColor: isDark ? "rgba(255,153,0,0.15)" : "#FFF7ED" }}
        >
          <Ionicons name="infinite" size={13} color={PRIMARY} />
          <Text className="text-[13px] font-semibold" style={{ color: PRIMARY }}>Pro · Unlimited</Text>
        </View>
      );
    }
    const empty = credits === 0;
    return (
      <View
        className="flex-row items-center gap-1.5 px-3.5 py-1.5 rounded-full"
        style={{
          backgroundColor: empty
            ? isDark ? "rgba(239,68,68,0.15)" : "rgba(239,68,68,0.08)"
            : isDark ? "rgba(255,153,0,0.15)" : "#FFF7ED",
        }}
      >
        <Ionicons name="diamond" size={12} color={empty ? "#EF4444" : PRIMARY} />
        <Text className="text-[13px] font-semibold" style={{ color: empty ? "#EF4444" : PRIMARY }}>
          {credits}/5 credits
        </Text>
      </View>
    );
  };

  // ── Empty state ───────────────────────────────────────────────────────────────
  if (!selectedImage) {
    return (
      <View className={`flex-1 ${isDark ? "bg-gray-900" : "bg-[#FAFAFA]"}`}>
        <StatusBar style={isDark ? "light" : "dark"} />

        <View className="px-6 pb-1" style={{ paddingTop: insets.top + 8 }}>
          <Text className={`text-[28px] font-extrabold -tracking-[0.5px] ${isDark ? "text-gray-50" : "text-gray-900"}`}>Snap</Text>
          <Text className={`text-sm mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>AI-powered art identification</Text>
        </View>

        <View className="flex-1 items-center justify-center px-8 gap-8">
          <ImagePicker onImageSelected={handleImageSelected} onError={handleImageError} quality={0.8}>
            {({ selectImage }) => (
              <TouchableOpacity
                onPress={hasCredits() ? selectImage : showUpgradePrompt}
                activeOpacity={0.8}
                className="w-[230px] h-[230px] items-center justify-center gap-3.5"
              >
                <View style={{ position: "absolute", top: 0, left: 0, width: 26, height: 26, borderTopWidth: 2.5, borderLeftWidth: 2.5, borderRadius: 3, borderColor: PRIMARY }} />
                <View style={{ position: "absolute", top: 0, right: 0, width: 26, height: 26, borderTopWidth: 2.5, borderRightWidth: 2.5, borderRadius: 3, borderColor: PRIMARY }} />
                <View style={{ position: "absolute", bottom: 0, left: 0, width: 26, height: 26, borderBottomWidth: 2.5, borderLeftWidth: 2.5, borderRadius: 3, borderColor: PRIMARY }} />
                <View style={{ position: "absolute", bottom: 0, right: 0, width: 26, height: 26, borderBottomWidth: 2.5, borderRightWidth: 2.5, borderRadius: 3, borderColor: PRIMARY }} />

                <View
                  className="w-[90px] h-[90px] rounded-[26px] items-center justify-center"
                  style={{ backgroundColor: isDark ? "rgba(255,153,0,0.12)" : "#FFF7ED" }}
                >
                  <Ionicons name="scan-outline" size={48} color={PRIMARY} />
                </View>
                <Text className={`text-[13px] font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Tap to choose artwork</Text>
              </TouchableOpacity>
            )}
          </ImagePicker>

          <View className="items-center gap-2">
            <Text className={`text-[22px] font-bold -tracking-[0.3px] ${isDark ? "text-gray-50" : "text-gray-900"}`}>Discover Any Artwork</Text>
            <Text className={`text-sm text-center leading-[22px] ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Photograph any painting, sculpture,{"\n"}or artwork for instant AI insights
            </Text>
          </View>

          <CreditsPill />
        </View>

        {credits === 0 && !isProUser && (
          <View
            className={`px-6 pt-4 border-t ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
            style={{ paddingBottom: insets.bottom + 12 }}
          >
            <TouchableOpacity
              onPress={() => presentPaywall({ showSuccessAlert: true })}
              className="flex-row items-center justify-center gap-2 rounded-[14px] py-3.5 bg-primary"
              activeOpacity={0.85}
            >
              <Ionicons name="star" size={15} color="#fff" />
              <Text className="text-white font-semibold text-sm">Upgrade to Pro for unlimited scans</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // ── Image selected ────────────────────────────────────────────────────────────
  return (
    <View className={`flex-1 ${isDark ? "bg-gray-900" : "bg-[#FAFAFA]"}`}>
      <StatusBar style="light" />

      <View style={{ width: SW, height: IMAGE_HEIGHT }}>
        <Image
          source={{ uri: selectedImage.uri }}
          className="w-full h-full"
          resizeMode="cover"
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.5)", "transparent"]}
          style={{ position: "absolute", top: 0, left: 0, right: 0, height: 140 }}
        />
        <LinearGradient
          colors={["transparent", isDark ? "#111827" : "#FAFAFA"]}
          start={{ x: 0, y: 0.3 }}
          end={{ x: 0, y: 1 }}
          style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: IMAGE_HEIGHT * 0.55 }}
        />
        <TouchableOpacity
          onPress={resetImage}
          className="absolute left-4 rounded-full p-2"
          style={{ top: insets.top + 10, backgroundColor: "rgba(0,0,0,0.35)" }}
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View className="flex-1 px-6 pt-4 gap-3 justify-center" style={{ paddingBottom: insets.bottom + 8 }}>
        <Text className={`text-[22px] font-bold -tracking-[0.3px] ${isDark ? "text-gray-50" : "text-gray-900"}`}>Ready to analyze</Text>
        <Text className={`text-sm leading-5 -mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          AI will identify the artwork and provide detailed insights
        </Text>

        <CreditsPill />

        <TouchableOpacity
          onPress={handleGenerate}
          disabled={loading || !hasCredits()}
          activeOpacity={0.85}
          className={`rounded-2xl overflow-hidden mt-0.5 ${loading || !hasCredits() ? "opacity-65" : "opacity-100"}`}
        >
          <LinearGradient
            colors={[Colors.Secondary, PRIMARY, "#E08800"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16 }}
          >
            {loading ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text className="text-white text-[17px] font-bold">Analyzing...</Text>
              </>
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color="#fff" />
                <Text className="text-white text-[17px] font-bold">
                  {hasCredits() ? "Analyze Artwork" : "No Credits"}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View className="flex-row gap-2.5">
          <ImagePicker onImageSelected={handleImageSelected} onError={handleImageError} quality={0.8}>
            {({ selectImage }) => (
              <TouchableOpacity
                onPress={selectImage}
                disabled={loading}
                className={`flex-1 flex-row items-center justify-center gap-2 border rounded-[14px] py-3 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
              >
                <Ionicons name="images-outline" size={18} color={isDark ? "#9CA3AF" : "#6B7280"} />
                <Text className={`text-sm font-semibold ${isDark ? "text-gray-400" : "text-gray-500"}`}>New Photo</Text>
              </TouchableOpacity>
            )}
          </ImagePicker>

          <TouchableOpacity
            onPress={resetImage}
            disabled={loading}
            className={`w-[54px] items-center justify-center border rounded-[14px] py-3 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
          >
            <Ionicons name="trash-outline" size={18} color={isDark ? "#9CA3AF" : "#EF4444"} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default SnapView;
