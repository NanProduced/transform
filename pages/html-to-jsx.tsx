import * as React from "react";
import { useCallback, useState } from "react";
import ConversionPanel, { Transformer } from "@components/ConversionPanel";
import HtmlToJsx from "htmltojsx";
import { EditorPanelProps } from "@components/EditorPanel";
import Form, { InputType } from "@components/Form";
import { useSettings } from "@hooks/useSettings";
import isSvg from "is-svg";
import Router from "next/router";

interface Settings {
  createFunction: boolean;
  outputFunctionName: string;
}

const formFields = [
  {
    type: InputType.SWITCH,
    key: "createFunction",
    label: "Create function component"
  }
];

export default function HtmlToJsxComponent() {
  const name = "HTML to JSX";

  const [settings, setSettings] = useSettings(name, {
    createFunction: false
  });

  const [_isSvg, setSvg] = useState(false);

  const transformer = useCallback<Transformer>(
    async ({ value }) => {
      setSvg(isSvg(value));

      const converter = new HtmlToJsx({
        createClass: false
      });
      let result = converter.convert(value);

      if (settings.createFunction) {
        result = `export const Foo = () => (${result})`;
      }

      return result;
    },
    [settings]
  );

  const getSettingsElement = useCallback<EditorPanelProps["settingElement"]>(
    ({ open, toggle }) => {
      return (
        <Form<Settings>
          title="HTML to JSX"
          onSubmit={setSettings}
          open={open}
          toggle={toggle}
          formsFields={formFields}
          initialValues={settings}
        />
      );
    },
    []
  );

  return (
    <ConversionPanel
      transformer={transformer}
      editorTitle="HTML"
      resultLanguage={"javascript"}
      resultTitle="JSX"
      editorLanguage="html"
      editorSettingsElement={getSettingsElement}
      settings={settings}
      editorProps={{
        topNotifications: () =>
          _isSvg ? (
            <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-4 py-3">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                SVG detected. For preview and optimization, go to{" "}
                <button
                  onClick={() => Router.push("/svg-to-jsx")}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  SVG to JSX converter.
                </button>
              </p>
            </div>
          ) : (
            undefined
          )
      }}
    />
  );
}
