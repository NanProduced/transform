import React from "react";
import {
  MenuIcon,
  GithubIcon,
  CommandIcon,
  SunIcon,
  MoonIcon,
  MonitorIcon
} from "./ui/Icons";
import { CommandPaletteTrigger } from "./CommandPalette";
import { useThemeContext, Theme } from "./ThemeProvider";

interface HeaderProps {
  onMenuClick: () => void;
  onCommandPaletteOpen: () => void;
}

const Logo: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="90px"
    height="19px"
    viewBox="0 0 306 62"
    className="text-foreground"
  >
    <path
      fill="currentColor"
      fillRule="nonzero"
      stroke="none"
      strokeWidth={1}
      d="M172.339 71.14V98h-7.91V71.14h-3.376v-7.382h3.375V51.207h7.91v12.55h6.153v7.384h-6.152zm11.989-7.382h7.91v3.058c1.453-1.523 2.742-2.566 3.867-3.129 1.149-.585 2.508-.878 4.078-.878 2.086 0 4.266.68 6.54 2.039L203.1 72.09c-1.5-1.078-2.964-1.617-4.394-1.617-4.313 0-6.469 3.257-6.469 9.773V98h-7.91V63.758zm52.138 0h7.945V98h-7.945v-3.586c-3.258 3.047-6.762 4.57-10.512 4.57-4.734 0-8.648-1.71-11.742-5.132-3.07-3.493-4.606-7.852-4.606-13.079 0-5.132 1.536-9.41 4.606-12.832 3.07-3.421 6.914-5.132 11.531-5.132 3.985 0 7.559 1.64 10.723 4.921v-3.972zm-18.774 17.015c0 3.282.88 5.954 2.637 8.016 1.805 2.086 4.078 3.129 6.82 3.129 2.93 0 5.297-1.008 7.102-3.023 1.805-2.086 2.707-4.735 2.707-7.946 0-3.21-.902-5.86-2.707-7.945-1.805-2.04-4.148-3.059-7.031-3.059-2.719 0-4.992 1.032-6.82 3.094-1.805 2.086-2.708 4.664-2.708 7.734zm37.162-17.015h7.945v3.164c2.766-2.742 5.883-4.113 9.352-4.113 3.984 0 7.09 1.253 9.316 3.761 1.922 2.133 2.883 5.614 2.883 10.442V98h-7.945V78.875c0-3.375-.47-5.707-1.407-6.996-.914-1.313-2.578-1.969-4.992-1.969-2.625 0-4.488.867-5.59 2.602-1.078 1.71-1.617 4.699-1.617 8.965V98h-7.945V63.758zm59.837 5.836l-6.54 3.48c-1.03-2.11-2.308-3.164-3.831-3.164-.727 0-1.348.24-1.864.72-.515.481-.773 1.097-.773 1.847 0 1.312 1.523 2.613 4.57 3.902 4.196 1.805 7.02 3.469 8.473 4.992 1.453 1.524 2.18 3.574 2.18 6.152 0 3.305-1.22 6.07-3.657 8.297-2.367 2.11-5.226 3.164-8.578 3.164-5.742 0-9.808-2.8-12.199-8.402l6.75-3.129c.938 1.64 1.652 2.684 2.145 3.129.96.89 2.109 1.336 3.445 1.336 2.672 0 4.008-1.219 4.008-3.656 0-1.407-1.032-2.719-3.094-3.938-.797-.398-1.594-.785-2.39-1.16-.798-.375-1.606-.762-2.426-1.16-2.297-1.125-3.914-2.25-4.852-3.375-1.195-1.43-1.793-3.27-1.793-5.52 0-2.976 1.02-5.437 3.059-7.382 2.086-1.946 4.617-2.918 7.593-2.918 4.383 0 7.641 2.261 9.774 6.785zm17.966 1.547V98h-7.945V71.14h-2.813v-7.382h2.813V50.539c0-4.312.75-7.36 2.25-9.14 2.062-2.485 5.062-3.727 9-3.727 1.406 0 3.175.41 5.308 1.23v8.086l-.808-.422c-1.711-.867-3.118-1.3-4.22-1.3-1.91 0-2.867.91-2.867 2.734v5.375h7.895v7.383h-7.895V98z"
    />
  </svg>
);

interface ThemeToggleProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, setTheme }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  const themeOptions: {
    value: Theme;
    icon: React.FC<{ size?: number; className?: string }>;
    label: string;
  }[] = [
    { value: "light", icon: SunIcon, label: "Light" },
    { value: "dark", icon: MoonIcon, label: "Dark" },
    { value: "system", icon: MonitorIcon, label: "System" }
  ];

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
        className="flex items-center justify-center w-9 h-9 rounded-md hover:bg-accent/10 transition-colors text-foreground"
        aria-label="Toggle theme"
      >
        <CurrentIcon size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-popover border border-border rounded-md shadow-lg overflow-hidden z-50">
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
                      : "text-foreground hover:bg-accent/5"
                  }`}
                >
                  <Icon size={16} />
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

const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  onCommandPaletteOpen
}) => {
  const { theme, setTheme } = useThemeContext();

  return (
    <header className="h-12 bg-background border-b border-border flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden flex items-center justify-center w-9 h-9 rounded-md hover:bg-accent/10 transition-colors text-foreground"
          aria-label="Toggle menu"
        >
          <MenuIcon size={20} />
        </button>

        <div className="flex items-center">
          <Logo />
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <div className="hidden md:block">
          <CommandPaletteTrigger onOpen={onCommandPaletteOpen} />
        </div>

        <button
          onClick={onCommandPaletteOpen}
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-md hover:bg-accent/10 transition-colors text-foreground"
          aria-label="Search"
        >
          <CommandIcon size={20} />
        </button>

        <ThemeToggle theme={theme} setTheme={setTheme} />

        <a
          href="https://github.com/ritz078/transform"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-9 h-9 rounded-md hover:bg-accent/10 transition-colors text-foreground"
          aria-label="GitHub"
        >
          <GithubIcon size={20} />
        </a>
      </div>
    </header>
  );
};

export default Header;
