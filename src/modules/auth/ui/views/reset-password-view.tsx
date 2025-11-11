import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import CodeStep from "@/modules/auth/ui/components/CodeStep";
import PasswordStep from "@/modules/auth/ui/components/PasswordStep";
import EmailStep from "@/modules/auth/ui/components/EmailStep";

const ResetPasswordView = () => {
  const router = useRouter();
  const { signIn, setActive } = useSignIn();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"email" | "code" | "password">("email");

  const handleSendResetEmail = async () => {
    setIsLoading(true);
    try {
      await signIn?.create({
        identifier: email.trim(),
        strategy: "reset_password_email_code",
      });
      setStep("code");
    } catch (error: any) {
      console.log("Password reset error:", error);
      Alert.alert(
        "Reset Failed",
        error?.errors?.[0]?.message ||
          "Unable to send reset email. Please check your email address and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setIsLoading(true);
    try {
      const result = await signIn?.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: code.trim(),
      });

      if (result?.status === "needs_new_password") {
        setStep("password");
      }
    } catch (error: any) {
      console.log("Code verification error:", error);
      Alert.alert(
        "Verification Failed",
        error?.errors?.[0]?.message ||
          "Invalid verification code. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setIsLoading(true);
    try {
      const result = await signIn?.resetPassword({
        password: newPassword,
      });

      if (result?.status === "complete") {
        await setActive!({ session: result.createdSessionId });
        Alert.alert("Success", "Your password has been reset successfully!", [
          { text: "OK", onPress: () => router.replace("/") },
        ]);
      }
    } catch (error: any) {
      console.log("Password reset error:", error);
      Alert.alert(
        "Reset Failed",
        error?.errors?.[0]?.message ||
          "Failed to reset password. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      await signIn?.create({
        identifier: email,
        strategy: "reset_password_email_code",
      });
      Alert.alert(
        "Code Sent",
        "A new verification code has been sent to your email.",
      );
    } catch {
      Alert.alert("Error", "Failed to resend code. Please try again.");
    }
  };

  const getHeaderText = () => {
    switch (step) {
      case "email":
        return (
          <Text className="text-3xl font-medium text-gray-900 mb-2">
            Forgot Password?{" "}
            <Ionicons name="lock-closed-outline" size={24} color="#374151" />
          </Text>
        );
      case "code":
        return (
          <Text className="text-3xl font-medium text-gray-900 mb-2">
            Check Your Email{" "}
            <Ionicons name="mail-outline" size={28} color="#374151" />
          </Text>
        );
      case "password":
        return (
          <Text className="text-3xl font-medium text-gray-900 mb-2">
            Set New Password{" "}
            <Ionicons name="lock-open-outline" size={24} color="#374151" />
          </Text>
        );
    }
  };

  const getSubtitleText = () => {
    switch (step) {
      case "email":
        return (
          <Text className="text-gray-600 text-base font-light">
            Enter your email address and we&apos;ll send you a verification code
          </Text>
        );
      case "code":
        return (
          <Text className="text-gray-600 text-base font-light">
            We&apos;ve sent a verification code to{" "}
            <Text className="font-semibold text-gray-900">{email}</Text>
          </Text>
        );
      case "password":
        return (
          <Text className="text-gray-600 text-base font-light">
            Choose a new secure password for your Musez account
          </Text>
        );
    }
  };

  const renderCurrentStep = () => {
    switch (step) {
      case "email":
        return (
          <EmailStep
            email={email}
            setEmail={setEmail}
            onSubmit={handleSendResetEmail}
            isLoading={isLoading}
          />
        );
      case "code":
        return (
          <CodeStep
            code={code}
            setCode={setCode}
            onSubmit={handleVerifyCode}
            onResend={handleResendCode}
            isLoading={isLoading}
          />
        );
      case "password":
        return (
          <PasswordStep
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            onSubmit={handleResetPassword}
            isLoading={isLoading}
          />
        );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingTop: 64, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="mb-8">
            {getHeaderText()}
            {getSubtitleText()}
          </View>

          {/* Current Step */}
          {renderCurrentStep()}

          {/* Back to Sign In */}
          <View className="mt-8 flex-row justify-center">
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-gray-600 underline">Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ResetPasswordView;
