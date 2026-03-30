"use client";

import { useEffect, useState } from "react";

import AnimationLink from "@/components/Animation/AnimationLink";

import ProjectInfo from "./components/ProjectInfo";

import styles from "../ProjectsPage.module.css";
import { AnimatePresence, motion } from "framer-motion";
import Carousel from "@/components/Carousel/Carousel";

const ProjectPage = ({ projects, project }) => {
  const [showInfo, setShowInfo] = useState(false);

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

  const safeProjects = Array.isArray(projects) ? projects.filter((item) => item?.slug?.current) : [];
  const currentIndex = safeProjects.findIndex((item) => item.slug.current === project?.slug?.current);
  const total = safeProjects.length;

  const prevProject = total > 0 ? safeProjects[(currentIndex - 1 + total) % total] : null;
  const nextProject = total > 0 ? safeProjects[(currentIndex + 1) % total] : null;

  const galleryItems = Array.isArray(project?.gallery) ? project.gallery : [];
  const gallery = [project?.coverMedia, ...galleryItems].filter(Boolean);
  const coverAspectRatio = project?.coverMedia?.medium?.width / project?.coverMedia?.medium?.height || 1;

  return (
    <div>
      <AnimationLink link="/projects" className={styles.backButton}>
        ← Back
      </AnimationLink>
      <div className={styles.galleryWrapper} style={{ "--cover-aspect": coverAspectRatio }}>
        {gallery.length > 0 && (
          <Carousel
            array={gallery}
            initialOffsetPx={gallery.length > 1 ? -50 : 0}
            deferInitialOffsetUntilTransitionEnd
          />
        )}
      </div>

      <AnimatePresence>{showInfo && <ProjectInfo project={project} />}</AnimatePresence>

      <div className={styles.projectFooter}>
        <div className={styles.projectTitle}>
          <strong>{project.title}</strong>
        </div>
        <button onClick={() => setShowInfo((prev) => !prev)}>(info)</button> /{" "}
        <div>
          {prevProject ? <AnimationLink link={`/projects/${prevProject.slug.current}`}>Prev</AnimationLink> : "Prev"}
          &nbsp;&nbsp;
          {nextProject ? <AnimationLink link={`/projects/${nextProject.slug.current}`}>Next</AnimationLink> : "Next"}
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;
