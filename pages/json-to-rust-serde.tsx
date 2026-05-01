import ConversionPanel from "@components/ConversionPanel";
import * as React from "react";
import { useCallback, useMemo } from "react";
import Form, { InputType } from "@components/Form";
import { useSettings } from "@hooks/useSettings";
import { EditorPanelProps } from "@components/EditorPanel";
import { Settings } from "@constants/svgoConfig";
import { createConversionPanelTransformer } from "@utils/pipeline/transformers";

const formFields = [
  {
    type: InputType.SELECT,
    key: "property_name_format",
    label: "Property Name Format",
    options: [
      "PascalCase",
      "camelCase",
      "snake_case",
      "SCREAMING_SNAKE_CASE",
      "kebab-case",
      "SCREAMING-KEBAB-CASE",
      "UPPERCASE"
    ].map(value => ({
      label: value,
      value
    }))
  }
];

const defaultSettings = {
  property_name_format: "camelCase"
};

export default function JsonToRustSerde() {
  const name = "json-to-rust-serde";

  const [settings, setSettings] = useSettings(name, defaultSettings);

  const transformer = useMemo(() => {
    return createConversionPanelTransformer("json-to-rust-serde", settings);
  }, [settings]);

  const getSettingsElement = useCallback<EditorPanelProps["settingElement"]>(
    ({ open, toggle }) => {
      return (
        <Form<Settings>
          title="JSON to Rust Serde"
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
      resultTitle="Rust Serde"
      resultLanguage={"rust"}
      resultSettingsElement={getSettingsElement}
      settings={settings}
    />
  );
}
