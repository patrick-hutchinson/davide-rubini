"use client";

import Medium from "@/components/Medium/Medium";
import { getImageResolutionUrl } from "@/components/Medium/hooks/useImageResolution";
import { preloadImage } from "@/lib/preloadImage";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import styles from "./HomePage.module.css";
import AnimationLink from "@/components/Animation/AnimationLink";

const COVER_WIDTH_PX = 300;
const COVER_PRELOAD_BATCH_SIZE = 12;

const getCoverImageSrc = (medium) => {
  if (!medium || medium.type !== "image" || !medium.url) return null;
  return getImageResolutionUrl(medium, { width: COVER_WIDTH_PX, quality: 75 });
};

const HomePage = ({ projects }) => {
  const safeProjects = Array.isArray(projects) ? projects : [];
  const coverMedia = useMemo(
    () =>
      safeProjects
        .map((project) => project?.coverMedia)
        .filter((item) => item?.medium),
    [safeProjects]
  );

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

  useEffect(() => {
    if (typeof window === "undefined" || coverMedia.length === 0) return undefined;

    const preloadTargets = coverMedia
      .map((item) => {
        const medium = item?.medium;
        const src = getCoverImageSrc(medium);
        if (!src || !medium?.url) return null;
        return { src, cacheKey: medium.url };
      })
      .filter(Boolean)
      .slice(0, COVER_PRELOAD_BATCH_SIZE);

    if (preloadTargets.length === 0) return undefined;

    preloadTargets.slice(0, 2).forEach(({ src, cacheKey }) => preloadImage(src, { cacheKey }));

    const deferredTargets = preloadTargets.slice(2);
    if (deferredTargets.length === 0) return undefined;

    let cancelled = false;
    let timerId;
    let idleCallbackId;

    const preloadDeferred = () => {
      if (cancelled) return;
      deferredTargets.forEach(({ src, cacheKey }) => preloadImage(src, { cacheKey }));
    };

    if ("requestIdleCallback" in window) {
      idleCallbackId = window.requestIdleCallback(preloadDeferred);
    } else {
      timerId = window.setTimeout(preloadDeferred, 120);
    }

    return () => {
      cancelled = true;
      if (typeof idleCallbackId === "number" && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleCallbackId);
      }
      if (typeof timerId === "number") {
        window.clearTimeout(timerId);
      }
    };
  }, [coverMedia]);

  if (coverMedia.length === 0) return <main className={styles.main} />;

  const activeMedium = coverMedia[index]?.medium;
  const activePreloadSrc = getCoverImageSrc(activeMedium) ?? activeMedium?.url;

  return (
    <main className={styles.main}>
      <AnimatePresence>
        <AnimationLink link="/projects" preloadSrc={activePreloadSrc}>
          <motion.div className={styles.coverMediaContainer}>
            {coverMedia.map((item, itemIndex) => {
              const isActive = itemIndex === index;
              const key = item?.medium?._id ?? item?.medium?.url ?? `home-cover-${itemIndex}`;

              return (
                <div
                  key={key}
                  className={`${styles.coverMediaItem} ${isActive ? styles.coverMediaItemActive : ""}`}
                  aria-hidden={!isActive}
                >
                  <Medium medium={item.medium} sizes="150px" quality={75} eager={itemIndex === 0} />
                </div>
              );
            })}
          </motion.div>
        </AnimationLink>
      </AnimatePresence>
    </main>
  );
};

export default HomePage;
