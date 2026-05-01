import { Transformer, FormatType } from "./types";

const createTransformer = (
  id: string,
  label: string,
  from: FormatType,
  to: FormatType,
  transform: (value: string, settings?: Record<string, any>) => Promise<string>
): Transformer => ({
  id,
  label,
  from,
  to,
  transform
});

export const transformers: Transformer[] = [
  createTransformer(
    "xml-to-json",
    "XML to JSON",
    "xml",
    "json",
    async value => {
      const { xml2json } = await import("xml-js");
      return JSON.stringify(
        JSON.parse(
          xml2json(value, {
            compact: true
          })
        )
      );
    }
  ),

  createTransformer(
    "yaml-to-json",
    "YAML to JSON",
    "yaml",
    "json",
    async value => {
      const yaml = await import("yaml");
      return JSON.stringify(yaml.parse(value));
    }
  ),

  createTransformer(
    "json-to-yaml",
    "JSON to YAML",
    "json",
    "yaml",
    async value => {
      const yaml = await import("yaml");
      return yaml.stringify(JSON.parse(value));
    }
  ),

  createTransformer(
    "toml-to-json",
    "TOML to JSON",
    "toml",
    "json",
    async value => {
      const toml = await import("@iarna/toml");
      return JSON.stringify(toml.parse(value));
    }
  ),

  createTransformer(
    "json-to-toml",
    "JSON to TOML",
    "json",
    "toml",
    async value => {
      const toml = await import("@iarna/toml");
      return toml.stringify(JSON.parse(value));
    }
  ),

  createTransformer(
    "yaml-to-toml",
    "YAML to TOML",
    "yaml",
    "toml",
    async value => {
      const yaml = await import("yaml");
      const toml = await import("@iarna/toml");
      return toml.stringify(yaml.parse(value));
    }
  ),

  createTransformer(
    "toml-to-yaml",
    "TOML to YAML",
    "toml",
    "yaml",
    async value => {
      const yaml = await import("yaml");
      const toml = await import("@iarna/toml");
      return yaml.stringify(toml.parse(value));
    }
  ),

  createTransformer("json-to-go", "JSON to Go", "json", "go", async value => {
    const jsonToGo = await import("json-to-go");
    const gofmt = await import("gofmt.js");
    return gofmt(jsonToGo.default(value).go);
  }),

  createTransformer(
    "json-to-go-bson",
    "JSON to Go BSON",
    "json",
    "go-bson",
    async value => {
      return JSON.stringify(JSON.parse(value || "{}"), null, 2)
        .replace(/\{/gm, "bson.M{")
        .replace(/\[/gm, "bson.A{")
        .replace(/\]/gm, "}")
        .replace(/(\d|\w|")$/gm, "$1,")
        .replace(/(\}$)(\n)/gm, "$1,$2");
    }
  ),

  createTransformer(
    "json-to-typescript",
    "JSON to TypeScript",
    "json",
    "typescript",
    async (value, settings = {}) => {
      const { run } = await import("json_typegen_wasm");
      return run(
        "Root",
        value,
        JSON.stringify({
          output_mode: settings.typealias
            ? "typescript/typealias"
            : "typescript"
        })
      );
    }
  ),

  createTransformer(
    "json-to-flow",
    "JSON to Flow",
    "json",
    "flow",
    async (value, settings = {}) => {
      const { json2ts } = await import("json-ts");
      return json2ts(value, { flow: true, ...settings });
    }
  ),

  createTransformer(
    "json-to-kotlin",
    "JSON to Kotlin",
    "json",
    "kotlin",
    async value => {
      const { run } = await import("json_typegen_wasm");
      return run(
        "Root",
        value,
        JSON.stringify({
          output_mode: "kotlin"
        })
      );
    }
  ),

  createTransformer(
    "json-to-java",
    "JSON to Java",
    "json",
    "java",
    async value => {
      const { run } = await import("json_typegen_wasm");
      const kotlinTransformationLines: string[] = run(
        "Root",
        value,
        JSON.stringify({
          output_mode: "kotlin"
        })
      ).split("\n");

      let javaTransformation: string = "";
      let currentClass: string = "";
      let variableNames: string[] = [];
      let variableTypes: string[] = [];

      kotlinTransformationLines.forEach((line: string) => {
        const originalLine = line;
        line = line.trim();

        if (line === ")") {
          let args: string[] = [];
          let getters: string[] = [];
          let setters: string[] = [];

          for (let i = 0; i < variableNames.length; i++) {
            const type = variableTypes[i];
            const variableName = variableNames[i];
            const titleCaseVariable =
              variableName.charAt(0).toUpperCase() + variableName.substring(1);
            args.push(`${type} ${variableName}`);
            getters.push(
              `\tpublic ${type} get${titleCaseVariable}() {\n\t\treturn this.${variableName};\n\t}\n`
            );
            setters.push(
              `\tpublic void set${titleCaseVariable}(${type} ${variableName}) {\n\t\tthis.${variableName} = ${variableName};\n\t}\n`
            );
          }

          let constructor = `\tpublic ${currentClass}(${args.join(", ")}) {`;
          let properties: string[] = [];
          variableNames.forEach(variable => {
            properties.push(`this.${variable} = ${variable};`);
          });
          constructor += `\n\t\t${properties.join("\n\t\t")}\n\t}\n`;
          javaTransformation += `\n${constructor}\n${getters.join(
            "\n"
          )}\n${setters.join("\n")}}`;

          currentClass = "";
          variableNames = [];
          variableTypes = [];
        } else if (line.startsWith("data class ")) {
          const classNameStartIndex = 11;
          const classNameEndIndex = line.indexOf("(");
          const className = line.substring(
            classNameStartIndex,
            classNameEndIndex
          );
          javaTransformation += `public class ${className} {`;
          currentClass = className;
        } else if (line.startsWith("val")) {
          const processedLine = line.replace("?", "");
          const variableStartIndex = 4;
          const variableEndIndex = processedLine.indexOf(":");
          const variable: string = processedLine.substring(
            variableStartIndex,
            variableEndIndex
          );
          const typeStartIndex = processedLine.indexOf(":") + 2;
          let type: string = processedLine.substring(
            typeStartIndex,
            processedLine.length - 1
          );

          type = type.replace("<Any>?", "<?>");
          type = type.replace("<Any>", "<?>");

          variableNames.push(variable);
          variableTypes.push(type);
          javaTransformation += `\tprivate ${type} ${variable};`;
        } else if (line.startsWith("typealias")) {
          const classNameStartIndex = 10;
          const classNameEndIndex = line.indexOf(" =");
          const className = line.substring(
            classNameStartIndex,
            classNameEndIndex
          );
          const typeNameEndIndex = line.indexOf("=") + 2;
          const type = line.substring(typeNameEndIndex, line.length - 1);
          const variable =
            className.charAt(0).toLowerCase() + className.substring(1);

          const titleCaseVariable = className;
          const getters = `\tpublic ${type} get${titleCaseVariable}() {\n\t\treturn this.${variable};\n\t}\n\n`;
          const setters = `\tpublic void set${titleCaseVariable}(${type} ${variable}) {\n\t\tthis.${variableName} = ${variable};\n\t}\n\n`;
          const constructor = `\tpublic ${className}(${type} ${variable}) {\n\t\tthis.${variable} = ${variable};\n\t}\n`;
          javaTransformation += `public class ${className} {\n\tprivate ${type} ${variable};\n`;
          javaTransformation += `\n${constructor}\n${getters}${setters}}`;
        } else if (line.startsWith("import")) {
          javaTransformation += `${line};`;
        } else {
          javaTransformation += originalLine;
        }

        javaTransformation += "\n";
      });

      return javaTransformation;
    }
  ),

  createTransformer(
    "json-to-rust-serde",
    "JSON to Rust Serde",
    "json",
    "rust-serde",
    async (value, settings = {}) => {
      const { run } = await import("json_typegen_wasm");
      return run(
        "Root",
        value,
        JSON.stringify({
          output_mode: "rust",
          property_name_format: settings.property_name_format || "camelCase"
        })
      );
    }
  ),

  createTransformer(
    "json-to-json-schema",
    "JSON to JSON Schema",
    "json",
    "json-schema",
    async value => {
      const { run } = await import("json_typegen_wasm");
      return run(
        "Root",
        value,
        JSON.stringify({
          output_mode: "json_schema"
        })
      );
    }
  ),

  createTransformer(
    "json-to-zod",
    "JSON to Zod",
    "json",
    "zod",
    async (value, settings = {}) => {
      const { jsonToZod } = await import("json-to-zod");
      return jsonToZod(JSON.parse(value), settings.rootName || "schema", true);
    }
  ),

  createTransformer(
    "json-to-jsdoc",
    "JSON to JSDoc",
    "json",
    "jsdoc",
    async value => {
      const { convert } = await import("@assets/vendor/json-to-jsdoc");
      return convert(value);
    }
  ),

  createTransformer(
    "json-to-io-ts",
    "JSON to io-ts",
    "json",
    "io-ts",
    async value => {
      const transformJsonTypes = await import("transform-json-types");
      const code = transformJsonTypes.default(value, {
        lang: "iots"
      });
      return `import * as t from "io-ts";\n\n${code}`;
    }
  ),

  createTransformer(
    "json-to-sarcastic",
    "JSON to Sarcastic",
    "json",
    "sarcastic",
    async value => {
      const transformJsonTypes = await import("transform-json-types");
      const code = transformJsonTypes.default(value, {
        lang: "sarcastic"
      });
      return `import is from "sarcastic";\n\n${code}`;
    }
  ),

  createTransformer(
    "json-to-graphql",
    "JSON to GraphQL",
    "json",
    "graphql",
    async value => {
      const { jsonToSchema } = await import(
        "@walmartlabs/json-to-simple-graphql-schema/lib"
      );
      return jsonToSchema({ jsonInput: value }).value;
    }
  ),

  createTransformer(
    "json-to-scala-case-class",
    "JSON to Scala Case Class",
    "json",
    "scala-case-class",
    async value => {
      const transformJsonTypes = await import("transform-json-types");
      return transformJsonTypes.default(value, {
        lang: "scala"
      });
    }
  )
];

export function getTransformer(id: string): Transformer | undefined {
  return transformers.find(t => t.id === id);
}

export function getTransformersByFrom(from: FormatType): Transformer[] {
  return transformers.filter(t => t.from === from);
}

export function getTransformersByTo(to: FormatType): Transformer[] {
  return transformers.filter(t => t.to === to);
}

export function getAllFormats(): FormatType[] {
  const formats = new Set<FormatType>();
  transformers.forEach(t => {
    formats.add(t.from);
    formats.add(t.to);
  });
  return Array.from(formats);
}

export function createConversionPanelTransformer(
  id: string,
  settings?: Record<string, any>
) {
  const transformer = getTransformer(id);
  if (!transformer) {
    throw new Error(`Transformer not found: ${id}`);
  }
  return async ({ value }: { value: string }) => {
    return transformer.transform(value, settings);
  };
}
