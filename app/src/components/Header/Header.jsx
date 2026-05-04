"use client";

import AnimationLink from "@/components/Animation/AnimationLink";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { disableScroll, enableScroll } from "@/helpers/blockScrolling";

import styles from "./Header.module.css";

const getArchiveColumnOptions = () => {
  if (typeof window === "undefined") return [12, 6, 4, 3];
  return window.innerWidth < 768 ? [1, 2] : [12, 6, 4, 3];
};

const getDefaultArchiveColumns = () => {
  if (typeof window === "undefined") return 6;
  return window.innerWidth < 768 ? 2 : 6;
};

const Header = ({ site }) => {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(new Date());

  const [projectsViewMode, setProjectsViewMode] = useState("grid");
  const [archiveColumns, setArchiveColumns] = useState(() => getDefaultArchiveColumns());
  const [archiveColumnOptions, setArchiveColumnOptions] = useState(() => getArchiveColumnOptions());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("projects:view-mode");
    if (stored === "grid" || stored === "list") {
      setProjectsViewMode(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const applyArchiveColumnsUi = () => {
      const nextOptions = getArchiveColumnOptions();
      const nextDefault = getDefaultArchiveColumns();

      setArchiveColumnOptions(nextOptions);
      setArchiveColumns((prev) => (nextOptions.includes(prev) ? prev : nextDefault));
    };

    applyArchiveColumnsUi();
    window.addEventListener("resize", applyArchiveColumnsUi);
    return () => window.removeEventListener("resize", applyArchiveColumnsUi);
  }, []);

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const hours24 = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");

  const period = hours24 >= 12 ? "p.m." : "a.m.";
  const hours12 = String(hours24 % 12 || 12).padStart(2, "0");

  const date = `${year}–${month}–${day}`;
  const time = `${hours12}:${minutes} ${period}`;

  const isActiveRoute = (basePath) => pathname === basePath || pathname?.startsWith(`${basePath}/`);
  const isArchiveRoute = isActiveRoute("/archive");
  const isProjectsListRoute = pathname === "/projects";
  const isProjectDetailRoute = pathname?.startsWith("/projects/") && pathname !== "/projects";
  const projectsLinkClassName = isProjectsListRoute
    ? styles.activeNavLink
    : isProjectDetailRoute
      ? styles.activeNavLinkClickable
      : undefined;

  const handleSetArchiveColumns = (columns) => {
    if (typeof window === "undefined") return;
    setArchiveColumns(columns);
    window.dispatchEvent(new CustomEvent("archive:change-columns", { detail: { columns } }));
  };

  const setProjectsView = (mode) => {
    if (typeof window === "undefined") return;
    setProjectsViewMode(mode);
    window.localStorage.setItem("projects:view-mode", mode);
    window.dispatchEvent(new CustomEvent("projects:view-mode-change", { detail: { mode } }));
  };

  return (
    <header className={styles.header}>
      <div className={styles.mobileMeta}>
        <AnimationLink className={styles.homeLink} link="/">
          <strong>{site.title}</strong>
        </AnimationLink>{" "}
        / {date} / {time}
      </div>

      <div className={styles.mobileMenuRow}>
        <div>
          <AnimationLink className={projectsLinkClassName} link="/projects">
            Projects
          </AnimationLink>{" "}
          /{" "}
          <AnimationLink className={isActiveRoute("/about") ? styles.activeNavLink : undefined} link="/about">
            About
          </AnimationLink>{" "}
          /{" "}
          <AnimationLink className={isActiveRoute("/archive") ? styles.activeNavLink : undefined} link="/archive">
            Archive
          </AnimationLink>{" "}
          /{" "}
          {mounted && (
            <>
              [
              <button onClick={() => setTheme("light")} className={theme === "light" ? "active" : ""} type="button">
                Light
              </button>
              &nbsp;–&nbsp;
              <button onClick={() => setTheme("dark")} className={theme === "dark" ? "active" : ""} type="button">
                Dark
              </button>
              ]
            </>
          )}
        </div>
        {isProjectsListRoute ? (
          <div className={styles.mobileProjectsViewToggle}>
            <button
              type="button"
              onClick={() => setProjectsView("grid")}
              className={projectsViewMode === "grid" ? "active" : ""}
            >
              Grid
            </button>
            &nbsp;–&nbsp;
            <button
              type="button"
              onClick={() => setProjectsView("list")}
              className={projectsViewMode === "list" ? "active" : ""}
            >
              List
            </button>
          </div>
        ) : isArchiveRoute ? (
          <div className={styles.mobileArchiveColumnsToggle}>
            <span>Columns:&nbsp;</span>
            {archiveColumnOptions.map((column, index) => (
              <span key={`mobile-archive-column-option-${column}`}>
                <button
                  type="button"
                  onClick={() => handleSetArchiveColumns(column)}
                  className={archiveColumns === column ? "active" : ""}
                >
                  {column}
                </button>
                {index < archiveColumnOptions.length - 1 ? <span>&nbsp;–&nbsp;</span> : null}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className={styles.desktopHeaderRow}>
        <div className={styles.desktopNav}>
          <AnimationLink className={styles.homeLink} link="/">
            <strong>{site.title}</strong>
          </AnimationLink>{" "}
          / {date} / {time} /{" "}
          <AnimationLink className={projectsLinkClassName} link="/projects">
            Projects
          </AnimationLink>{" "}
          /{" "}
          <AnimationLink className={isActiveRoute("/about") ? styles.activeNavLink : undefined} link="/about">
            About
          </AnimationLink>{" "}
          /{" "}
          <AnimationLink className={isActiveRoute("/archive") ? styles.activeNavLink : undefined} link="/archive">
            Archive
          </AnimationLink>{" "}
          /{" "}
          {mounted && (
            <>
              [
              <button onClick={() => setTheme("light")} className={theme === "light" ? "active" : ""} type="button">
                Light
              </button>
              &nbsp;–&nbsp;
              <button onClick={() => setTheme("dark")} className={theme === "dark" ? "active" : ""} type="button">
                Dark
              </button>
              ]
            </>
          )}
        </div>

        {isArchiveRoute ? (
          <div className={styles.archiveColumnsToggle}>
            <span>Columns:&nbsp;</span>
            {archiveColumnOptions.map((column, index) => (
              <span key={`archive-column-option-${column}`}>
                <button
                  type="button"
                  onClick={() => handleSetArchiveColumns(column)}
                  className={archiveColumns === column ? "active" : ""}
                >
                  {column}
                </button>
                {index < archiveColumnOptions.length - 1 ? <span>&nbsp;–&nbsp;</span> : null}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {isProjectsListRoute ? (
        <div className={styles.projectsViewToggle}>
          <button
            type="button"
            onClick={() => setProjectsView("grid")}
            className={projectsViewMode === "grid" ? "active" : ""}
          >
            Grid
          </button>
          &nbsp;–&nbsp;
          <button
            type="button"
            onClick={() => setProjectsView("list")}
            className={projectsViewMode === "list" ? "active" : ""}
          >
            List
          </button>
        </div>
      ) : null}

      <hr />
      <br />
    </header>
  );
};

export default Header;
