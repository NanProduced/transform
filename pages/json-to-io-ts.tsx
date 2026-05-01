import ConversionPanel from "@components/ConversionPanel";
import * as React from "react";
import { createConversionPanelTransformer } from "@utils/pipeline/transformers";

export default function JsonToIoTs() {
  const transformer = createConversionPanelTransformer("json-to-io-ts");

  return (
    <ConversionPanel
      transformer={transformer}
      editorTitle="JSON"
      editorLanguage="json"
      resultTitle="IO TS"
      resultLanguage={"rust"}
    />
  );
}
