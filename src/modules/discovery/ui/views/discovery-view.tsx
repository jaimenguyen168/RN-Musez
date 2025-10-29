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

const DiscoveryView = () => {
  const router = useRouter();
  const {
    coords,
    isLoading: isLocationLoading,
    error: locationError,
  } = useLocationManager(true);

  const museumsParams = coords
    ? {
        latitude: coords.latitude,
        longitude: coords.longitude,
      }
    : null;
  const { setMuseumList } = useMuseumListStore();

  const {
    data: museums = [],
    isLoading: museumsLoading,
    error: museumsError,
    refetch: refetchMuseums,
  } = useMuseumsQuery(museumsParams, {
    retry: 2,
    retryDelay: 1000,
  });

  useEffect(() => {
    if (museumsError) {
      Alert.alert("Error", museumsError.message);
    }
  }, [museumsError]);

  useEffect(() => {
    if (locationError) {
      Alert.alert("Location Error", "Unable to get your location");
    }
  }, [locationError]);

  const handleLocationPress = () => {
    router.push("/discovery/map");
  };

  const handleGoToMuseum = (id: string) => {
    router.push(`/museums/${id}`);
  };

  const handleShowAll = () => {
    setMuseumList("Nearby", sortedMuseums);
    router.push("/museums");
  };

  const handleRefresh = async () => {
    if (coords) {
      await refetchMuseums();
    }
  };

  const sortedMuseums = useMemo(() => {
    if (!coords || !museums.length) return museums;

    return museums
      .map((museum) => {
        const museumCoords = museum.geometry?.location
          ? {
              latitude: museum.geometry.location.lat,
              longitude: museum.geometry.location.lng,
            }
          : null;

        const rawDistance = museumCoords
          ? calculateRawDistance(coords, museumCoords)
          : Infinity;

        return {
          ...museum,
          rawDistance,
        };
      })
      .sort((a, b) => a.rawDistance - b.rawDistance)
      .map(({ rawDistance, ...museum }) => museum);
  }, [coords, museums]);

  const renderMainContent = () => {
    if (museumsLoading || isLocationLoading) {
      return (
        <View className="flex-1 items-center justify-center min-h-[400px]">
          <ActivityIndicator size="large" color={Colors.Primary} />
        </View>
      );
    }

    return (
      <View className="flex-1 mt-4">
        <MuseumRowList
          title="Nearby"
          museums={sortedMuseums.slice(0, 5)}
          onCardPress={(id) => handleGoToMuseum(id)}
          onShowAll={handleShowAll}
        />
      </View>
    );
  };

  const headerComponent = (
    <DiscoveryHeader
      place="Philadelphia, USA"
      onLocationPress={handleLocationPress}
      onChatPress={() => {}}
      onBellPress={() => {}}
    />
  );

  return (
    <AnimatedHeaderWrapper
      title="Musez"
      headerComponent={headerComponent}
      scrollThreshold={80}
      blurIntensity={80}
      blurType="light"
    >
      {renderMainContent()}
    </AnimatedHeaderWrapper>
  );
};

export default DiscoveryView;
