import Medium from "@/components/Medium/Medium";
import { useEffect, useMemo, useState } from "react";
import styles from "./ListView.module.css";

import ListItem from "./components/ListItem";
import ListHead from "./components/ListHead";

const ListView = ({ projects }) => {
  const [canHover, setCanHover] = useState(false);
  const [hoveredProjectId, setHoveredProjectId] = useState(null);
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

  const handleMouseEnter = (project) => {
    if (!canHover) return;
    setHoveredProjectId(project?._id ?? null);
  };

  const handleMouseLeave = () => {
    if (!canHover) return;
    setHoveredProjectId(null);
  };

  return (
    <section className={styles.listTableSection}>
      <table className={styles.listWrap}>
        <tbody>
          <tr>
            <td className={styles.listTableCell}>
              <div className={styles.listScrollWrap}>
                <table className={styles.listTable}>
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
