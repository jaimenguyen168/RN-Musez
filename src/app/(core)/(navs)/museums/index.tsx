import React from "react";
import { useRouter } from "expo-router";
import MuseumListView from "@/modules/museums/ui/views/museum-list-view";
import { useMuseumListStore } from "@/stores/museumListStore";
import BackButton from "@/components/BackButton";

export default function MuseumsScreen() {
  const router = useRouter();
  const { museums } = useMuseumListStore();

  const handleCardPress = (museumId: string) => {
    router.push(`/museums/${encodeURIComponent(museumId)}`);
  };

  const handleBackPress = () => {
    router.back();
  };

  return (
    <MuseumListView
      museums={museums}
      onCardPress={handleCardPress}
      leftComponent={<BackButton onPress={handleBackPress} />}
    />
  );
}
