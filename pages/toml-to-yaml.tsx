import ConversionPanel from "@components/ConversionPanel";
import * as React from "react";
import { createConversionPanelTransformer } from "@utils/pipeline/transformers";

export default function TomlToYaml() {
  const transformer = createConversionPanelTransformer("toml-to-yaml");

  return (
    <ConversionPanel
      transformer={transformer}
      editorTitle="TOML"
      editorLanguage="toml"
      resultTitle="YAML"
      resultLanguage={"yaml"}
    />
  );
}
