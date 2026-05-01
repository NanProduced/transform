import ConversionPanel from "@components/ConversionPanel";
import * as React from "react";
import { createConversionPanelTransformer } from "@utils/pipeline/transformers";

export default function XmlToJson() {
  const transformer = createConversionPanelTransformer("xml-to-json");

  return (
    <ConversionPanel
      transformer={transformer}
      editorTitle="XML"
      editorLanguage="xml"
      resultTitle="JSON"
      resultLanguage={"json"}
    />
  );
}
