"use client";

import * as React from "react";
import {
  MODE_STORAGE_KEY,
  THEME_STORAGE_KEY,
  type ThemeColor,
  type ThemeMode,
} from "@/lib/theme-config";

interface ThemeContextValue {
  themeColor: ThemeColor;
  themeMode: ThemeMode;
  resolvedMode: "light" | "dark";
  setThemeColor: (color: ThemeColor) => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultColor?: ThemeColor;
  defaultMode?: ThemeMode;
}

export function ThemeProvider({
  children,
  defaultColor = "sage",
  defaultMode = "system",
}: ThemeProviderProps) {
  const [themeColor, setThemeColorState] = React.useState<ThemeColor>(defaultColor);
  const [themeMode, setThemeModeState] = React.useState<ThemeMode>(defaultMode);
  const [resolvedMode, setResolvedMode] = React.useState<"light" | "dark">("light");
  const [mounted, setMounted] = React.useState(false);

  // Initialize from localStorage and system preference on mount
  React.useEffect(() => {
    const storedColor = localStorage.getItem(THEME_STORAGE_KEY) as ThemeColor | null;
    const storedMode = localStorage.getItem(MODE_STORAGE_KEY) as ThemeMode | null;

    if (storedColor) setThemeColorState(storedColor);
    if (storedMode) setThemeModeState(storedMode);

    setMounted(true);
  }, []);

  // Resolve the actual mode based on system preference
  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const updateResolvedMode = () => {
      if (themeMode === "system") {
        setResolvedMode(mediaQuery.matches ? "dark" : "light");
      } else {
        setResolvedMode(themeMode);
      }
    };

    updateResolvedMode();
    mediaQuery.addEventListener("change", updateResolvedMode);

    return () => mediaQuery.removeEventListener("change", updateResolvedMode);
  }, [themeMode]);

  // Apply theme to document
  React.useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    // Update color theme attribute
    root.setAttribute("data-theme", themeColor);

    // Update dark/light class
    root.classList.remove("light", "dark");
    root.classList.add(resolvedMode);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", resolvedMode === "dark" ? "#1a1f1c" : "#faf9f7");
    }
  }, [themeColor, resolvedMode, mounted]);

  const setThemeColor = React.useCallback((color: ThemeColor) => {
    setThemeColorState(color);
    localStorage.setItem(THEME_STORAGE_KEY, color);
  }, []);

  const setThemeMode = React.useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  }, []);

  const value = React.useMemo(
    () => ({
      themeColor,
      themeMode,
      resolvedMode,
      setThemeColor,
      setThemeMode,
    }),
    [themeColor, themeMode, resolvedMode, setThemeColor, setThemeMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
