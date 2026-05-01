import React, { useEffect, useState } from "react";
import EditorPanel, { EditorPanelProps } from "@components/EditorPanel";
import { Language, useData } from "@hooks/useData";
import { useRouter } from "next/router";
import { activeRouteData } from "@utils/routes";
import PrettierWorker from "@workers/prettier.worker";
import { getWorker } from "@utils/workerWrapper";
import { LoaderIcon, AlertTriangleIcon, XIcon } from "@components/ui/Icons";

let prettierWorker;

function getEditorLanguage(lang: Language) {
  const mapping = {
    flow: "typescript"
  };

  return mapping[lang] || lang;
}

export type Transformer = (args: {
  value: string;
  splitEditorValue?: string;
}) => Promise<string>;

export interface ConversionPanelProps {
  splitTitle?: string;
  splitLanguage?: Language;
  editorTitle: string;
  editorLanguage: Language;
  editorDefaultValue?: string;
  resultTitle: React.ReactNode;
  resultLanguage: Language;
  splitEditorProps?: Partial<EditorPanelProps>;
  splitEditorDefaultValue?: string;
  editorProps?: Partial<EditorPanelProps>;
  resultEditorProps?: Partial<EditorPanelProps>;
  transformer: Transformer;
  defaultSplitValue?: string;
  editorSettingsElement?: EditorPanelProps["settingElement"];
  resultSettingsElement?: EditorPanelProps["settingElement"];
  settings?: any;
}

const ConversionPanel: React.FC<ConversionPanelProps> = function({
  splitEditorProps,
  editorProps,
  resultEditorProps,
  transformer,
  splitLanguage,
  splitTitle,
  editorLanguage,
  editorTitle,
  resultLanguage,
  resultTitle,
  editorSettingsElement,
  settings,
  editorDefaultValue,
  splitEditorDefaultValue,
  resultSettingsElement
}) {
  const [value, setValue] = useData(editorDefaultValue || editorLanguage);
  const [splitValue, setSplitValue] = useData(
    splitEditorDefaultValue || splitLanguage
  );
  const [result, setResult] = useState("");
  const [message, setMessage] = useState("");
  const [showUpdateSpinner, toggleUpdateSpinner] = useState(false);

  const router = useRouter();
  const route = activeRouteData(router.pathname);

  let packageDetails;

  if (route) {
    const { packageUrl, packageName } = route;

    packageDetails =
      packageName && packageUrl
        ? {
            name: packageName,
            url: packageUrl
          }
        : undefined;
  }

  useEffect(() => {
    async function transform() {
      try {
        toggleUpdateSpinner(true);
        prettierWorker = prettierWorker || getWorker(PrettierWorker);

        const result = await transformer({
          value,
          splitEditorValue: splitTitle ? splitValue : undefined
        });

        let prettyResult = await prettierWorker.send({
          value: result,
          language: resultLanguage
        });

        if (prettyResult.startsWith(";<")) {
          prettyResult = prettyResult.slice(1);
        }
        setResult(prettyResult);
        setMessage("");
      } catch (e) {
        console.error(e);
        setMessage(e.message);
      }
      toggleUpdateSpinner(false);
    }

    transform();
  }, [splitValue, value, splitTitle, settings]);

  return (
    <>
      <div className="flex flex-row overflow-hidden flex-1 h-[calc(100vh-48px)]">
        <div className="flex flex-1 border-r border-border flex-col overflow-hidden">
          <EditorPanel
            language={getEditorLanguage(editorLanguage)}
            onChange={setValue}
            hasLoad
            defaultValue={value}
            id={1}
            hasCopy={false}
            title={editorTitle}
            settingElement={editorSettingsElement}
            hasClear
            {...editorProps}
          />

          {splitTitle && (
            <div className="flex flex-1 border-t border-border">
              <EditorPanel
                title={splitTitle}
                defaultValue={splitValue}
                language={getEditorLanguage(splitLanguage)}
                id={2}
                hasCopy={false}
                onChange={setSplitValue}
                hasLoad
                hasClear
                {...splitEditorProps}
              />
            </div>
          )}
        </div>

        <div className="flex flex-1 relative overflow-hidden">
          {showUpdateSpinner && (
            <div className="absolute top-12 right-8 z-10 inline-flex bg-background border border-border rounded-full shadow-lg p-2">
              <LoaderIcon className="w-6 h-6 text-primary-600" />
            </div>
          )}

          <EditorPanel
            title={resultTitle}
            defaultValue={result}
            language={getEditorLanguage(resultLanguage)}
            id={3}
            editable={false}
            hasPrettier={false}
            settingElement={resultSettingsElement}
            packageDetails={packageDetails}
            {...resultEditorProps}
          />
        </div>
      </div>

      {message && (
        <div className="absolute left-0 lg:left-72 right-0 bottom-0 z-30 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                {message}
              </p>
            </div>
            <button
              onClick={() => setMessage("")}
              className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-800/20 transition-colors text-red-500"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(ConversionPanel);
