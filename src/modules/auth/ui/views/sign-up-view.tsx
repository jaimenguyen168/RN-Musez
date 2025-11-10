import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import OAuthButton from "@/modules/auth/ui/components/OAuthButton";
import { useSignUp } from "@clerk/clerk-expo";
import FormField from "@/modules/auth/ui/components/FormField";
import { getClerkErrorMessage, SignUpFormData } from "@/modules/auth/types";
import { useRouter } from "expo-router";
import { signUpSchema } from "@/modules/auth/schemas";
import { useSignUpFormValidation } from "@/modules/auth/schemas/validator";
import AppButton from "@/components/AppButton";

const SignUpView = () => {
  const router = useRouter();
  const { signUp, setActive } = useSignUp();

  const { errors, validateForm, clearFieldError } =
    useSignUpFormValidation(signUpSchema);

  const [formData, setFormData] = useState<SignUpFormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const updateFormData = (field: keyof SignUpFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    clearFieldError(field);
  };

  const handleRegister = async () => {
    if (!validateForm(formData)) {
      return;
    }

    setIsLoading(true);

    try {
      console.log("Attempting sign up...");

      const result = await signUp?.create({
        username: formData.username,
        emailAddress: formData.email,
        password: formData.password,
      });

      console.log("SignUp result:", result);

      if (result?.status === "complete") {
        console.log("SignUp successful!");
        await setActive!({ session: result.createdSessionId });
      } else if (result?.status === "missing_requirements") {
        // Handle email verification if required
        Alert.alert(
          "Verification Required",
          "Please check your email for a verification link to complete your registration.",
          [
            {
              text: "OK",
              onPress: () => {
                // Navigate to verification screen or stay on current screen
                console.log("Email verification required");
              },
            },
          ],
        );
      } else {
        Alert.alert(
          "Registration Incomplete",
          "Additional verification steps may be required. Please try again.",
        );
      }
    } catch (error: any) {
      console.log("SignUp error:", error);

      const errorMessage = getClerkErrorMessage(error, "email");

      Alert.alert("Registration Failed", errorMessage, [
        { text: "OK", style: "default" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingTop: 64, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="mb-8">
            <Text className="text-3xl font-medium text-gray-900 mb-2">
              Welcome to <Text className="text-primary font-bold">Musez</Text>{" "}
              👋
            </Text>
            <Text className="text-gray-600 text-base">
              Register to access your account and continue your journey
            </Text>
          </View>

          {/* Username Field */}
          <FormField
            label="Username"
            value={formData.username}
            onChangeText={(text) => updateFormData("username", text)}
            placeholder="ex: Johndoe123"
            returnKeyType="next"
            error={errors.username}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Email Field */}
          <FormField
            label="Email"
            value={formData.email}
            onChangeText={(text) => updateFormData("email", text)}
            placeholder="ex: username@gmail.com"
            keyboardType="email-address"
            returnKeyType="next"
            error={errors.email}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Password Field */}
          <FormField
            label="Password"
            value={formData.password}
            onChangeText={(text) => updateFormData("password", text)}
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            showPasswordToggle
            onTogglePassword={() => setShowPassword(!showPassword)}
            returnKeyType="next"
            error={errors.password}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Confirm Password Field */}
          <FormField
            label="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={(text) => updateFormData("confirmPassword", text)}
            placeholder="••••••••"
            secureTextEntry={!showConfirmPassword}
            showPasswordToggle
            onTogglePassword={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
            returnKeyType="done"
            onSubmitEditing={handleRegister}
            error={errors.confirmPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Register Button */}
          <AppButton onPress={handleRegister} disabled={isLoading}>
            <Text className="text-white text-center font-semibold text-lg">
              {isLoading ? "Registering..." : "Register"}
            </Text>
          </AppButton>

          {/* OR Divider */}
          <View className="flex-row items-center my-8">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-4 text-gray-500 bg-gray-200 px-3 py-1 rounded-full text-sm">
              OR
            </Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* Social Login Buttons */}
          <View className="flex-row gap-4 mb-8">
            <OAuthButton provider="google" />
            <OAuthButton provider="apple" />
          </View>

          {/* Login Link */}
          <View className="flex-row justify-center items-center">
            <Text className="text-gray-600">Already have an account? </Text>
            <TouchableOpacity onPress={handleLogin}>
              <Text className="text-primary font-bold">Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUpView;
