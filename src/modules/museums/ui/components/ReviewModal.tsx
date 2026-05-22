import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useTheme } from "@/provider/ThemeProvider";

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  museumId: string;
  museumName: string;
}

const STAR_COUNT = 5;

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

const ReviewModal = ({
  visible,
  onClose,
  museumId,
  museumName,
}: ReviewModalProps) => {
  const { isDark } = useTheme();

  const existingReview = useQuery(
    api.function.reviews.getUserReviewForMuseum,
    visible ? { museumId } : "skip",
  );

  const addReview = useMutation(api.function.reviews.addReview);
  const deleteReview = useMutation(api.function.reviews.deleteReview);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pre-fill when editing an existing review
  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment ?? "");
    } else if (existingReview === null) {
      setRating(0);
      setComment("");
    }
  }, [existingReview]);

  const isEditing = !!existingReview;
  const canSubmit = rating > 0 && !isSubmitting && !isDeleting;

  const handleClose = () => {
    if (isSubmitting || isDeleting) return;
    onClose();
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      await addReview({
        museumId,
        rating,
        comment: comment.trim() || undefined,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting || isSubmitting) return;
    setIsDeleting(true);
    try {
      await deleteReview({ museumId });
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={30}
      >
        <ScrollView
          className="flex-1 bg-white dark:bg-gray-900"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-6 pt-12 pb-10 flex-1">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-lg font-semibold text-main">
                {isEditing ? "Edit Review" : "Write a Review"}
              </Text>
              <TouchableOpacity
                onPress={handleClose}
                disabled={isSubmitting || isDeleting}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={
                    isSubmitting || isDeleting
                      ? "#ccc"
                      : isDark
                        ? "#9CA3AF"
                        : "#666"
                  }
                />
              </TouchableOpacity>
            </View>

            {/* Museum name */}
            <Text
              className="text-base text-secondary mb-8 text-center"
              numberOfLines={2}
            >
              {museumName}
            </Text>

            {/* Star selector */}
            <View className="items-center mb-3">
              <View className="flex-row gap-3 mb-2">
                {Array.from({ length: STAR_COUNT }, (_, i) => i + 1).map(
                  (star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setRating(star)}
                      disabled={isSubmitting || isDeleting}
                      hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                    >
                      <Ionicons
                        name={star <= rating ? "star" : "star-outline"}
                        size={44}
                        color={star <= rating ? "#F59E0B" : isDark ? "#4B5563" : "#D1D5DB"}
                      />
                    </TouchableOpacity>
                  ),
                )}
              </View>
              <Text className="text-sm font-medium text-secondary h-5">
                {rating > 0 ? RATING_LABELS[rating] : "Tap to rate"}
              </Text>
            </View>

            {/* Comment input */}
            <View className="mb-6 mt-4">
              <Text className="text-base font-medium text-main mb-2">
                Your review{" "}
                <Text className="text-secondary font-normal">(optional)</Text>
              </Text>
              <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder="Share your experience..."
                placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                maxLength={500}
                editable={!isSubmitting && !isDeleting}
                className="border border-soft rounded-xl p-4 text-base text-main bg-surface"
                style={{ minHeight: 120 }}
              />
              <Text className="text-xs text-secondary mt-1 text-right">
                {comment.length}/500
              </Text>
            </View>

            <View className="gap-3 mt-auto">
              {/* Submit */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!canSubmit}
                className={`py-4 rounded-xl items-center ${
                  canSubmit ? "bg-indigo-500" : "bg-gray-300 dark:bg-gray-700"
                }`}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold text-base">
                    {isEditing ? "Update Review" : "Submit Review"}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Delete (only if editing) */}
              {isEditing && (
                <TouchableOpacity
                  onPress={handleDelete}
                  disabled={isDeleting || isSubmitting}
                  className="py-4 rounded-xl items-center border border-red-400"
                >
                  {isDeleting ? (
                    <ActivityIndicator color="#EF4444" />
                  ) : (
                    <Text className="text-red-500 font-semibold text-base">
                      Delete Review
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ReviewModal;
