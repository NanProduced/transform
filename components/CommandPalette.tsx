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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-24">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-lg mx-4 bg-background border border-border rounded-lg shadow-2xl overflow-hidden">
        <div className="flex items-center px-3 py-2 border-b border-border">
          <SearchIcon
            size={20}
            className="text-muted-foreground flex-shrink-0"
          />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search transforms..."
            className="flex-1 px-3 py-2 bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="ml-2 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
          >
            <XIcon size={16} />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {filteredRoutes.length > 0 ? (
            <div className="py-1">
              {filteredRoutes.map((route, index) => (
                <button
                  key={route.path}
                  onClick={() => handleSelect(route.path)}
                  className={`w-full flex items-center px-3 py-2 text-left transition-colors ${
                    index === selectedIndex
                      ? "bg-accent/10 text-accent"
                      : "hover:bg-accent/5 text-foreground"
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
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <SearchIcon size={32} className="mb-2 opacity-50" />
              <p className="text-sm">No transforms found</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-muted/30">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 bg-background rounded border border-border font-mono">
                ↑
              </span>
              <span className="px-1.5 py-0.5 bg-background rounded border border-border font-mono">
                ↓
              </span>
              <span className="ml-1">Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 bg-background rounded border border-border font-mono">
                ↵
              </span>
              <span className="ml-1">Select</span>
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CommandIcon size={12} />
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
      className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors border border-border"
    >
      <SearchIcon size={16} />
      <span className="hidden sm:inline">Search...</span>
      <span className="flex items-center gap-0.5 text-xs ml-auto">
        <CommandIcon size={12} />
        <span>K</span>
      </span>
    </button>
  );
};

export default CommandPalette;
