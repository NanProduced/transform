import ConversionPanel from "@components/ConversionPanel";
import * as React from "react";
import { createConversionPanelTransformer } from "@utils/pipeline/transformers";

export default function JsonToKotlin() {
  const transformer = createConversionPanelTransformer("json-to-kotlin");

  return (
    <ConversionPanel
      transformer={transformer}
      editorTitle="JSON"
      editorLanguage="json"
      resultTitle="Kotlin"
      resultLanguage={"kotlin"}
    />
  );
}
