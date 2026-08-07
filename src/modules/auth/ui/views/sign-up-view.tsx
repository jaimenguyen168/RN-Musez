import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Linking,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import OAuthButton from "@/modules/auth/ui/components/OAuthButton";
import { useSignUp } from "@clerk/clerk-expo";
import { getClerkErrorMessage, SignUpFormData } from "@/modules/auth/types";
import { useRouter } from "expo-router";
import { signUpSchema } from "@/modules/auth/schemas";
import { useSignUpFormValidation } from "@/modules/auth/schemas/validator";
import { useTheme } from "@/provider/ThemeProvider";
import { useOrganicTheme } from "@/constants/organicTheme";

const SignUpView = () => {
  const router = useRouter();
  const { isDark } = useTheme();
  const c = useOrganicTheme();
  const { signUp, setActive } = useSignUp();

  const { errors, validateForm, clearFieldError } = useSignUpFormValidation(signUpSchema);

  const [formData, setFormData] = useState<SignUpFormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const updateFormData = (field: keyof SignUpFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    clearFieldError(field);
  };

  const handleRegister = async () => {
    if (!validateForm(formData)) return;

    setIsLoading(true);
    try {
      const result = await signUp?.create({
        username: formData.username,
        emailAddress: formData.email,
        password: formData.password,
      });

      if (result?.status === "complete") {
        await setActive!({ session: result.createdSessionId });
      } else if (result?.status === "missing_requirements") {
        setVerifying(true);
      } else {
        Alert.alert(
          "Registration Incomplete",
          "Additional verification steps may be required. Please try again.",
        );
      }
    } catch (error: any) {
      const errorMessage = getClerkErrorMessage(error, "email");
      Alert.alert("Registration Failed", errorMessage, [{ text: "OK", style: "default" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await signUp?.prepareEmailAddressVerification();
      Alert.alert("Sent", "A new verification link is on its way.");
    } catch {
      Alert.alert("Couldn't resend", "Please try again in a moment.");
    } finally {
      setIsResending(false);
    }
  };

  const handleOpenMailApp = () => {
    const url = Platform.OS === "ios" ? "message://" : "mailto:";
    Linking.openURL(url).catch(() => {});
  };

  const handleLogin = () => router.replace("/sign-in");

  if (verifying) {
    return (
      <SafeAreaView className="flex-1 bg-organic">
        <StatusBar style={isDark ? "light" : "dark"} />
        <View className="flex-1 items-center justify-center gap-3.5 px-[26px]">
          <View className="w-[104px] h-[104px] rounded-full items-center justify-center bg-organic-accent2-soft">
            <Ionicons name="mail-outline" size={42} color={c.accent2} />
          </View>
          <Text className="font-heading text-organic text-[26px] leading-8">Check your email</Text>
          <Text className="font-figtree text-organic-muted text-sm leading-[22px] text-center">
            We sent a verification link to{" "}
            <Text className="font-figtree-bold text-organic">{formData.email}</Text>. Open it and your account is
            ready to use.
          </Text>
          <View className="gap-2 w-full mt-1.5">
            <TouchableOpacity onPress={handleOpenMailApp} className="py-[15px] rounded-full items-center bg-organic-accent">
              <Text className="font-heading text-organic-accent-soft text-[15px]">Open mail app</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleResend} disabled={isResending} className="py-3 items-center">
              <Text className="font-figtree-bold text-organic-muted text-[13.5px]">
                {isResending ? "Resending…" : "Resend the link"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
            <Text className="font-heading text-organic text-[30px] leading-9">Start your collection</Text>
            <Text className="font-figtree text-organic-muted text-sm">Four fields and you&apos;re in.</Text>
          </View>

          <View className="px-5 gap-7 mt-9">
            <View className="gap-2">
              <Text className="font-figtree-bold text-organic-muted text-[11.5px] tracking-[0.8px] uppercase">
                Username
              </Text>
              <TextInput
                value={formData.username}
                onChangeText={(text) => updateFormData("username", text)}
                placeholder="your-handle"
                placeholderTextColor={c.textFaint}
                autoCapitalize="none"
                autoCorrect={false}
                className="border border-organic-divider bg-organic-surface rounded-full px-4 py-3.5 font-figtree text-organic text-[15px]"
              />
              {errors.username && (
                <Text className="font-figtree-bold text-organic-status-closed text-xs px-1">{errors.username}</Text>
              )}
            </View>

            <View className="gap-2">
              <Text className="font-figtree-bold text-organic-muted text-[11.5px] tracking-[0.8px] uppercase">
                Email address
              </Text>
              <TextInput
                value={formData.email}
                onChangeText={(text) => updateFormData("email", text)}
                placeholder="you@example.com"
                placeholderTextColor={c.textFaint}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                className="border border-organic-divider bg-organic-surface rounded-full px-4 py-3.5 font-figtree text-organic text-[15px]"
              />
              {errors.email && (
                <Text className="font-figtree-bold text-organic-status-closed text-xs px-1">{errors.email}</Text>
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
                placeholder="At least 8 characters"
                placeholderTextColor={c.textFaint}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                className="border border-organic-divider bg-organic-surface rounded-full px-4 py-3.5 font-figtree text-organic text-[15px]"
              />
              {errors.password && (
                <Text className="font-figtree-bold text-organic-status-closed text-xs px-1">{errors.password}</Text>
              )}
            </View>

            <View className="gap-2">
              <View className="flex-row justify-between items-baseline">
                <Text className="font-figtree-bold text-organic-muted text-[11.5px] tracking-[0.8px] uppercase">
                  Confirm password
                </Text>
                <TouchableOpacity onPress={() => setShowConfirmPassword((v) => !v)}>
                  <Text className="font-figtree-bold text-organic-accent-strong text-xs">
                    {showConfirmPassword ? "Hide" : "Show"}
                  </Text>
                </TouchableOpacity>
              </View>
              <TextInput
                value={formData.confirmPassword}
                onChangeText={(text) => updateFormData("confirmPassword", text)}
                placeholder="Type it again"
                placeholderTextColor={c.textFaint}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={handleRegister}
                className="border border-organic-divider bg-organic-surface rounded-full px-4 py-3.5 font-figtree text-organic text-[15px]"
              />
              {errors.confirmPassword && (
                <Text className="font-figtree-bold text-organic-status-closed text-xs px-1">
                  {errors.confirmPassword}
                </Text>
              )}
            </View>

            <TouchableOpacity
              onPress={handleRegister}
              disabled={isLoading}
              className={`mt-0.5 py-4 rounded-full items-center ${isLoading ? "opacity-70" : ""} bg-organic-accent`}
            >
              <Text className="font-heading text-organic-accent-soft text-[15.5px]">
                {isLoading ? "Creating account…" : "Create account"}
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

          <View className="flex-1 mt-9" />

          <View className="px-5 pt-8 items-center">
            <View className="flex-row">
              <Text className="font-figtree text-organic-muted text-[13.5px]">Already have an account? </Text>
              <TouchableOpacity onPress={handleLogin}>
                <Text className="font-figtree-bold text-organic-accent-strong text-[13.5px]">Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUpView;
