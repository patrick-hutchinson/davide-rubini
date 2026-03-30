"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import Medium from "@/components/Medium/Medium";
import { preloadImage } from "@/lib/preloadImage";
import styles from "./ArchivePage.module.css";

const ArchivePage = ({ archive }) => {
  const [columns, setColumns] = useState(12);
  const [activeIndex, setActiveIndex] = useState(null);
  const gallery = Array.isArray(archive?.gallery) ? archive.gallery : [];
  if (gallery.length === 0) return null;

  const changeColumns = () => {
    setColumns((prev) => {
      if (prev === 3) return 4;
      if (prev === 4) return 6;
      if (prev === 6) return 12;
      return 3;
    });
  };

  useEffect(() => {
    const onChangeColumns = () => {
      changeColumns();
    };

    window.addEventListener("archive:change-columns", onChangeColumns);
    return () => window.removeEventListener("archive:change-columns", onChangeColumns);
  }, []);

  const reversedGallery = useMemo(
    () =>
      [...gallery]
        .map((item, index) => ({
          ...item,
          _index: index + 1,
        }))
        .reverse(),
    [gallery],
  );

  const closeFullscreen = () => setActiveIndex(null);
  const goNext = () => setActiveIndex((prev) => (prev + 1) % reversedGallery.length);
  const goPrev = () => setActiveIndex((prev) => (prev - 1 + reversedGallery.length) % reversedGallery.length);

  useEffect(() => {
    if (activeIndex === null) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        closeFullscreen();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, reversedGallery.length]);

  useEffect(() => {
    if (activeIndex === null || reversedGallery.length === 0) return;

    const current = reversedGallery[activeIndex];
    const next = reversedGallery[(activeIndex + 1) % reversedGallery.length];
    const prev = reversedGallery[(activeIndex - 1 + reversedGallery.length) % reversedGallery.length];

    const urls = [current, next, prev]
      .map((item) => item?.medium?.url)
      .filter(Boolean);

    urls.forEach((url) => preloadImage(url));
  }, [activeIndex, reversedGallery]);

  const columnSizes = {
    3: "(max-width: 900px) calc((100vw - 24px) / 2), calc((100vw - 32px) / 3)",
    4: "(max-width: 900px) calc((100vw - 24px) / 2), calc((100vw - 40px) / 4)",
    6: "(max-width: 900px) calc((100vw - 24px) / 3), calc((100vw - 56px) / 6)",
    12: "(max-width: 900px) calc((100vw - 40px) / 4), calc((100vw - 104px) / 12)",
  };
  const archiveImageSizes = columnSizes[columns] || "100vw";

  return (
    <main className={styles.main}>
      <div className={styles.archiveContainer} style={{ "--archive-columns": columns }}>
        {reversedGallery.map((medium, index) => (
          <div
            key={medium.medium?._id ?? `${medium._index}`}
            className={styles.archiveMediumContainer}
            role="button"
            tabIndex={0}
            onClick={() => setActiveIndex(index)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setActiveIndex(index);
              }
            }}
          >
            <Medium medium={medium.medium} className={styles.archiveMedium} sizes={archiveImageSizes} quality={72} />
            <span className={styles.archiveIndex}>
              <span className={styles.indexInner}>{medium._index}</span>
            </span>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {activeIndex !== null && reversedGallery[activeIndex] && (
          <motion.div
            className={styles.fullscreenOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className={styles.fullscreenStage}>
              <div className={styles.fullscreenMediumWrap}>
                <Medium
                  className={styles.fullscreenMedium}
                  medium={reversedGallery[activeIndex].medium}
                  sizes="100vw"
                  quality={85}
                  fit="contain"
                />
              </div>
            </div>

            <div className={styles.fullscreenMeta}>
              <strong>
                • {reversedGallery[activeIndex]._index} - {reversedGallery[activeIndex]?.altText || "Untitled"}
              </strong>{" "}
              <button type="button" onClick={closeFullscreen}>
                (close)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default ArchivePage;
