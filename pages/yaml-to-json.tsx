import ConversionPanel from "@components/ConversionPanel";
import * as React from "react";
import { createConversionPanelTransformer } from "@utils/pipeline/transformers";

export default function YamlToJson() {
  const transformer = createConversionPanelTransformer("yaml-to-json");

  return (
    <ConversionPanel
      transformer={transformer}
      editorTitle="YAML"
      editorLanguage="yaml"
      resultTitle="JSON"
      resultLanguage={"json"}
    />
  );
}
