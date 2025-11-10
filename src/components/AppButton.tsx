import React from "react";
import { TouchableOpacity, Text, TouchableOpacityProps } from "react-native";

interface AppButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "outline";
  loading?: boolean;
  disabled?: boolean;
}

const AppButton = ({
  children,
  variant = "default",
  loading = false,
  disabled = false,
  className = "",
  ...props
}: AppButtonProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "secondary":
        return "bg-primary-600";
      case "outline":
        return "bg-white border border-gray-300";
      case "default":
      default:
        return "bg-primary";
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case "outline":
        return "text-gray-900";
      case "secondary":
      case "default":
      default:
        return "text-white";
    }
  };

  const isDisabled = disabled || loading;
  const opacityClass = isDisabled ? "opacity-70" : "";

  return (
    <TouchableOpacity
      className={`rounded-2xl p-4 ${getVariantClasses()} ${opacityClass} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {typeof children === "string" ? (
        <Text className={`text-center font-semibold text-lg ${getTextColor()}`}>
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

export default AppButton;
