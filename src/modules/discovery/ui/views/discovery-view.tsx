import { ActivityIndicator, View, Alert, Text, ScrollView } from "react-native";
import React, { useEffect, useMemo } from "react";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DiscoveryHeader from "@/modules/discovery/ui/components/DiscoveryHeader";
import DiscoverySearchBar from "@/modules/discovery/ui/components/DiscoverySearchBar";
import MuseumSpotlightCard from "@/modules/discovery/ui/components/MuseumSpotlightCard";
import MuseumWalkCarousel from "@/modules/discovery/ui/components/MuseumWalkCarousel";
import MuseumTripList from "@/modules/discovery/ui/components/MuseumTripList";
import { useLocationManager } from "@/hooks/useLocationManager";
import { useMuseumsQuery } from "@/hooks/useMuseumsQuery";
import { calculateRawDistance } from "@/utils/distance";
import { useMuseumListStore } from "@/stores/museumListStore";
import { useTheme } from "@/provider/ThemeProvider";
import { useOrganicTheme } from "@/constants/organicTheme";
import ProfileMenuDropdown from "@/modules/profile/ui/components/ProfileMenuDropdown";

const DiscoveryView = () => {
  const router = useRouter();
  const { isDark } = useTheme();
  const c = useOrganicTheme();
  const insets = useSafeAreaInsets();

  const {
    address,
    coords,
    isLoading: isLocationLoading,
    error: locationError,
  } = useLocationManager(true);

  const museumsParams = coords
    ? { latitude: coords.latitude, longitude: coords.longitude }
    : null;

  const { setMuseumList } = useMuseumListStore();

  const {
    data: museums = [],
    isLoading: museumsLoading,
    error: museumsError,
  } = useMuseumsQuery(museumsParams);

  useEffect(() => {
    if (museumsError) Alert.alert("Error", museumsError.message);
  }, [museumsError]);

  useEffect(() => {
    if (locationError) Alert.alert("Location Error", "Unable to get your location");
  }, [locationError]);

  const handleLocationPress = () => router.push("/discovery/map");
  const handleSearchPress = () => router.push("/search");
  const handleGoToMuseum = (id: string) => router.push(`/museums/${encodeURIComponent(id)}`);
  const handleShowAll = () => {
    setMuseumList("Nearby", sortedMuseums);
    router.push("/museums");
  };

  // All museums sorted by distance
  const sortedMuseums = useMemo(() => {
    if (!coords || !museums.length) return museums;
    return museums
      .map((museum) => {
        const rawDistance = calculateRawDistance(coords, { latitude: museum.lat, longitude: museum.lng });
        return { ...museum, rawDistance };
      })
      .sort((a, b) => a.rawDistance - b.rawDistance)
      .map(({ rawDistance, ...museum }) => museum);
  }, [coords, museums]);

  const spotlightMuseum = sortedMuseums[0];
  const walkMuseums = sortedMuseums.slice(1, 6);
  const tripMuseums = sortedMuseums.slice(6);

  const renderMainContent = () => {
    if (museumsLoading || isLocationLoading) {
      return (
        <View className="min-h-[400px] items-center justify-center">
          <ActivityIndicator size="large" color={c.accent} />
        </View>
      );
    }

    if (sortedMuseums.length === 0) {
      return (
        <View className="min-h-[300px] items-center justify-center px-10">
          <Text className="font-figtree text-organic-muted text-sm text-center">
            No museums nearby yet.
          </Text>
        </View>
      );
    }

    return (
      <View className="pt-1 pb-[90px] gap-5">
        <View className="gap-2.5">
          <Text className="font-figtree-bold text-organic-accent text-[11px] tracking-[1.1px] uppercase px-5">
            Closest to you
          </Text>
          <MuseumSpotlightCard
            museum={spotlightMuseum}
            onPress={() => handleGoToMuseum(spotlightMuseum.osmId)}
          />
        </View>

        <MuseumWalkCarousel
          title="A short walk away"
          museums={walkMuseums}
          onCardPress={handleGoToMuseum}
          onShowAll={handleShowAll}
        />

        <MuseumTripList
          title="Worth the trip"
          museums={tripMuseums}
          onCardPress={handleGoToMuseum}
          onShowAll={tripMuseums.length > 0 ? handleShowAll : undefined}
          footerText={
            tripMuseums.length > 0
              ? `That's ${sortedMuseums.length} museum${sortedMuseums.length === 1 ? "" : "s"} nearby`
              : undefined
          }
        />
      </View>
    );
  };

  return (
    <View className="flex-1 bg-organic">
      <StatusBar style={isDark ? "light" : "dark"} />

      <View className="bg-organic pb-2" style={{ paddingTop: insets.top + 8 }}>
        <DiscoveryHeader
          place={address || "Unknown Location"}
          onLocationPress={handleLocationPress}
          rightComponent={<ProfileMenuDropdown imageSize={38} />}
        />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="pb-4">
          <DiscoverySearchBar onPress={handleSearchPress} />
        </View>
        {renderMainContent()}
      </ScrollView>
    </View>
  );
};

export default DiscoveryView;
