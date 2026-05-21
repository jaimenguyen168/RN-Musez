import React from "react";
import { View, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Review {
  authorName: string;
  rating: number;
  text: string;
  relativeTimeDescription: string;
  userAvatar?: string | null;
}

interface ReviewsProps {
  reviews: Review[];
  maxReviews?: number;
  showTitle?: boolean;
  title?: string;
  iconColor?: string;
  cardWidth?: number;
}

const Reviews = ({
  reviews,
  maxReviews = 5,
  showTitle = true,
  title = "Recent Reviews",
  iconColor = "#6366F1",
  cardWidth = 320,
}: ReviewsProps) => {
  const displayReviews = (reviews ?? []).slice(0, maxReviews);

  return (
    <View className="p-6">
      {showTitle && (
        <View className="flex-row items-center mb-4">
          <Ionicons name="chatbubbles" size={20} color={iconColor} />
          <Text className="text-lg font-semibold ml-2 text-main">{title}</Text>
        </View>
      )}

      {displayReviews.length === 0 ? (
        <View className="bg-surface rounded-2xl p-6 items-center border border-soft">
          <Ionicons name="chatbubble-outline" size={32} color="#9CA3AF" />
          <Text className="text-base font-semibold text-main mt-3">
            No reviews yet
          </Text>
          <Text className="text-sm text-secondary mt-1 text-center">
            Be the first to review this museum
          </Text>
        </View>
      ) : (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {displayReviews.map((review, index) => (
          <View
            key={index}
            className="bg-surface p-5 rounded-2xl mr-4 border border-soft"
            style={{
              width: cardWidth,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <Text
                className="text-base font-semibold flex-1 text-main"
                numberOfLines={1}
              >
                {review.authorName}
              </Text>
              <View className="flex-row items-center ml-2 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full">
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text className="text-sm font-medium text-amber-700 dark:text-amber-300 ml-1">
                  {review.rating}
                </Text>
              </View>
            </View>
            <Text
              className="text-sm leading-6 text-secondary mb-3"
              numberOfLines={4}
            >
              {review.text}
            </Text>
            <Text className="text-xs text-secondary font-medium opacity-75">
              {review.relativeTimeDescription}
            </Text>
          </View>
        ))}
      </ScrollView>
      )}
    </View>
  );
};

export default Reviews;
