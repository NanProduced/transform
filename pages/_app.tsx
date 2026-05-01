import React, { useEffect, useState, useCallback } from "react";
import { ThemeProvider } from "@components/ThemeProvider";
import { ToastProvider } from "@components/ui/Toast";
import Header from "@components/Header";
import Sidebar from "@components/Sidebar";
import CommandPalette from "@components/CommandPalette";
import "@styles/main.css";

import NProgress from "nprogress";
import Router, { useRouter } from "next/router";
import { activeRouteData } from "@utils/routes";
import Head from "next/head";
import { Meta } from "@components/Meta";

export default function App(props) {
  const { Component, pageProps } = props;
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const toggleCommandPalette = useCallback(() => {
    setCommandPaletteOpen(prev => !prev);
  }, []);

  const closeCommandPalette = useCallback(() => {
    setCommandPaletteOpen(false);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggleCommandPalette();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [toggleCommandPalette]);

  useEffect(() => {
    let timer;

    const stopProgress = () => {
      clearTimeout(timer);
      NProgress.done();
    };

    const startProgress = () => NProgress.start();

    const showProgressBar = () => {
      timer = setTimeout(startProgress, 300);
      router.events.on("routeChangeComplete", stopProgress);
      router.events.on("routeChangeError", stopProgress);
    };

    router.events.on("routeChangeStart", showProgressBar);

    return () => {
      router.events.off("routeChangeComplete", stopProgress);
      router.events.off("routeChangeError", stopProgress);
      router.events.off("routeChangeStart", showProgressBar);
      timer && clearTimeout(timer);
    };
  }, []);

  const activeRoute = activeRouteData(router.pathname);

  return (
    <ThemeProvider>
      <ToastProvider>
        {router.pathname === "/" || !router.pathname ? (
          <Meta
            title={"Transform"}
            url={`https://transform.tools${router.pathname}`}
            description={
              "A polyglot web converter that's going to save you a lot of time."
            }
          />
        ) : (
          <Meta
            title={activeRoute?.searchTerm}
            url={`https://transform.tools${router.pathname}`}
            description={activeRoute?.desc}
          />
        )}

        <div className="flex flex-col h-screen bg-background text-foreground">
          <Header
            onMenuClick={toggleSidebar}
            onCommandPaletteOpen={toggleCommandPalette}
          />

          <div className="flex flex-1 overflow-hidden">
            <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

            <main className="flex-1 flex flex-col overflow-hidden min-w-0">
              <Component {...pageProps} />
            </main>
          </div>
        </div>

        <CommandPalette
          isOpen={commandPaletteOpen}
          onClose={closeCommandPalette}
        />
      </ToastProvider>
    </ThemeProvider>
  );
}
