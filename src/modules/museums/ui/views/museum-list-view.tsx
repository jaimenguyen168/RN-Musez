import { View, Text, FlatList } from "react-native";
import React, { ReactNode } from "react";
import { Museum } from "@/types/museum";
import MuseumOverviewCard from "@/modules/discovery/ui/components/MuseumOverviewCard";
import { useMuseumListStore } from "@/stores/museumListStore";
import BlurNavigationHeader from "@/components/BlurNavigationHeader";

interface MuseumListViewProps {
  museums: Museum[];
  onCardPress?: (museumId: string) => void;
  leftComponent?: ReactNode;
  rightComponent?: ReactNode;
  secondRightComponent?: ReactNode;
}

const MuseumListView = ({
  museums,
  onCardPress,
  leftComponent,
  rightComponent,
  secondRightComponent,
}: MuseumListViewProps) => {
  const { title } = useMuseumListStore();

  const renderMuseumItem = ({ item }: { item: Museum }) => (
    <MuseumOverviewCard
      museum={item}
      variant="detailed"
      onCardPress={() => onCardPress?.(item.placeId)}
    />
  );

  if (museums.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-lg text-gray-500 text-center">
          No museums found
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <BlurNavigationHeader
        title={title}
        leftComponent={leftComponent}
        rightComponent={rightComponent}
        secondRightComponent={secondRightComponent}
      />

      {/* Museum List */}
      <FlatList
        data={museums}
        keyExtractor={(item) => item.placeId}
        renderItem={renderMuseumItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 8,
          paddingBottom: 16,
          paddingTop: 128,
        }}
        ItemSeparatorComponent={() => <View className="h-2" />}
      />
    </View>
  );
};

export default MuseumListView;
