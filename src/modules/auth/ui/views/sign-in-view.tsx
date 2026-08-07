import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import OAuthButton from "@/modules/auth/ui/components/OAuthButton";
import { useSignIn } from "@clerk/clerk-expo";
import { getClerkErrorMessage, LoginFormData } from "@/modules/auth/types";
import { emailSchema, usernameSchema } from "@/modules/auth/schemas";
import { useRouter } from "expo-router";
import { useSignInFormValidation } from "@/modules/auth/schemas/validator";
import { useTheme } from "@/provider/ThemeProvider";
import { useOrganicTheme } from "@/constants/organicTheme";

type IdentifierTab = "email" | "username";

const SignInView = () => {
  const router = useRouter();
  const { isDark } = useTheme();
  const c = useOrganicTheme();
  const { signIn, setActive } = useSignIn();

  const { errors, validateForm, clearFieldError, clearAllErrors } =
    useSignInFormValidation();

  const [selectedTab, setSelectedTab] = useState<IdentifierTab>("email");
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleTabChange = (tab: IdentifierTab) => {
    setSelectedTab(tab);
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
    if (!handleValidation()) return;

    setIsLoading(true);

    try {
      const identifier =
        selectedTab === "username" ? formData.username! : formData.email!;

      const result = await signIn?.create({
        identifier: identifier,
        password: formData.password,
      });

      if (result?.status === "complete") {
        await setActive!({ session: result.createdSessionId });
      } else {
        Alert.alert(
          "Sign In Incomplete",
          "Additional verification steps may be required. Please try again.",
        );
      }
    } catch (error: any) {
      const errorMessage = getClerkErrorMessage(error, selectedTab);
      Alert.alert("Sign In Failed", errorMessage, [{ text: "OK", style: "default" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => router.push("/reset-password");
  const handleRegister = () => router.push("/sign-up");

  const identifierValue = selectedTab === "email" ? formData.email || "" : formData.username || "";
  const identifierError = selectedTab === "email" ? errors.email : errors.username;

  return (
    <SafeAreaView className="flex-1 bg-organic">
      <StatusBar style={isDark ? "light" : "dark"} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-5 gap-2.5" style={{ paddingTop: 32 }}>
            <Text className="font-heading text-organic text-[30px] leading-9">Welcome back</Text>
            <Text className="font-figtree text-organic-muted text-sm">
              Your collection is where you left it.
            </Text>
          </View>

          <View className="px-5 gap-7 mt-9">
            <View className="bg-organic-surface rounded-full p-1 flex-row gap-1">
              {(["email", "username"] as const).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => handleTabChange(tab)}
                  className={`flex-1 py-2.5 rounded-full items-center ${selectedTab === tab ? "bg-organic-accent" : ""}`}
                >
                  <Text
                    className={`font-figtree-bold text-[13px] ${selectedTab === tab ? "text-organic-accent-soft" : "text-organic"}`}
                  >
                    {tab === "email" ? "Email" : "Username"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="gap-2">
              <Text className="font-figtree-bold text-organic-muted text-[11.5px] tracking-[0.8px] uppercase">
                {selectedTab === "email" ? "Email address" : "Username"}
              </Text>
              <TextInput
                value={identifierValue}
                onChangeText={(text) => updateFormData(selectedTab, text)}
                placeholder={selectedTab === "email" ? "you@example.com" : "your-handle"}
                placeholderTextColor={c.textFaint}
                keyboardType={selectedTab === "email" ? "email-address" : "default"}
                autoCapitalize="none"
                autoCorrect={false}
                className="border border-organic-divider bg-organic-surface rounded-full px-4 py-3.5 font-figtree text-organic text-[15px]"
              />
              {identifierError && (
                <Text className="font-figtree-bold text-organic-status-closed text-xs px-1">{identifierError}</Text>
              )}
            </View>

            <View className="gap-2">
              <View className="flex-row justify-between items-baseline">
                <Text className="font-figtree-bold text-organic-muted text-[11.5px] tracking-[0.8px] uppercase">
                  Password
                </Text>
                <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                  <Text className="font-figtree-bold text-organic-accent-strong text-xs">
                    {showPassword ? "Hide" : "Show"}
                  </Text>
                </TouchableOpacity>
              </View>
              <TextInput
                value={formData.password}
                onChangeText={(text) => updateFormData("password", text)}
                placeholder="••••••••"
                placeholderTextColor={c.textFaint}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={handleLogin}
                className="border border-organic-divider bg-organic-surface rounded-full px-4 py-3.5 font-figtree text-organic text-[15px]"
              />
              {errors.password && (
                <Text className="font-figtree-bold text-organic-status-closed text-xs px-1">{errors.password}</Text>
              )}
              <TouchableOpacity onPress={handleForgotPassword} className="self-end pt-0.5">
                <Text className="font-figtree-bold text-organic-muted text-[12.5px]">Forgot password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              className={`py-4 rounded-full items-center flex-row justify-center gap-2.5 ${isLoading ? "opacity-70" : ""} bg-organic-accent`}
            >
              <Text className="font-heading text-organic-accent-soft text-[15.5px]">
                {isLoading ? "Signing in…" : "Sign in"}
              </Text>
            </TouchableOpacity>

            <View className="flex-row items-center gap-3 py-1">
              <View className="flex-1 h-px bg-organic-divider" />
              <Text className="font-figtree-bold text-organic-muted text-[15px]">or</Text>
              <View className="flex-1 h-px bg-organic-divider" />
            </View>

            <View className="flex-row gap-3">
              <OAuthButton provider="google" />
              <OAuthButton provider="apple" />
            </View>
          </View>

          <View className="flex-1" />

          <View className="px-5 pt-8 items-center">
            <View className="flex-row">
              <Text className="font-figtree text-organic-muted text-[13.5px]">New here? </Text>
              <TouchableOpacity onPress={handleRegister}>
                <Text className="font-figtree-bold text-organic-accent-strong text-[13.5px]">Create an account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignInView;
