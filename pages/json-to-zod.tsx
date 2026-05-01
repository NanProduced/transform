import ConversionPanel from "@components/ConversionPanel";
import { EditorPanelProps } from "@components/EditorPanel";
import Form, { InputType } from "@components/Form";
import { useSettings } from "@hooks/useSettings";
import * as React from "react";
import { useCallback, useMemo } from "react";
import { createConversionPanelTransformer } from "@utils/pipeline/transformers";

interface Settings {
  rootName: string;
}

const formFields = [
  {
    type: InputType.TEXT_INPUT,
    key: "rootName",
    label: "Root Schema Name"
  }
];

export default function JsonToZod() {
  const name = "JSON to Zod Schema";

  const [settings, setSettings] = useSettings(name, {
    rootName: "schema"
  });

  const transformer = useMemo(() => {
    return createConversionPanelTransformer("json-to-zod", settings);
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
      resultTitle="Zod Schema"
      resultLanguage={"typescript"}
      editorSettingsElement={getSettingsElement}
      settings={settings}
    />
  );
}
