import React, { useEffect, useRef, useState } from "react";
import { View, Text, Alert, TouchableOpacity, ActivityIndicator, Animated, Easing, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useArtworkStore } from "@/stores/artworkStore";
import { analyzeArtwork } from "@/services/geminiService";
import { Ionicons } from "@expo/vector-icons";
import { Artwork } from "@/types/artwork";
import ImagePicker, { ImageAsset } from "@/components/ImagePicker";
import { useTheme } from "@/provider/ThemeProvider";
import { useOrganicTheme } from "@/constants/organicTheme";
import { useCredits } from "@/modules/snap/hooks/useCredits";
import { usePaywall } from "@/hooks/usePaywall";

type SnapStage = "empty" | "importing" | "photo";

const IMPORT_STAGES = ["Reading photo…", "Preparing…"];
const IMPORT_DURATION_MS = 900;
const LEAVING_DELAY_MS = 650;

const SpinnerRing = ({ size, color, trackColor }: { size: number; color: string; trackColor: string }) => {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 800, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: size > 24 ? 3 : 2.5,
        borderColor: trackColor,
        borderTopColor: color,
        transform: [{ rotate }],
      }}
    />
  );
};

const SnapView = () => {
  const router = useRouter();
  const { isDark } = useTheme();
  const c = useOrganicTheme();
  const { setCurrentArtwork } = useArtworkStore();
  const { presentPaywall } = usePaywall();

  const { credits, loading: creditsLoading, consumeCredit, hasCredits, getTimeUntilReset, isProUser } =
    useCredits();

  const [stage, setStage] = useState<SnapStage>("empty");
  const [selectedImage, setSelectedImage] = useState<ImageAsset | null>(null);
  const [importPct, setImportPct] = useState(0);
  const [importStageIndex, setImportStageIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const importTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (importTimer.current) clearInterval(importTimer.current);
    };
  }, []);

  const handleImageError = (error: string) => Alert.alert("Error", `Failed to select image: ${error}`);

  const beginImport = (image: ImageAsset) => {
    setSelectedImage(image);
    setStage("importing");
    setImportPct(0);
    setImportStageIndex(0);
    if (importTimer.current) clearInterval(importTimer.current);

    const startedAt = Date.now();
    importTimer.current = setInterval(() => {
      const pct = Math.min(100, Math.round(((Date.now() - startedAt) / IMPORT_DURATION_MS) * 100));
      setImportPct(pct);
      setImportStageIndex(pct > 55 ? 1 : 0);
      if (pct >= 100) {
        if (importTimer.current) clearInterval(importTimer.current);
        setStage("photo");
      }
    }, 60);
  };

  const cancelImport = () => {
    if (importTimer.current) clearInterval(importTimer.current);
    setSelectedImage(null);
    setStage("empty");
  };

  const discard = () => {
    setSelectedImage(null);
    setStage("empty");
  };

  const handlePickPress = (selectImage: () => void) => {
    if (!hasCredits()) {
      setUpgradeOpen(true);
      return;
    }
    selectImage();
  };

  const handleAnalyze = async () => {
    if (busy || leaving || !selectedImage) return;
    if (!hasCredits()) {
      setUpgradeOpen(true);
      return;
    }
    setBusy(true);
    try {
      const creditUsed = await consumeCredit();
      if (!creditUsed) {
        setBusy(false);
        setUpgradeOpen(true);
        return;
      }
      const result = await analyzeArtwork(selectedImage.uri);
      const artworkData: Artwork = { ...result, imageUri: selectedImage.uri };
      setCurrentArtwork(artworkData);
      setBusy(false);
      setLeaving(true);
      setTimeout(() => router.push("/artworks/new"), LEAVING_DELAY_MS);
    } catch {
      setBusy(false);
      Alert.alert("Error", "Failed to analyze artwork. Please try again.");
    }
  };

  const handleGoPro = () => {
    setUpgradeOpen(false);
    presentPaywall({ showSuccessAlert: true });
  };

  if (creditsLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-organic">
        <ActivityIndicator size="large" color={c.accent} />
      </View>
    );
  }

  const ctaEnabled = busy || leaving || hasCredits();
  const ctaLabel = leaving ? "Opening results ↗" : busy ? "Analyzing…" : !hasCredits() ? "No Credits" : "Analyze Artwork";
  const hoursUntilReset = Math.max(1, Math.round((getTimeUntilReset().getTime() - Date.now()) / 3600000));

  const SnapPill = () => {
    if (isProUser) {
      return (
        <View className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-organic-accent-soft">
          <Ionicons name="infinite" size={13} color={c.accentStrong} />
          <Text className="font-figtree-bold text-organic-accent-strong text-[12px]">Unlimited</Text>
        </View>
      );
    }
    const empty = credits === 0;
    return (
      <View
        className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full ${empty ? "" : "bg-organic-accent-soft"}`}
        style={empty ? { backgroundColor: isDark ? "rgba(255,198,165,0.18)" : "rgba(140,73,26,0.1)" } : undefined}
      >
        <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: empty ? c.statusClosed : c.accent }} />
        <Text className={`font-figtree-bold text-[12px] ${empty ? "text-organic-status-closed" : "text-organic-accent-strong"}`}>
          {credits}/3 credits
        </Text>
      </View>
    );
  };

  const Header = () => (
    <View className="px-5 flex-row justify-between items-start gap-3">
      <View className="gap-[3px]">
        <Text className="font-heading text-organic text-[28px] leading-[32px]">Snap</Text>
        <Text className="font-figtree text-organic-muted text-[13px]">
          Point at art, get the story — identified by AI.
        </Text>
      </View>
      <View className="mt-1">
        <SnapPill />
      </View>
    </View>
  );

  const UpgradeSheet = () =>
    upgradeOpen ? (
      <View className="absolute inset-0 z-40 justify-end">
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setUpgradeOpen(false)}
          className="absolute inset-0 bg-organic-overlay"
        />
        <View className="bg-organic rounded-t-[28px] px-5 pt-3.5 pb-[52px] gap-3">
          <View className="w-10 h-1 rounded-full bg-organic-faint self-center" />
          <View
            className="self-start rounded-full px-3 py-1.5"
            style={{ backgroundColor: isDark ? "rgba(255,198,165,0.18)" : "rgba(140,73,26,0.1)" }}
          >
            <Text className="font-figtree-bold text-organic-status-closed text-[11.5px]">Daily limit reached</Text>
          </View>
          <Text className="font-heading text-organic text-[23px] leading-[27px]">That&apos;s your 3 snaps for today</Text>
          <Text className="font-figtree text-organic-muted text-[13.5px] leading-[19px]">
            Free credits refill once every 24 hours — yours come back in about {hoursUntilReset}{" "}
            hour{hoursUntilReset === 1 ? "" : "s"}. Pro removes the limit entirely.
          </Text>
          <View className="bg-organic-surface rounded-2xl p-3.5 gap-1.5">
            {["Unlimited artwork identification", "Deeper reads on every piece", "Saved snap history"].map((line) => (
              <View key={line} className="flex-row gap-2 items-center">
                <Text className="text-organic-accent2 font-figtree-bold">◆</Text>
                <Text className="font-figtree text-organic text-[13px]">{line}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity onPress={handleGoPro} className="py-[15px] rounded-full items-center bg-organic-accent">
            <Text className="font-heading text-organic-accent-soft text-[15.5px]">Upgrade to Pro</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setUpgradeOpen(false)} className="py-3 rounded-full items-center">
            <Text className="font-heading text-organic-muted text-[13.5px]">I&apos;ll wait for tomorrow</Text>
          </TouchableOpacity>
        </View>
      </View>
    ) : null;

  // ── Empty state ───────────────────────────────────────────────────────────────
  if (stage === "empty") {
    return (
      <SafeAreaView className="flex-1 bg-organic" edges={["top"]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View className="flex-1 pt-3 gap-[18px]">
          <Header />

          <ImagePicker onImageSelected={beginImport} onError={handleImageError} quality={0.8}>
            {({ selectImage }) => (
              <TouchableOpacity
                onPress={() => handlePickPress(selectImage)}
                activeOpacity={0.85}
                className="mx-5 h-[330px] rounded-2xl bg-organic-surface items-center justify-center overflow-hidden"
              >
                <View
                  className="absolute rounded-xl"
                  style={{ top: 18, left: 18, right: 18, bottom: 18, borderWidth: 2, borderStyle: "dashed", borderColor: c.divider }}
                />
                {[
                  { top: 30, left: 30, borderTopWidth: 4, borderLeftWidth: 4, borderRadius: 14 },
                  { top: 30, right: 30, borderTopWidth: 4, borderRightWidth: 4, borderRadius: 14 },
                  { bottom: 30, left: 30, borderBottomWidth: 4, borderLeftWidth: 4, borderRadius: 14 },
                  { bottom: 30, right: 30, borderBottomWidth: 4, borderRightWidth: 4, borderRadius: 14 },
                ].map((corner, i) => (
                  <View key={i} className="absolute w-[34px] h-[34px]" style={{ ...corner, borderColor: c.accent }} />
                ))}

                <View className="items-center gap-3">
                  <View
                    className="w-[74px] h-[74px] rounded-full items-center justify-center bg-organic-accent"
                    style={{ shadowColor: c.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 }}
                  >
                    <Ionicons name="camera" size={30} color={c.accentSoft} />
                  </View>
                  <Text className="font-heading text-organic text-base">Choose an artwork photo</Text>
                  <Text className="font-figtree text-organic-muted text-[12.5px]">Camera or library</Text>
                </View>
              </TouchableOpacity>
            )}
          </ImagePicker>

          <View className="px-5 gap-1.5">
            <Text className="font-heading text-organic text-[23px] leading-[27px]">Discover Any Artwork</Text>
            <Text className="font-figtree text-organic-muted text-[13.5px] leading-[19px]">
              Photograph a painting, sculpture, or any piece on display and get instant insights — artist, period,
              and what makes it worth a second look.
            </Text>
          </View>
        </View>

        <UpgradeSheet />
      </SafeAreaView>
    );
  }

  // ── Importing state ──────────────────────────────────────────────────────────
  if (stage === "importing") {
    return (
      <SafeAreaView className="flex-1 bg-organic" edges={["top"]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View className="flex-1 pt-3 gap-[18px]">
          <Header />

          <View className="mx-5 h-[330px] rounded-2xl bg-organic-surface overflow-hidden items-center justify-center">
            <View className="absolute inset-0 bg-organic-placeholder-a" />
            <View className="items-center gap-3.5">
              <SpinnerRing size={34} color={c.accent} trackColor={c.divider} />
              <Text className="font-heading text-organic text-base">{IMPORT_STAGES[importStageIndex]}</Text>
            </View>
          </View>

          <View className="px-5 gap-2">
            <View className="h-2 rounded-full bg-organic-faint overflow-hidden">
              <View className="h-full rounded-full bg-organic-accent" style={{ width: `${importPct}%` }} />
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="font-figtree text-organic-muted text-[12.5px]">{importPct}%</Text>
              <TouchableOpacity onPress={cancelImport}>
                <Text className="font-figtree-bold text-organic-accent-strong text-[13px]">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── Photo attached ────────────────────────────────────────────────────────────
  return (
    <View className="flex-1 bg-organic">
      <StatusBar style="light" />
      <View className="h-[430px] bg-organic-placeholder-a">
        {selectedImage && (
          <Image source={{ uri: selectedImage.uri }} className="w-full h-full" resizeMode="cover" />
        )}
        <TouchableOpacity
          onPress={discard}
          disabled={busy || leaving}
          className="absolute top-16 left-3.5 w-9 h-9 rounded-full items-center justify-center bg-organic-photo-btn"
        >
          <Ionicons name="chevron-back" size={19} color={c.text} />
        </TouchableOpacity>
      </View>

      <View className="px-5 pt-[18px] gap-1.5">
        <View className="flex-row justify-between items-center gap-3">
          <Text className="font-heading text-organic text-[23px]">Ready to analyze</Text>
          <SnapPill />
        </View>
        <Text className="font-figtree text-organic-muted text-[13.5px] leading-[19px]">
          We&apos;ll look for the artist, period and title, then hand you a short read on the piece.
        </Text>
      </View>

      <View className="px-5 pt-[18px] gap-2.5">
        <TouchableOpacity
          onPress={handleAnalyze}
          disabled={busy || leaving}
          className={`py-[15px] rounded-full items-center flex-row justify-center gap-2.5 ${ctaEnabled ? "bg-organic-accent" : "bg-organic-faint"}`}
        >
          {busy && <SpinnerRing size={16} color={c.text} trackColor="rgba(32,30,29,0.25)" />}
          <Text className="font-heading text-organic-accent-soft text-[15.5px]">{ctaLabel}</Text>
        </TouchableOpacity>

        <View className="flex-row gap-2">
          <ImagePicker onImageSelected={beginImport} onError={handleImageError} quality={0.8}>
            {({ selectImage }) => (
              <TouchableOpacity
                onPress={() => handlePickPress(selectImage)}
                disabled={busy || leaving}
                className="flex-1 py-3 rounded-full items-center border border-organic-divider bg-organic-surface-alt"
              >
                <Text className="font-heading text-organic text-[13.5px]">Different photo</Text>
              </TouchableOpacity>
            )}
          </ImagePicker>
          <TouchableOpacity
            onPress={discard}
            disabled={busy || leaving}
            className="flex-1 py-3 rounded-full items-center border border-organic-divider"
          >
            <Text className="font-heading text-organic-accent-strong text-[13.5px]">Delete photo</Text>
          </TouchableOpacity>
        </View>

        {leaving && (
          <Text className="font-figtree text-organic-muted text-[12.5px] text-center">
            Taking you to the results…
          </Text>
        )}
      </View>

      <UpgradeSheet />
    </View>
  );
};

export default SnapView;
