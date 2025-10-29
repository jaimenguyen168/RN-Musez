import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface OpeningHoursProps {
  weekdayText: string[];
  showTitle?: boolean;
  iconColor?: string;
}

const OpeningHours = ({
  weekdayText,
  showTitle = true,
  iconColor = "#6366F1",
}: OpeningHoursProps) => {
  if (!weekdayText || weekdayText.length === 0) {
    return null;
  }

  return (
    <View className="p-6">
      {showTitle && (
        <View className="flex-row items-center mb-4">
          <Ionicons name="time" size={20} color={iconColor} />
          <Text className="text-lg font-semibold ml-2 text-gray-900">
            Opening Hours
          </Text>
        </View>
      )}

      <View className="bg-gray-50 rounded-xl pb-4 px-6">
        {weekdayText.map((day, index) => {
          const [dayName, ...timeParts] = day.split(": ");
          const timeText = timeParts.join(": ");

          return (
            <View
              key={index}
              className="flex-row justify-between items-center pt-4 border-b border-gray-200 last:border-b-0"
            >
              <Text className="text-base font-medium text-gray-900">
                {dayName}
              </Text>
              <Text className="text-base text-gray-600 font-medium">
                {timeText || "Closed"}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};
export default OpeningHours;
