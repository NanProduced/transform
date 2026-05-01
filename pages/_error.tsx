import React, { useState } from "react";
import { useRouter } from "next/router";
import Error404 from "@assets/svgs/Error404";
import Error500 from "@assets/svgs/Error500";
import { routes } from "@utils/routes";
import { SearchIcon, XIcon, CommandIcon } from "@components/ui/Icons";

export default function Error({ statusCode }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredRoutes = routes.filter(route => {
    if (!search.trim()) return false;
    const searchLower = search.toLowerCase();
    return (
      route.searchTerm?.toLowerCase().includes(searchLower) ||
      route.label?.toLowerCase().includes(searchLower)
    );
  });

  const handleSelect = (path: string) => {
    router.push(path);
    setIsDropdownOpen(false);
  };

  return (
    <div className="flex flex-1 items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center max-w-2xl w-full px-4 py-12">
        {statusCode === 404 ? (
          <>
            <Error404 />
            <h1 className="mt-12 text-xl font-semibold text-center text-foreground">
              You seem to have landed on the wrong place. Search what you are
              looking for below.
            </h1>

            <div className="mt-8 w-full max-w-md relative">
              <div className="relative">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={e => {
                    setSearch(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder="Search transforms..."
                  className="w-full pl-12 pr-12 py-3 text-base bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 text-foreground placeholder:text-muted-foreground"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-muted-foreground">
                  <CommandIcon className="w-3 h-3" />
                  <span>K</span>
                </span>
              </div>

              {isDropdownOpen && search && filteredRoutes.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 max-h-80 overflow-y-auto">
                  {filteredRoutes.map(route => (
                    <button
                      key={route.path}
                      onClick={() => handleSelect(route.path)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors border-b border-border/50 last:border-b-0"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-foreground block truncate">
                          {route.searchTerm || route.label}
                        </span>
                        {route.desc && (
                          <span className="text-xs text-muted-foreground block truncate mt-0.5">
                            {route.desc}
                          </span>
                        )}
                      </div>
                      {route.category && route.category !== "Others" && (
                        <span className="text-xs px-2 py-1 bg-muted rounded text-muted-foreground flex-shrink-0">
                          {route.category}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {isDropdownOpen && search && filteredRoutes.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 p-6 text-center">
                  <SearchIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    No transforms found
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Error500 />
            <h1 className="mt-12 text-xl font-semibold text-center text-foreground">
              Something Broke. Check back again in some time.
            </h1>
          </>
        )}
      </div>
    </div>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : null;
  return { statusCode };
};
