import * as React from "react";
import { useCallback, useState, useEffect } from "react";
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
import { nestedJson as sampleJson } from "@constants/data";
import { useSettings } from "@hooks/useSettings";
import Form, { InputType } from "@components/Form";

const Monaco = dynamic(() => import("../components/Monaco"), {
  ssr: false
});

interface JsonToCsvSettings {
  flatten: boolean;
  delimiter: string;
  includeEmpty: boolean;
  quoteChar: string;
}

const formFields = [
  {
    type: InputType.SWITCH,
    key: "flatten",
    label: "Flatten Nested Objects (递归拍平嵌套对象)"
  },
  {
    type: InputType.SWITCH,
    key: "includeEmpty",
    label: "Include Empty Fields (包含空字段)"
  },
  {
    type: InputType.SELECT,
    key: "delimiter",
    label: "Delimiter (分隔符)",
    options: [
      { label: "Comma (,)", value: "," },
      { label: "Tab (\\t)", value: "\t" },
      { label: "Semicolon (;)", value: ";" },
      { label: "Pipe (|)", value: "|" }
    ]
  },
  {
    type: InputType.SELECT,
    key: "quoteChar",
    label: "Quote Character (引号字符)",
    options: [
      { label: 'Double Quote (")', value: '"' },
      { label: "Single Quote (')", value: "'" }
    ]
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

function flattenObject(
  obj: any,
  prefix = "",
  includeEmpty = false
): Record<string, any> {
  const result: Record<string, any> = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];

      if (value === null || value === undefined) {
        if (includeEmpty) {
          result[newKey] = value;
        }
      } else if (Array.isArray(value)) {
        if (value.length === 0) {
          if (includeEmpty) {
            result[newKey] = "[]";
          }
        } else if (
          value.every(
            v =>
              typeof v === "string" ||
              typeof v === "number" ||
              typeof v === "boolean" ||
              v === null
          )
        ) {
          result[newKey] = JSON.stringify(value);
        } else {
          value.forEach((item, index) => {
            const flattened = flattenObject(
              item,
              `${newKey}.${index}`,
              includeEmpty
            );
            Object.assign(result, flattened);
          });
        }
      } else if (typeof value === "object" && value !== null) {
        if (Object.keys(value).length === 0) {
          if (includeEmpty) {
            result[newKey] = "{}";
          }
        } else {
          const flattened = flattenObject(value, newKey, includeEmpty);
          Object.assign(result, flattened);
        }
      } else {
        result[newKey] = value;
      }
    }
  }

  return result;
}

function ensureArray(data: any): any[] {
  if (Array.isArray(data)) {
    return data;
  }
  if (typeof data === "object" && data !== null) {
    return [data];
  }
  return [];
}

function getAllHeaders(rows: Record<string, any>[]): string[] {
  const headers = new Set<string>();
  rows.forEach(row => {
    Object.keys(row).forEach(key => headers.add(key));
  });
  return Array.from(headers).sort();
}

function padRow(
  row: Record<string, any>,
  headers: string[]
): Record<string, any> {
  const result: Record<string, any> = {};
  headers.forEach(header => {
    result[header] = row.hasOwnProperty(header) ? row[header] : "";
  });
  return result;
}

export default function JsonToCsv() {
  const name = "JSON to CSV";

  const [settings, setSettings] = useSettings<JsonToCsvSettings>(name, {
    flatten: true,
    delimiter: ",",
    includeEmpty: false,
    quoteChar: '"'
  });

  const [inputValue, setInputValue] = useState(sampleJson);
  const [outputValue, setOutputValue] = useState("");
  const [message, setMessage] = useState("");
  const [showSettingsDialogue, setSettingsDialog] = useState(false);

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

  useEffect(() => {
    transform();
  }, [inputValue, settings]);

  const transform = useCallback(() => {
    if (!inputValue.trim()) {
      setOutputValue("");
      setMessage("");
      return;
    }

    try {
      let data = JSON.parse(inputValue);
      const rows = ensureArray(data);

      let processedRows: Record<string, any>[];
      if (settings.flatten) {
        processedRows = rows.map(row =>
          flattenObject(row, "", settings.includeEmpty)
        );
      } else {
        processedRows = rows;
      }

      const headers = getAllHeaders(processedRows);
      const paddedRows = processedRows.map(row => padRow(row, headers));

      const csv = Papa.unparse(paddedRows, {
        delimiter: settings.delimiter,
        quotes: true,
        quoteChar: settings.quoteChar
      });

      setOutputValue(csv);
      setMessage("");
    } catch (e) {
      setMessage(`Invalid JSON: ${e.message}`);
      setOutputValue("");
    }
  }, [inputValue, settings]);

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
    accept: ".json"
  });

  const copyOutput = useCallback(() => {
    copy(outputValue);
    toaster.success("Copied to clipboard.");
  }, [outputValue]);

  const handleDownload = useCallback(() => {
    if (!outputValue.trim()) {
      toaster.warning("No data to download");
      return;
    }
    downloadBlob(outputValue, "output.csv", "text/csv;charset=utf-8");
    toaster.success("CSV file downloaded!");
  }, [outputValue]);

  const handleLoadSample = useCallback(() => {
    setInputValue(sampleJson);
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
                JSON
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

            <Form<JsonToCsvSettings>
              title={name}
              onSubmit={setSettings}
              open={showSettingsDialogue}
              toggle={_toggleSettingsDialog}
              formsFields={formFields}
              initialValues={settings}
            />

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
                      <Heading size={400}>JSON to CSV Converter</Heading>
                      <p style={{ marginTop: 8, fontSize: 14 }}>
                        Paste your JSON data or click "Load Sample" to try it
                        out. Features: Recursive flattening of nested objects,
                        dot-path headers, and customizable output.
                      </p>
                    </>
                  }
                />
              </Pane>
            )}

            <Monaco
              language="json"
              value={inputValue}
              options={inputOptions}
              onChange={value => {
                setInputValue(value);
              }}
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
                CSV
              </Heading>
            </Pane>

            <Button
              marginRight={10}
              height={28}
              iconBefore="download"
              onClick={handleDownload}
            >
              Download CSV
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
              language="plaintext"
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
