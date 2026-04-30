import React, { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { Pane, Spinner } from "evergreen-ui";

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
  fontFamily?: string;
}

const MONACO_DEFAULT_FONT = "Menlo, Consolas, monospace, sans-serif";

function getMonacoFontFamily(): string {
  if (typeof window === "undefined") {
    return MONACO_DEFAULT_FONT;
  }
  const rootStyle = window.getComputedStyle(document.documentElement);
  const customFont = rootStyle.getPropertyValue("--font-family-monaco").trim();
  return customFont || MONACO_DEFAULT_FONT;
}

export const Monaco: React.FC<MonacoProps> = ({
  language,
  value,
  defaultValue,
  height,
  width,
  options,
  onChange,
  fontFamily
}) => {
  const [editorFontFamily, setEditorFontFamily] = useState(() => {
    return fontFamily || getMonacoFontFamily();
  });

  useEffect(() => {
    if (fontFamily) {
      setEditorFontFamily(fontFamily);
    } else {
      const updateFont = () => {
        setEditorFontFamily(getMonacoFontFamily());
      };

      updateFont();

      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (
            mutation.type === "attributes" &&
            mutation.attributeName === "style"
          ) {
            updateFont();
          }
        });
      });

      observer.observe(document.documentElement, { attributes: true });

      return () => observer.disconnect();
    }
  }, [fontFamily]);

  const mergedOptions = {
    ...options,
    fontFamily: editorFontFamily,
    fontLigatures: true
  };

  return (
    <Editor
      defaultLanguage={language}
      defaultValue={defaultValue}
      value={value}
      height={height}
      width={width}
      options={mergedOptions}
      onChange={onChange}
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
