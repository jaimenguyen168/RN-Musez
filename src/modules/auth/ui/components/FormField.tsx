import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
  required?: boolean;
  showPasswordToggle?: boolean;
  onTogglePassword?: () => void;
  containerClassName?: string;
  inputClassName?: string;
  labelClassName?: string;
}

const FormField = ({
  label,
  error,
  required = false,
  secureTextEntry = false,
  showPasswordToggle = false,
  onTogglePassword,
  containerClassName = "mb-6",
  inputClassName = "bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-base",
  labelClassName = "text-gray-700 font-medium mb-2",
  ...props
}: FormFieldProps) => {
  const hasPasswordToggle = showPasswordToggle && onTogglePassword;
  const finalInputClassName = hasPasswordToggle
    ? `${inputClassName} pr-12`
    : inputClassName;

  return (
    <View className={containerClassName}>
      <Text className={labelClassName}>
        {label}
        {required && <Text className="text-red-500"> *</Text>}
      </Text>

      <View className="relative">
        <TextInput
          secureTextEntry={secureTextEntry}
          className={finalInputClassName}
          {...props}
        />

        {hasPasswordToggle && (
          <TouchableOpacity
            onPress={onTogglePassword}
            className="absolute right-4 top-4"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={secureTextEntry ? "eye" : "eye-off"}
              size={22}
              color="#6B7280"
            />
          </TouchableOpacity>
        )}
      </View>

      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  );
};

export default FormField;
