import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTheme } from "@/provider/ThemeProvider";

interface FAQItemProps {
  question: string;
  answer: string;
  index: number;
  isExpanded: boolean;
  onToggle: (index: number) => void;
}

const FAQItem = ({
  question,
  answer,
  index,
  isExpanded,
  onToggle,
}: FAQItemProps) => {
  const { isDark } = useTheme();
  const chevronColor = isDark ? "#9CA3AF" : "#6B7280";

  return (
    <View className="mb-3">
      <TouchableOpacity
        onPress={() => onToggle(index)}
        className="flex-row items-center justify-between p-4 bg-card rounded-2xl"
        activeOpacity={0.7}
      >
        <Text className="text-base font-medium text-main flex-1 mr-3">
          {question}
        </Text>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={chevronColor}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View className="mt-2 p-4 bg-surface rounded-2xl">
          <Text className="text-sm text-secondary leading-6">{answer}</Text>
        </View>
      )}
    </View>
  );
};

export default FAQItem;
