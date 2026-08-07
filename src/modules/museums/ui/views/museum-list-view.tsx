import { View, Text, FlatList, Animated, Easing } from "react-native";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Museum } from "../../../../../convex/convexTypes";
import MuseumOverviewCard from "@/modules/discovery/ui/components/MuseumOverviewCard";
import { useMuseumListStore } from "@/stores/museumListStore";
import { useTheme } from "@/provider/ThemeProvider";

interface MuseumListViewProps {
  museums: Museum[];
  onCardPress?: (museumId: string) => void;
  leftComponent?: ReactNode;
  rightComponent?: ReactNode;
  secondRightComponent?: ReactNode;
}

const BIG_CARD_COUNT = 3;
const NAV_DELAY_MS = 320;

const titleList = ["Saved", "Nearby"];

const MuseumListView = ({
  museums,
  onCardPress,
  leftComponent,
  rightComponent,
  secondRightComponent,
}: MuseumListViewProps) => {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { title } = useMuseumListStore();
  const usedTitle = titleList.includes(title) ? title : "Museums";

  const [navText, setNavText] = useState<string | null>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const navTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (navTimer.current) clearTimeout(navTimer.current);
    };
  }, []);

  const handleCardPress = (museum: Museum) => {
    setNavText(`Opening ${museum.name}…`);
    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
    navTimer.current = setTimeout(() => onCardPress?.(museum.osmId), NAV_DELAY_MS);
  };

  const renderMuseumItem = ({ item, index }: { item: Museum; index: number }) => (
    <MuseumOverviewCard
      museum={item}
      variant={index < BIG_CARD_COUNT ? "detailed" : "compact"}
      onCardPress={() => handleCardPress(item)}
    />
  );

  return (
    <View className="flex-1 bg-organic">
      <StatusBar style={isDark ? "light" : "dark"} />

      <View
        className="px-5 flex-row items-center justify-between gap-3"
        style={{ paddingTop: insets.top + 8, paddingBottom: 16 }}
      >
        <View className="flex-row items-center gap-3 flex-1">
          {leftComponent && (
            <View className="w-[38px] h-[38px] rounded-full items-center justify-center bg-organic-surface border border-organic-divider">
              {leftComponent}
            </View>
          )}
          <View className="gap-0.5 flex-1">
            <Text className="font-heading text-organic text-[25px] leading-[27px]" numberOfLines={1}>
              {usedTitle}
            </Text>
            <Text className="font-figtree text-organic-muted text-[12.5px]">
              {museums.length} museum{museums.length === 1 ? "" : "s"}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          {secondRightComponent}
          {rightComponent}
        </View>
      </View>

      {museums.length > 0 ? (
        <FlatList
          data={museums}
          keyExtractor={(item) => item.osmId}
          renderItem={renderMuseumItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, gap: 12 }}
        />
      ) : (
        <View className="items-center gap-2.5 px-8" style={{ paddingTop: 40 }}>
          <Text className="font-heading text-organic text-[21px]">Nothing in here yet</Text>
          <Text className="font-figtree text-organic-muted text-[13.5px] text-center leading-5 max-w-[260px]">
            This group is empty. Save a museum and add it from its detail page.
          </Text>
        </View>
      )}

      {navText && (
        <Animated.View
          className="absolute left-4 right-4 rounded-full py-3.5 px-5"
          style={{
            bottom: insets.bottom + 20,
            backgroundColor: isDark ? "#f5ead8" : "#201e1d",
            opacity: toastOpacity,
          }}
        >
          <Text
            className="font-figtree-bold text-center text-[13.5px]"
            style={{ color: isDark ? "#201e1d" : "#f5ead8" }}
          >
            {navText}
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

export default MuseumListView;
