import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { z } from "zod";
import FormField from "@/modules/auth/ui/components/FormField";
import AppButton from "@/components/AppButton";
import BlurNavigationHeader from "@/components/BlurNavigationHeader";
import BackButton from "@/components/BackButton";
import ImagePicker, { ImageAsset } from "@/components/ImagePicker";
import { useSignUpFormValidation } from "@/modules/auth/schemas/validator";
import { useTheme } from "@/provider/ThemeProvider";
import { useImageUpload } from "@/hooks/useImageUpload";

const profileSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be less than 50 characters"),
});

interface EditableField {
  username: boolean;
}

const EditProfileView = () => {
  const router = useRouter();
  const { isDark } = useTheme();
  const user = useQuery(api.function.users.getCurrentUser);
  const updateProfile = useMutation(api.function.users.updateUserProfile);
  const { uploadImageToConvex } = useImageUpload();

  const { errors, validateForm, clearFieldError } =
    useSignUpFormValidation(profileSchema);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });

  const [editableFields, setEditableFields] = useState<EditableField>({
    username: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [selectedProfileImage, setSelectedProfileImage] =
    useState<ImageAsset | null>(null);
  const [selectedCoverImage, setSelectedCoverImage] =
    useState<ImageAsset | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleUsernameChange = (value: string) => {
    setFormData((prev) => ({ ...prev, username: value }));
    clearFieldError("username");
  };

  const handleProfileImageSelected = (image: ImageAsset) => {
    setSelectedProfileImage(image);
  };

  const handleCoverImageSelected = (image: ImageAsset) => {
    setSelectedCoverImage(image);
  };

  const handleImageError = (error: string) => {
    Alert.alert("Error", `Failed to select image: ${error}`);
  };

  const toggleFieldEdit = (field: keyof EditableField) => {
    setEditableFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));

    // If disabling edit mode, reset the field to original value
    if (editableFields[field] && user) {
      if (field === "username") {
        setFormData((prev) => ({ ...prev, username: user.username || "" }));
        clearFieldError("username");
      }
    }
  };

  const uploadImageToStorage = async (image: ImageAsset): Promise<string> => {
    try {
      return await uploadImageToConvex(image.uri);
    } catch (error) {
      console.error("Error uploading image to storage:", error);
      throw new Error("Failed to upload image to storage");
    }
  };

  const handleSave = async () => {
    const hasProfileChanges =
      (editableFields.username &&
        formData.username.trim() !== user?.username) ||
      selectedProfileImage !== null ||
      selectedCoverImage !== null;

    if (!hasProfileChanges) {
      Alert.alert("No Changes", "Please make some changes before saving.");
      return;
    }

    if (editableFields.username) {
      if (
        !validateForm({
          username: formData.username.trim(),
        })
      ) {
        return;
      }
    }

    setIsLoading(true);
    try {
      const updateData: {
        username?: string;
        imageUrl?: string;
        coverImageUrl?: string;
      } = {};

      if (
        editableFields.username &&
        formData.username.trim() !== user?.username
      ) {
        updateData.username = formData.username.trim();
      }

      if (selectedProfileImage) {
        updateData.imageUrl = await uploadImageToStorage(selectedProfileImage);
      }

      if (selectedCoverImage) {
        updateData.coverImageUrl =
          await uploadImageToStorage(selectedCoverImage);
      }

      await updateProfile(updateData);

      Alert.alert("Success", "Profile updated successfully!");

      setEditableFields({
        username: false,
      });
      setSelectedProfileImage(null);
      setSelectedCoverImage(null);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Failed to update profile. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const hasChanges =
    editableFields.username ||
    selectedProfileImage !== null ||
    selectedCoverImage !== null;

  const displayProfileImageUri = selectedProfileImage?.uri || user.imageUrl;
  const displayCoverImageUri = selectedCoverImage?.uri || user.coverImageUrl;

  return (
    <View className="flex-1 bg-app">
      {/* Blur Navigation Header */}
      <BlurNavigationHeader
        title="Edit Profile"
        leftComponent={<BackButton onPress={() => router.back()} />}
        blurType={isDark ? "dark" : "light"}
        statusBarStyle={isDark ? "light" : "dark"}
      />

      <ScrollView
        className="flex-1 bg-app"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 100 }}
      >
        {/* Cover Image Section */}
        <View className="relative h-48 bg-gray-200 dark:bg-gray-800">
          {displayCoverImageUri ? (
            <Image
              source={{ uri: displayCoverImageUri }}
              className="w-full h-48"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-48 bg-gradient-to-b from-primary-400 to-primary-600 items-center justify-center">
              <Ionicons name="image-outline" size={48} color="white" />
              <Text className="text-white mt-2 font-medium">
                Add Cover Photo
              </Text>
            </View>
          )}

          {/* Cover Image Edit Button */}
          <View className="absolute bottom-4 right-4">
            <ImagePicker
              onImageSelected={handleCoverImageSelected}
              onError={handleImageError}
              quality={0.8}
              allowsEditing={true}
            >
              {({ selectImage }) => (
                <TouchableOpacity
                  onPress={selectImage}
                  className="bg-black/50 p-3 rounded-full"
                >
                  <Ionicons name="camera" size={20} color="white" />
                </TouchableOpacity>
              )}
            </ImagePicker>
          </View>

          {/* Cover Image Change Indicator */}
          {selectedCoverImage && (
            <View className="absolute top-4 right-4 w-6 h-6 bg-green-500 rounded-full items-center justify-center">
              <Ionicons name="checkmark" size={14} color="white" />
            </View>
          )}
        </View>

        {/* Profile Photo Section */}
        <View className="items-center -mt-16 pb-8">
          <View className="relative">
            <View className="w-32 h-32 rounded-full bg-primary-600/40 items-center justify-center overflow-hidden border-4 border-white dark:border-gray-900">
              <Image
                source={{ uri: displayProfileImageUri }}
                className="w-32 h-32 rounded-full"
                resizeMode="cover"
              />
            </View>
            {/* Show indicator if image is changed */}
            {selectedProfileImage && (
              <View className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full items-center justify-center">
                <Ionicons name="checkmark" size={14} color="white" />
              </View>
            )}
          </View>

          <ImagePicker
            onImageSelected={handleProfileImageSelected}
            onError={handleImageError}
            quality={0.8}
            allowsEditing={true}
          >
            {({ selectImage }) => (
              <TouchableOpacity
                onPress={selectImage}
                className="mt-4 px-6 py-3 bg-card border border-gray-200 dark:border-gray-700 rounded-xl"
              >
                <Text className="text-gray-700 dark:text-gray-300 font-semibold">
                  Edit Photo
                </Text>
              </TouchableOpacity>
            )}
          </ImagePicker>
        </View>

        {/* Form Fields */}
        <View className="px-6 py-6">
          {/* Username Field */}
          <View className="mb-8">
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                Username
              </Text>
              <TouchableOpacity
                onPress={() => toggleFieldEdit("username")}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={editableFields.username ? "checkmark" : "pencil"}
                  size={18}
                  color={editableFields.username ? "#10B981" : "#9CA3AF"}
                />
              </TouchableOpacity>
            </View>
            <FormField
              label=""
              value={formData.username}
              onChangeText={handleUsernameChange}
              placeholder="Enter your username"
              editable={editableFields.username}
              containerClassName="mb-0"
              labelClassName="hidden"
              inputClassName={`py-4 font-medium ${
                editableFields.username
                  ? "text-main bg-card border px-3 border-soft rounded-2xl mt-2"
                  : "text-gray-500 dark:text-gray-400 border-0 px-0 "
              }`}
              error={errors.username}
            />
          </View>

          {/* Email Field (Read-only) */}
          <View className="mb-8">
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-600 dark:text-gray-400 text-sm">
                Email
              </Text>
            </View>
            <FormField
              label=""
              value={formData.email}
              onChangeText={() => {}}
              placeholder="Email address"
              editable={false}
              containerClassName="mb-0"
              labelClassName="hidden"
              inputClassName="bg-app border-0 px-0 py-3 font-medium text-gray-400 dark:text-gray-600"
            />
            <Text className="text-gray-400 dark:text-gray-500 text-xs mt-1">
              Email cannot be changed
            </Text>
          </View>
        </View>

        {/* Save Button - Only show when there are changes */}
        {hasChanges && (
          <View className="px-6 py-8">
            <AppButton onPress={handleSave} disabled={isLoading}>
              <Text className="text-white text-lg font-semibold text-center">
                {isLoading ? "Saving..." : "Save Changes"}
              </Text>
            </AppButton>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default EditProfileView;
