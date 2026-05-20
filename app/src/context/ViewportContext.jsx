"use client";

import { createContext, useContext, useLayoutEffect, useState } from "react";

const ViewportContext = createContext(null);

export const ViewportProvider = ({ children }) => {
  const [viewportHeight, setViewportHeight] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);

  useLayoutEffect(() => {
    const update = () => {
      const vv = window.visualViewport;
      setViewportHeight(Math.round(vv?.height ?? window.innerHeight));
      setViewportWidth(Math.round(vv?.width ?? window.innerWidth));
    };

    update();
    window.addEventListener("resize", update);
    window.visualViewport?.addEventListener("resize", update);
    window.visualViewport?.addEventListener("scroll", update);
    return () => {
      window.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("scroll", update);
    };
  }, []);

  return <ViewportContext.Provider value={{ viewportHeight, viewportWidth }}>{children}</ViewportContext.Provider>;
};

export const useViewport = () => {
  const ctx = useContext(ViewportContext);
  if (!ctx) throw new Error("useViewport must be used inside ViewportProvider");
  return ctx;
};
