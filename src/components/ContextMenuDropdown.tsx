import React from "react";
import { ContextMenu, Host, Button } from "@expo/ui/swift-ui";
import { SFSymbol } from "expo-symbols";
import { scaleEffect } from "@expo/ui/swift-ui/modifiers";
import { useTheme } from "@/provider/ThemeProvider";

interface MenuOption {
  label: string;
  value: string;
  systemImage?: SFSymbol;
}

interface ContextMenuDropdownProps {
  options: MenuOption[];
  selectedValue?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  triggerLabel?: string;
  iconScale?: number;
  variant?: "default" | "plain";
}

const ContextMenuDropdown = ({
  options,
  selectedValue = "",
  onValueChange,
  iconScale = 1.2,
}: ContextMenuDropdownProps) => {
  const { isDark } = useTheme();
  const handleOptionSelect = (option: MenuOption) => {
    onValueChange(option.value);
  };

  return (
    <Host style={{ height: 50, width: 50 }}>
      <ContextMenu>
        <ContextMenu.Items>
          {options.map((option) => (
            <Button
              key={option.value}
              systemImage={option.systemImage || "circle"}
              onPress={() => handleOptionSelect(option)}
              variant={selectedValue === option.value ? "default" : "bordered"}
            >
              {option.label}
            </Button>
          ))}
        </ContextMenu.Items>
        <ContextMenu.Trigger>
          <Button
            systemImage="ellipsis.circle"
            modifiers={[scaleEffect(iconScale)]}
            color={isDark ? "white" : "black"}
          />
        </ContextMenu.Trigger>
      </ContextMenu>
    </Host>
  );
};

export default ContextMenuDropdown;
