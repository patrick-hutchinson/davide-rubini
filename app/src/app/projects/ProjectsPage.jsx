"use client";

import { useEffect, useMemo, useState } from "react";

import GridView from "./components/GridView";
import ListView from "./components/ListView/ListView";

const ProjectsPage = ({ projects }) => {
  const safeProjects = useMemo(() => (Array.isArray(projects) ? projects : []), [projects]);
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const stored = window.localStorage.getItem("projects:view-mode");
    if (stored === "grid" || stored === "list") {
      setViewMode(stored);
    }

    const onViewModeChange = (event) => {
      const nextMode = event?.detail?.mode;
      if (nextMode === "grid" || nextMode === "list") {
        setViewMode(nextMode);
      }
    };

    window.addEventListener("projects:view-mode-change", onViewModeChange);
    return () => window.removeEventListener("projects:view-mode-change", onViewModeChange);
  }, []);

  return <main>{viewMode === "grid" ? <GridView projects={safeProjects} /> : <ListView projects={safeProjects} />}</main>;
};

export default ProjectsPage;
