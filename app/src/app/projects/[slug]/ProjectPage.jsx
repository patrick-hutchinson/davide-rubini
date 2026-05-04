"use client";

import { useEffect, useState } from "react";

import AnimationLink from "@/components/Animation/AnimationLink";
import Medium from "@/components/Medium/Medium";
import Text from "@/components/Text/Text";

import styles from "./ProjectPage.module.css";
import { AnimatePresence, motion } from "framer-motion";
import ProjectGallery from "./components/ProjectGallery/ProjectGallery";

const ProjectPage = ({ projects, project }) => {
  const mobileStackSizes = "(max-width: 47.99rem) calc(100vw - 16px), 1px";
  const [showInfo, setShowInfo] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (!showInfo) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowInfo(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showInfo]);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY || window.pageYOffset || 0;
      const doc = document.documentElement;
      const maxScroll = doc.scrollHeight - doc.clientHeight;

      if (maxScroll <= 0) {
        setScrollProgress(0);
        return;
      }

      const nextProgress = Math.min(100, Math.max(0, Math.round((scrollTop / maxScroll) * 100)));
      setScrollProgress(nextProgress);
    };

    updateScrollProgress();
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", updateScrollProgress);

    return () => {
      window.removeEventListener("scroll", updateScrollProgress);
      window.removeEventListener("resize", updateScrollProgress);
    };
  }, []);

  const safeProjects = Array.isArray(projects) ? projects.filter((item) => item?.slug?.current) : [];
  const currentIndex = safeProjects.findIndex((item) => item.slug.current === project?.slug?.current);
  const total = safeProjects.length;

  const prevProject = total > 0 ? safeProjects[(currentIndex - 1 + total) % total] : null;
  const nextProject = total > 0 ? safeProjects[(currentIndex + 1) % total] : null;

  const galleryItems = Array.isArray(project?.gallery) ? project.gallery : [];
  const gallery = [project?.coverMedia, ...galleryItems].filter(Boolean);

  const credits = Array.isArray(project?.credits) ? project.credits : [];

  const categories = Array.isArray(project?.categories)
    ? project.categories
        .map((category) => (typeof category === "string" ? category : category?.name))
        .filter(Boolean)
    : [];

  const handleScrollTop = () => window.scrollTo(0, 0);

  return (
    <div className={styles.projectPage}>
      <div style={{ position: "fixed", top: "var(--margin-page)", right: "var(--margin-page)" }}>{scrollProgress}%</div>
      <div className={styles.projectContent}>
        <strong>{project.title}</strong>
        <div>
          <span>{project.year}</span>
          {categories.length > 0 && <span>—{categories.join(", ")}</span>}
          <span>—{project.client}</span>
        </div>

        <Text text={project.description} className={styles.description} />

        <ProjectGallery gallery={gallery} />

        {credits.length > 0 && (
          <div>
            Credits&nbsp;•&nbsp;
            {credits.map((credit, index) => (
              <span key={`credit-${index}`}>
                {credit?.role}:&nbsp;
                {Array.isArray(credit?.entries) &&
                  credit.entries.map((entry, entryIndex) => (
                    <span key={`credit-${index}-entry-${entryIndex}`}>
                      {entry}
                      {entryIndex < credit.entries.length - 1 && ", "}
                    </span>
                  ))}
                {index < credits.length - 1 && " • "}
              </span>
            ))}
          </div>
        )}

        <hr />
      </div>

      <div className={styles.projectFooter}>
        <div>
          {prevProject ? (
            <AnimationLink link={`/projects/${prevProject.slug.current}`}>← Previous Project</AnimationLink>
          ) : (
            "Prev"
          )}
          &nbsp;&nbsp;
          {nextProject ? (
            <AnimationLink link={`/projects/${nextProject.slug.current}`}>Next Project →</AnimationLink>
          ) : (
            "Next"
          )}
        </div>
        <button onClick={() => handleScrollTop()}>↑ top</button>
      </div>
    </div>
  );
};

export default ProjectPage;
