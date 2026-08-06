import { View, Text, TouchableOpacity, ScrollView, Animated } from "react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocationManager } from "@/hooks/useLocationManager";
import { useMuseumsQuery } from "@/hooks/useMuseumsQuery";
import { calculateRawDistance } from "@/utils/distance";
import { useOrganicTheme } from "@/constants/organicTheme";
import { useRecentSearchesStore } from "@/stores/recentSearchesStore";
import MuseumSearchRow from "@/modules/discovery/ui/components/MuseumSearchRow";

const SUGGESTIONS = ["Art", "History", "Science", "Free entry", "Kids"];
const DEBOUNCE_MS = 500;

interface DiscoverySearchViewProps {
  query: string;
  onRunSearch: (term: string) => void;
}

const DiscoverySearchView = ({ query, onRunSearch }: DiscoverySearchViewProps) => {
  const router = useRouter();
  const c = useOrganicTheme();
  const { coords } = useLocationManager(false);

  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const recents = useRecentSearchesStore((s) => s.terms);
  const addRecentSearch = useRecentSearchesStore((s) => s.addRecentSearch);
  const clearRecentSearches = useRecentSearchesStore((s) => s.clearRecentSearches);

  const museumsParams = coords ? { latitude: coords.latitude, longitude: coords.longitude } : null;
  const { data: museums = [] } = useMuseumsQuery(museumsParams);

  const sortedMuseums = useMemo(() => {
    if (!coords || !museums.length) return museums;
    return museums
      .map((m) => ({ ...m, rawDistance: calculateRawDistance(coords, { latitude: m.lat, longitude: m.lng }) }))
      .sort((a, b) => a.rawDistance - b.rawDistance)
      .map(({ rawDistance, ...m }) => m);
  }, [coords, museums]);

  // Debounce the query 500ms before it drives the actual search.
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, DEBOUNCE_MS);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query]);

  useEffect(() => {
    if (debouncedQuery) addRecentSearch(debouncedQuery);
  }, [debouncedQuery]);

  const trimmedQuery = query.trim();
  const isIdle = trimmedQuery.length === 0;
  const isSettling = !isIdle && debouncedQuery.toLowerCase() !== trimmedQuery.toLowerCase();

  const results = useMemo(() => {
    if (isIdle || isSettling) return [];
    const q = debouncedQuery.toLowerCase();
    return sortedMuseums.filter((m) =>
      [m.name, m.category, m.description, m.city].filter(Boolean).some((f) => f!.toLowerCase().includes(q)),
    );
  }, [sortedMuseums, debouncedQuery, isIdle, isSettling]);

  // Skips the debounce wait — used when the user picks a recent/suggestion.
  const runSearch = (term: string) => {
    onRunSearch(term);
    setDebouncedQuery(term.trim());
  };

  const handleGoToMuseum = (id: string) => router.push(`/museums/${encodeURIComponent(id)}`);

  return (
    <SafeAreaView className="flex-1 bg-organic" edges={["top"]} collapsable={false}>
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View className="px-5 pt-5 pb-10 gap-6">
          {isIdle && (
            <>
              {recents.length > 0 && (
                <View className="gap-2.5">
                  <View className="flex-row justify-between items-baseline">
                    <Text className="font-heading text-organic text-[19px]">Recent searches</Text>
                    <TouchableOpacity onPress={clearRecentSearches}>
                      <Text className="font-figtree-bold text-organic-accent-strong text-[13px]">Clear</Text>
                    </TouchableOpacity>
                  </View>
                  <View className="bg-organic-surface rounded-2xl overflow-hidden">
                    {recents.map((term, i) => (
                      <TouchableOpacity
                        key={term}
                        onPress={() => runSearch(term)}
                        className={`flex-row gap-3 items-center px-4 py-3.5 ${
                          i !== recents.length - 1 ? "border-b border-organic-divider" : ""
                        }`}
                      >
                        <Ionicons name="time-outline" size={15} color={c.textFaint} />
                        <Text className="font-figtree text-organic flex-1 text-sm">{term}</Text>
                        <Ionicons
                          name="arrow-up-outline"
                          size={14}
                          color={c.textFaint}
                          style={{ transform: [{ rotate: "-45deg" }] }}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <View className="gap-2.5">
                <Text className="font-heading text-organic text-[19px]">Try something</Text>
                <View className="flex-row flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => runSearch(s)}
                      className="rounded-full border border-organic-divider bg-organic-surface-alt px-4 py-2.5"
                    >
                      <Text className="font-heading text-organic text-[13.5px]">{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}

          {isSettling && (
            <View className="gap-2.5">
              <Text className="font-figtree text-organic-muted text-[12.5px]">Searching…</Text>
              {[0, 1, 2].map((i) => (
                <SkeletonRow key={i} widthPct={62 - i * 9} />
              ))}
            </View>
          )}

          {!isIdle && !isSettling && (
            <View className="gap-2.5">
              <Text className="font-figtree text-organic-muted text-[12.5px]">
                {results.length} museum{results.length === 1 ? "" : "s"} found
              </Text>
              {results.map((m) => (
                <MuseumSearchRow key={m.osmId} museum={m} onPress={() => handleGoToMuseum(m.osmId)} />
              ))}
              {results.length === 0 && (
                <View className="items-center gap-1.5 py-10 px-4">
                  <Text className="font-heading text-organic text-[19px]">Nothing here yet</Text>
                  <Text className="font-figtree text-organic-muted text-[13px] text-center">
                    Try a shorter word, or browse what&apos;s nearby.
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DiscoverySearchView;

const SkeletonRow = ({ widthPct }: { widthPct: number }) => {
  const opacity = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 550, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.55, duration: 550, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={{ opacity }}
      className="flex-row gap-3 items-center bg-organic-surface rounded-2xl p-3.5"
    >
      <View className="w-[52px] h-[52px] rounded-lg bg-organic-placeholder-a" />
      <View className="flex-1 gap-2">
        <View className="h-[11px] rounded-full bg-organic-placeholder-a" style={{ width: `${widthPct}%` }} />
        <View className="h-[9px] rounded-full bg-organic-placeholder-a" style={{ width: "42%" }} />
      </View>
    </Animated.View>
  );
};
