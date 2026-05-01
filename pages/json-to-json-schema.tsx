import ConversionPanel from "@components/ConversionPanel";
import * as React from "react";
import { createConversionPanelTransformer } from "@utils/pipeline/transformers";

export default function JsonToJsonSchema() {
  const transformer = createConversionPanelTransformer("json-to-json-schema");

  return (
    <ConversionPanel
      transformer={transformer}
      editorTitle="JSON"
      editorLanguage="json"
      resultTitle="JSON Schema"
      resultLanguage={"json"}
    />
  );
}
