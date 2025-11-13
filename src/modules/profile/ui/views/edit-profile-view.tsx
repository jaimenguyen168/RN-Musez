import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { z } from "zod";
import FormField from "@/modules/auth/ui/components/FormField";
import AppButton from "@/components/AppButton";
import BlurNavigationHeader from "@/components/BlurNavigationHeader";
import BackButton from "@/components/BackButton";
import ImagePicker, { ImageAsset } from "@/components/ImagePicker";
import { useSignUpFormValidation } from "@/modules/auth/schemas/validator";

const profileSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be less than 50 characters"),
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 8, {
      message: "Password must be at least 8 characters when provided",
    }),
});

interface EditableField {
  username: boolean;
  password: boolean;
}

const EditProfileView = () => {
  const router = useRouter();
  const user = useQuery(api.function.users.getCurrentUser);
  const { errors, validateForm, clearFieldError } =
    useSignUpFormValidation(profileSchema);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [editableFields, setEditableFields] = useState<EditableField>({
    username: false,
    password: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProfileImage, setSelectedProfileImage] =
    useState<ImageAsset | null>(null);

  // Initialize form data when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        password: "",
      });
    }
  }, [user]);

  const handleUsernameChange = (value: string) => {
    setFormData((prev) => ({ ...prev, username: value }));
    clearFieldError("username");
  };

  const handlePasswordChange = (value: string) => {
    setFormData((prev) => ({ ...prev, password: value }));
    clearFieldError("password");
  };

  const handleProfileImageSelected = (image: ImageAsset) => {
    setSelectedProfileImage(image);
    // You can immediately upload the image here or wait until save
    // For now, we'll just store it locally until save
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
      } else if (field === "password") {
        setFormData((prev) => ({ ...prev, password: "" }));
        clearFieldError("password");
      }
    }
  };

  const handleSave = async () => {
    if (
      !validateForm({
        username: formData.username.trim(),
        password: formData.password || undefined,
      })
    ) {
      return;
    }

    setIsLoading(true);
    try {
      Alert.alert("Success", "Profile updated successfully!");

      setEditableFields({
        username: false,
        password: false,
      });

      // Clear password field and selected image after successful save
      setFormData((prev) => ({ ...prev, password: "" }));
      setSelectedProfileImage(null);

      router.back();
    } catch {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const hasChanges =
    editableFields.username ||
    editableFields.password ||
    selectedProfileImage !== null;
  const displayImageUri = selectedProfileImage?.uri || user.imageUrl;

  return (
    <View className="flex-1 bg-white">
      {/* Blur Navigation Header */}
      <BlurNavigationHeader
        title="Edit Profile"
        leftComponent={<BackButton onPress={() => router.back()} />}
        blurType="light"
        statusBarStyle="dark"
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 100 }}
      >
        {/* Profile Photo Section */}
        <View className="items-center py-8">
          <View className="relative">
            <View className="w-32 h-32 rounded-full bg-primary-600/40 items-center justify-center overflow-hidden">
              <Image
                source={{ uri: displayImageUri }}
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
                className="mt-4 px-6 py-3 bg-white border border-gray-200 rounded-xl"
              >
                <Text className="text-gray-700 font-semibold">Edit Photo</Text>
              </TouchableOpacity>
            )}
          </ImagePicker>
        </View>

        {/* Form Fields */}
        <View className="px-6 py-6">
          {/* Username Field */}
          <View className="mb-8">
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-600 text-sm">Username</Text>
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
              inputClassName={`bg-white border-0 px-0 py-3 font-medium ${
                editableFields.username ? "text-gray-900" : "text-gray-500"
              }`}
              error={errors.username}
            />
          </View>

          {/* Email Field (Read-only) */}
          <View className="mb-8">
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-600 text-sm">Email</Text>
            </View>
            <FormField
              label=""
              value={formData.email}
              onChangeText={() => {}} // No-op since it's not editable
              placeholder="Email address"
              editable={false}
              containerClassName="mb-0"
              labelClassName="hidden"
              inputClassName="bg-white border-0 px-0 py-3 font-medium text-gray-500"
            />
            <Text className="text-gray-400 text-xs mt-1">
              Email cannot be changed
            </Text>
          </View>

          {/* Password Field */}
          <View className="mb-8">
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-600 text-sm">Password</Text>
              <TouchableOpacity
                onPress={() => toggleFieldEdit("password")}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={editableFields.password ? "checkmark" : "pencil"}
                  size={18}
                  color={editableFields.password ? "#10B981" : "#9CA3AF"}
                />
              </TouchableOpacity>
            </View>
            <FormField
              label=""
              value={formData.password}
              onChangeText={handlePasswordChange}
              placeholder={
                editableFields.password ? "Enter new password" : "••••••••"
              }
              secureTextEntry={!showPassword && editableFields.password}
              showPasswordToggle={editableFields.password}
              onTogglePassword={() => setShowPassword(!showPassword)}
              editable={editableFields.password}
              containerClassName="mb-0"
              labelClassName="hidden"
              inputClassName={`bg-white border-0 px-0 py-3 font-medium ${
                editableFields.password ? "text-gray-900" : "text-gray-500"
              }`}
              error={errors.password}
            />
            {!editableFields.password && (
              <Text className="text-gray-400 text-xs mt-1">
                Click the pencil to change password
              </Text>
            )}
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
