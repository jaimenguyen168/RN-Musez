import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Alert, Animated, Easing } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { Artwork } from "@/types/artwork";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useTheme } from "@/provider/ThemeProvider";
import { useOrganicTheme } from "@/constants/organicTheme";
import { useImageUpload } from "@/hooks/useImageUpload";
import ArtworkPhotoHeader, { ARTWORK_HEADER_HEIGHT } from "@/modules/snap/ui/components/ArtworkPhotoHeader";

interface ArtworkDetailsViewProps {
  artwork: Artwork | null;
  loading: boolean;
  showButton?: boolean;
}

const SpinnerRing = ({
  size,
  color,
  trackColor,
}: {
  size: number;
  color: string;
  trackColor: string;
}) => {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

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

const META_FIELDS: {
  key: keyof Pick<Artwork, "period" | "style" | "medium" | "dateCreated">;
  label: string;
}[] = [
  { key: "period", label: "Period" },
  { key: "style", label: "Style" },
  { key: "medium", label: "Medium" },
  { key: "dateCreated", label: "Created" },
];

const ArtworkDetailsView = ({
  artwork,
  loading,
  showButton = false,
}: ArtworkDetailsViewProps) => {
  const router = useRouter();
  const { isDark } = useTheme();
  const c = useOrganicTheme();
  const [isSaving, setIsSaving] = useState(false);
  const createArtwork = useMutation(api.function.artworks.createArtwork);
  const { uploadImageToConvex } = useImageUpload();
  const scrollY = useRef(new Animated.Value(0)).current;
  const onScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: false,
  });

  const handleSaveArtwork = async () => {
    if (!artwork) return;
    setIsSaving(true);
    try {
      const convexImageUrl = await uploadImageToConvex(artwork.imageUri);
      await createArtwork({
        artwork: { ...artwork, imageUri: convexImageUrl },
      });
      Alert.alert(
        "Artwork Saved!",
        "Your artwork has been successfully saved to your collection.",
        [
          { text: "Snap New One", onPress: () => router.push("/snap") },
          {
            text: "View Collection",
            onPress: () =>
              router.push({
                pathname: "/favorite",
                params: { artwork: "true" },
              }),
            style: "default",
          },
        ],
      );
    } catch {
      Alert.alert(
        "Save Failed",
        "There was an error saving your artwork. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ── No artwork object at all (route/store failure) ──────────────────────
  if (!loading && !artwork) {
    return (
      <View className="flex-1 items-center justify-center px-8 gap-3 bg-organic">
        <StatusBar style={isDark ? "light" : "dark"} />
        <Ionicons name="image-outline" size={56} color={c.textFaint} />
        <Text className="font-heading text-organic text-xl text-center">
          Artwork Not Found
        </Text>
        <Text className="font-figtree text-organic-muted text-sm text-center leading-5">
          The artwork you&apos;re looking for could not be found.
        </Text>
        <TouchableOpacity
          className="bg-organic-accent mt-1 px-6 py-3 rounded-full"
          onPress={() => router.back()}
        >
          <Text className="font-heading text-organic-accent-soft text-[15px]">
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const hasIdentification = !!(
    artwork?.title ||
    artwork?.artist ||
    artwork?.description ||
    artwork?.culturalContext ||
    artwork?.funFact ||
    artwork?.location ||
    (artwork?.relatedArtworks && artwork.relatedArtworks.length > 0)
  );
  const hasError = !loading && !!artwork?.error;
  const notFound = !loading && !hasError && !!artwork && !hasIdentification;
  const success = !loading && !hasError && !!artwork && hasIdentification;

  const metaFields = artwork
    ? META_FIELDS.map(({ key, label }) => ({
        label,
        value: artwork[key],
      })).filter((f): f is { label: string; value: string } => !!f.value)
    : [];

  return (
    <View className="flex-1 bg-organic">
      <StatusBar style="light" />

      <ArtworkPhotoHeader imageUri={artwork?.imageUri} scrollY={scrollY} />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        bounces
        contentContainerStyle={{ paddingTop: ARTWORK_HEADER_HEIGHT }}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {/* ── Loading ───────────────────────────────────────────────────── */}
        {loading && (
          <View className="px-5 pt-4 gap-3.5">
            <View className="flex-row items-center gap-2.5">
              <SpinnerRing size={20} color={c.accent} trackColor={c.divider} />
              <Text className="font-heading text-organic text-[19px]">
                {showButton ? "Reading the piece…" : "Loading artwork…"}
              </Text>
            </View>
            <Text className="font-figtree text-organic-muted text-[13px]">
              {showButton
                ? "Matching brushwork, period and subject. A few seconds."
                : "Fetching the details for this piece."}
            </Text>
            <View className="gap-3 mt-0.5">
              {[0, 1, 2].map((row) => (
                <View
                  key={row}
                  className="bg-organic-surface rounded-2xl p-4 gap-2.5"
                >
                  <View className="h-[11px] rounded-full bg-organic-faint w-[38%]" />
                  <View className="h-[9px] rounded-full bg-organic-faint w-[70%]" />
                  <View className="h-[9px] rounded-full bg-organic-faint w-[64%]" />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Not found ─────────────────────────────────────────────────── */}
        {notFound && (
          <View className="px-5 pt-4 gap-3.5">
            <Text className="font-heading text-organic text-2xl leading-7">
              No match for this one
            </Text>
            <Text className="font-figtree text-organic-muted text-[13.5px] leading-5">
              We couldn&apos;t find this piece in any collection we know.
              Lesser-known works, temporary installations and gift-shop
              reproductions often come back empty.
            </Text>
            <View className="bg-organic-surface rounded-2xl p-4 gap-2">
              <Text className="font-heading text-organic text-[15.5px]">
                Worth trying
              </Text>
              <Text className="font-figtree text-organic-muted text-[13px] leading-5">
                Shoot the piece straight on, fill the frame, and include the
                wall label if there is one — labels help a lot.
              </Text>
            </View>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => router.push("/snap")}
                className="flex-1 py-3.5 rounded-full items-center bg-organic-accent"
              >
                <Text className="font-heading text-organic-accent-soft text-sm">
                  Snap again
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push("/search")}
                className="flex-1 py-3.5 rounded-full items-center border border-organic-divider bg-organic-surface-alt"
              >
                <Text className="font-heading text-organic text-sm">
                  Search by name
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Error ─────────────────────────────────────────────────────── */}
        {hasError && (
          <View className="px-5 pt-4">
            <View
              className="rounded-2xl p-4 gap-2.5"
              style={{ backgroundColor: isDark ? "#4d2418" : "#f3d3c6" }}
            >
              <View className="flex-row gap-3 items-start">
                <View
                  className="w-[38px] h-[38px] rounded-xl items-center justify-center"
                  style={{ backgroundColor: isDark ? "#6b3520" : "#e2a58c" }}
                >
                  <Text
                    style={{ color: isDark ? "#ffc0aa" : "#6d2410" }}
                    className="text-lg font-extrabold"
                  >
                    !
                  </Text>
                </View>
                <View className="flex-1 gap-1">
                  <Text
                    className="font-heading text-[17px]"
                    style={{ color: isDark ? "#ffc0aa" : "#6d2410" }}
                  >
                    The analysis didn&apos;t finish
                  </Text>
                  <Text
                    className="font-figtree text-[13.5px] leading-5"
                    style={{ color: isDark ? "#e8bda9" : "#8a3f22" }}
                  >
                    Something broke on our side before results came back. Your
                    credit wasn&apos;t used — try again in a moment.
                  </Text>
                </View>
              </View>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => router.back()}
                  className="flex-1 py-3 rounded-full items-center bg-organic-accent"
                >
                  <Text className="font-heading text-organic-accent-soft text-[13.5px]">
                    Try again
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push("/snap")}
                  className="flex-1 py-3 rounded-full items-center border"
                  style={{
                    borderColor: isDark ? "rgba(255,192,170,0.4)" : "#d09a80",
                  }}
                >
                  <Text
                    className="font-heading text-[13.5px]"
                    style={{ color: isDark ? "#ffc0aa" : "#6d2410" }}
                  >
                    Snap a new photo
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* ── Success ───────────────────────────────────────────────────── */}
        {success && artwork && (
          <View className="gap-4 pt-4">
            <View className="px-5 gap-1.5">
              <Text className="font-heading text-organic text-[26px] leading-[31px]">
                {artwork.title || "Untitled piece"}
              </Text>
              {artwork.artist ? (
                <Text className="font-figtree-bold text-organic-accent-strong text-sm">
                  {artwork.artist}
                </Text>
              ) : (
                <Text className="font-figtree text-organic-faint text-[13px] italic">
                  Artist unknown
                </Text>
              )}
            </View>

            {metaFields.length > 0 && (
              <View className="flex-row flex-wrap gap-2 px-5">
                {metaFields.map(({ label, value }) => (
                  <View
                    key={label}
                    className="bg-organic-surface rounded-full px-3.5 py-1.5"
                  >
                    <Text className="font-figtree text-[12.5px]">
                      <Text className="text-organic-faint">{label} </Text>
                      <Text className="font-figtree-bold text-organic">
                        {value}
                      </Text>
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <View className="px-5 gap-3.5">
              {artwork.description && (
                <View className="bg-organic-surface rounded-2xl p-4 gap-1.5">
                  <Text className="font-heading text-organic text-base">
                    What you&apos;re looking at
                  </Text>
                  <Text className="font-figtree text-organic-muted text-[13.5px] leading-5">
                    {artwork.description}
                  </Text>
                </View>
              )}

              {artwork.culturalContext && (
                <View className="bg-organic-surface rounded-2xl p-4 gap-1.5">
                  <Text className="font-heading text-organic text-base">
                    Why it mattered
                  </Text>
                  <Text className="font-figtree text-organic-muted text-[13.5px] leading-5">
                    {artwork.culturalContext}
                  </Text>
                </View>
              )}

              {artwork.funFact && (
                <View className="bg-organic-accent2-soft rounded-2xl p-4 flex-row gap-3 items-start">
                  <View
                    className="w-[34px] h-[34px] rounded-full items-center justify-center"
                    style={{ backgroundColor: c.accent2 }}
                  >
                    <Text
                      style={{ color: isDark ? "#2c3320" : "#f0fae1" }}
                      className="text-[15px] font-extrabold"
                    >
                      ◆
                    </Text>
                  </View>
                  <View className="flex-1 gap-1">
                    <Text
                      className="font-heading text-[15.5px]"
                      style={{ color: isDark ? "#e7f0d8" : "#3d472b" }}
                    >
                      One more thing
                    </Text>
                    <Text
                      className="font-figtree text-[13.5px] leading-5"
                      style={{ color: isDark ? "#dbe6c8" : "#3d472b" }}
                    >
                      {artwork.funFact}
                    </Text>
                  </View>
                </View>
              )}

              {artwork.location && (
                <View className="bg-organic-surface rounded-2xl px-3.5 py-3 flex-row items-center gap-3">
                  <View className="w-11 h-11 rounded-xl items-center justify-center bg-organic-accent2-soft">
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color={c.accent2}
                    />
                  </View>
                  <View className="flex-1 gap-0.5">
                    <Text className="font-figtree-bold text-organic-faint text-[11px] uppercase tracking-wide">
                      Usually found at
                    </Text>
                    <Text className="font-figtree-bold text-organic text-[13.5px]">
                      {artwork.location}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={c.textFaint}
                  />
                </View>
              )}

              {artwork.relatedArtworks &&
                artwork.relatedArtworks.length > 0 && (
                  <View className="bg-organic-surface rounded-2xl p-4 gap-2.5">
                    <Text className="font-heading text-organic text-base">
                      If you liked this
                    </Text>
                    <View className="gap-2">
                      {artwork.relatedArtworks.map((name, i) => (
                        <View
                          key={`${i}-${name}`}
                          className="flex-row justify-between items-center gap-2"
                        >
                          <Text className="font-figtree text-organic text-[13.5px] flex-1">
                            {name}
                          </Text>
                          <Ionicons
                            name="chevron-forward"
                            size={14}
                            color={c.textFaint}
                          />
                        </View>
                      ))}
                    </View>
                  </View>
                )}
            </View>

            {showButton && (
              <View className="px-5 pt-0.5">
                <TouchableOpacity
                  onPress={handleSaveArtwork}
                  disabled={isSaving}
                  activeOpacity={0.85}
                  className={`flex-row items-center justify-center gap-2.5 py-4 rounded-full bg-organic-accent ${isSaving ? "opacity-70" : "opacity-100"}`}
                >
                  {isSaving ? (
                    <SpinnerRing
                      size={17}
                      color={c.accentSoft}
                      trackColor="rgba(255,255,255,0.3)"
                    />
                  ) : (
                    <Ionicons name="heart" size={19} color={c.accentSoft} />
                  )}
                  <Text className="font-heading text-organic-accent-soft text-[15.5px]">
                    {isSaving ? "Saving…" : "Save Artwork"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        <View className="h-8" />
      </Animated.ScrollView>
    </View>
  );
};

export default ArtworkDetailsView;
