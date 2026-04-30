import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  useMemo
} from "react";
import {
  DesignTokens,
  FontData,
  ThemeData,
  getTheme,
  saveTheme
} from "@utils/indexedDB";
import {
  loadAllStoredFonts,
  uploadFont,
  removeFont,
  getFontFamilyById
} from "@utils/fontManager";

interface ThemeLabContextType {
  uiFontFamily: string | undefined;
  monacoFontFamily: string | undefined;
  designTokens: DesignTokens | undefined;
  customFonts: FontData[];
  isLoading: boolean;

  setUiFontFamily: (family: string | undefined) => void;
  setMonacoFontFamily: (family: string | undefined) => void;
  setDesignTokens: (tokens: DesignTokens | undefined) => void;
  addCustomFont: (file: File) => Promise<FontData>;
  deleteCustomFont: (id: string) => Promise<void>;
  resetToDefaults: () => void;
  exportTheme: () => string;
  importTheme: (jsonString: string) => Promise<boolean>;
  applyTokens: () => void;
}

const defaultDesignTokens: DesignTokens = {
  colors: {
    primary: "#0e7ccf",
    secondary: "#6c757d",
    background: "#ffffff",
    surface: "#f8f9fa",
    textPrimary: "#212529",
    textSecondary: "#6c757d",
    border: "#dee2e6",
    success: "#28a745",
    warning: "#ffc107",
    error: "#dc3545"
  },
  borderRadius: {
    sm: "2px",
    md: "4px",
    lg: "8px",
    xl: "16px",
    full: "9999px"
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px"
  }
};

const ThemeLabContext = createContext<ThemeLabContextType | null>(null);

export function useThemeLab() {
  const context = useContext(ThemeLabContext);
  if (!context) {
    throw new Error("useThemeLab must be used within ThemeLabProvider");
  }
  return context;
}

export { ThemeLabContext, defaultDesignTokens };
