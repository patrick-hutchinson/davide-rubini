"use client";

import { useState } from "react";

import AnimationLink from "@/components/Animation/AnimationLink";
import Medium from "@/components/Medium/Medium";
import styles from "../ProjectsPage.module.css";
import { AnimatePresence } from "framer-motion";
import Carousel from "@/components/Carousel/Carousel";

const ProjectPage = ({ projects, project }) => {
  const [showInfo, setShowInfo] = useState(false);

  const safeProjects = Array.isArray(projects) ? projects.filter((item) => item?.slug?.current) : [];
  const currentIndex = safeProjects.findIndex((item) => item.slug.current === project?.slug?.current);
  const total = safeProjects.length;

  const prevProject = total > 0 ? safeProjects[(currentIndex - 1 + total) % total] : null;
  const nextProject = total > 0 ? safeProjects[(currentIndex + 1) % total] : null;

  const gallery = [project.coverMedia, ...project.gallery];

  return (
    <div>
      <div className={styles.gallery}>{gallery.length > 0 && <Carousel array={gallery} />}</div>

      <AnimatePresence>{showInfo && <div>{project.description && <div>{project.description}</div>}</div>}</AnimatePresence>

      <div className={styles.projectFooter}>
        <div>
          <strong>{project.title}</strong>
        </div>
        <button onClick={() => setShowInfo((prev) => !prev)}>(info)</button> /{" "}
        <div>
          {prevProject ? <AnimationLink link={`/projects/${prevProject.slug.current}`}>Prev</AnimationLink> : "Prev"} /{" "}
          {nextProject ? <AnimationLink link={`/projects/${nextProject.slug.current}`}>Next</AnimationLink> : "Next"}
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;
