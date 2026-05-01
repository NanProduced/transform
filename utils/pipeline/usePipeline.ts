import { useState, useCallback, useEffect } from "react";
import { Stage, FormatType } from "./types";
import { getTransformer, transformers } from "./transformers";
import { findPath, ConversionPath, getFormats } from "./graph";
import {
  createStagesFromPath,
  validatePipeline,
  reorderStages,
  generateId,
  getMemoizeKey,
  getFromCache,
  setInCache,
  clearCache,
  decodePipelineState,
  PipelineLinkState
} from "./pipelineUtils";

interface UsePipelineOptions {
  initialInput?: string;
  initialStartFormat?: FormatType;
  initialEndFormat?: FormatType;
  urlState?: string;
}

interface UsePipelineReturn {
  stages: Stage[];
  input: string;
  startFormat: FormatType | null;
  endFormat: FormatType | null;
  availableFormats: FormatType[];
  isRunning: boolean;
  hasError: boolean;
  firstErrorIndex: number | null;
  setInput: (value: string) => void;
  setStartFormat: (format: FormatType) => void;
  setEndFormat: (format: FormatType) => void;
  findAndSetPath: (start: FormatType, end: FormatType) => boolean;
  runPipeline: () => Promise<void>;
  stopPipeline: () => void;
  clearStages: () => void;
  addStage: (
    transformerId: string,
    position?: "start" | "end" | number
  ) => void;
  removeStage: (stageId: string) => void;
  moveStage: (fromIndex: number, toIndex: number) => void;
  updateStageSettings: (stageId: string, settings: Record<string, any>) => void;
  getAvailableTransformers: (format: FormatType) => typeof transformers;
  findAvailablePaths: (start: FormatType, end: FormatType) => ConversionPath[];
  clearMemoizeCache: () => void;
  getCacheSize: () => number;
  loadFromUrlState: (encodedState: string) => boolean;
  currentPath: ConversionPath | null;
}

export function usePipeline(
  options: UsePipelineOptions = {}
): UsePipelineReturn {
  const { initialInput = "", urlState } = options;

  const availableFormats = getFormats();
  const defaultFormat =
    availableFormats.length > 0 ? availableFormats[0] : null;

  const [stages, setStages] = useState<Stage[]>([]);
  const [input, setInput] = useState<string>(initialInput);
  const [startFormat, setStartFormatState] = useState<FormatType | null>(
    defaultFormat
  );
  const [endFormat, setEndFormatState] = useState<FormatType | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [shouldStop, setShouldStop] = useState(false);
  const [currentPath, setCurrentPath] = useState<ConversionPath | null>(null);

  const hasError = stages.some(s => s.status === "error");
  const firstErrorIndex = stages.findIndex(s => s.status === "error");

  const resetStageResults = useCallback(() => {
    setStages(prev =>
      prev.map(s => ({
        ...s,
        input: "",
        output: "",
        error: null,
        status: "idle" as const
      }))
    );
  }, []);

  const setStartFormat = useCallback(
    (format: FormatType) => {
      setStartFormatState(format);
      resetStageResults();
    },
    [resetStageResults]
  );

  const setEndFormat = useCallback(
    (format: FormatType) => {
      setEndFormatState(format);
      resetStageResults();
    },
    [resetStageResults]
  );

  const findAndSetPath = useCallback(
    (start: FormatType, end: FormatType): boolean => {
      const path = findPath(start, end);
      if (path) {
        setCurrentPath(path);
        setStages(createStagesFromPath(path));
        setStartFormatState(start);
        setEndFormatState(end);
        return true;
      }
      return false;
    },
    []
  );

  const runPipeline = useCallback(async () => {
    if (stages.length === 0) return;

    const validation = validatePipeline(stages);
    if (!validation.valid) {
      console.error("Pipeline validation failed:", validation.error);
      return;
    }

    setIsRunning(true);
    setShouldStop(false);

    let currentInput = input;

    for (let i = 0; i < stages.length; i++) {
      if (shouldStop) break;

      const stage = stages[i];
      const transformer = getTransformer(stage.transformerId);

      if (!transformer) {
        setStages(prev =>
          prev.map((s, idx) =>
            idx === i
              ? {
                  ...s,
                  status: "error" as const,
                  error: "Transformer not found"
                }
              : s
          )
        );
        break;
      }

      setStages(prev =>
        prev.map((s, idx) =>
          idx === i
            ? { ...s, status: "loading" as const, input: currentInput }
            : s
        )
      );

      try {
        const memoKey = getMemoizeKey(
          stage.transformerId,
          currentInput,
          stage.settings
        );

        let output: string;
        const cachedOutput = getFromCache(memoKey);

        if (cachedOutput !== undefined) {
          output = cachedOutput;
        } else {
          output = await transformer.transform(currentInput, stage.settings);
          setInCache(memoKey, output);
        }

        setStages(prev =>
          prev.map((s, idx) =>
            idx === i
              ? {
                  ...s,
                  status: "success" as const,
                  output,
                  error: null,
                  input: currentInput
                }
              : s
          )
        );

        currentInput = output;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setStages(prev =>
          prev.map((s, idx) =>
            idx === i
              ? {
                  ...s,
                  status: "error" as const,
                  error: errorMessage,
                  input: currentInput
                }
              : s
          )
        );
        break;
      }
    }

    setIsRunning(false);
  }, [stages, input, shouldStop]);

  const stopPipeline = useCallback(() => {
    setShouldStop(true);
  }, []);

  const clearStages = useCallback(() => {
    setStages([]);
    setStartFormatState(null);
    setEndFormatState(null);
    setCurrentPath(null);
  }, []);

  const addStage = useCallback(
    (transformerId: string, position: "start" | "end" | number = "end") => {
      const transformer = getTransformer(transformerId);
      if (!transformer) return;

      const newStage: Stage = {
        id: `stage-${generateId()}`,
        transformerId,
        input: "",
        output: "",
        error: null,
        status: "idle",
        settings: { ...transformer.defaultSettings }
      };

      setStages(prev => {
        const newStages = [...prev];
        if (position === "start") {
          newStages.unshift(newStage);
        } else if (position === "end") {
          newStages.push(newStage);
        } else {
          newStages.splice(position, 0, newStage);
        }
        return newStages;
      });
    },
    []
  );

  const removeStage = useCallback((stageId: string) => {
    setStages(prev => prev.filter(s => s.id !== stageId));
  }, []);

  const moveStage = useCallback((fromIndex: number, toIndex: number) => {
    setStages(prev => reorderStages(prev, fromIndex, toIndex));
  }, []);

  const updateStageSettings = useCallback(
    (stageId: string, settings: Record<string, any>) => {
      setStages(prev =>
        prev.map(s =>
          s.id === stageId
            ? { ...s, settings: { ...s.settings, ...settings } }
            : s
        )
      );
    },
    []
  );

  const getAvailableTransformers = useCallback((format: FormatType) => {
    return transformers.filter(t => t.from === format);
  }, []);

  const findAvailablePaths = useCallback(
    (start: FormatType, end: FormatType) => {
      const { conversionGraph } = require("./graph");
      return conversionGraph.findAllPaths(start, end);
    },
    []
  );

  const clearMemoizeCache = useCallback(() => {
    clearCache();
  }, []);

  const getCacheSize = useCallback(() => {
    const { getCacheSize: getSize } = require("./pipelineUtils");
    return getSize();
  }, []);

  const loadFromUrlState = useCallback((encodedState: string): boolean => {
    const decoded = decodePipelineState(encodedState);
    if (!decoded) return false;

    if (decoded.input) {
      setInput(decoded.input);
    }

    if (decoded.stages && decoded.stages.length > 0) {
      const newStages: Stage[] = decoded.stages.map(transformerId => {
        const transformer = getTransformer(transformerId);
        return {
          id: `stage-${generateId()}`,
          transformerId,
          input: "",
          output: "",
          error: null,
          status: "idle" as const,
          settings: decoded.settings?.[transformerId] || {
            ...transformer?.defaultSettings
          }
        };
      });

      setStages(newStages);

      if (newStages.length > 0) {
        const firstTransformer = getTransformer(newStages[0].transformerId);
        const lastTransformer = getTransformer(
          newStages[newStages.length - 1].transformerId
        );
        if (firstTransformer) setStartFormatState(firstTransformer.from);
        if (lastTransformer) setEndFormatState(lastTransformer.to);
      }
    }

    return true;
  }, []);

  useEffect(() => {
    if (urlState) {
      loadFromUrlState(urlState);
    }
  }, [urlState, loadFromUrlState]);

  return {
    stages,
    input,
    startFormat,
    endFormat,
    availableFormats,
    isRunning,
    hasError,
    firstErrorIndex: firstErrorIndex >= 0 ? firstErrorIndex : null,
    setInput,
    setStartFormat,
    setEndFormat,
    findAndSetPath,
    runPipeline,
    stopPipeline,
    clearStages,
    addStage,
    removeStage,
    moveStage,
    updateStageSettings,
    getAvailableTransformers,
    findAvailablePaths,
    clearMemoizeCache,
    getCacheSize,
    loadFromUrlState,
    currentPath
  };
}
