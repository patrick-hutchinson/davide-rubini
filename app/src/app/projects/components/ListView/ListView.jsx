import Medium from "@/components/Medium/Medium";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./ListView.module.css";

import ListItem from "./components/ListItem";
import ListHead from "./components/ListHead";

const ListView = ({ projects }) => {
  const [canHover, setCanHover] = useState(false);
  const [hoveredProjectId, setHoveredProjectId] = useState(null);
  const [mobileClientColumnWidth, setMobileClientColumnWidth] = useState(null);
  const listTableRef = useRef(null);
  const hoverPreviewProjects = useMemo(() => projects.filter((project) => project?.coverMedia?.medium), [projects]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const mediaQuery = window.matchMedia("(min-width: 48rem) and (hover: hover) and (pointer: fine)");

    const apply = () => setCanHover(mediaQuery.matches);
    apply();

    mediaQuery.addEventListener("change", apply);
    return () => mediaQuery.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!canHover) {
      setHoveredProjectId(null);
    }
  }, [canHover]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const measureMobileClientColumnWidth = () => {
      if (window.innerWidth >= 769) {
        setMobileClientColumnWidth(null);
        return;
      }

      const labels = ["Studio", ...projects.map((project) => `${project?.client ?? ""}`)].filter(Boolean);
      if (labels.length === 0) {
        setMobileClientColumnWidth(null);
        return;
      }

      const sampleCell =
        listTableRef.current?.querySelector("tbody td:nth-child(4)") ||
        listTableRef.current?.querySelector("thead th:nth-child(4)") ||
        listTableRef.current?.querySelector("td, th");

      const computedStyle = sampleCell ? window.getComputedStyle(sampleCell) : window.getComputedStyle(document.body);
      const measureEl = document.createElement("span");

      measureEl.style.position = "absolute";
      measureEl.style.visibility = "hidden";
      measureEl.style.whiteSpace = "nowrap";
      measureEl.style.pointerEvents = "none";
      measureEl.style.fontFamily = computedStyle.fontFamily;
      measureEl.style.fontSize = computedStyle.fontSize;
      measureEl.style.fontWeight = computedStyle.fontWeight;
      measureEl.style.fontStyle = computedStyle.fontStyle;
      measureEl.style.fontVariant = computedStyle.fontVariant;
      measureEl.style.letterSpacing = computedStyle.letterSpacing;
      measureEl.style.textTransform = computedStyle.textTransform;

      document.body.appendChild(measureEl);

      let maxWidth = 0;
      labels.forEach((label) => {
        measureEl.textContent = label;
        maxWidth = Math.max(maxWidth, measureEl.getBoundingClientRect().width);
        console.log(maxWidth, "maxWidth");
      });

      document.body.removeChild(measureEl);

      setMobileClientColumnWidth(Math.ceil(maxWidth + 2));
    };

    measureMobileClientColumnWidth();
    window.addEventListener("resize", measureMobileClientColumnWidth);
    return () => window.removeEventListener("resize", measureMobileClientColumnWidth);
  }, [projects]);

  const handleMouseEnter = (project) => {
    if (!canHover) return;
    setHoveredProjectId(project?._id ?? null);
  };

  const handleMouseLeave = () => {
    if (!canHover) return;
    setHoveredProjectId(null);
  };

  return (
    <section
      className={styles.listTableSection}
      style={mobileClientColumnWidth ? { "--list-client-width": `${mobileClientColumnWidth}px` } : undefined}
    >
      <table className={styles.listWrap}>
        <tbody>
          <tr>
            <td className={styles.listTableCell}>
              <div className={styles.listScrollWrap}>
                <table className={styles.listTable} ref={listTableRef}>
                  <ListHead />
                  <tbody>
                    {projects.map((project, index) => (
                      <ListItem
                        key={project._id}
                        project={project}
                        index={index}
                        canHover={canHover}
                        onMouseEnterProject={handleMouseEnter}
                        onMouseLeaveProject={handleMouseLeave}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </td>
            <td className={styles.previewCell}>
              <div className={styles.coverMediaStack} aria-hidden={!canHover}>
                {hoverPreviewProjects.map((previewProject) => {
                  const isActive = canHover && hoveredProjectId === previewProject._id;

                  return (
                    <div
                      key={previewProject._id}
                      className={`${styles.coverMediaLayer} ${isActive ? styles.coverMediaLayerActive : ""}`}
                      aria-hidden={!isActive}
                    >
                      <Medium className={styles.coverMedia} medium={previewProject.coverMedia.medium} eager />
                    </div>
                  );
                })}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  );
};

export default ListView;
