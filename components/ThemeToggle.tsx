import React from "react";
import { useThemeContext, Theme } from "./ThemeProvider";
import { SunIcon, MoonIcon, MonitorIcon } from "./ui/Icons";

const themeOptions: { value: Theme; icon: React.FC; label: string }[] = [
  { value: "light", icon: SunIcon, label: "Light" },
  { value: "dark", icon: MoonIcon, label: "Dark" },
  { value: "system", icon: MonitorIcon, label: "System" }
];

const ThemeToggle: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useThemeContext();
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const CurrentIcon =
    themeOptions.find(t => t.value === theme)?.icon || SunIcon;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-muted/50 transition-colors text-foreground"
        aria-label="Toggle theme"
      >
        <CurrentIcon className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-popover border border-border rounded-lg shadow-lg overflow-hidden z-50 animate-in fade-in slide-down duration-150">
          <div className="py-1">
            {themeOptions.map(option => {
              const Icon = option.icon;
              const isActive = theme === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    setTheme(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-accent/10 text-accent"
                      : "text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 text-left">{option.label}</span>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
