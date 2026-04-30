import React, { useState, useEffect, useCallback, ReactNode } from "react";
import { DesignTokens, FontData, getTheme, saveTheme } from "@utils/indexedDB";
import { loadAllStoredFonts, uploadFont, removeFont } from "@utils/fontManager";
import { ThemeLabContext, defaultDesignTokens } from "@hooks/useThemeLab";

interface ThemeLabProviderProps {
  children: ReactNode;
}

function applyCssVariables(tokens: DesignTokens | undefined) {
  const root = document.documentElement;
  const mergedTokens = { ...defaultDesignTokens, ...tokens };

  if (mergedTokens.colors) {
    const colors = mergedTokens.colors;
    if (colors.primary)
      root.style.setProperty("--color-primary", colors.primary);
    if (colors.secondary)
      root.style.setProperty("--color-secondary", colors.secondary);
    if (colors.background)
      root.style.setProperty("--color-background", colors.background);
    if (colors.surface)
      root.style.setProperty("--color-surface", colors.surface);
    if (colors.textPrimary)
      root.style.setProperty("--color-text-primary", colors.textPrimary);
    if (colors.textSecondary)
      root.style.setProperty("--color-text-secondary", colors.textSecondary);
    if (colors.border) root.style.setProperty("--color-border", colors.border);
    if (colors.success)
      root.style.setProperty("--color-success", colors.success);
    if (colors.warning)
      root.style.setProperty("--color-warning", colors.warning);
    if (colors.error) root.style.setProperty("--color-error", colors.error);
  }

  if (mergedTokens.borderRadius) {
    const radius = mergedTokens.borderRadius;
    if (radius.sm) root.style.setProperty("--radius-sm", radius.sm);
    if (radius.md) root.style.setProperty("--radius-md", radius.md);
    if (radius.lg) root.style.setProperty("--radius-lg", radius.lg);
    if (radius.xl) root.style.setProperty("--radius-xl", radius.xl);
    if (radius.full) root.style.setProperty("--radius-full", radius.full);
  }

  if (mergedTokens.spacing) {
    const spacing = mergedTokens.spacing;
    if (spacing.xs) root.style.setProperty("--spacing-xs", spacing.xs);
    if (spacing.sm) root.style.setProperty("--spacing-sm", spacing.sm);
    if (spacing.md) root.style.setProperty("--spacing-md", spacing.md);
    if (spacing.lg) root.style.setProperty("--spacing-lg", spacing.lg);
    if (spacing.xl) root.style.setProperty("--spacing-xl", spacing.xl);
  }
}

function applyFontFamily(
  uiFontFamily: string | undefined,
  monacoFontFamily: string | undefined
) {
  const root = document.documentElement;

  if (uiFontFamily) {
    root.style.setProperty(
      "--font-family-ui",
      `'${uiFontFamily}', system-ui, sans-serif`
    );
  } else {
    root.style.removeProperty("--font-family-ui");
  }

  if (monacoFontFamily) {
    root.style.setProperty(
      "--font-family-monaco",
      `'${monacoFontFamily}', Consolas, monospace`
    );
  } else {
    root.style.removeProperty("--font-family-monaco");
  }
}

export function ThemeLabProvider({ children }: ThemeLabProviderProps) {
  const [uiFontFamily, setUiFontFamilyState] = useState<string | undefined>();
  const [monacoFontFamily, setMonacoFontFamilyState] = useState<
    string | undefined
  >();
  const [designTokens, setDesignTokensState] = useState<
    DesignTokens | undefined
  >();
  const [customFonts, setCustomFonts] = useState<FontData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const persistTheme = useCallback(async () => {
    await saveTheme({
      id: "default",
      uiFontFamily,
      monacoFontFamily,
      designTokens
    });
  }, [uiFontFamily, monacoFontFamily, designTokens]);

  useEffect(() => {
    if (!isLoading) {
      persistTheme();
      applyCssVariables(designTokens);
      applyFontFamily(uiFontFamily, monacoFontFamily);
    }
  }, [uiFontFamily, monacoFontFamily, designTokens, isLoading, persistTheme]);

  useEffect(() => {
    applyCssVariables(defaultDesignTokens);
    const initialize = async () => {
      try {
        const fonts = await loadAllStoredFonts();
        setCustomFonts(fonts);

        const theme = await getTheme("default");
        if (theme) {
          if (theme.uiFontFamily) setUiFontFamilyState(theme.uiFontFamily);
          if (theme.monacoFontFamily)
            setMonacoFontFamilyState(theme.monacoFontFamily);
          if (theme.designTokens) setDesignTokensState(theme.designTokens);
        }
      } catch (error) {
        console.error("Failed to initialize theme lab:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  const setUiFontFamily = useCallback((family: string | undefined) => {
    setUiFontFamilyState(family);
  }, []);

  const setMonacoFontFamily = useCallback((family: string | undefined) => {
    setMonacoFontFamilyState(family);
  }, []);

  const setDesignTokens = useCallback((tokens: DesignTokens | undefined) => {
    setDesignTokensState(tokens);
  }, []);

  const addCustomFont = useCallback(async (file: File): Promise<FontData> => {
    const fontData = await uploadFont(file);
    setCustomFonts(prev => [...prev, fontData]);
    return fontData;
  }, []);

  const deleteCustomFont = useCallback(
    async (id: string): Promise<void> => {
      await removeFont(id);
      setCustomFonts(prev => prev.filter(f => f.id !== id));

      const deletedFont = customFonts.find(f => f.id === id);
      if (deletedFont) {
        if (uiFontFamily === deletedFont.family) {
          setUiFontFamilyState(undefined);
        }
        if (monacoFontFamily === deletedFont.family) {
          setMonacoFontFamilyState(undefined);
        }
      }
    },
    [customFonts, uiFontFamily, monacoFontFamily]
  );

  const resetToDefaults = useCallback(() => {
    setUiFontFamilyState(undefined);
    setMonacoFontFamilyState(undefined);
    setDesignTokensState(undefined);
    applyCssVariables(defaultDesignTokens);
    applyFontFamily(undefined, undefined);
  }, []);

  const exportTheme = useCallback((): string => {
    const exportData = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      uiFontFamily,
      monacoFontFamily,
      designTokens
    };
    return JSON.stringify(exportData, null, 2);
  }, [uiFontFamily, monacoFontFamily, designTokens]);

  const importTheme = useCallback(async (jsonString: string): Promise<
    boolean
  > => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.uiFontFamily) setUiFontFamilyState(parsed.uiFontFamily);
      if (parsed.monacoFontFamily)
        setMonacoFontFamilyState(parsed.monacoFontFamily);
      if (parsed.designTokens) setDesignTokensState(parsed.designTokens);
      return true;
    } catch (error) {
      console.error("Failed to import theme:", error);
      return false;
    }
  }, []);

  const applyTokens = useCallback(() => {
    applyCssVariables(designTokens);
    applyFontFamily(uiFontFamily, monacoFontFamily);
  }, [designTokens, uiFontFamily, monacoFontFamily]);

  const value = {
    uiFontFamily,
    monacoFontFamily,
    designTokens,
    customFonts,
    isLoading,
    setUiFontFamily,
    setMonacoFontFamily,
    setDesignTokens,
    addCustomFont,
    deleteCustomFont,
    resetToDefaults,
    exportTheme,
    importTheme,
    applyTokens
  };

  return (
    <ThemeLabContext.Provider value={value}>
      {children}
    </ThemeLabContext.Provider>
  );
}
