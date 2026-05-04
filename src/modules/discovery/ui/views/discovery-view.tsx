import { ActivityIndicator, View, Alert } from "react-native";
import React, { useEffect, useMemo } from "react";
import { useRouter } from "expo-router";
import DiscoveryHeader from "@/modules/discovery/ui/components/DiscoveryHeader";
import MuseumRowList from "@/modules/discovery/ui/components/MuseumRowList";
import { Colors } from "@/constants/colors";
import { useLocationManager } from "@/hooks/useLocationManager";
import AnimatedHeaderWrapper from "@/components/AnimatedHeaderWrapper";
import { useMuseumsQuery } from "@/hooks/useMuseumsQuery";
import { calculateRawDistance } from "@/utils/distance";
import { useMuseumListStore } from "@/stores/museumListStore";
import { useTheme } from "@/provider/ThemeProvider";
import MuseumGridList from "@/modules/discovery/ui/components/MuseumGridList";
import MuseumInfoList from "@/modules/discovery/ui/components/MuseumInfoList";
import ProfileMenuDropdown from "@/modules/profile/ui/components/ProfileMenuDropdown";

const DiscoveryView = () => {
  const router = useRouter();
  const { isDark } = useTheme();
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
  const handleGoToMuseum = (id: string) =>
    router.push(`/museums/${encodeURIComponent(id)}`);
  const handleShowAll = () => {
    setMuseumList("Nearby", sortedMuseums);
    router.push("/museums");
  };

  // All museums sorted by distance
  const sortedMuseums = useMemo(() => {
    if (!coords || !museums.length) return museums;
    return museums
      .map((museum) => {
        const museumCoords = museum.geometry?.location
          ? { latitude: museum.geometry.location.lat, longitude: museum.geometry.location.lng }
          : null;
        const rawDistance = museumCoords ? calculateRawDistance(coords, museumCoords) : Infinity;
        return { ...museum, rawDistance };
      })
      .sort((a, b) => a.rawDistance - b.rawDistance)
      .map(({ rawDistance, ...museum }) => museum);
  }, [coords, museums]);

  // Nearby: first 4 with a Wikimedia image stored in DB
  const nearbyMuseums = useMemo(
    () => sortedMuseums.filter((m) => !!m.imageUrl).slice(0, 4),
    [sortedMuseums],
  );

  // "Featured" — next 4 museums with images, skipping those already shown in Nearby
  const featuredMuseums = useMemo(() => {
    const nearbyIds = new Set(nearbyMuseums.map((m) => m.placeId));
    return sortedMuseums
      .filter((m) => !!m.imageUrl && !nearbyIds.has(m.placeId))
      .slice(0, 4);
  }, [sortedMuseums, nearbyMuseums]);

  // "Explore More" — next 5 by distance (with or without image), skipping Nearby + Featured
  const exploreMoreMuseums = useMemo(() => {
    const shownIds = new Set([
      ...nearbyMuseums.map((m) => m.placeId),
      ...featuredMuseums.map((m) => m.placeId),
    ]);
    return sortedMuseums.filter((m) => !shownIds.has(m.placeId)).slice(0, 5);
  }, [sortedMuseums, nearbyMuseums, featuredMuseums]);

  const renderMainContent = () => {
    if (museumsLoading || isLocationLoading) {
      return (
        <View className="flex-1 items-center justify-center min-h-[400px]">
          <ActivityIndicator size="large" color={Colors.Primary} />
        </View>
      );
    }

    return (
      <View className="flex-1 mt-4 bg-app">
        <MuseumRowList
          title="Nearby"
          museums={nearbyMuseums}
          onCardPress={(id) => handleGoToMuseum(id)}
          onShowAll={handleShowAll}
        />

        <MuseumGridList
          title="Featured"
          museums={featuredMuseums}
          onCardPress={(id) => handleGoToMuseum(id)}
        />

        <MuseumInfoList
          title="Explore More"
          museums={exploreMoreMuseums}
          onCardPress={(id) => handleGoToMuseum(id)}
        />
      </View>
    );
  };

  const headerComponent = (
    <DiscoveryHeader
      place={address || "Unknown Location"}
      onLocationPress={handleLocationPress}
      rightComponent={<ProfileMenuDropdown imageSize={36} />}
    />
  );

  return (
    <AnimatedHeaderWrapper
      title="Musez"
      headerComponent={headerComponent}
      scrollThreshold={80}
      blurIntensity={80}
      blurType={isDark ? "dark" : "light"}
      backgroundColor={isDark ? "#111827" : "#f9fafb"}
      titleStyle={`text-xl font-bold tracking-wide ${isDark ? "text-white" : "text-black"}`}
    >
      {renderMainContent()}
    </AnimatedHeaderWrapper>
  );
};

export default DiscoveryView;
