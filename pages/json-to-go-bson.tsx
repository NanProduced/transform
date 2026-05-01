import ConversionPanel from "@components/ConversionPanel";
import * as React from "react";
import { createConversionPanelTransformer } from "@utils/pipeline/transformers";

export default function JsonToGoBson() {
  const transformer = createConversionPanelTransformer("json-to-go-bson");

  return (
    <ConversionPanel
      transformer={transformer}
      editorTitle="JSON"
      editorLanguage="json"
      resultTitle="Go Bson"
      resultLanguage={"go"}
    />
  );
}
