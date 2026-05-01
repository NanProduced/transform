import ConversionPanel from "@components/ConversionPanel";
import * as React from "react";
import { createConversionPanelTransformer } from "@utils/pipeline/transformers";

export default function JsonToGraphql() {
  const transformer = createConversionPanelTransformer("json-to-graphql");

  return (
    <ConversionPanel
      transformer={transformer}
      editorTitle="JSON"
      editorLanguage="json"
      resultTitle="GraphQL"
      resultLanguage={"graphql"}
    />
  );
}
