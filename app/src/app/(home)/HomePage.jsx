"use client";

import Medium from "@/components/Medium/Medium";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import styles from "./HomePage.module.css";
import AnimationLink from "@/components/Animation/AnimationLink";

const HomePage = ({ projects }) => {
  const safeProjects = Array.isArray(projects) ? projects : [];
  const coverMedia = safeProjects
    .map((project) => project?.coverMedia)
    .filter((item) => item?.medium);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const isMobileViewport = window.matchMedia("(max-width: 47.99rem)").matches;
    if (!isMobileViewport) return undefined;

    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, []);

  useEffect(() => {
    if (coverMedia.length <= 1) return undefined;

    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % coverMedia.length);
    }, 300);

    return () => clearInterval(interval);
  }, [coverMedia.length]);

  if (coverMedia.length === 0) return <main className={styles.main} />;

  return (
    <main className={styles.main}>
      <AnimatePresence>
        <AnimationLink link="/projects">
          <motion.div className={styles.coverMediaContainer}>
            <Medium medium={coverMedia[index].medium} sizes="150px" quality={75} />
          </motion.div>
        </AnimationLink>
      </AnimatePresence>
    </main>
  );
};

export default HomePage;
