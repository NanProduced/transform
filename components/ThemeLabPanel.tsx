import React, { useState, useCallback, useRef } from "react";
import {
  Dialog,
  Pane,
  Heading,
  Button,
  IconButton,
  Select,
  Text,
  Alert,
  Badge,
  Tablist,
  Tab,
  toaster
} from "evergreen-ui";
import { useDropzone } from "react-dropzone";
import { useThemeLab, defaultDesignTokens } from "@hooks/useThemeLab";
import { FontData, DesignTokens } from "@utils/indexedDB";

const SYSTEM_FONTS = [
  { label: "System Default", value: "" },
  { label: "Inter", value: "Inter" },
  { label: "Segoe UI", value: "Segoe UI" },
  { label: "Roboto", value: "Roboto" },
  { label: "Helvetica Neue", value: "Helvetica Neue" },
  { label: "Arial", value: "Arial" },
  { label: "Consolas", value: "Consolas" },
  { label: "Monaco", value: "Monaco" },
  { label: "Courier New", value: "Courier New" }
];

const COLOR_PRESETS = [
  { name: "Ocean Blue", primary: "#0e7ccf", secondary: "#17a2b8" },
  { name: "Forest Green", primary: "#28a745", secondary: "#20c997" },
  { name: "Sunset Orange", primary: "#dc3545", secondary: "#fd7e14" },
  { name: "Deep Purple", primary: "#6f42c1", secondary: "#6610f2" },
  { name: "Teal", primary: "#20c997", secondary: "#17a2b8" }
];

const RADIUS_PRESETS = [
  { name: "Sharp", sm: "0px", md: "0px", lg: "0px", xl: "0px" },
  { name: "Subtle", sm: "2px", md: "4px", lg: "6px", xl: "8px" },
  { name: "Rounded", sm: "4px", md: "8px", lg: "12px", xl: "16px" },
  { name: "Pill", sm: "8px", md: "16px", lg: "24px", xl: "32px" }
];

interface ThemeLabPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

function FontUploadZone({
  onFileUpload,
  customFonts,
  onDeleteFont
}: {
  onFileUpload: (file: File) => void;
  customFonts: FontData[];
  onDeleteFont: (id: string) => void;
}) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const fontFiles = acceptedFiles.filter(file =>
        /\.(woff|woff2|ttf|otf|eot)$/i.test(file.name)
      );
      fontFiles.forEach(file => onFileUpload(file));
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "font/woff": [".woff"],
      "font/woff2": [".woff2"],
      "font/ttf": [".ttf"],
      "font/otf": [".otf"]
    },
    maxFiles: 10
  });

  return (
    <Pane>
      <Heading size={400} marginBottom={8}>
        Custom Fonts
      </Heading>
      <Text size={300} marginBottom={12} opacity={0.7}>
        Drag & drop font files (.woff, .woff2, .ttf, .otf) or click to browse
      </Text>

      <Pane
        {...getRootProps()}
        padding={24}
        border="2px dashed"
        borderColor={isDragActive ? "#0e7ccf" : "#ddd"}
        backgroundColor={isDragActive ? "#f0f7ff" : "#fafafa"}
        borderRadius={8}
        textAlign="center"
        cursor="pointer"
        marginBottom={16}
      >
        <input {...getInputProps()} />
        <Text size={400} opacity={0.6}>
          {isDragActive
            ? "Drop the fonts here..."
            : "Drag 'n' drop fonts here, or click to select"}
        </Text>
      </Pane>

      {customFonts.length > 0 && (
        <Pane>
          <Heading size={300} marginBottom={8} opacity={0.7}>
            Uploaded Fonts ({customFonts.length})
          </Heading>
          {customFonts.map(font => (
            <Pane
              key={font.id}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              padding={8}
              backgroundColor="#f5f5f5"
              borderRadius={4}
              marginBottom={4}
            >
              <Pane display="flex" flexDirection="column">
                <Text size={300} fontWeight={500}>
                  {font.name}
                </Text>
                <Text size={200} opacity={0.6} fontFamily={`'${font.family}'`}>
                  Sample: The quick brown fox
                </Text>
              </Pane>
              <IconButton
                icon="trash"
                appearance="minimal"
                intent="danger"
                onClick={() => onDeleteFont(font.id)}
              />
            </Pane>
          ))}
        </Pane>
      )}
    </Pane>
  );
}

function FontSelector({
  label,
  value,
  onChange,
  customFonts
}: {
  label: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  customFonts: FontData[];
}) {
  const allOptions = [
    ...SYSTEM_FONTS,
    ...customFonts.map(font => ({
      label: font.name,
      value: font.family
    }))
  ];

  return (
    <Pane display="flex" flexDirection="column" marginBottom={16}>
      <Heading size={300} marginBottom={8}>
        {label}
      </Heading>
      <Select
        value={value || ""}
        onChange={e => onChange(e.target.value || undefined)}
        width="100%"
      >
        {allOptions.map(option => (
          <option key={option.value || "default"} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      {value && (
        <Text size={200} marginTop={4} opacity={0.6} fontFamily={`'${value}'`}>
          Preview: The quick brown fox jumps over the lazy dog
        </Text>
      )}
    </Pane>
  );
}

function ColorEditor({
  tokens,
  onChange
}: {
  tokens: DesignTokens | undefined;
  onChange: (tokens: DesignTokens) => void;
}) {
  const colors = tokens?.colors || defaultDesignTokens.colors;

  const updateColor = (key: string, value: string) => {
    const newTokens: DesignTokens = {
      ...tokens,
      colors: {
        ...colors,
        [key]: value
      }
    };
    onChange(newTokens);
  };

  const applyPreset = (preset: typeof COLOR_PRESETS[0]) => {
    const newTokens: DesignTokens = {
      ...tokens,
      colors: {
        ...colors,
        primary: preset.primary,
        secondary: preset.secondary
      }
    };
    onChange(newTokens);
  };

  const colorFields = [
    { key: "primary", label: "Primary" },
    { key: "secondary", label: "Secondary" },
    { key: "background", label: "Background" },
    { key: "surface", label: "Surface" },
    { key: "textPrimary", label: "Text Primary" },
    { key: "textSecondary", label: "Text Secondary" },
    { key: "border", label: "Border" },
    { key: "success", label: "Success" },
    { key: "warning", label: "Warning" },
    { key: "error", label: "Error" }
  ];

  return (
    <Pane>
      <Heading size={300} marginBottom={8}>
        Color Presets
      </Heading>
      <Pane display="flex" gap={8} marginBottom={16} flexWrap="wrap">
        {COLOR_PRESETS.map(preset => (
          <Button
            key={preset.name}
            appearance="minimal"
            onClick={() => applyPreset(preset)}
            style={{
              background: `linear-gradient(135deg, ${preset.primary}, ${preset.secondary})`,
              color: "#fff",
              textShadow: "0 1px 2px rgba(0,0,0,0.3)"
            }}
          >
            {preset.name}
          </Button>
        ))}
      </Pane>

      <Heading size={300} marginBottom={8}>
        Custom Colors
      </Heading>
      {colorFields.map(field => (
        <Pane
          key={field.key}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          paddingY={8}
          borderBottom="1px solid #eee"
        >
          <Text size={300}>{field.label}</Text>
          <Pane display="flex" alignItems="center" gap={8}>
            <input
              type="color"
              value={(colors as any)?.[field.key] || "#000000"}
              onChange={e => updateColor(field.key, e.target.value)}
              style={{
                width: 40,
                height: 32,
                border: "none",
                borderRadius: 4,
                cursor: "pointer"
              }}
            />
            <Text size={200} fontFamily="monospace" opacity={0.7}>
              {(colors as any)?.[field.key] || ""}
            </Text>
          </Pane>
        </Pane>
      ))}
    </Pane>
  );
}

function RadiusEditor({
  tokens,
  onChange
}: {
  tokens: DesignTokens | undefined;
  onChange: (tokens: DesignTokens) => void;
}) {
  const borderRadius = tokens?.borderRadius || defaultDesignTokens.borderRadius;

  const updateRadius = (key: string, value: string) => {
    const newTokens: DesignTokens = {
      ...tokens,
      borderRadius: {
        ...borderRadius,
        [key]: value
      }
    };
    onChange(newTokens);
  };

  const applyPreset = (preset: typeof RADIUS_PRESETS[0]) => {
    const newTokens: DesignTokens = {
      ...tokens,
      borderRadius: preset
    };
    onChange(newTokens);
  };

  const radiusFields = [
    { key: "sm", label: "Small" },
    { key: "md", label: "Medium" },
    { key: "lg", label: "Large" },
    { key: "xl", label: "X-Large" }
  ];

  return (
    <Pane>
      <Heading size={300} marginBottom={8}>
        Border Radius Presets
      </Heading>
      <Pane display="flex" gap={8} marginBottom={16}>
        {RADIUS_PRESETS.map(preset => (
          <Button
            key={preset.name}
            appearance="minimal"
            onClick={() => applyPreset(preset)}
            style={{ borderRadius: preset.lg }}
          >
            {preset.name}
          </Button>
        ))}
      </Pane>

      <Heading size={300} marginBottom={8}>
        Custom Radius
      </Heading>
      {radiusFields.map(field => (
        <Pane
          key={field.key}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          paddingY={8}
          borderBottom="1px solid #eee"
        >
          <Text size={300}>{field.label}</Text>
          <Pane display="flex" alignItems="center" gap={8}>
            <Pane
              width={40}
              height={40}
              backgroundColor="#0e7ccf"
              style={{ borderRadius: (borderRadius as any)?.[field.key] || 0 }}
            />
            <input
              type="text"
              value={(borderRadius as any)?.[field.key] || ""}
              onChange={e => updateRadius(field.key, e.target.value)}
              style={{
                width: 80,
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: 4
              }}
            />
          </Pane>
        </Pane>
      ))}
    </Pane>
  );
}

function ImportExportSection({
  onImport,
  exportData
}: {
  onImport: (json: string) => Promise<boolean>;
  exportData: string;
}) {
  const [importText, setImportText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        const text = event.target?.result as string;
        setImportText(text);
      };
      reader.readAsText(file);
    }
  };

  const handleImport = async () => {
    const success = await onImport(importText);
    if (success) {
      toaster.success("Theme imported successfully!");
    } else {
      toaster.danger("Failed to import theme. Please check the JSON format.");
    }
  };

  const handleExport = () => {
    const blob = new Blob([exportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `theme-lab-config-${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();
    URL.revokeObjectURL(url);
    toaster.success("Theme exported successfully!");
  };

  return (
    <Pane>
      <Heading size={400} marginBottom={16}>
        Import / Export
      </Heading>

      <Pane marginBottom={24}>
        <Heading size={300} marginBottom={8}>
          Export Theme
        </Heading>
        <Text size={300} marginBottom={12} opacity={0.7}>
          Export your current theme configuration as a JSON file
        </Text>
        <Button appearance="primary" onClick={handleExport}>
          Download Theme JSON
        </Button>
      </Pane>

      <Pane>
        <Heading size={300} marginBottom={8}>
          Import Theme
        </Heading>
        <Text size={300} marginBottom={12} opacity={0.7}>
          Paste JSON or upload a theme file
        </Text>
        <Pane display="flex" gap={8} marginBottom={12}>
          <Button
            appearance="minimal"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload File
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
        </Pane>
        <textarea
          value={importText}
          onChange={e => setImportText(e.target.value)}
          placeholder='Paste your theme JSON here...\n\nExample:\n{\n  "uiFontFamily": "Inter",\n  "monacoFontFamily": "Consolas",\n  "designTokens": { ... }\n}'
          style={{
            width: "100%",
            minHeight: 120,
            padding: 12,
            border: "1px solid #ddd",
            borderRadius: 4,
            fontFamily: "monospace",
            fontSize: 12
          }}
        />
        <Pane display="flex" gap={8} marginTop={12}>
          <Button appearance="primary" onClick={handleImport}>
            Import Theme
          </Button>
          <Button appearance="minimal" onClick={() => setImportText("")}>
            Clear
          </Button>
        </Pane>
      </Pane>
    </Pane>
  );
}

export function ThemeLabPanel({ isOpen, onClose }: ThemeLabPanelProps) {
  const {
    uiFontFamily,
    monacoFontFamily,
    designTokens,
    customFonts,
    setUiFontFamily,
    setMonacoFontFamily,
    setDesignTokens,
    addCustomFont,
    deleteCustomFont,
    resetToDefaults,
    exportTheme,
    importTheme,
    isLoading
  } = useThemeLab();

  const [activeTab, setActiveTab] = useState("fonts");

  const handleFontUpload = async (file: File) => {
    try {
      await addCustomFont(file);
      toaster.success(`Font "${file.name}" uploaded successfully!`);
    } catch (error) {
      toaster.danger(`Failed to upload font: ${(error as Error).message}`);
    }
  };

  const handleDeleteFont = async (id: string) => {
    const font = customFonts.find(f => f.id === id);
    try {
      await deleteCustomFont(id);
      toaster.success(`Font "${font?.name}" deleted`);
    } catch (error) {
      toaster.danger("Failed to delete font");
    }
  };

  const handleReset = () => {
    if (
      confirm("Are you sure you want to reset all theme settings to defaults?")
    ) {
      resetToDefaults();
      toaster.success("Theme reset to defaults");
    }
  };

  if (isLoading) {
    return (
      <Dialog
        title="Theme Lab"
        isShown={isOpen}
        onCloseComplete={onClose}
        hasFooter={false}
      >
        <Pane padding={24} textAlign="center">
          <Text>Loading theme settings...</Text>
        </Pane>
      </Dialog>
    );
  }

  return (
    <Dialog
      title="Theme Lab"
      isShown={isOpen}
      onCloseComplete={onClose}
      width={700}
      hasFooter={false}
    >
      <Pane borderBottom="1px solid #e8e8e8" marginBottom={16}>
        <Tablist marginBottom={0}>
          <Tab
            isSelected={activeTab === "fonts"}
            onSelect={() => setActiveTab("fonts")}
          >
            Fonts
          </Tab>
          <Tab
            isSelected={activeTab === "colors"}
            onSelect={() => setActiveTab("colors")}
          >
            Colors
          </Tab>
          <Tab
            isSelected={activeTab === "radius"}
            onSelect={() => setActiveTab("radius")}
          >
            Radius
          </Tab>
          <Tab
            isSelected={activeTab === "import-export"}
            onSelect={() => setActiveTab("import-export")}
          >
            Import/Export
          </Tab>
        </Tablist>
      </Pane>

      <Pane padding={8} maxHeight={400} overflowY="auto">
        {activeTab === "fonts" && (
          <Pane>
            <FontSelector
              label="UI Font Family"
              value={uiFontFamily}
              onChange={setUiFontFamily}
              customFonts={customFonts}
            />
            <FontSelector
              label="Monaco Editor Font Family"
              value={monacoFontFamily}
              onChange={setMonacoFontFamily}
              customFonts={customFonts}
            />
            <FontUploadZone
              onFileUpload={handleFontUpload}
              customFonts={customFonts}
              onDeleteFont={handleDeleteFont}
            />
          </Pane>
        )}

        {activeTab === "colors" && (
          <ColorEditor tokens={designTokens} onChange={setDesignTokens} />
        )}

        {activeTab === "radius" && (
          <RadiusEditor tokens={designTokens} onChange={setDesignTokens} />
        )}

        {activeTab === "import-export" && (
          <ImportExportSection
            onImport={importTheme}
            exportData={exportTheme()}
          />
        )}
      </Pane>

      <Pane
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        marginTop={16}
        paddingTop={16}
        borderTop="1px solid #e8e8e8"
      >
        <Button appearance="minimal" intent="danger" onClick={handleReset}>
          Reset to Defaults
        </Button>
        <Button appearance="primary" onClick={onClose}>
          Done
        </Button>
      </Pane>
    </Dialog>
  );
}

export default ThemeLabPanel;
