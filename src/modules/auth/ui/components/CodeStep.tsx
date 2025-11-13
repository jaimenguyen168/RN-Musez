import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import FormField from "@/modules/auth/ui/components/FormField";
import AppButton from "@/components/AppButton";
import { z } from "zod";
import { useSignUpFormValidation } from "@/modules/auth/schemas/validator";

const codeSchema = z.object({
  code: z
    .string()
    .min(1, "Verification code is required")
    .regex(/^\d{6}$/, "Verification code must be 6 digits"),
});

interface CodeStepProps {
  code: string;
  setCode: (code: string) => void;
  onSubmit: () => void;
  onResend: () => void;
  isLoading: boolean;
}

const CodeStep = ({
  code,
  setCode,
  onSubmit,
  onResend,
  isLoading,
}: CodeStepProps) => {
  const { errors, validateForm, clearFieldError } =
    useSignUpFormValidation(codeSchema);

  const handleCodeChange = (value: string) => {
    setCode(value);
    clearFieldError("code");
  };

  const handleSubmit = () => {
    if (validateForm({ code: code.trim() })) {
      onSubmit();
    }
  };

  return (
    <>
      <FormField
        label="Verification Code"
        value={code}
        onChangeText={handleCodeChange}
        placeholder="Enter 6-digit code"
        keyboardType="number-pad"
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
        autoCapitalize="none"
        autoCorrect={false}
        error={errors.code}
        maxLength={6}
      />

      <AppButton onPress={handleSubmit} disabled={isLoading}>
        <Text className="text-white text-center font-semibold text-lg">
          {isLoading ? "Verifying..." : "Verify Code"}
        </Text>
      </AppButton>

      <View className="mt-6 flex-row justify-center items-center">
        <Text className="text-secondary">Didn&apos;t receive the code? </Text>
        <TouchableOpacity onPress={onResend}>
          <Text className="text-primary font-bold underline">Resend</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default CodeStep;
