"use client";

import Medium from "@/components/Medium/Medium";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import styles from "./HomePage.module.css";
import AnimationLink from "@/components/Animation/AnimationLink";

const HomePage = ({ projects }) => {
  const coverMedia = projects.map((project) => project.coverMedia);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % coverMedia.length);
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className={styles.main}>
      <AnimatePresence>
        <AnimationLink link="/projects">
          <motion.div className={styles.coverMediaContainer}>
            <Medium medium={coverMedia[index].medium} />
          </motion.div>
        </AnimationLink>
      </AnimatePresence>
    </main>
  );
};

export default HomePage;
