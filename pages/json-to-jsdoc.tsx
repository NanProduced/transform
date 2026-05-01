import ConversionPanel from "@components/ConversionPanel";
import * as React from "react";
import { createConversionPanelTransformer } from "@utils/pipeline/transformers";

export default function JsonToJsdoc() {
  const transformer = createConversionPanelTransformer("json-to-jsdoc");

  return (
    <ConversionPanel
      transformer={transformer}
      editorTitle="JSON"
      editorLanguage="json"
      resultTitle="JSDoc"
      resultLanguage={"javascript"}
    />
  );
}
