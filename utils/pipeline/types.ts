export type FormatType =
  | "xml"
  | "json"
  | "yaml"
  | "toml"
  | "typescript"
  | "flow"
  | "javascript"
  | "java"
  | "kotlin"
  | "go"
  | "go-bson"
  | "rust-serde"
  | "scala-case-class"
  | "graphql"
  | "graphql-schema-ast"
  | "graphql-introspection-json"
  | "jsx"
  | "react-native"
  | "pug"
  | "css"
  | "css-js"
  | "css-tailwind"
  | "markdown"
  | "html"
  | "json-schema"
  | "openapi-schema"
  | "protobuf"
  | "zod"
  | "mobx-state-tree"
  | "io-ts"
  | "sarcastic"
  | "mongoose"
  | "big-query"
  | "mysql"
  | "proptypes"
  | "jsdoc"
  | "typescript-declaration"
  | "flow-declaration"
  | "jsonld-compacted"
  | "jsonld-expanded"
  | "jsonld-flattened"
  | "jsonld-framed"
  | "jsonld-normalized"
  | "jsonld-nquads"
  | "cadence";

export interface Transformer {
  id: string;
  label: string;
  from: FormatType;
  to: FormatType;
  transform: (value: string, settings?: Record<string, any>) => Promise<string>;
  settings?: Record<string, any>;
  defaultSettings?: Record<string, any>;
}

export interface Stage {
  id: string;
  transformerId: string;
  input: string;
  output: string;
  error: string | null;
  status: "idle" | "loading" | "success" | "error";
  settings?: Record<string, any>;
}

export interface PipelineState {
  stages: Stage[];
  input: string;
  startFormat: FormatType;
  endFormat: FormatType;
  memoized: Map<string, string>;
}

export interface Edge {
  from: FormatType;
  to: FormatType;
  transformerId: string;
}

export interface GraphNode {
  format: FormatType;
  edges: Edge[];
}
