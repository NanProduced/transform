import ConversionPanel from "@components/ConversionPanel";
import * as React from "react";
import { createConversionPanelTransformer } from "@utils/pipeline/transformers";

export default function JsonToScalaCaseClass() {
  const transformer = createConversionPanelTransformer(
    "json-to-scala-case-class"
  );

  return (
    <ConversionPanel
      transformer={transformer}
      editorTitle="JSON"
      editorLanguage="json"
      resultTitle="Scala Case Class"
      resultLanguage={"scala"}
    />
  );
}
