import ConversionPanel from "@components/ConversionPanel";
import * as React from "react";
import { createConversionPanelTransformer } from "@utils/pipeline/transformers";

export default function YamlToToml() {
  const transformer = createConversionPanelTransformer("yaml-to-toml");

  return (
    <ConversionPanel
      transformer={transformer}
      editorTitle="YAML"
      editorLanguage="yaml"
      resultTitle="TOML"
      resultLanguage={"toml"}
    />
  );
}
