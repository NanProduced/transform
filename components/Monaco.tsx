import React from "react";
import Editor from "@monaco-editor/react";
import { LoaderIcon } from "@components/ui/Icons";
import { useThemeContext } from "@components/ThemeProvider";

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
}

export const Monaco: React.FC<MonacoProps> = ({
  language,
  value,
  defaultValue,
  height,
  width,
  options,
  onChange
}) => {
  const { isDark } = useThemeContext();
  const monacoTheme = isDark ? "vs-dark" : "vs";

  return (
    <Editor
      defaultLanguage={language}
      defaultValue={defaultValue}
      value={value}
      height={height}
      width={width}
      theme={monacoTheme}
      options={{
        ...options,
        theme: monacoTheme
      }}
      onChange={onChange}
      loading={
        <div className="flex items-center justify-center h-[400px] flex-1">
          <LoaderIcon className="w-8 h-8 text-primary-600" />
        </div>
      }
    />
  );
};

export default Monaco;
