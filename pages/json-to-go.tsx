import ConversionPanel from "@components/ConversionPanel";
import * as React from "react";
import { createConversionPanelTransformer } from "@utils/pipeline/transformers";

export default function JsonToGo() {
  const transformer = createConversionPanelTransformer("json-to-go");

  return (
    <ConversionPanel
      transformer={transformer}
      editorTitle="JSON"
      editorLanguage="json"
      resultTitle="Go"
      resultLanguage={"go"}
    />
  );
}
