import ConversionPanel from "@components/ConversionPanel";
import { EditorPanelProps } from "@components/EditorPanel";
import Form, { InputType } from "@components/Form";
import { useSettings } from "@hooks/useSettings";
import * as React from "react";
import { useCallback, useMemo } from "react";
import { createConversionPanelTransformer } from "@utils/pipeline/transformers";

interface Settings {
  typealias: boolean;
}

const formFields = [
  {
    type: InputType.SWITCH,
    key: "typealias",
    label: "Create Mono Type"
  }
];

export default function JsonToTypescript() {
  const name = "JSON to Typescript";

  const [settings, setSettings] = useSettings(name, {
    typealias: false
  });

  const transformer = useMemo(() => {
    return createConversionPanelTransformer("json-to-typescript", settings);
  }, [settings]);

  const getSettingsElement = useCallback<EditorPanelProps["settingElement"]>(
    ({ open, toggle }) => {
      return (
        <Form<Settings>
          title={name}
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
      editorTitle="JSON"
      editorLanguage="json"
      resultTitle="TypeScript"
      resultLanguage={"typescript"}
      editorSettingsElement={getSettingsElement}
      settings={settings}
    />
  );
}
