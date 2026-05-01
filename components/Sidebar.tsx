import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { categorizedRoutes, Route } from "@utils/routes";
import { XIcon, SearchIcon } from "./ui/Icons";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const sidebarRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchCurrentX = useRef<number>(0);

  useEffect(() => {
    if (isOpen) {
      setSearch("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchCurrentX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchCurrentX.current - touchStartX.current;
    const threshold = 100;

    if (diff > threshold && touchStartX.current < 80) {
      return;
    }

    if (diff < -threshold) {
      onClose();
    }
  };

  const filteredCategories = categorizedRoutes
    .map(category => {
      if (!search.trim()) {
        return category;
      }
      const searchLower = search.toLowerCase();
      return {
        ...category,
        content: (category.content as Route[]).filter(route => {
          const _label =
            category.category.toLowerCase() !== "others"
              ? `${category.category} ${route.label}`
              : route.label;
          return (
            _label.toLowerCase().includes(searchLower) ||
            route.label.toLowerCase().includes(searchLower) ||
            (route.desc && route.desc.toLowerCase().includes(searchLower))
          );
        })
      };
    })
    .filter(cat => (cat.content as Route[]).length > 0);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center gap-3 p-3 border-b border-border">
        <div className="flex-1">
          <div className="relative">
            <SearchIcon
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search transforms..."
              className="w-full pl-9 pr-4 py-2 bg-muted border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0"
            />
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden flex items-center justify-center w-9 h-9 rounded-md hover:bg-muted transition-colors text-muted-foreground"
        >
          <XIcon size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin pb-4">
        {filteredCategories.length > 0 ? (
          filteredCategories.map(route => (
            <div key={route.category} className="mt-4">
              <div className="px-3 mb-1">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {route.category}
                </h3>
              </div>
              {(route.content as Route[])
                .sort((a, b) => a.label.localeCompare(b.label))
                .map((item: Route) => {
                  const isActive = router.pathname === item.path;
                  return (
                    <Link key={item.label} href={item.path} prefetch={false}>
                      <a
                        onClick={() => {
                          if (
                            typeof window !== "undefined" &&
                            window.innerWidth < 1024
                          ) {
                            onClose();
                          }
                        }}
                        className="block"
                      >
                        <div
                          className={`px-3 py-2 text-sm transition-colors cursor-pointer border-l-2 ${
                            isActive
                              ? "bg-accent/10 text-accent border-accent"
                              : "text-foreground hover:bg-accent/5 border-transparent"
                          }`}
                        >
                          {item.label}
                          {item.desc && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                              {item.desc}
                            </p>
                          )}
                        </div>
                      </a>
                    </Link>
                  );
                })}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <SearchIcon size={32} className="mb-2 opacity-50" />
            <p className="text-sm">No transforms found</p>
          </div>
        )}
      </div>

      <div className="border-t border-border p-3 bg-muted/30">
        <a
          href="https://vercel.com?utm_source=ritz078&utm_campaign=oss"
          target="_blank"
          rel="noopener noreferrer"
          className="block mb-3"
        >
          <img
            src="https://www.datocms-assets.com/31049/1618983297-powered-by-vercel.svg"
            alt="Vercel"
            className="h-7 mx-auto"
          />
        </a>
        <p className="text-xs text-center text-muted-foreground">
          Created by{" "}
          <a
            href="https://twitter.com/ritz078"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            @ritz078
          </a>
        </p>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:flex w-72 border-r border-border flex-col flex-shrink-0">
        <SidebarContent />
      </div>

      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />

          <div
            ref={sidebarRef}
            className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-background border-r border-border shadow-xl"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
