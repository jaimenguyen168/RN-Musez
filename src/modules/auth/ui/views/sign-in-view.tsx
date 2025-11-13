import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import TabsPicker from "@/components/TabsPicker";
import OAuthButton from "@/modules/auth/ui/components/OAuthButton";
import { useSignIn } from "@clerk/clerk-expo";
import FormField from "@/modules/auth/ui/components/FormField";
import { getClerkErrorMessage, LoginFormData } from "@/modules/auth/types";
import { emailSchema, usernameSchema } from "@/modules/auth/schemas";
import { useRouter } from "expo-router";
import { useSignInFormValidation } from "@/modules/auth/schemas/validator";
import AppButton from "@/components/AppButton";
import Divider from "@/components/Divider";

const { width: screenWidth } = Dimensions.get("window");

const SignInView = () => {
  const router = useRouter();
  const { signIn, setActive } = useSignIn();

  const { errors, validateForm, clearFieldError, clearAllErrors } =
    useSignInFormValidation();

  const [selectedTab, setSelectedTab] = useState<"username" | "email">(
    "username",
  );
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const tabOptions: [string, string] = ["Username", "Email"];

  const getDisplayValue = (tab: string): string => {
    return tab === "username" ? "Username" : "Email";
  };

  const handleTabChange = (value: string) => {
    const stateValue = value.toLowerCase() as "username" | "email";
    setSelectedTab(stateValue);
    clearAllErrors();
  };

  const updateFormData = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    clearFieldError(field);
  };

  const handleValidation = (): boolean => {
    const schema = selectedTab === "username" ? usernameSchema : emailSchema;
    const dataToValidate =
      selectedTab === "username"
        ? { username: formData.username, password: formData.password }
        : { email: formData.email, password: formData.password };

    return validateForm(schema, dataToValidate);
  };

  const handleLogin = async () => {
    if (!handleValidation()) {
      return;
    }

    setIsLoading(true);

    try {
      console.log(`Attempting sign in with ${selectedTab}...`);

      const identifier =
        selectedTab === "username" ? formData.username! : formData.email!;

      const result = await signIn?.create({
        identifier: identifier,
        password: formData.password,
      });

      console.log("SignIn result:", result);

      if (result?.status === "complete") {
        console.log("SignIn successful!");
        await setActive!({ session: result.createdSessionId });
      } else {
        Alert.alert(
          "Sign In Incomplete",
          "Additional verification steps may be required. Please try again.",
        );
      }
    } catch (error: any) {
      console.log("SignIn error:", error);

      const errorMessage = getClerkErrorMessage(error, selectedTab);

      Alert.alert("Sign In Failed", errorMessage, [
        { text: "OK", style: "default" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push("/reset-password");
  };

  // const handleNeedHelp = () => {
  //   console.log("Need help pressed");
  // };

  const handleRegister = () => {
    router.push("/sign-up");
  };

  return (
    <SafeAreaView className="flex-1 bg-app">
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
            <Text className="text-3xl font-medium text-main mb-2">
              Welcome to <Text className="text-primary font-bold">Musez</Text>{" "}
              👋
            </Text>
            <Text className="text-secondary text-base font-light">
              Login to discover amazing artworks and museums
            </Text>
          </View>

          {/* Tab Selector */}
          <TabsPicker
            options={tabOptions}
            selectedValue={getDisplayValue(selectedTab)}
            onSelectionChange={handleTabChange}
            width={screenWidth - 44}
          />

          {/* Input Fields */}
          {selectedTab === "username" ? (
            <FormField
              label="Username"
              value={formData.username || ""}
              onChangeText={(text) => updateFormData("username", text)}
              placeholder="ex: Johndoe"
              returnKeyType="next"
              error={errors.username}
              autoCapitalize="none"
              autoCorrect={false}
            />
          ) : (
            <FormField
              label="Email"
              value={formData.email || ""}
              onChangeText={(text) => updateFormData("email", text)}
              placeholder="ex: john@example.com"
              keyboardType="email-address"
              returnKeyType="next"
              error={errors.email}
              autoCapitalize="none"
              autoCorrect={false}
            />
          )}

          {/* Password Field */}
          <FormField
            label="Password"
            value={formData.password}
            onChangeText={(text) => updateFormData("password", text)}
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            showPasswordToggle
            onTogglePassword={() => setShowPassword(!showPassword)}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            error={errors.password}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Help and Forgot Password */}
          <View className="flex-row justify-end mb-8">
            {/*<TouchableOpacity onPress={handleNeedHelp}>*/}
            {/*  <Text className="text-gray-600 underline">Need a help?</Text>*/}
            {/*</TouchableOpacity>*/}
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text className="text-secondary underline">Forgot Password</Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <AppButton onPress={handleLogin} disabled={isLoading}>
            <Text className="text-white text-center font-semibold text-lg">
              {isLoading ? "Signing In..." : "Login"}
            </Text>
          </AppButton>

          {/* OR Divider */}
          <View className="flex-row items-center my-8">
            <Divider className="mx-0" />
            <Text className="mx-4 text-main bg-surface px-3 py-1 rounded-full text-sm">
              OR
            </Text>
            <Divider className="mx-0" />
          </View>

          {/* Social Login Buttons */}
          <View className="flex-row gap-4 mb-8">
            <OAuthButton provider="google" />
            <OAuthButton provider="apple" />
          </View>

          {/* Register Link */}
          <View className="flex-row justify-center items-center">
            <Text className="text-secondary">Don&apos;t have a account? </Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text className="text-primary font-bold underline">Register</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignInView;
