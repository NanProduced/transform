import { useEffect, useState } from "react";

const STORAGE_KEY = "__transform_tools_theme";

export type Theme = "light" | "dark" | "system";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  const getSystemTheme = (): "light" | "dark" => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  };

  const applyTheme = (newTheme: Theme) => {
    const resolved = newTheme === "system" ? getSystemTheme() : newTheme;

    const root = window.document.documentElement;

    root.classList.remove("light", "dark");
    root.classList.add(resolved);

    (root.style as any).colorScheme = resolved;

    setResolvedTheme(resolved);
  };

  const setThemeWithStorage = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTheme));
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    const nextTheme: Theme = resolvedTheme === "dark" ? "light" : "dark";
    setThemeWithStorage(nextTheme);
  };

  const cycleTheme = () => {
    const cycle: Theme[] = ["light", "dark", "system"];
    const currentIndex = cycle.indexOf(theme);
    const nextIndex = (currentIndex + 1) % cycle.length;
    setThemeWithStorage(cycle[nextIndex]);
  };

  useEffect(() => {
    let storedTheme: Theme = "system";

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (["light", "dark", "system"].includes(parsed)) {
          storedTheme = parsed;
        }
      }
    } catch (e) {
      storedTheme = "system";
    }

    setTheme(storedTheme);
    applyTheme(storedTheme);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemThemeChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, []);

  return {
    theme,
    resolvedTheme,
    setTheme: setThemeWithStorage,
    toggleTheme,
    cycleTheme,
    isDark: resolvedTheme === "dark",
    isLight: resolvedTheme === "light"
  };
}
