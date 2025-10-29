import { View, Text, FlatList, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { MuseumDetails } from "@/types";
import MuseumOverviewCard from "@/modules/discovery/ui/components/MuseumOverviewCard";

const FavoriteView = () => {
  const [museums, setMuseums] = useState<MuseumDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const savedMuseumIds = useQuery(api.function.museums.getSavedMuseumIds, {
    userId: "1234",
  });

  useEffect(() => {
    if (!savedMuseumIds || savedMuseumIds.length === 0) return;

    const fetchMuseumDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        // Extract just the museumId values
        const placeIds = savedMuseumIds.map((item) => item.museumId);

        console.log("Fetching details for place IDs:", placeIds);

        // Call your API
        const response = await fetch("/api/museum-ids", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ placeIds }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to fetch museums");
        }

        console.log("Fetched museum details:", data.data);
        setMuseums(data.data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        console.error("Error fetching museum details:", errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchMuseumDetails();
  }, [savedMuseumIds]);

  if (!savedMuseumIds) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
        <Text className="mt-2">Loading saved museums...</Text>
      </View>
    );
  }

  if (savedMuseumIds.length === 0) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-lg font-semibold text-gray-600">
          No saved museums yet
        </Text>
        <Text className="text-gray-500 text-center mt-2">
          Start exploring and save museums you want to visit!
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
        <Text className="mt-2">Fetching museum details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 text-center">
          Error loading museums: {error}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-900">Saved Museums</Text>
        <Text className="text-gray-600 mt-1">
          {museums.length} museum{museums.length !== 1 ? "s" : ""} saved
        </Text>
      </View>

      <FlatList
        data={museums}
        keyExtractor={(item) => item.placeId}
        renderItem={({ item }) => <MuseumOverviewCard museum={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

export default FavoriteView;
