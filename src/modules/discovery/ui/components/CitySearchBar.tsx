import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Text,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PlacesSuggestion {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface PlacesResponse {
  predictions: PlacesSuggestion[];
  status: string;
}

interface CitySearchBarProps {
  onLocationSelect: (coords: { latitude: number; longitude: number }) => void;
  onClose: () => void;
}

const CitySearchBar = ({ onLocationSelect, onClose }: CitySearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlacesSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingDetails, setIsGettingDetails] = useState(false);

  // Debounced search for place suggestions
  useEffect(() => {
    if (searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchPlaces(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const searchPlaces = async (query: string) => {
    try {
      setIsSearching(true);
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          query,
        )}&types=(cities)&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`,
      );

      const data: PlacesResponse = await response.json();

      if (data.status === "OK") {
        setSuggestions(data.predictions);
      } else {
        console.error("Places API error:", data.status);
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error searching places:", error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const getPlaceDetails = async (placeId: string) => {
    try {
      setIsGettingDetails(true);
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`,
      );

      const data = await response.json();

      if (data.status === "OK" && data.result?.geometry?.location) {
        const { lat, lng } = data.result.geometry.location;
        onLocationSelect({ latitude: lat, longitude: lng });
        setSuggestions([]);
        setSearchQuery("");
        onClose();
      }
    } catch (error) {
      console.error("Error getting place details:", error);
      Alert.alert("Error", "Failed to get location details");
    } finally {
      setIsGettingDetails(false);
    }
  };

  const handleSuggestionPress = (suggestion: PlacesSuggestion) => {
    getPlaceDetails(suggestion.place_id);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSuggestions([]);
  };

  return (
    <View>
      {/* Search Input */}
      <View className="rounded-2xl px-4 py-3 flex-row items-center bg-card border border-soft mb-2">
        <Ionicons name="search" size={20} color="#6B7280" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search for a city..."
          placeholderTextColor="#9CA3AF"
          className="flex-1 ml-3 text-main text-base"
          autoFocus={true}
          autoCapitalize="words"
          autoCorrect={false}
          editable={!isGettingDetails}
        />
        {(isSearching || isGettingDetails) && (
          <ActivityIndicator size="small" color="#6B7280" />
        )}
        {searchQuery.length > 0 && !isSearching && !isGettingDetails && (
          <TouchableOpacity onPress={handleClearSearch} className="ml-2">
            <Ionicons name="close-circle" size={20} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Suggestions List */}
      {suggestions.length > 0 && !isGettingDetails && (
        <View className="bg-card border border-soft rounded-2xl max-h-60">
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSuggestionPress(item)}
                className="px-4 py-3 border-b border-divider last:border-b-0"
                disabled={isGettingDetails}
              >
                <Text className="text-main font-medium">
                  {item.structured_formatting.main_text}
                </Text>
                <Text className="text-secondary text-sm">
                  {item.structured_formatting.secondary_text}
                </Text>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          />
        </View>
      )}

      {isGettingDetails && (
        <View className="bg-card border border-soft rounded-2xl p-4 flex-row items-center justify-center">
          <ActivityIndicator size="small" color="#6B7280" className="mr-2" />
          <Text className="text-secondary">Getting location details...</Text>
        </View>
      )}
    </View>
  );
};

export default CitySearchBar;
