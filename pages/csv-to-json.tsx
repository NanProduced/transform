import * as React from "react";
import { useCallback, useState, useEffect, useRef } from "react";
import {
  Pane,
  Alert,
  Heading,
  Button,
  toaster,
  Tooltip,
  IconButton
} from "evergreen-ui";
import dynamic from "next/dynamic";
import copy from "clipboard-copy";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { csv as sampleCsv } from "@constants/data";
import { useSettings } from "@hooks/useSettings";
import Form, { InputType } from "@components/Form";
import * as monaco from "monaco-editor";

const Monaco = dynamic(() => import("../components/Monaco"), {
  ssr: false
});

interface CsvToJsonSettings {
  dynamicTyping: boolean;
  header: boolean;
  skipEmptyLines: boolean;
}

const formFields = [
  {
    type: InputType.SWITCH,
    key: "dynamicTyping",
    label: "Dynamic Typing (类型推断)"
  },
  {
    type: InputType.SWITCH,
    key: "header",
    label: "First Row as Header (首行作为表头)"
  },
  {
    type: InputType.SWITCH,
    key: "skipEmptyLines",
    label: "Skip Empty Lines (跳过空行)"
  }
];

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function CsvToJson() {
  const name = "CSV to JSON";

  const [settings, setSettings] = useSettings<CsvToJsonSettings>(name, {
    dynamicTyping: true,
    header: true,
    skipEmptyLines: true
  });

  const [inputValue, setInputValue] = useState(sampleCsv);
  const [outputValue, setOutputValue] = useState("");
  const [message, setMessage] = useState("");
  const [showSettingsDialogue, setSettingsDialog] = useState(false);
  const [fetchingUrl, setFetchingUrl] = useState("");
  const [parseError, setParseError] = useState<{
    row: number;
    message: string;
  } | null>(null);

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof monaco | null>(null);

  const inputOptions = {
    fontSize: 14,
    readOnly: false,
    codeLens: false,
    fontFamily: "Menlo, Consolas, monospace, sans-serif",
    minimap: {
      enabled: false
    },
    quickSuggestions: false,
    lineNumbers: "on",
    renderValidationDecorations: "off"
  };

  const outputOptions = {
    fontSize: 14,
    readOnly: true,
    codeLens: false,
    fontFamily: "Menlo, Consolas, monospace, sans-serif",
    minimap: {
      enabled: false
    },
    quickSuggestions: false,
    lineNumbers: "on",
    renderValidationDecorations: "off"
  };

  const handleEditorMount = useCallback(
    (
      editor: monaco.editor.IStandaloneCodeEditor,
      monacoInstance: typeof monaco
    ) => {
      editorRef.current = editor;
      monacoRef.current = monacoInstance;
    },
    []
  );

  const setErrorMarkers = useCallback((row: number, errorMessage: string) => {
    if (!editorRef.current || !monacoRef.current) return;

    const model = editorRef.current.getModel();
    if (!model) return;

    const lineNumber = Math.max(1, row + 1);
    const lineContent = model.getLineContent(lineNumber);

    const markers: monaco.editor.IMarkerData[] = [
      {
        startLineNumber: lineNumber,
        startColumn: 1,
        endLineNumber: lineNumber,
        endColumn: lineContent.length + 1,
        message: errorMessage,
        severity: monacoRef.current.MarkerSeverity.Error
      }
    ];

    monacoRef.current.editor.setModelMarkers(model, "csv-parser", markers);
  }, []);

  const clearErrorMarkers = useCallback(() => {
    if (!editorRef.current || !monacoRef.current) return;

    const model = editorRef.current.getModel();
    if (!model) return;

    monacoRef.current.editor.setModelMarkers(model, "csv-parser", []);
  }, []);

  useEffect(() => {
    transform();
  }, [inputValue, settings]);

  const transform = useCallback(() => {
    if (!inputValue.trim()) {
      setOutputValue("[]");
      setMessage("");
      setParseError(null);
      clearErrorMarkers();
      return;
    }

    try {
      Papa.parse(inputValue, {
        header: settings.header,
        dynamicTyping: settings.dynamicTyping,
        skipEmptyLines: settings.skipEmptyLines,
        complete: results => {
          setParseError(null);
          clearErrorMarkers();
          const output = settings.header
            ? results.data
            : { data: results.data, meta: results.meta };
          setOutputValue(JSON.stringify(output, null, 2));
          setMessage("");
        },
        error: (error: any, file?: any, row?: number) => {
          const errorRow = row !== undefined ? row : 0;
          setParseError({ row: errorRow, message: error.message });
          setErrorMarkers(errorRow, error.message);
          setMessage(`Parse error at row ${errorRow}: ${error.message}`);
        }
      });
    } catch (e) {
      setMessage(e.message);
      setParseError({ row: 0, message: e.message });
      setErrorMarkers(0, e.message);
    }
  }, [inputValue, settings, clearErrorMarkers, setErrorMarkers]);

  const _toggleSettingsDialog = useCallback(
    () => setSettingsDialog(!showSettingsDialogue),
    [showSettingsDialogue]
  );

  const onFilePicked = useCallback((files: File[]) => {
    if (!(files && files.length)) return;
    const file = files[0];
    const reader = new FileReader();
    reader.readAsText(file, "utf-8");
    reader.onload = () => {
      setInputValue(reader.result as string);
    };
  }, []);

  const { getRootProps } = useDropzone({
    onDrop: files => onFilePicked(files),
    disabled: false,
    accept: ".csv,.txt"
  });

  const copyOutput = useCallback(() => {
    copy(outputValue);
    toaster.success("Copied to clipboard.");
  }, [outputValue]);

  const fetchFile = useCallback(() => {
    if (!fetchingUrl) return;
    (async () => {
      try {
        const res = await fetch(fetchingUrl);
        const value = await res.text();
        setInputValue(value);
        setFetchingUrl("");
      } catch (e) {
        toaster.danger(`Failed to fetch: ${e.message}`);
      }
    })();
  }, [fetchingUrl]);

  const handleDownload = useCallback(() => {
    if (!outputValue.trim()) {
      toaster.warning("No data to download");
      return;
    }
    downloadBlob(outputValue, "output.json", "application/json");
    toaster.success("JSON file downloaded!");
  }, [outputValue]);

  const handleLoadSample = useCallback(() => {
    setInputValue(sampleCsv);
    toaster.success("Sample data loaded");
  }, []);

  return (
    <>
      <Pane
        display="flex"
        flexDirection="row"
        overflow="hidden"
        flex={1}
        height="calc(100vh - 40px)"
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
            height={40}
            paddingX={10}
            alignItems="center"
            borderBottom
            zIndex={2}
            backgroundColor="#FFFFFF"
            flexShrink={0}
          >
            <Pane flex={1}>
              <Heading size={500} marginTop={0}>
                CSV
              </Heading>
            </Pane>

            <Button
              marginRight={10}
              iconBefore="cog"
              onClick={_toggleSettingsDialog}
              height={28}
            >
              Settings
            </Button>

            <Form<CsvToJsonSettings>
              title={name}
              onSubmit={setSettings}
              open={showSettingsDialogue}
              toggle={_toggleSettingsDialog}
              formsFields={formFields}
              initialValues={settings}
            />

            {parseError && (
              <Button
                marginRight={10}
                height={28}
                intent="danger"
                onClick={() => {
                  toaster.danger(
                    `Error at row ${parseError.row + 1}: ${parseError.message}`
                  );
                }}
              >
                Error at row {parseError.row + 1}
              </Button>
            )}

            <Button marginRight={10} height={28} onClick={handleLoadSample}>
              Load Sample
            </Button>

            <Tooltip content="Clear">
              <IconButton
                height={28}
                icon="trash"
                intent="danger"
                marginRight={10}
                onClick={() => setInputValue("")}
              />
            </Tooltip>
          </Pane>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              overflow: "hidden"
            }}
            {...getRootProps()}
          >
            {inputValue.trim() === "" && (
              <Pane
                position="absolute"
                top={60}
                left={20}
                right={20}
                zIndex={10}
              >
                <Alert
                  backgroundColor="#F6FFED"
                  intent="success"
                  title={
                    <>
                      <Heading size={400}>CSV to JSON Converter</Heading>
                      <p style={{ marginTop: 8, fontSize: 14 }}>
                        Paste your CSV data or click "Load Sample" to try it
                        out. Features: Dynamic type inference, error
                        highlighting, and customizable parsing options.
                      </p>
                    </>
                  }
                />
              </Pane>
            )}

            <Monaco
              language="plaintext"
              value={inputValue}
              options={inputOptions}
              onChange={value => {
                setInputValue(value);
              }}
              onMount={handleEditorMount}
            />
          </div>
        </Pane>

        <Pane display="flex" flex={1} flexDirection="column" overflow="hidden">
          <Pane
            display="flex"
            height={40}
            paddingX={10}
            alignItems="center"
            borderBottom
            zIndex={2}
            backgroundColor="#FFFFFF"
            flexShrink={0}
          >
            <Pane flex={1}>
              <Heading size={500} marginTop={0}>
                JSON
              </Heading>
            </Pane>

            <Button
              marginRight={10}
              height={28}
              iconBefore="download"
              onClick={handleDownload}
            >
              Download JSON
            </Button>

            <Button
              appearance="primary"
              marginRight={10}
              iconBefore="duplicate"
              onClick={copyOutput}
              height={28}
            >
              Copy
            </Button>
          </Pane>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              overflow: "hidden"
            }}
          >
            <Monaco
              language="json"
              value={outputValue}
              options={outputOptions}
              onChange={() => {}}
            />
          </div>
        </Pane>
      </Pane>

      {message && (
        <Alert
          paddingY={15}
          paddingX={20}
          left={240}
          right={0}
          position="absolute"
          intent="danger"
          bottom={0}
          title={message}
          backgroundColor="#FAE2E2"
          zIndex={3}
        />
      )}
    </>
  );
}
