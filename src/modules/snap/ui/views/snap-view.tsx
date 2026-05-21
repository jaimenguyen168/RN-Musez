import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
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
import RevenueCatUI from "react-native-purchases-ui";
import { useCredits } from "@/modules/snap/hooks/useCredits";
import { usePaywall } from "@/hooks/usePaywall";

const { width: SW, height: SH } = Dimensions.get("window");
const IMAGE_HEIGHT = SH * 0.54;
const PRIMARY = Colors.Primary; // #FF9900

const SnapView = () => {
  const [selectedImage, setSelectedImage] = useState<ImageAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setCurrentArtwork } = useArtworkStore();
  const { isDark } = useTheme();
  const { isProUser } = useRevenueCat();
  const { presentUpgradePrompt } = usePaywall();
  const insets = useSafeAreaInsets();

  const { credits, loading: creditsLoading, consumeCredit, hasCredits, getTimeUntilReset } =
    useCredits(isProUser || false);

  const bg = isDark ? "#111827" : "#FAFAFA";
  const cardBg = isDark ? "#1F2937" : "#FFFFFF";
  const textMain = isDark ? "#F9FAFB" : "#111827";
  const textSub = isDark ? "#9CA3AF" : "#6B7280";
  const borderColor = isDark ? "#374151" : "#E5E7EB";

  const handleImageSelected = (image: ImageAsset) => setSelectedImage(image);
  const handleImageError = (error: string) =>
    Alert.alert("Error", `Failed to select image: ${error}`);
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
      router.push(`/artworks/new`);
    } catch {
      Alert.alert("Error", "Failed to analyze artwork. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (creditsLoading) {
    return (
      <View style={[styles.center, { backgroundColor: bg }]}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  // ── Credits pill ──────────────────────────────────────────────────────────
  const CreditsPill = () => {
    if (isProUser) {
      return (
        <View style={[styles.pill, { backgroundColor: isDark ? "rgba(255,153,0,0.15)" : "#FFF7ED" }]}>
          <Ionicons name="infinite" size={13} color={PRIMARY} />
          <Text style={[styles.pillText, { color: PRIMARY }]}>Pro · Unlimited</Text>
        </View>
      );
    }
    const empty = credits === 0;
    return (
      <View style={[styles.pill, {
        backgroundColor: empty
          ? isDark ? "rgba(239,68,68,0.15)" : "rgba(239,68,68,0.08)"
          : isDark ? "rgba(255,153,0,0.15)" : "#FFF7ED",
      }]}>
        <Ionicons name="diamond" size={12} color={empty ? "#EF4444" : PRIMARY} />
        <Text style={[styles.pillText, { color: empty ? "#EF4444" : PRIMARY }]}>
          {credits}/5 credits
        </Text>
      </View>
    );
  };

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!selectedImage) {
    return (
      <View style={[styles.screen, { backgroundColor: bg }]}>
        <StatusBar style={isDark ? "light" : "dark"} />

        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <Text style={[styles.topTitle, { color: textMain }]}>Snap</Text>
          <Text style={[styles.topSubtitle, { color: textSub }]}>AI-powered art identification</Text>
        </View>

        <View style={styles.emptyBody}>
          <ImagePicker onImageSelected={handleImageSelected} onError={handleImageError} quality={0.8}>
            {({ selectImage }) => (
              <TouchableOpacity
                onPress={hasCredits() ? selectImage : showUpgradePrompt}
                activeOpacity={0.8}
                style={styles.viewfinder}
              >
                {/* Corner brackets */}
                <View style={[styles.corner, { top: 0, left: 0, borderTopWidth: 2.5, borderLeftWidth: 2.5, borderColor: PRIMARY }]} />
                <View style={[styles.corner, { top: 0, right: 0, borderTopWidth: 2.5, borderRightWidth: 2.5, borderColor: PRIMARY }]} />
                <View style={[styles.corner, { bottom: 0, left: 0, borderBottomWidth: 2.5, borderLeftWidth: 2.5, borderColor: PRIMARY }]} />
                <View style={[styles.corner, { bottom: 0, right: 0, borderBottomWidth: 2.5, borderRightWidth: 2.5, borderColor: PRIMARY }]} />

                <View style={[styles.scanIconBg, { backgroundColor: isDark ? "rgba(255,153,0,0.12)" : "#FFF7ED" }]}>
                  <Ionicons name="scan-outline" size={48} color={PRIMARY} />
                </View>
                <Text style={[styles.viewfinderHint, { color: textSub }]}>Tap to choose artwork</Text>
              </TouchableOpacity>
            )}
          </ImagePicker>

          <View style={styles.emptyText}>
            <Text style={[styles.emptyTitle, { color: textMain }]}>Discover Any Artwork</Text>
            <Text style={[styles.emptySubtitle, { color: textSub }]}>
              Photograph any painting, sculpture,{"\n"}or artwork for instant AI insights
            </Text>
          </View>

          <CreditsPill />
        </View>

        {credits === 0 && !isProUser && (
          <View style={[styles.upgradeBar, { backgroundColor: cardBg, borderTopColor: borderColor, paddingBottom: insets.bottom + 12 }]}>
            <TouchableOpacity
              onPress={async () => { await RevenueCatUI.presentPaywall({ displayCloseButton: true }); }}
              style={[styles.upgradeBtn, { backgroundColor: PRIMARY }]}
              activeOpacity={0.85}
            >
              <Ionicons name="star" size={15} color="#fff" />
              <Text style={styles.upgradeBtnText}>Upgrade to Pro for unlimited scans</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // ── Image selected state ──────────────────────────────────────────────────
  return (
    <View style={[styles.screen, { backgroundColor: bg }]}>
      <StatusBar style="light" />

      <View style={{ width: SW, height: IMAGE_HEIGHT }}>
        <Image
          source={{ uri: selectedImage.uri }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.5)", "transparent"]}
          style={{ position: "absolute", top: 0, left: 0, right: 0, height: 140 }}
        />
        <LinearGradient
          colors={["transparent", bg]}
          start={{ x: 0, y: 0.3 }}
          end={{ x: 0, y: 1 }}
          style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: IMAGE_HEIGHT * 0.55 }}
        />
        <TouchableOpacity
          onPress={resetImage}
          style={[styles.backBtn, { top: insets.top + 10 }]}
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={[styles.actionSheet, { paddingBottom: insets.bottom + 8 }]}>
        <Text style={[styles.actionTitle, { color: textMain }]}>Ready to analyze</Text>
        <Text style={[styles.actionSubtitle, { color: textSub }]}>
          AI will identify the artwork and provide detailed insights
        </Text>

        <CreditsPill />

        <TouchableOpacity
          onPress={handleGenerate}
          disabled={loading || !hasCredits()}
          activeOpacity={0.85}
          style={[styles.generateBtn, { opacity: loading || !hasCredits() ? 0.65 : 1 }]}
        >
          <LinearGradient
            colors={[Colors.Secondary, PRIMARY, "#E08800"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.generateGradient}
          >
            {loading ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.generateText}>Analyzing...</Text>
              </>
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color="#fff" />
                <Text style={styles.generateText}>
                  {hasCredits() ? "Analyze Artwork" : "No Credits"}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.secondaryRow}>
          <ImagePicker onImageSelected={handleImageSelected} onError={handleImageError} quality={0.8}>
            {({ selectImage }) => (
              <TouchableOpacity
                onPress={selectImage}
                disabled={loading}
                style={[styles.secondaryBtn, { flex: 1, backgroundColor: cardBg, borderColor }]}
              >
                <Ionicons name="images-outline" size={18} color={textSub} />
                <Text style={[styles.secondaryBtnText, { color: textSub }]}>New Photo</Text>
              </TouchableOpacity>
            )}
          </ImagePicker>

          <TouchableOpacity
            onPress={resetImage}
            disabled={loading}
            style={[styles.secondaryBtn, { width: 54, backgroundColor: cardBg, borderColor }]}
          >
            <Ionicons name="trash-outline" size={18} color={isDark ? "#9CA3AF" : "#EF4444"} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  topBar: { paddingHorizontal: 24, paddingBottom: 4 },
  topTitle: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  topSubtitle: { fontSize: 14, marginTop: 2 },

  emptyBody: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 32,
  },

  viewfinder: {
    width: 230,
    height: 230,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  corner: {
    position: "absolute",
    width: 26,
    height: 26,
    borderRadius: 3,
  },
  scanIconBg: {
    width: 90,
    height: 90,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  viewfinderHint: { fontSize: 13, fontWeight: "500" },

  emptyText: { alignItems: "center", gap: 8 },
  emptyTitle: { fontSize: 22, fontWeight: "700", letterSpacing: -0.3 },
  emptySubtitle: { fontSize: 14, textAlign: "center", lineHeight: 22 },

  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  pillText: { fontSize: 13, fontWeight: "600" },

  upgradeBar: { paddingHorizontal: 24, paddingTop: 16, borderTopWidth: 1 },
  upgradeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
  },
  upgradeBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },

  backBtn: {
    position: "absolute",
    left: 16,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 22,
    padding: 8,
  },

  actionSheet: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 12,
    justifyContent: "center",
  },
  actionTitle: { fontSize: 22, fontWeight: "700", letterSpacing: -0.3 },
  actionSubtitle: { fontSize: 14, lineHeight: 20, marginTop: -4 },

  generateBtn: { borderRadius: 16, overflow: "hidden", marginTop: 2 },
  generateGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
  },
  generateText: { color: "#fff", fontSize: 17, fontWeight: "700" },

  secondaryRow: { flexDirection: "row", gap: 10 },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 13,
  },
  secondaryBtnText: { fontSize: 14, fontWeight: "600" },
});

export default SnapView;
