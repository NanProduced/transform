import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  Pane,
  Heading,
  Button,
  Select,
  Text,
  Spinner,
  Alert,
  IconButton,
  Tooltip,
  toaster,
  Badge,
  Dialog,
  Pill
} from "evergreen-ui";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { usePipeline } from "@utils/pipeline/usePipeline";
import { getTransformer } from "@utils/pipeline/transformers";
import { FormatType, Stage } from "@utils/pipeline/types";
import { createShareLink } from "@utils/pipeline/pipelineUtils";
import copy from "clipboard-copy";
import * as data from "@constants/data";

const Monaco = dynamic(() => import("../components/Monaco"), {
  ssr: false
});

const formatDisplayNames: Record<FormatType, string> = {
  xml: "XML",
  json: "JSON",
  yaml: "YAML",
  toml: "TOML",
  typescript: "TypeScript",
  flow: "Flow",
  javascript: "JavaScript",
  java: "Java",
  kotlin: "Kotlin",
  go: "Go",
  "go-bson": "Go BSON",
  "rust-serde": "Rust Serde",
  "scala-case-class": "Scala Case Class",
  graphql: "GraphQL",
  "graphql-schema-ast": "GraphQL Schema AST",
  "graphql-introspection-json": "GraphQL Introspection JSON",
  jsx: "JSX",
  "react-native": "React Native",
  pug: "Pug",
  css: "CSS",
  "css-js": "CSS JS Objects",
  "css-tailwind": "TailwindCSS",
  markdown: "Markdown",
  html: "HTML",
  "json-schema": "JSON Schema",
  "openapi-schema": "OpenAPI Schema",
  protobuf: "Protobuf",
  zod: "Zod",
  "mobx-state-tree": "MobX State Tree",
  "io-ts": "io-ts",
  sarcastic: "Sarcastic",
  mongoose: "Mongoose",
  "big-query": "Big Query",
  mysql: "MySQL",
  proptypes: "PropTypes",
  jsdoc: "JSDoc",
  "typescript-declaration": "TypeScript Declaration",
  "flow-declaration": "Flow Declaration",
  "jsonld-compacted": "JSON-LD Compacted",
  "jsonld-expanded": "JSON-LD Expanded",
  "jsonld-flattened": "JSON-LD Flattened",
  "jsonld-framed": "JSON-LD Framed",
  "jsonld-normalized": "JSON-LD Normalized",
  "jsonld-nquads": "JSON-LD N-Quads",
  cadence: "Cadence"
};

const getMonacoLanguage = (format: FormatType): string => {
  const mapping: Partial<Record<FormatType, string>> = {
    json: "json",
    xml: "xml",
    yaml: "yaml",
    toml: "toml",
    typescript: "typescript",
    flow: "typescript",
    javascript: "javascript",
    java: "java",
    kotlin: "kotlin",
    go: "go",
    html: "html",
    css: "css",
    markdown: "markdown",
    graphql: "graphql"
  };
  return mapping[format] || "plaintext";
};

interface StageCardProps {
  stage: Stage;
  index: number;
  totalStages: number;
  isRunning: boolean;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onViewDetail: () => void;
}

function StageCard({
  stage,
  index,
  totalStages,
  isRunning,
  onRemove,
  onMoveUp,
  onMoveDown,
  onViewDetail
}: StageCardProps) {
  const transformer = getTransformer(stage.transformerId);
  const statusColors = {
    idle: "neutral",
    loading: "blue",
    success: "green",
    error: "red"
  } as const;

  if (!transformer) return null;

  return (
    <Pane
      display="flex"
      flexDirection="column"
      minWidth={280}
      maxWidth={320}
      border
      borderRadius={8}
      overflow="hidden"
      marginX={8}
      position="relative"
    >
      <Pane
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        paddingX={12}
        paddingY={10}
        backgroundColor="#f8f9fa"
        borderBottom
      >
        <Pane display="flex" alignItems="center">
          <Badge color={statusColors[stage.status]} marginRight={8} />
          <Text size={300} fontWeight={500}>
            Stage {index + 1}
          </Text>
        </Pane>
        <Pane display="flex" alignItems="center">
          <Tooltip content="View Details">
            <IconButton
              icon="eye"
              height={24}
              appearance="minimal"
              onClick={onViewDetail}
              marginRight={4}
            />
          </Tooltip>
          {index > 0 && (
            <Tooltip content="Move Up">
              <IconButton
                icon="arrow-up"
                height={24}
                appearance="minimal"
                onClick={onMoveUp}
                marginRight={4}
              />
            </Tooltip>
          )}
          {index < totalStages - 1 && (
            <Tooltip content="Move Down">
              <IconButton
                icon="arrow-down"
                height={24}
                appearance="minimal"
                onClick={onMoveDown}
                marginRight={4}
              />
            </Tooltip>
          )}
          {!isRunning && (
            <Tooltip content="Remove Stage">
              <IconButton
                icon="cross"
                height={24}
                appearance="minimal"
                intent="danger"
                onClick={onRemove}
              />
            </Tooltip>
          )}
        </Pane>
      </Pane>

      <Pane paddingX={12} paddingY={10} borderBottom>
        <Pane display="flex" alignItems="center" justifyContent="space-between">
          <Text size={300}>
            <Text fontWeight={600}>{formatDisplayNames[transformer.from]}</Text>
            <Text marginX={8}>→</Text>
            <Text fontWeight={600}>{formatDisplayNames[transformer.to]}</Text>
          </Text>
          <Pill
            color={statusColors[stage.status]}
            display="flex"
            alignItems="center"
          >
            {stage.status === "loading" ? (
              <Spinner size={12} marginRight={4} />
            ) : null}
            <Text size={200}>{stage.status}</Text>
          </Pill>
        </Pane>
      </Pane>

      <Pane flex={1} minHeight={120} padding={8}>
        {stage.status === "error" && (
          <Alert intent="danger" padding={8} marginBottom={8}>
            <Text size={200}>{stage.error}</Text>
          </Alert>
        )}
        {stage.status === "success" && (
          <Pane>
            <Text size={200} color="muted">
              Input: {stage.input.length} chars
            </Text>
            <br />
            <Text size={200} color="muted">
              Output: {stage.output.length} chars
            </Text>
          </Pane>
        )}
        {stage.status === "idle" && (
          <Text size={300} color="muted" fontStyle="italic">
            Ready to run...
          </Text>
        )}
        {stage.status === "loading" && (
          <Pane
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="100%"
          >
            <Spinner />
          </Pane>
        )}
      </Pane>
    </Pane>
  );
}

interface StageDetailModalProps {
  stage: Stage | null;
  isOpen: boolean;
  onClose: () => void;
}

function StageDetailModal({ stage, isOpen, onClose }: StageDetailModalProps) {
  if (!stage) return null;

  const transformer = getTransformer(stage.transformerId);
  if (!transformer) return null;

  const monacoOptions = {
    fontSize: 12,
    readOnly: true,
    minimap: { enabled: false },
    lineNumbers: "on" as const
  };

  return (
    <Dialog
      isShown={isOpen}
      title={`Stage: ${transformer.label}`}
      onCloseComplete={onClose}
      width={900}
    >
      <Pane display="flex" flexDirection="column" height={500}>
        <Pane flex={1} marginBottom={16} border>
          <Pane
            paddingY={8}
            paddingX={12}
            backgroundColor="#f8f9fa"
            borderBottom
          >
            <Text size={300} fontWeight={500}>
              Input ({formatDisplayNames[transformer.from]})
            </Text>
          </Pane>
          <Pane height="calc(100% - 36px)">
            <Monaco
              language={getMonacoLanguage(transformer.from)}
              value={stage.input || ""}
              options={monacoOptions}
            />
          </Pane>
        </Pane>
        <Pane flex={1} border>
          <Pane
            paddingY={8}
            paddingX={12}
            backgroundColor="#f8f9fa"
            borderBottom
          >
            <Text size={300} fontWeight={500}>
              Output ({formatDisplayNames[transformer.to]})
            </Text>
          </Pane>
          <Pane height="calc(100% - 36px)">
            <Monaco
              language={getMonacoLanguage(transformer.to)}
              value={stage.output || ""}
              options={monacoOptions}
            />
          </Pane>
        </Pane>
      </Pane>
    </Dialog>
  );
}

export default function PipelinePage() {
  const router = useRouter();
  const urlState = router.query.state as string | undefined;

  const [selectedStageDetail, setSelectedStageDetail] = useState<Stage | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const {
    stages,
    input,
    startFormat,
    endFormat,
    availableFormats,
    isRunning,
    hasError,
    firstErrorIndex,
    setInput,
    setStartFormat,
    setEndFormat,
    findAndSetPath,
    runPipeline,
    stopPipeline,
    clearStages,
    removeStage,
    moveStage,
    getAvailableTransformers
  } = usePipeline({
    initialInput: data.xml,
    urlState
  });

  const handleFindPath = useCallback(() => {
    if (!startFormat || !endFormat) {
      toaster.warning("Please select both start and end formats");
      return;
    }

    if (startFormat === endFormat) {
      toaster.warning("Start and end formats must be different");
      return;
    }

    const success = findAndSetPath(startFormat, endFormat);
    if (!success) {
      toaster.danger(
        `No conversion path found from ${formatDisplayNames[startFormat]} to ${formatDisplayNames[endFormat]}`
      );
    } else {
      toaster.success("Conversion path found!");
    }
  }, [startFormat, endFormat, findAndSetPath]);

  const handleRun = useCallback(async () => {
    if (stages.length === 0) {
      toaster.warning("Please create a pipeline first");
      return;
    }
    await runPipeline();
    if (hasError) {
      toaster.danger(`Pipeline failed at stage ${(firstErrorIndex ?? -1) + 1}`);
    } else {
      toaster.success("Pipeline completed successfully!");
    }
  }, [stages, runPipeline, hasError, firstErrorIndex]);

  const handleMoveStage = useCallback(
    (fromIndex: number, toIndex: number) => {
      moveStage(fromIndex, toIndex);
    },
    [moveStage]
  );

  const handleViewDetail = useCallback((stage: Stage) => {
    setSelectedStageDetail(stage);
    setIsDetailModalOpen(true);
  }, []);

  const handleShare = useCallback(() => {
    const link = createShareLink(input, stages, window.location.origin);
    setShareLink(link);
    setIsShareModalOpen(true);
  }, [input, stages]);

  const handleCopyLink = useCallback(async () => {
    try {
      await copy(shareLink);
      toaster.success("Link copied to clipboard!");
    } catch (e) {
      toaster.danger("Failed to copy link");
    }
  }, [shareLink]);

  const handleStartFormatChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setStartFormat(e.target.value as FormatType);
    },
    [setStartFormat]
  );

  const handleEndFormatChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setEndFormat(e.target.value as FormatType);
    },
    [setEndFormat]
  );

  const monacoOptions = useMemo(
    () => ({
      fontSize: 14,
      minimap: { enabled: false },
      lineNumbers: "on" as const,
      fontFamily: "Menlo, Consolas, monospace, sans-serif"
    }),
    []
  );

  return (
    <Pane
      display="flex"
      flexDirection="row"
      overflow="hidden"
      flex={1}
      height={"calc(100vh - 40px)"}
    >
      <Pane
        display="flex"
        flex={1}
        borderRight
        flexDirection="column"
        overflow="hidden"
      >
        <Pane
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          paddingX={20}
          paddingY={12}
          borderBottom
          backgroundColor="#ffffff"
          flexShrink={0}
        >
          <Pane display="flex" alignItems="center">
            <Heading size={600} marginRight={20}>
              Pipeline
            </Heading>
            <Badge color="blue">Multi-Step Conversion</Badge>
          </Pane>
          <Pane display="flex" alignItems="center">
            {stages.length > 0 && (
              <>
                <Button
                  iconBefore="share"
                  appearance="minimal"
                  onClick={handleShare}
                  marginRight={10}
                >
                  Share
                </Button>
                <Button
                  iconBefore="cross"
                  appearance="minimal"
                  intent="danger"
                  onClick={clearStages}
                  marginRight={10}
                >
                  Clear
                </Button>
              </>
            )}
            {isRunning ? (
              <Button iconBefore="stop" intent="danger" onClick={stopPipeline}>
                Stop
              </Button>
            ) : (
              <Button
                iconBefore="play"
                appearance="primary"
                onClick={handleRun}
                disabled={stages.length === 0}
              >
                Run Pipeline
              </Button>
            )}
          </Pane>
        </Pane>

        <Pane
          display="flex"
          alignItems="center"
          paddingX={20}
          paddingY={12}
          borderBottom
          backgroundColor="#f8f9fa"
          flexShrink={0}
          flexWrap="wrap"
        >
          <Pane display="flex" alignItems="center" marginRight={20}>
            <Text size={300} marginRight={8}>
              From:
            </Text>
            <Select
              value={startFormat || ""}
              onChange={handleStartFormatChange}
              width={180}
              placeholder="Select format"
            >
              {availableFormats.map(format => (
                <option key={format} value={format}>
                  {formatDisplayNames[format]}
                </option>
              ))}
            </Select>
          </Pane>
          <Pane display="flex" alignItems="center" marginRight={20}>
            <Text size={300} marginRight={8}>
              To:
            </Text>
            <Select
              value={endFormat || ""}
              onChange={handleEndFormatChange}
              width={180}
              placeholder="Select format"
            >
              {availableFormats.map(format => (
                <option key={format} value={format}>
                  {formatDisplayNames[format]}
                </option>
              ))}
            </Select>
          </Pane>
          <Button
            iconBefore="search"
            onClick={handleFindPath}
            disabled={!startFormat || !endFormat || startFormat === endFormat}
          >
            Find Path
          </Button>

          {stages.length > 0 && (
            <Pane
              display="flex"
              alignItems="center"
              marginLeft={20}
              paddingLeft={20}
              borderLeft
            >
              <Text size={300} color="muted">
                {stages.length} stage{stages.length !== 1 ? "s" : ""}
                {startFormat && endFormat && (
                  <>
                    {" • "}
                    {formatDisplayNames[startFormat]} →{" "}
                    {formatDisplayNames[endFormat]}
                  </>
                )}
              </Text>
            </Pane>
          )}
        </Pane>

        <Pane display="flex" flex={1} overflow="hidden" flexDirection="column">
          {stages.length === 0 ? (
            <Pane
              display="flex"
              flex={1}
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              padding={40}
            >
              <Heading size={500} marginBottom={12}>
                Create a Conversion Pipeline
              </Heading>
              <Text
                size={400}
                color="muted"
                textAlign="center"
                marginBottom={20}
              >
                Select a start and end format, then click "Find Path" to
                discover the shortest conversion chain.
              </Text>
              <Text size={300} color="muted">
                Example: XML → JSON → Go
              </Text>
            </Pane>
          ) : (
            <>
              <Pane
                flex={1}
                display="flex"
                flexDirection="column"
                borderBottom
                overflow="hidden"
              >
                <Pane
                  paddingY={8}
                  paddingX={12}
                  backgroundColor="#f8f9fa"
                  borderBottom
                  flexShrink={0}
                >
                  <Text size={300} fontWeight={500}>
                    Input ({startFormat ? formatDisplayNames[startFormat] : ""})
                  </Text>
                </Pane>
                <Pane flex={1} overflow="hidden">
                  <Monaco
                    language={
                      startFormat ? getMonacoLanguage(startFormat) : "plaintext"
                    }
                    value={input}
                    options={{
                      ...monacoOptions,
                      readOnly: isRunning
                    }}
                    onChange={setInput}
                  />
                </Pane>
              </Pane>

              <Pane
                flexShrink={0}
                minHeight={200}
                maxHeight={250}
                padding={16}
                display="flex"
                alignItems="stretch"
                overflowX="auto"
                backgroundColor="#fafafa"
                borderTop
              >
                {stages.map((stage, index) => (
                  <React.Fragment key={stage.id}>
                    <StageCard
                      stage={stage}
                      index={index}
                      totalStages={stages.length}
                      isRunning={isRunning}
                      onRemove={() => removeStage(stage.id)}
                      onMoveUp={() => handleMoveStage(index, index - 1)}
                      onMoveDown={() => handleMoveStage(index, index + 1)}
                      onViewDetail={() => handleViewDetail(stage)}
                    />
                    {index < stages.length - 1 && (
                      <Pane
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        paddingX={4}
                      >
                        <Text size={500} color="muted">
                          →
                        </Text>
                      </Pane>
                    )}
                  </React.Fragment>
                ))}
              </Pane>
            </>
          )}
        </Pane>
      </Pane>

      {stages.length > 0 && (
        <Pane display="flex" flex={1} flexDirection="column" overflow="hidden">
          <Pane
            paddingY={8}
            paddingX={12}
            backgroundColor="#f8f9fa"
            borderBottom
            flexShrink={0}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Text size={300} fontWeight={500}>
              Final Output ({endFormat ? formatDisplayNames[endFormat] : ""})
            </Text>
            <Badge color={hasError ? "red" : "green"}>
              {hasError ? "Error" : "Result"}
            </Badge>
          </Pane>
          <Pane flex={1} overflow="hidden">
            <Monaco
              language={endFormat ? getMonacoLanguage(endFormat) : "plaintext"}
              value={
                stages.length > 0 &&
                stages[stages.length - 1].status === "success"
                  ? stages[stages.length - 1].output
                  : ""
              }
              options={{
                ...monacoOptions,
                readOnly: true
              }}
            />
          </Pane>
        </Pane>
      )}

      {stages.length === 0 && (
        <Pane
          display="flex"
          flex={1}
          alignItems="center"
          justifyContent="center"
          backgroundColor="#fafafa"
        >
          <Pane textAlign="center">
            <Text size={400} color="muted" marginBottom={8}>
              Output will appear here
            </Text>
            <Text size={300} color="muted">
              Select formats and click "Find Path" to create a pipeline
            </Text>
          </Pane>
        </Pane>
      )}

      <StageDetailModal
        stage={selectedStageDetail}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />

      <Dialog
        isShown={isShareModalOpen}
        title="Share Pipeline"
        onCloseComplete={() => setIsShareModalOpen(false)}
        confirmLabel="Copy Link"
        onConfirm={handleCopyLink}
        hasCancel={false}
      >
        <Pane marginBottom={16}>
          <Text size={300} marginBottom={8}>
            Copy this link to share your pipeline configuration:
          </Text>
        </Pane>
        <Pane
          display="flex"
          alignItems="center"
          border
          borderRadius={4}
          padding={8}
          backgroundColor="#f8f9fa"
        >
          <Text
            size={200}
            flex={1}
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            fontFamily="monospace"
          >
            {shareLink}
          </Text>
          <Button
            iconBefore="duplicate"
            appearance="primary"
            onClick={handleCopyLink}
            marginLeft={8}
          >
            Copy
          </Button>
        </Pane>
      </Dialog>
    </Pane>
  );
}
