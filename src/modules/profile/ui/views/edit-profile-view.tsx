import React, { useEffect, useRef, useState } from "react";
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { z } from "zod";
import ImagePicker, { ImageAsset } from "@/components/ImagePicker";
import { useSignUpFormValidation } from "@/modules/auth/schemas/validator";
import { useTheme } from "@/provider/ThemeProvider";
import { useOrganicTheme } from "@/constants/organicTheme";
import { useImageUpload } from "@/hooks/useImageUpload";

const profileSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be less than 50 characters"),
});

const USERNAME_MAX = 50;

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter((w) => /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("") || name.slice(0, 2).toUpperCase();

const EditProfileView = () => {
  const router = useRouter();
  const { isDark } = useTheme();
  const c = useOrganicTheme();
  const insets = useSafeAreaInsets();
  const user = useQuery(api.function.users.getCurrentUser);
  const updateProfile = useMutation(api.function.users.updateUserProfile);
  const { uploadImageToConvex } = useImageUpload();

  const { errors, validateForm, clearFieldError } = useSignUpFormValidation(profileSchema);

  const [username, setUsername] = useState("");
  const [selectedProfileImage, setSelectedProfileImage] = useState<ImageAsset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedNote, setSavedNote] = useState(false);
  const savedNoteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (user) setUsername(user.username || "");
  }, [user]);

  useEffect(() => {
    return () => {
      if (savedNoteTimer.current) clearTimeout(savedNoteTimer.current);
    };
  }, []);

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    clearFieldError("username");
  };

  const handleImageSelected = (image: ImageAsset) => setSelectedProfileImage(image);
  const handleImageError = (error: string) => Alert.alert("Error", `Failed to select image: ${error}`);

  const hasChanges = username.trim() !== (user?.username ?? "") || selectedProfileImage !== null;

  const handleDiscard = () => {
    setUsername(user?.username || "");
    setSelectedProfileImage(null);
    clearFieldError("username");
  };

  const handleSave = async () => {
    if (!hasChanges || isLoading) return;

    const usernameChanged = username.trim() !== (user?.username ?? "");
    if (usernameChanged && !validateForm({ username: username.trim() })) return;

    setIsLoading(true);
    try {
      const updateData: { username?: string; imageUrl?: string } = {};
      if (usernameChanged) updateData.username = username.trim();
      if (selectedProfileImage) updateData.imageUrl = await uploadImageToConvex(selectedProfileImage.uri);

      await updateProfile(updateData);

      setSelectedProfileImage(null);
      setSavedNote(true);
      if (savedNoteTimer.current) clearTimeout(savedNoteTimer.current);
      savedNoteTimer.current = setTimeout(() => setSavedNote(false), 2200);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <View className="flex-1 bg-organic">
        <StatusBar style={isDark ? "light" : "dark"} />
      </View>
    );
  }

  const displayProfileImageUri = selectedProfileImage?.uri || user.imageUrl;

  return (
    <View className="flex-1 bg-organic">
      <StatusBar style={isDark ? "light" : "dark"} />

      <View className="px-5 flex-row items-center gap-3" style={{ paddingTop: insets.top + 8, paddingBottom: 8 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-[38px] h-[38px] rounded-full items-center justify-center bg-organic-surface border border-organic-divider"
        >
          <Ionicons name="chevron-back" size={19} color={c.text} />
        </TouchableOpacity>
        <Text className="font-heading text-organic text-2xl leading-6">Edit profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="gap-5">
          <ImagePicker onImageSelected={handleImageSelected} onError={handleImageError} quality={0.8} allowsEditing>
            {({ selectImage }) => (
              <View className="items-center gap-2.5">
                <TouchableOpacity onPress={selectImage} className="relative">
                  <View
                    className="w-[104px] h-[104px] rounded-full overflow-hidden items-center justify-center"
                    style={{ backgroundColor: "#8c491a" }}
                  >
                    {displayProfileImageUri ? (
                      <Image source={{ uri: displayProfileImageUri }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                      <Text className="font-heading text-4xl" style={{ color: "#ffe1d0" }}>
                        {initialsOf(user.username)}
                      </Text>
                    )}
                  </View>
                  <View className="absolute -right-0.5 -bottom-0.5 w-[34px] h-[34px] rounded-full bg-organic items-center justify-center border-2 border-organic-surface">
                    <Ionicons name="camera-outline" size={16} color={c.accent} />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={selectImage}>
                  <Text className="font-heading text-organic-accent text-sm">
                    {selectedProfileImage ? "Photo selected" : "Change photo"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ImagePicker>

          <View className="px-5 gap-3.5">
            <View className="gap-1.5">
              <Text className="font-figtree-bold text-organic-muted text-[11.5px] tracking-[0.8px] uppercase">
                Username
              </Text>
              <TextInput
                value={username}
                onChangeText={handleUsernameChange}
                maxLength={USERNAME_MAX}
                placeholder="Your name"
                placeholderTextColor={c.textFaint}
                className="border border-organic-divider bg-organic-surface rounded-full px-4 py-3.5 font-figtree text-organic text-[15px]"
              />
              <View className="flex-row justify-between">
                <Text className="font-figtree text-organic-muted text-[11.5px]">Shown on your reviews.</Text>
                <Text className="font-figtree text-organic-muted text-[11.5px]">
                  {username.length}/{USERNAME_MAX}
                </Text>
              </View>
              {errors.username && (
                <Text className="font-figtree text-organic-status-closed text-xs">{errors.username}</Text>
              )}
            </View>

            <View className="gap-1.5">
              <Text className="font-figtree-bold text-organic-muted text-[11.5px] tracking-[0.8px] uppercase">
                Email
              </Text>
              <View className="bg-organic-surface-alt rounded-full px-4 py-3.5 flex-row items-center gap-2.5">
                <Text className="flex-1 font-figtree text-organic-muted text-[15px]" numberOfLines={1}>
                  {user.email}
                </Text>
                <Ionicons name="lock-closed-outline" size={15} color={c.textFaint} />
              </View>
              <Text className="font-figtree text-organic-muted text-[11.5px]">
                Your email can&apos;t be changed here. Contact support if you need it moved.
              </Text>
            </View>
          </View>

          <View className="px-5 gap-2">
            <TouchableOpacity
              onPress={handleSave}
              disabled={!hasChanges || isLoading}
              className={`py-4 rounded-full items-center ${hasChanges && !isLoading ? "bg-organic-accent" : "bg-organic-faint"}`}
            >
              <Text
                className={`font-heading text-[15.5px] ${hasChanges && !isLoading ? "text-organic-accent-soft" : "text-organic-muted"}`}
              >
                {isLoading ? "Saving…" : "Save changes"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDiscard} disabled={!hasChanges || isLoading} className="py-3 items-center">
              <Text className="font-heading text-organic-muted text-[13.5px]">Discard</Text>
            </TouchableOpacity>
            {savedNote && (
              <Text className="font-figtree-bold text-organic-status-open text-[12.5px] text-center">
                Profile updated ✓
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default EditProfileView;
