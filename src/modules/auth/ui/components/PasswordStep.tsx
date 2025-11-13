import React, { useState } from "react";
import { Text } from "react-native";
import FormField from "@/modules/auth/ui/components/FormField";
import AppButton from "@/components/AppButton";
import { z } from "zod";
import { useSignUpFormValidation } from "@/modules/auth/schemas/validator";

const passwordSchema = z
  .object({
    newPassword: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

interface PasswordStepProps {
  newPassword: string;
  setNewPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (password: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const PasswordStep = ({
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  onSubmit,
  isLoading,
}: PasswordStepProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { errors, validateForm, clearFieldError } =
    useSignUpFormValidation(passwordSchema);

  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);
    clearFieldError("newPassword");
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    clearFieldError("confirmPassword");
  };

  const handleSubmit = () => {
    if (validateForm({ newPassword, confirmPassword })) {
      onSubmit();
    }
  };

  return (
    <>
      <FormField
        label="New Password"
        value={newPassword}
        onChangeText={handleNewPasswordChange}
        placeholder="••••••••"
        secureTextEntry={!showPassword}
        showPasswordToggle
        onTogglePassword={() => setShowPassword(!showPassword)}
        returnKeyType="next"
        autoCapitalize="none"
        autoCorrect={false}
        error={errors.newPassword}
      />

      <FormField
        label="Confirm New Password"
        value={confirmPassword}
        onChangeText={handleConfirmPasswordChange}
        placeholder="••••••••"
        secureTextEntry={!showConfirmPassword}
        showPasswordToggle
        onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
        autoCapitalize="none"
        autoCorrect={false}
        error={errors.confirmPassword}
      />

      <AppButton onPress={handleSubmit} disabled={isLoading}>
        <Text className="text-white text-center font-semibold text-lg">
          {isLoading ? "Updating..." : "Update Password"}
        </Text>
      </AppButton>
    </>
  );
};

export default PasswordStep;
