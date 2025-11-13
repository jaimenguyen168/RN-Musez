import React, { createContext, useContext, useEffect, useState } from "react";
import { colorScheme, useColorScheme } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const { colorScheme: systemColorScheme } = useColorScheme();

  const isDark =
    theme === "system" ? systemColorScheme === "dark" : theme === "dark";

  // Load saved theme preference on app start
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("theme-preference");
        if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
          setThemeState(savedTheme as ThemeMode);

          // Apply the theme immediately
          if (savedTheme !== "system") {
            colorScheme.set(savedTheme as "light" | "dark");
          }
        }
      } catch (error) {
        console.error("Failed to load theme preference:", error);
      }
    };

    loadTheme();
  }, []);

  useEffect(() => {
    if (theme === "system") {
      colorScheme.set(systemColorScheme as ThemeMode);
    } else {
      colorScheme.set(theme);
    }
  }, [theme, systemColorScheme]);

  const setTheme = async (newTheme: ThemeMode) => {
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem("theme-preference", newTheme);

      if (newTheme === "system") {
        colorScheme.set(systemColorScheme as ThemeMode);
      } else {
        colorScheme.set(newTheme);
      }
    } catch (error) {
      console.error("Failed to save theme preference:", error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
