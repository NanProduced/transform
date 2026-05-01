import React, { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import copy from "clipboard-copy";
import Npm from "@assets/svgs/Npm";
import { useDropzone } from "react-dropzone";
import { useToast } from "@components/ui/Toast";
import {
  SettingsIcon,
  UploadIcon,
  TrashIcon,
  CopyIcon,
  XIcon
} from "@components/ui/Icons";

export interface EditorPanelProps {
  editable?: boolean;
  language?: string;
  defaultValue: string;
  title: React.ReactNode;
  hasCopy?: boolean;
  hasPrettier?: boolean;
  id: string | number;
  onChange?: (value: string) => void;
  hasLoad?: boolean;
  hasClear?: boolean;
  settingElement?: (args: { toggle: () => void; open: boolean }) => JSX.Element;
  alertMessage?: React.ReactNode;
  topNotifications?: (args: {
    toggleSettings: () => void;
    isSettingsOpen: boolean;
  }) => React.ReactNode;
  previewElement?: (value: string) => React.ReactNode;
  acceptFiles?: string | string[];
  packageDetails?: {
    name: string;
    url: string;
  };
}

const Monaco = dynamic(() => import("../components/Monaco"), {
  ssr: false
});

const Tooltip: React.FC<{
  content: string;
  children: React.ReactElement;
}> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-flex">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded whitespace-nowrap z-50">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
        </div>
      )}
    </div>
  );
};

export default function EditorPanel({
  editable = true,
  title,
  settingElement,
  hasLoad,
  acceptFiles,
  hasClear,
  hasCopy = true,
  topNotifications,
  language,
  defaultValue,
  onChange,
  id,
  packageDetails
}: EditorPanelProps) {
  const [showSettingsDialogue, setSettingsDialog] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const [fetchingUrl, setFetchingUrl] = useState("");
  const [showLoadMenu, setShowLoadMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadMenuRef = useRef<HTMLDivElement>(null);
  const { success, danger } = useToast();

  const options = {
    fontSize: 14,
    readOnly: !editable,
    codeLens: false,
    fontFamily: "Menlo, Consolas, monospace, sans-serif",
    minimap: {
      enabled: false
    },
    quickSuggestions: false,
    lineNumbers: "on",
    renderValidationDecorations: "off"
  };

  const _toggleSettingsDialog = useCallback(
    () => setSettingsDialog(!showSettingsDialogue),
    [showSettingsDialogue]
  );

  useEffect(() => {
    (window as any).__webpack_public_path__ = "/_next/static/";
  }, []);

  const getSettings = useCallback(() => {
    if (!settingElement) return null;
    return (
      <>
        <Tooltip content="Settings">
          <button
            onClick={_toggleSettingsDialog}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
          >
            <SettingsIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </Tooltip>

        {settingElement({
          toggle: _toggleSettingsDialog,
          open: showSettingsDialogue
        })}
      </>
    );
  }, [showSettingsDialogue]);

  const onFilePicked = useCallback(
    (files: File[]) => {
      if (!(files && files.length)) return;
      const file = files[0];
      const reader = new FileReader();
      reader.readAsText(file, "utf-8");
      reader.onload = () => {
        setValue(reader.result as string);
        onChange?.(reader.result as string);
      };
    },
    [onChange]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        loadMenuRef.current &&
        !loadMenuRef.current.contains(event.target as Node)
      ) {
        setShowLoadMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { getRootProps } = useDropzone({
    onDrop: files => onFilePicked(files),
    disabled: !editable,
    accept: acceptFiles
      ? (Array.isArray(acceptFiles) ? acceptFiles : [acceptFiles]).reduce(
          (acc, type) => ({ ...acc, [type]: [] }),
          {}
        )
      : undefined,
    onDropRejected: () => danger("This file type is not supported.")
  });

  const copyValue = useCallback(() => {
    copy(value);
    success("Copied to clipboard.");
  }, [value, success]);

  const fetchFile = useCallback(() => {
    (async () => {
      if (!fetchingUrl) return;
      try {
        const res = await fetch(fetchingUrl);
        const textValue = await res.text();
        setValue(textValue);
        setFetchingUrl("");
        setShowLoadMenu(false);
        onChange?.(textValue);
      } catch (e) {
        danger("Failed to fetch URL");
      }
    })();
  }, [fetchingUrl, onChange, danger]);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex h-10 px-2.5 sm:px-3 items-center border-b border-border z-10 bg-card dark:bg-card flex-shrink-0">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-foreground truncate">
            {title}
          </h3>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {settingElement && getSettings()}

          {hasLoad && (
            <div className="relative" ref={loadMenuRef}>
              <Tooltip content="Load File">
                <button
                  onClick={() => setShowLoadMenu(!showLoadMenu)}
                  className="inline-flex items-center justify-center w-7 h-7 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  <UploadIcon className="w-4 h-4" />
                </button>
              </Tooltip>

              {showLoadMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-xl z-50 p-4 animate-in fade-in slide-down duration-150">
                  <div className="mb-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept={
                        acceptFiles
                          ? (Array.isArray(acceptFiles)
                              ? acceptFiles
                              : [acceptFiles]
                            ).join(",")
                          : undefined
                      }
                      onChange={e => {
                        if (e.target.files && e.target.files.length > 0) {
                          onFilePicked(Array.from(e.target.files));
                          setShowLoadMenu(false);
                        }
                      }}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-4 py-2 text-sm font-medium text-foreground bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-lg transition-colors"
                    >
                      Choose File
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">OR</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={fetchingUrl}
                      onChange={e => setFetchingUrl(e.target.value)}
                      placeholder="Enter URL"
                      onKeyDown={e => {
                        if (e.key === "Enter") {
                          fetchFile();
                        }
                      }}
                      className="flex-1 min-w-0 px-3 py-2 text-sm bg-background border border-border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                    <button
                      onClick={fetchFile}
                      className="px-3 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-r-lg transition-colors"
                    >
                      Fetch
                    </button>
                  </div>

                  <button
                    onClick={() => setShowLoadMenu(false)}
                    className="absolute top-2 right-2 p-1 rounded hover:bg-muted transition-colors text-muted-foreground"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {hasClear && (
            <Tooltip content="Clear">
              <button
                onClick={() => {
                  setValue("");
                  onChange?.("");
                }}
                className="inline-flex items-center justify-center w-7 h-7 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-500"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </Tooltip>
          )}

          {packageDetails && (
            <a
              href={packageDetails.url}
              style={{ display: "inline-flex" }}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Tooltip content={packageDetails.name}>
                <Npm />
              </Tooltip>
            </a>
          )}

          {hasCopy && (
            <button
              onClick={copyValue}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
            >
              <CopyIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Copy</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden" {...getRootProps()}>
        {topNotifications &&
          topNotifications({
            isSettingsOpen: showSettingsDialogue,
            toggleSettings: _toggleSettingsDialog
          })}

        <Monaco
          language={language}
          value={value}
          options={options}
          onChange={newValue => {
            setValue(newValue);
            onChange?.(newValue);
          }}
        />
      </div>
    </div>
  );
}
