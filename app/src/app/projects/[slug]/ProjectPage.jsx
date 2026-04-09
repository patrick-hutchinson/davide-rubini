"use client";

import { useEffect, useState } from "react";

import AnimationLink from "@/components/Animation/AnimationLink";
import Medium from "@/components/Medium/Medium";
import Text from "@/components/Text/Text";

import ProjectInfo from "./components/ProjectInfo";

import styles from "../ProjectsPage.module.css";
import { AnimatePresence, motion } from "framer-motion";
import Carousel from "@/components/Carousel/Carousel";

const ProjectPage = ({ projects, project }) => {
  const mobileStackSizes = "(max-width: 47.99rem) calc(100vw - 16px), 1px";
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
  const credits = Array.isArray(project?.credits) ? project.credits : [];

  return (
    <div>
      <main className={styles.mobileProjectStackPage}>
        <AnimationLink link="/projects" className={styles.mobileBackButton}>
          ← Back
        </AnimationLink>

        <section className={styles.mobileProjectSection}>
          <h2 className={styles.mobileProjectSectionTitle}>Cover Media</h2>
          <Medium medium={project?.coverMedia?.medium} sizes={mobileStackSizes} quality={75} />
        </section>

        <section className={styles.mobileProjectSection}>
          <h2 className={styles.mobileProjectSectionTitle}>Description</h2>
          <Text text={project?.description} className={styles.mobileProjectDescription} />
        </section>

        <section className={styles.mobileProjectSection}>
          <h2 className={styles.mobileProjectSectionTitle}>Gallery</h2>
          <div className={styles.mobileProjectGalleryStack}>
            {galleryItems.map((item, index) => (
              <div key={item?._id || `mobile-gallery-${index}`}>
                <Medium
                  medium={item?.medium}
                  sizes={mobileStackSizes}
                  quality={75}
                />
              </div>
            ))}
          </div>
        </section>

        <section className={styles.mobileProjectSection}>
          <h2 className={styles.mobileProjectSectionTitle}>Credits</h2>
          {credits.length > 0 ? (
            <ul className={styles.mobileCreditList}>
              {credits.map((credit, index) => (
                <li key={`mobile-credit-${index}`} className={styles.creditRow}>
                  {credit?.role ? `${credit.role}: ` : ""}
                  {Array.isArray(credit?.entries)
                    ? credit.entries
                        .map((entry) => (typeof entry === "string" ? entry : ""))
                        .filter(Boolean)
                        .join(", ")
                    : ""}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </main>

      <div className={styles.desktopProjectPage}>
        <AnimationLink link="/projects" className={styles.backButton}>
          ← Back
        </AnimationLink>
        <div className={styles.galleryWrapper} style={{ "--cover-aspect": coverAspectRatio }}>
          {gallery.length > 0 && (
            <Carousel
              array={gallery}
              initialOffsetPx={gallery.length > 1 ? -50 : 0}
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
    </div>
  );
};

export default ProjectPage;
