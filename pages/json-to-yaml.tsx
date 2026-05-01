import ConversionPanel from "@components/ConversionPanel";
import * as React from "react";
import { createConversionPanelTransformer } from "@utils/pipeline/transformers";

export default function JsonToYaml() {
  const transformer = createConversionPanelTransformer("json-to-yaml");

  return (
    <ConversionPanel
      transformer={transformer}
      editorTitle="JSON"
      editorLanguage="json"
      resultTitle="YAML"
      resultLanguage={"yaml"}
    />
  );
}
