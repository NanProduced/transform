import { Settings } from "@constants/svgoConfig";
import { default as React, useCallback } from "react";
import { EditorPanelProps } from "@components/EditorPanel";
import Form from "@components/Form";
import ConversionPanel, { Transformer } from "@components/ConversionPanel";
import { AlertTriangleIcon } from "@components/ui/Icons";

const svgToDataUrl = (svgStr: string) => {
  const encoded = encodeURIComponent(svgStr)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");

  const header = "data:image/svg+xml,";
  const dataUrl = header + encoded;

  return dataUrl;
};

interface SvgConverterProps {
  name: string;
  babelWorker?: any;
  transformer: Transformer;
  formFields: any;
  resultTitle: string;
  optimizedValue: string;
  settings: any;
  setSettings: (settings: any) => void;
}

export const SvgConverter: React.FC<SvgConverterProps> = ({
  transformer,
  resultTitle,
  formFields,
  optimizedValue,
  settings,
  setSettings
}) => {
  const getSettingsPanel = useCallback<EditorPanelProps["settingElement"]>(
    ({ open, toggle }) => {
      return (
        <Form<Partial<Settings>>
          initialValues={settings}
          open={open}
          toggle={toggle}
          title={"SVGO Settings"}
          onSubmit={setSettings}
          formsFields={formFields}
        />
      );
    },
    []
  );

  return (
    <ConversionPanel
      transformer={transformer}
      editorTitle="SVG"
      resultLanguage="javascript"
      resultTitle={resultTitle}
      editorLanguage="html"
      editorDefaultValue="svg"
      settings={settings}
      editorProps={{
        settingElement: getSettingsPanel,
        topNotifications: ({ toggleSettings }) =>
          settings.optimizeSvg && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-3">
              <div className="flex items-start gap-3">
                <AlertTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    SVGO optimization is turned on. You can turn it off or
                    configure it in{" "}
                    <button
                      onClick={toggleSettings}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      settings
                    </button>
                  </p>
                </div>
              </div>
            </div>
          ),
        previewElement: value => (
          <div className="flex flex-row flex-1 h-full">
            <div className="flex flex-1 relative">
              <img
                style={{
                  flex: 1,
                  width: "100%",
                  borderRight: "1px solid #e5e7eb"
                }}
                src={svgToDataUrl(value)}
                alt="original"
                className="object-contain p-4"
              />

              <span className="absolute bottom-3 right-3 text-xs px-2 py-1 bg-green-500 text-white rounded font-medium">
                Original
              </span>
            </div>
            <div className="flex flex-1 relative">
              {optimizedValue && (
                <img
                  style={{
                    flex: 1,
                    width: "100%"
                  }}
                  src={svgToDataUrl(optimizedValue)}
                  alt="optimized"
                  className="object-contain p-4"
                />
              )}

              <span className="absolute bottom-3 right-3 text-xs px-2 py-1 bg-green-500 text-white rounded font-medium">
                Result
              </span>
            </div>
          </div>
        ),
        acceptFiles: "image/svg+xml"
      }}
    />
  );
};
