import { View, Text, TouchableOpacity, TextInput } from "react-native";
import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useOrganicTheme } from "@/constants/organicTheme";

interface MuseumReviewComposerProps {
  museumId: string;
}

const RATING_LABELS = ["Tap a star to rate", "Poor", "Fair", "Good", "Very Good", "Excellent"];

const MuseumReviewComposer = ({ museumId }: MuseumReviewComposerProps) => {
  const c = useOrganicTheme();
  const existingReview = useQuery(api.function.reviews.getUserReviewForMuseum, { museumId });
  const addReview = useMutation(api.function.reviews.addReview);
  const deleteReview = useMutation(api.function.reviews.deleteReview);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment ?? "");
    }
  }, [existingReview]);

  const showForm = !existingReview || editing;

  const handlePost = async () => {
    if (rating === 0 || submitting) return;
    setSubmitting(true);
    try {
      await addReview({ museumId, rating, comment: comment.trim() || undefined });
      setEditing(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    await deleteReview({ museumId });
    setRating(0);
    setComment("");
    setEditing(false);
  };

  if (!showForm && existingReview) {
    const stars = "★".repeat(existingReview.rating) + "☆".repeat(5 - existingReview.rating);
    return (
      <View className="bg-organic-accent-soft rounded-2xl p-3.5 gap-1.5">
        <Text className="font-figtree-bold text-organic-accent-strong text-[11px] tracking-wide uppercase">
          Your review
        </Text>
        <Text className="text-organic-accent text-[15px] tracking-[2px]">{stars}</Text>
        {!!existingReview.comment && (
          <Text className="font-figtree text-organic text-[13.5px] leading-[19px]">{existingReview.comment}</Text>
        )}
        <View className="flex-row gap-3.5 mt-0.5">
          <TouchableOpacity onPress={() => setEditing(true)}>
            <Text className="font-figtree-bold text-organic-accent-strong text-[13px]">Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete}>
            <Text className="font-figtree-bold text-organic-muted text-[13px]">Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-organic-surface rounded-2xl p-3.5 gap-2">
      <Text className="font-figtree-bold text-organic text-sm">Been here? Rate your visit</Text>
      <View className="flex-row items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity key={n} onPress={() => setRating(n)} hitSlop={4} className="px-0.5">
            <Text className={`text-[30px] leading-[34px] ${n <= rating ? "text-organic-accent" : "text-organic-faint"}`}>
              {n <= rating ? "★" : "☆"}
            </Text>
          </TouchableOpacity>
        ))}
        <Text className="font-figtree text-organic-muted text-[12.5px] ml-1.5">{RATING_LABELS[rating]}</Text>
      </View>
      <TextInput
        value={comment}
        onChangeText={setComment}
        placeholder="Anything future visitors should know? (optional)"
        placeholderTextColor={c.textFaint}
        multiline
        numberOfLines={3}
        maxLength={500}
        textAlignVertical="top"
        className="font-figtree border border-organic-divider rounded-lg bg-organic-surface-alt p-2.5 text-organic text-[13.5px] min-h-[72px]"
      />
      <TouchableOpacity
        onPress={handlePost}
        disabled={rating === 0 || submitting}
        className={`self-end py-2.5 px-[22px] rounded-full ${rating > 0 ? "bg-organic-accent" : "bg-organic-faint"}`}
      >
        <Text className="font-heading text-organic-accent-soft text-[13.5px]">
          {existingReview ? "Update review" : "Post review"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default MuseumReviewComposer;
