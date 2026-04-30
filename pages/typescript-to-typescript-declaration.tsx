import ConversionPanel from "@components/ConversionPanel";
import * as React from "react";
import { useCallback } from "react";
import request from "@utils/request";

export default function TypescriptToTypescriptDeclaration() {
  const transformer = useCallback(
    ({ value }) =>
      request("/api/flow-to-typescript", {
        value,
        declarationOnly: true,
        isTS: true
      }),
    []
  );

  return (
    <ConversionPanel
      transformer={transformer}
      editorTitle="TypeScript"
      editorLanguage="typescript"
      resultTitle="TypeScript"
      resultLanguage="typescript"
      resultEditorProps={{
        topNotifications: () => (
          <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-4 py-3">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              This code is converted on the server.
            </p>
          </div>
        )
      }}
    />
  );
}
