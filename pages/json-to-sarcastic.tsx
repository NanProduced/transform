import ConversionPanel from "@components/ConversionPanel";
import * as React from "react";
import { createConversionPanelTransformer } from "@utils/pipeline/transformers";

export default function JsonToSarcastic() {
  const transformer = createConversionPanelTransformer("json-to-sarcastic");

  return (
    <ConversionPanel
      transformer={transformer}
      editorTitle="JSON"
      editorLanguage="json"
      resultTitle="Sarcastic"
      resultLanguage={"javascript"}
    />
  );
}
