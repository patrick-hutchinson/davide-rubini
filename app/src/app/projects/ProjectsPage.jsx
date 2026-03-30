"use client";

import AnimationLink from "@/components/Animation/AnimationLink";

import styles from "./ProjectsPage.module.css";
import { useState } from "react";
import Medium from "@/components/Medium/Medium";

const ProjectsPage = ({ projects }) => {
  const [hoveredProject, setHoveredProject] = useState(projects[1]);

  const handleMouseEnter = (project) => setHoveredProject(project);
  const handleMouseLeave = () => setHoveredProject(null);

  return (
    <div className="grid">
      <ul className={styles.projectContainer}>
        {projects.map((project) => (
          <li
            key={project._id}
            className={styles.project}
            onMouseEnter={() => handleMouseEnter(project)}
            onMouseLeave={() => handleMouseLeave(project)}
          >
            <AnimationLink
              className="grid"
              link={`/projects/${project.slug.current}`}
              preloadSrc={project.coverMedia?.medium?.url}
            >
              <span className={styles.projectTitleWrapper}>
                <span className={styles.title}>{project.title}</span>
                <span className={styles.imageCount} typo="small">
                  ({project.gallery?.length})
                </span>
              </span>
              <span className={styles.client}>{project.client}</span>
              <span className={styles.year}>{project.year}</span>
            </AnimationLink>
          </li>
        ))}
      </ul>

      <Medium className={styles.coverMedia} medium={hoveredProject?.coverMedia.medium} />
    </div>
  );
};

export default ProjectsPage;
