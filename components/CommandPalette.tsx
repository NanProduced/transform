import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import { routes } from "@utils/routes";
import { SearchIcon, CommandIcon, XIcon } from "./ui/Icons";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filteredRoutes = routes.filter(route => {
    if (!search.trim()) return true;
    const searchLower = search.toLowerCase();
    return (
      route.searchTerm?.toLowerCase().includes(searchLower) ||
      route.label?.toLowerCase().includes(searchLower) ||
      route.category?.toLowerCase().includes(searchLower) ||
      route.desc?.toLowerCase().includes(searchLower)
    );
  });

  const handleSelect = useCallback(
    (path: string) => {
      router.push(path);
      onClose();
    },
    [router, onClose]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex(prev =>
            prev < filteredRoutes.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex(prev =>
            prev > 0 ? prev - 1 : filteredRoutes.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (filteredRoutes[selectedIndex]) {
            handleSelect(filteredRoutes[selectedIndex].path);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    },
    [filteredRoutes, selectedIndex, handleSelect, onClose]
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg mx-4 bg-background border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-down duration-200">
        <div className="flex items-center px-4 py-3 border-b border-border">
          <SearchIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search transforms... (e.g., JSON to TypeScript)"
            className="flex-1 px-3 py-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-base"
            autoFocus
          />
          <button
            onClick={onClose}
            className="ml-2 p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto scrollbar-thin">
          {filteredRoutes.length > 0 ? (
            <div className="py-2">
              {filteredRoutes.map((route, index) => (
                <button
                  key={route.path}
                  onClick={() => handleSelect(route.path)}
                  className={`w-full flex items-center px-4 py-2.5 text-left transition-colors ${
                    index === selectedIndex
                      ? "bg-accent/10 text-accent"
                      : "hover:bg-muted/50 text-foreground"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">
                        {route.searchTerm || route.label}
                      </span>
                      {route.category && route.category !== "Others" && (
                        <span className="text-xs px-2 py-0.5 bg-muted rounded text-muted-foreground flex-shrink-0">
                          {route.category}
                        </span>
                      )}
                    </div>
                    {route.desc && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {route.desc}
                      </p>
                    )}
                  </div>
                  {index === selectedIndex && (
                    <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                      Enter
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <SearchIcon className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No transforms found</p>
              <p className="text-xs mt-1">Try a different search term</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/30">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 bg-muted rounded font-mono">
                ↑
              </span>
              <span className="px-1.5 py-0.5 bg-muted rounded font-mono">
                ↓
              </span>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 bg-muted rounded font-mono">
                ↵
              </span>
              Select
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CommandIcon className="w-3 h-3" />
            <span>+</span>
            <span>K</span>
            <span className="ml-1">to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface CommandPaletteTriggerProps {
  onOpen: () => void;
}

export const CommandPaletteTrigger: React.FC<CommandPaletteTriggerProps> = ({
  onOpen
}) => {
  return (
    <button
      onClick={onOpen}
      className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted/50 hover:bg-muted rounded-lg transition-colors border border-border/50"
    >
      <SearchIcon className="w-4 h-4" />
      <span className="hidden sm:inline">Search...</span>
      <span className="flex items-center gap-0.5 text-xs">
        <CommandIcon className="w-3 h-3" />
        <span>K</span>
      </span>
    </button>
  );
};

export default CommandPalette;
