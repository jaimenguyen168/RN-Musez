import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AnimatedHeaderWrapper from "@/components/AnimatedHeaderWrapper";

const SnapHeader = ({
  onPlusPress,
  showPlusButton,
}: {
  onPlusPress: () => void;
  showPlusButton: boolean;
}) => {
  return (
    <View className="flex-row items-center justify-between px-6 py-4">
      {/* Title */}
      <View className="flex-1">
        <Text className="text-2xl font-bold text-gray-900">Explore</Text>
        <Text className="text-sm text-gray-600 mt-1">
          Snap and discover art pieces
        </Text>
      </View>

      {/* Plus Button - only show when there's scrollable content */}
      {showPlusButton && (
        <TouchableOpacity onPress={onPlusPress} className="p-3">
          <Ionicons name="add" size={24} color="#374151" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const ItemsList = ({ items }: { items: any[] }) => {
  return (
    <View className="py-4 flex-1">
      {/* Main Content Card */}
      <View className="mx-4 bg-white rounded-3xl shadow-lg overflow-hidden">
        <View className="p-6">
          <Text className="text-2xl font-bold text-gray-900 mb-6">
            Your Art Collection
          </Text>

          {items.map((item, index) => (
            <TouchableOpacity
              key={index}
              className="bg-gray-50 p-4 rounded-2xl mb-4 border border-gray-100"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="font-semibold text-lg text-gray-900 mb-1">
                    {item.title}
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    {item.description || "Art piece information"}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bottom Spacing */}
      <View className="h-8" />
    </View>
  );
};

export default function SnapScreen() {
  // Empty array of snapped items
  const snappedItems: any[] = [1, 2];

  const handlePlusPress = () => {
    console.log("Plus button pressed");
  };

  const handleSnapPress = () => {
    console.log("Snap button pressed");
  };

  // If empty, show static non-scrollable view
  if (snappedItems.length === 0) {
    return (
      <View className="flex-1 pt-14 pb-48">
        <SnapHeader onPlusPress={handlePlusPress} showPlusButton={false} />
        {/* Main Content Card */}
        <View className="flex-1 justify-center px-4">
          <View className="bg-white rounded-3xl shadow-lg overflow-hidden">
            <View className="p-8 items-center justify-center min-h-[400px]">
              <TouchableOpacity
                onPress={handleSnapPress}
                className="items-center justify-center w-32 h-32 rounded-full border-2 border-dashed border-indigo-300 mb-8"
              >
                <Ionicons name="camera" size={48} color="#6366F1" />
              </TouchableOpacity>

              <Text className="text-2xl font-bold text-gray-900 mb-4 text-center">
                Start Your Art Journey
              </Text>

              <Text className="text-base text-gray-600 text-center leading-6 mb-8 max-w-sm">
                Snap a photo of any art piece to get detailed information,
                history, and insights about the artwork.
              </Text>

              <TouchableOpacity
                onPress={handleSnapPress}
                className="bg-indigo-500 px-8 py-4 rounded-full shadow-md"
                style={{ elevation: 3 }}
              >
                <Text className="text-white font-semibold text-lg">
                  Take Your First Snap
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // If has items, show scrollable view with animated header
  const headerComponent = (
    <SnapHeader onPlusPress={handlePlusPress} showPlusButton={true} />
  );

  return (
    <AnimatedHeaderWrapper
      title="Explore"
      headerComponent={headerComponent}
      scrollThreshold={80}
      blurIntensity={80}
      blurType="light"
      backgroundColor="bg-secondary"
    >
      <ItemsList items={snappedItems} />
    </AnimatedHeaderWrapper>
  );
}
