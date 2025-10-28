import { ActivityIndicator, View, Alert } from "react-native";
import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import DiscoveryHeader from "@/modules/discovery/ui/components/DiscoveryHeader";
import MuseumRowList from "@/modules/discovery/ui/components/MuseumRowList";
import { Colors } from "@/constants/colors";
import { useLocationManager } from "@/hooks/useLocationManager";
import AnimatedHeaderWrapper from "@/components/AnimatedHeaderWrapper";
import { useMuseumsQuery } from "@/hooks/useMuseumsQuery";

const DiscoveryView = () => {
  const router = useRouter();

  const {
    coords,
    isLoading: isLocationLoading,
    error: locationError,
  } = useLocationManager(true);

  // Prepare params for the museum query
  const museumsParams = coords
    ? {
        latitude: coords.latitude,
        longitude: coords.longitude,
      }
    : null;

  const {
    data: museums = [],
    isLoading: museumsLoading,
    error: museumsError,
    refetch: refetchMuseums,
    isFetching,
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
    router.push("/museums");
  };

  const handleRefresh = async () => {
    if (coords) {
      await refetchMuseums();
    }
  };

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
          museums={museums}
          onCardPress={(id) => handleGoToMuseum(id)}
          onFavoritePress={(id) => {}}
          favoriteMuseumIds={[]}
          onShowAll={handleShowAll}
          userLocation={coords || undefined}
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
