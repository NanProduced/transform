import React from "react";
import Editor from "@monaco-editor/react";
import { Pane, Spinner } from "evergreen-ui";
import * as monaco from "monaco-editor";

export function processSize(size) {
  return !/^\d+$/.test(size) ? size : `${size}px`;
}

interface MonacoProps {
  theme?: string;
  language?: string;
  value?: string;
  width?: number | string;
  height?: number | string;
  options?: any;
  defaultValue?: string;
  onChange: (value: string) => void;
  onMount?: (
    editor: monaco.editor.IStandaloneCodeEditor,
    monacoInstance: typeof monaco
  ) => void;
}

export const Monaco: React.FC<MonacoProps> = ({
  language,
  value,
  defaultValue,
  height,
  width,
  options,
  onChange,
  onMount
}) => {
  return (
    <Editor
      defaultLanguage={language}
      defaultValue={defaultValue}
      value={value}
      height={height}
      width={width}
      options={options}
      onChange={onChange}
      onMount={onMount}
      loading={
        <Pane
          display="flex"
          alignItems="center"
          justifyContent="center"
          height={400}
          flex={1}
        >
          <Spinner />
        </Pane>
      }
    />
  );
};

export default Monaco;
