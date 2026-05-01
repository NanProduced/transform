import { Stage, FormatType, Transformer } from "./types";
import { getTransformer } from "./transformers";
import { findPath, ConversionPath } from "./graph";

export function generateId(): string {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;
}

export function createStage(transformer: Transformer, index: number): Stage {
  return {
    id: `stage-${generateId()}`,
    transformerId: transformer.id,
    input: "",
    output: "",
    error: null,
    status: "idle",
    settings: { ...transformer.defaultSettings }
  };
}

export function createStagesFromPath(path: ConversionPath): Stage[] {
  return path.transformers.map((transformer, index) =>
    createStage(transformer, index)
  );
}

export function validatePipeline(
  stages: Stage[]
): { valid: boolean; error?: string } {
  if (stages.length === 0) {
    return { valid: false, error: "Pipeline must have at least one stage" };
  }

  for (let i = 0; i < stages.length - 1; i++) {
    const currentTransformer = getTransformer(stages[i].transformerId);
    const nextTransformer = getTransformer(stages[i + 1].transformerId);

    if (!currentTransformer || !nextTransformer) {
      return { valid: false, error: "Invalid transformer in pipeline" };
    }

    if (currentTransformer.to !== nextTransformer.from) {
      return {
        valid: false,
        error: `Stage ${i +
          1} outputs ${currentTransformer.to.toUpperCase()} but Stage ${i +
          2} expects ${nextTransformer.from.toUpperCase()}`
      };
    }
  }

  return { valid: true };
}

export function canAddStage(
  stages: Stage[],
  newTransformer: Transformer,
  position: "start" | "end" | number = "end"
): boolean {
  if (stages.length === 0) {
    return true;
  }

  if (position === "start") {
    const firstTransformer = getTransformer(stages[0].transformerId);
    return firstTransformer
      ? newTransformer.to === firstTransformer.from
      : false;
  }

  if (position === "end") {
    const lastTransformer = getTransformer(
      stages[stages.length - 1].transformerId
    );
    return lastTransformer ? newTransformer.from === lastTransformer.to : false;
  }

  return true;
}

export function reorderStages(
  stages: Stage[],
  fromIndex: number,
  toIndex: number
): Stage[] {
  const newStages = [...stages];
  const [removed] = newStages.splice(fromIndex, 1);
  newStages.splice(toIndex, 0, removed);
  return newStages;
}

export function getPipelineStartFormat(stages: Stage[]): FormatType | null {
  if (stages.length === 0) return null;
  const firstTransformer = getTransformer(stages[0].transformerId);
  return firstTransformer?.from || null;
}

export function getPipelineEndFormat(stages: Stage[]): FormatType | null {
  if (stages.length === 0) return null;
  const lastTransformer = getTransformer(
    stages[stages.length - 1].transformerId
  );
  return lastTransformer?.to || null;
}

export interface PipelineLinkState {
  input?: string;
  stages: string[];
  settings?: Record<string, Record<string, any>>;
}

export function encodePipelineState(state: PipelineLinkState): string {
  const jsonString = JSON.stringify(state);
  try {
    return btoa(
      encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g, (match, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )
    );
  } catch (e) {
    return btoa(unescape(encodeURIComponent(jsonString)));
  }
}

export function decodePipelineState(encoded: string): PipelineLinkState | null {
  try {
    const jsonString = decodeURIComponent(
      atob(encoded)
        .split("")
        .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonString);
  } catch (e) {
    try {
      const jsonString = decodeURIComponent(escape(atob(encoded)));
      return JSON.parse(jsonString);
    } catch (e2) {
      return null;
    }
  }
}

export function createShareLink(
  input: string,
  stages: Stage[],
  baseUrl: string = ""
): string {
  const state: PipelineLinkState = {
    input: input,
    stages: stages.map(s => s.transformerId),
    settings: stages.reduce((acc, stage) => {
      if (stage.settings) {
        acc[stage.transformerId] = stage.settings;
      }
      return acc;
    }, {} as Record<string, Record<string, any>>)
  };

  const encoded = encodePipelineState(state);
  return `${baseUrl}/pipeline?state=${encodeURIComponent(encoded)}`;
}

interface MemoizeCache {
  [key: string]: string;
}

let memoizeCache: MemoizeCache = {};

export function getMemoizeKey(
  transformerId: string,
  input: string,
  settings?: Record<string, any>
): string {
  const settingsStr = settings ? JSON.stringify(settings) : "";
  return `${transformerId}:${input.length}:${settingsStr}:${hashString(input)}`;
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

export function getFromCache(key: string): string | undefined {
  return memoizeCache[key];
}

export function setInCache(key: string, value: string): void {
  memoizeCache[key] = value;
}

export function clearCache(): void {
  memoizeCache = {};
}

export function getCacheSize(): number {
  return Object.keys(memoizeCache).length;
}
