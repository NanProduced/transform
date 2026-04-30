import { FontData, getAllFonts, saveFont, deleteFont } from "./indexedDB";

const loadedFonts = new Map<string, FontFace>();
const fontFamilyMap = new Map<string, string>();

export async function loadFontFromBuffer(
  family: string,
  data: ArrayBuffer,
  mimeType: string
): Promise<FontFace> {
  const existingFont = loadedFonts.get(family);
  if (existingFont) {
    return existingFont;
  }

  const fontFace = new FontFace(family, data, {
    style: "normal",
    weight: "normal"
  });

  try {
    await fontFace.load();
    document.fonts.add(fontFace);
    loadedFonts.set(family, fontFace);
    return fontFace;
  } catch (error) {
    console.error(`Failed to load font ${family}:`, error);
    throw error;
  }
}

export function generateFontFamilyName(name: string): string {
  const sanitized = name
    .replace(/\.(woff|woff2|ttf|otf|eot)$/i, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_");
  return `CustomFont_${sanitized}_${Date.now()}`;
}

export async function uploadFont(file: File): Promise<FontData> {
  const arrayBuffer = await file.arrayBuffer();
  const family = generateFontFamilyName(file.name);
  const id = `font_${Date.now()}`;

  await loadFontFromBuffer(family, arrayBuffer, file.type);

  const fontData: FontData = {
    id,
    name: file.name,
    family,
    data: arrayBuffer,
    mimeType: file.type,
    createdAt: Date.now()
  };

  await saveFont(fontData);
  fontFamilyMap.set(id, family);

  return fontData;
}

export async function loadAllStoredFonts(): Promise<FontData[]> {
  const fonts = await getAllFonts();

  for (const font of fonts) {
    if (!loadedFonts.has(font.family)) {
      try {
        await loadFontFromBuffer(font.family, font.data, font.mimeType);
        fontFamilyMap.set(font.id, font.family);
      } catch (error) {
        console.warn(`Failed to load stored font ${font.name}:`, error);
      }
    }
  }

  return fonts;
}

export async function removeFont(id: string): Promise<void> {
  const family = fontFamilyMap.get(id);
  if (family) {
    const fontFace = loadedFonts.get(family);
    if (fontFace) {
      try {
        document.fonts.delete(fontFace);
      } catch (e) {
        // Some browsers may not support delete
      }
      loadedFonts.delete(family);
    }
    fontFamilyMap.delete(id);
  }
  await deleteFont(id);
}

export function isFontLoaded(family: string): boolean {
  return loadedFonts.has(family);
}

export function getLoadedFontFamilies(): string[] {
  return Array.from(loadedFonts.keys());
}

export function getFontFamilyById(id: string): string | undefined {
  return fontFamilyMap.get(id);
}
