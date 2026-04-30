const DB_NAME = "transform-theme-lab";
const DB_VERSION = 1;
const FONTS_STORE = "fonts";
const THEME_STORE = "theme";

interface FontData {
  id: string;
  name: string;
  family: string;
  data: ArrayBuffer;
  mimeType: string;
  createdAt: number;
}

interface ThemeData {
  id: string;
  uiFontFamily?: string;
  monacoFontFamily?: string;
  designTokens?: DesignTokens;
  updatedAt: number;
}

interface DesignTokens {
  colors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    surface?: string;
    textPrimary?: string;
    textSecondary?: string;
    border?: string;
    success?: string;
    warning?: string;
    error?: string;
  };
  borderRadius?: {
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    full?: string;
  };
  spacing?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(FONTS_STORE)) {
        db.createObjectStore(FONTS_STORE, { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains(THEME_STORE)) {
        db.createObjectStore(THEME_STORE, { keyPath: "id" });
      }
    };
  });
}

function withDB<T>(operation: (db: IDBDatabase) => Promise<T>): Promise<T> {
  return openDB().then((db) => {
    return operation(db).finally(() => {
      db.close();
    });
  });
}

export async function saveFont(font: Omit<FontData, "createdAt">): Promise<void> {
  return withDB((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([FONTS_STORE], "readwrite");
      const store = transaction.objectStore(FONTS_STORE);
      const fontData: FontData = {
        ...font,
        createdAt: Date.now()
      };
      const request = store.put(fontData);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
}

export async function getFont(id: string): Promise<FontData | undefined> {
  return withDB((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([FONTS_STORE], "readonly");
      const store = transaction.objectStore(FONTS_STORE);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  });
}

export async function getAllFonts(): Promise<FontData[]> {
  return withDB((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([FONTS_STORE], "readonly");
      const store = transaction.objectStore(FONTS_STORE);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  });
}

export async function deleteFont(id: string): Promise<void> {
  return withDB((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([FONTS_STORE], "readwrite");
      const store = transaction.objectStore(FONTS_STORE);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
}

export async function saveTheme(theme: Omit<ThemeData>): Promise<void> {
  return withDB((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([THEME_STORE], "readwrite");
      const store = transaction.objectStore(THEME_STORE);
      const themeData: ThemeData = {
        ...theme,
        updatedAt: Date.now()
      };
      const request = store.put(themeData);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
}

export async function getTheme(id: string = "default"): Promise<ThemeData | undefined> {
  return withDB((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([THEME_STORE], "readonly");
      const store = transaction.objectStore(THEME_STORE);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  });
}

export async function clearAllData(): Promise<void> {
  return withDB((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([FONTS_STORE, THEME_STORE], "readwrite");
      const fontsStore = transaction.objectStore(FONTS_STORE);
      const themeStore = transaction.objectStore(THEME_STORE);
      
      const fontsClear = fontsStore.clear();
      const themeClear = themeStore.clear();
      
      let completed = 0;
      const checkComplete = () => {
        completed++;
        if (completed === 2) resolve();
      };
      
      fontsClear.onsuccess = checkComplete;
      themeClear.onsuccess = checkComplete;
      
      const handleError = () => reject(new Error("Failed to clear data"));
      fontsClear.onerror = handleError;
      themeClear.onerror = handleError;
    });
  });
}

export type { FontData, ThemeData, DesignTokens };
