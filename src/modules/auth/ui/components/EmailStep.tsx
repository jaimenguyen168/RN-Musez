import React from "react";
import { Text } from "react-native";
import FormField from "@/modules/auth/ui/components/FormField";
import AppButton from "@/components/AppButton";
import { z } from "zod";
import { useSignUpFormValidation } from "@/modules/auth/schemas/validator";

const emailSchema = z.object({
  email: z
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
});

interface EmailStepProps {
  email: string;
  setEmail: (email: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const EmailStep = ({
  email,
  setEmail,
  onSubmit,
  isLoading,
}: EmailStepProps) => {
  const { errors, validateForm, clearFieldError } =
    useSignUpFormValidation(emailSchema);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    clearFieldError("email");
  };

  const handleSubmit = () => {
    if (validateForm({ email: email.trim() })) {
      onSubmit();
    }
  };

  return (
    <>
      <FormField
        label="Email Address"
        value={email}
        onChangeText={handleEmailChange}
        placeholder="ex: artlover@example.com"
        keyboardType="email-address"
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
        autoCapitalize="none"
        autoCorrect={false}
        error={errors.email}
      />

      <AppButton onPress={handleSubmit} disabled={isLoading}>
        <Text className="text-white text-center font-semibold text-lg">
          {isLoading ? "Sending..." : "Send Reset Code"}
        </Text>
      </AppButton>
    </>
  );
};

export default EmailStep;
