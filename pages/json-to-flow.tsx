import ConversionPanel from "@components/ConversionPanel";
import * as React from "react";
import { useCallback, useMemo } from "react";
import { useSettings } from "@hooks/useSettings";
import Form, { InputType } from "@components/Form";
import { EditorPanelProps } from "@components/EditorPanel";
import { Settings } from "@constants/svgoConfig";
import { createConversionPanelTransformer } from "@utils/pipeline/transformers";

const formFields = [
  {
    type: InputType.TEXT_INPUT,
    key: "namespace",
    label: "Namespace"
  },
  {
    type: InputType.TEXT_INPUT,
    key: "prefix",
    label: "prefix"
  },
  {
    type: InputType.TEXT_INPUT,
    key: "rootName",
    label: "Root Name"
  }
];

const defaultSettings = {
  namespace: "",
  prefix: "I",
  rootName: "RootObject"
};

export default function JsonToFlow() {
  const name = "json-to-flow";

  const [settings, setSettings] = useSettings(name, defaultSettings);

  const transformer = useMemo(() => {
    return createConversionPanelTransformer("json-to-flow", settings);
  }, [settings]);

  const getSettingsElement = useCallback<EditorPanelProps["settingElement"]>(
    ({ open, toggle }) => {
      return (
        <Form<Settings>
          title="JSON to Flow"
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
      resultTitle="Flow"
      resultLanguage={"typescript"}
      resultSettingsElement={getSettingsElement}
      settings={settings}
    />
  );
}
