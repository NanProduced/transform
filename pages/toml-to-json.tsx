import ConversionPanel from "@components/ConversionPanel";
import * as React from "react";
import { createConversionPanelTransformer } from "@utils/pipeline/transformers";

export default function TomlToJson() {
  const transformer = createConversionPanelTransformer("toml-to-json");

  return (
    <ConversionPanel
      transformer={transformer}
      editorTitle="TOML"
      editorLanguage="toml"
      resultTitle="JSON"
      resultLanguage={"json"}
    />
  );
}
