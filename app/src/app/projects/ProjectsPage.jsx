"use client";

import AnimationLink from "@/components/Animation/AnimationLink";

import styles from "./ProjectsPage.module.css";
import { useEffect, useMemo, useState } from "react";
import Medium from "@/components/Medium/Medium";

const ProjectsPage = ({ projects }) => {
  const mobileProjectCardSizes = "(max-width: 47.99rem) calc(100vw - 16px), 1px";
  const safeProjects = useMemo(() => (Array.isArray(projects) ? projects : []), [projects]);
  const [canHover, setCanHover] = useState(false);
  const [hoveredProject, setHoveredProject] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(min-width: 48rem) and (hover: hover) and (pointer: fine)");

    const apply = () => setCanHover(mediaQuery.matches);
    apply();

    mediaQuery.addEventListener("change", apply);
    return () => mediaQuery.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!canHover) {
      setHoveredProject(null);
      return;
    }

    setHoveredProject(safeProjects[0] ?? null);
  }, [canHover, safeProjects]);

  const handleMouseEnter = (project) => {
    if (!canHover) return;
    setHoveredProject(project);
  };
  const handleMouseLeave = () => {
    if (!canHover) return;
    setHoveredProject(null);
  };

  return (
    <div className="grid">
      <ul className={styles.projectContainer}>
        {safeProjects.map((project) => (
          <li
            key={project._id}
            className={styles.project}
            onMouseEnter={canHover ? () => handleMouseEnter(project) : undefined}
            onMouseLeave={canHover ? () => handleMouseLeave(project) : undefined}
          >
            <AnimationLink
              className="grid"
              link={`/projects/${project.slug.current}`}
              preloadSrc={project.coverMedia?.medium?.url}
            >
              <Medium
                className={styles.mobileCover}
                medium={project.coverMedia?.medium}
                sizes={mobileProjectCardSizes}
                quality={72}
              />
              <span className={styles.projectTitleWrapper}>
                <span className={styles.title}>{project.title}</span>
                <span className={styles.imageCount} typo="small">
                  (
                  <span style={{ position: "relative", bottom: "-0.5px" }}>
                    {project.gallery?.length > 0 ? project.gallery.length : 0}
                  </span>
                  )
                </span>
              </span>
              <span className={styles.client}>{project.client}</span>
              <span className={styles.year}>{project.year}</span>
            </AnimationLink>
          </li>
        ))}
      </ul>

      <Medium className={styles.coverMedia} medium={canHover ? hoveredProject?.coverMedia.medium : undefined} />
    </div>
  );
};

export default ProjectsPage;
