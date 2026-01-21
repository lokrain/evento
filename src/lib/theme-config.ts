/**
 * Theme Configuration
 * Defines multiple color themes for the therapy website
 * Each theme maintains the calm, trust-building aesthetic
 */

export type ThemeColor = "sage" | "ocean" | "warm" | "lavender";
export type ThemeMode = "light" | "dark" | "system";

export interface ThemeConfig {
  id: ThemeColor;
  name: string;
  description: string;
}

export const themeConfigs: ThemeConfig[] = [
  {
    id: "sage",
    name: "Градина",
    description: "Успокояващи зелени тонове за баланс и хармония",
  },
  {
    id: "ocean",
    name: "Океан",
    description: "Дълбоки сини нюанси за спокойствие и доверие",
  },
  {
    id: "warm",
    name: "Топлина",
    description: "Меки земни тонове за уют и сигурност",
  },
  {
    id: "lavender",
    name: "Лавандула",
    description: "Нежни лилави акценти за релакс и съзерцание",
  },
];

export const THEME_STORAGE_KEY = "therapy-theme-color";
export const MODE_STORAGE_KEY = "therapy-theme-mode";
