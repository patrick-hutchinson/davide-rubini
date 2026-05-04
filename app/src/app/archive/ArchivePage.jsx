"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import Medium from "@/components/Medium/Medium";
import { getImageResolutionUrl } from "@/components/Medium/hooks/useImageResolution";
import { preloadImage } from "@/lib/preloadImage";
import styles from "./ArchivePage.module.css";

const getAllowedColumns = () => {
  if (typeof window === "undefined") return [3, 4, 6, 12];

  const width = window.innerWidth;
  if (width < 768) return [1, 2];
  return [3, 4, 6, 12];
};

const getPreferredDefaultColumns = () => {
  if (typeof window === "undefined") return 6;
  return window.innerWidth < 768 ? 2 : 6;
};

const ArchivePage = ({ archive }) => {
  const SWIPE_THRESHOLD_PX = 36;
  const [columns, setColumns] = useState(() => getPreferredDefaultColumns());
  const [activeIndex, setActiveIndex] = useState(null);
  const gallery = Array.isArray(archive?.gallery) ? archive.gallery : [];
  if (gallery.length === 0) return null;

  const changeColumns = () => {
    const allowed = getAllowedColumns();
    setColumns((prev) => {
      const currentIndex = allowed.indexOf(prev);
      if (currentIndex === -1) return allowed[0];
      return allowed[(currentIndex + 1) % allowed.length];
    });
  };

  useEffect(() => {
    const applyAllowedColumns = () => {
      const allowed = getAllowedColumns();
      const preferred = getPreferredDefaultColumns();
      const fallback = allowed.includes(preferred) ? preferred : allowed[0];
      setColumns((prev) => (allowed.includes(prev) ? prev : fallback));
    };

    applyAllowedColumns();
    window.addEventListener("resize", applyAllowedColumns);
    return () => window.removeEventListener("resize", applyAllowedColumns);
  }, []);

  useEffect(() => {
    const onChangeColumns = (event) => {
      const nextColumns = event?.detail?.columns;

      if (typeof nextColumns === "number") {
        const allowed = getAllowedColumns();
        if (allowed.includes(nextColumns)) {
          setColumns(nextColumns);
        }
        return;
      }

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
    if (activeIndex === null) return undefined;

    let touchStartX = null;
    let touchStartY = null;

    const onTouchStart = (event) => {
      const touch = event.touches?.[0];
      if (!touch) return;
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    };

    const onTouchEnd = (event) => {
      const touch = event.changedTouches?.[0];
      if (!touch || touchStartX === null || touchStartY === null) return;

      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);

      if (isHorizontalSwipe && Math.abs(deltaX) >= SWIPE_THRESHOLD_PX) {
        if (deltaX < 0) {
          goNext();
        } else {
          goPrev();
        }
      }

      touchStartX = null;
      touchStartY = null;
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [activeIndex, reversedGallery.length]);

  useEffect(() => {
    if (activeIndex === null || reversedGallery.length === 0) return;

    const current = reversedGallery[activeIndex];
    const next = reversedGallery[(activeIndex + 1) % reversedGallery.length];
    const prev = reversedGallery[(activeIndex - 1 + reversedGallery.length) % reversedGallery.length];
    const fullscreenTargetWidth = Math.max(1, Math.round(window.innerWidth * (window.devicePixelRatio || 1)));

    const urls = [current, next, prev]
      .map((item) => item?.medium)
      .filter(Boolean)
      .map((medium) =>
        getImageResolutionUrl(medium, {
          width: fullscreenTargetWidth,
          quality: 100,
        })
      )
      .filter(Boolean);

    urls.forEach((url) => preloadImage(url));
  }, [activeIndex, reversedGallery]);

  const columnSizes = {
    1: "calc(100vw - (2 * var(--margin-page)))",
    2: "(max-width: 47.99rem) calc((100vw - 24px) / 2), calc((100vw - 24px) / 2)",
    3: "(max-width: 900px) calc(((100vw - 24px) / 2) * 1.25), calc(((100vw - 32px) / 3) * 1.5)",
    4: "(max-width: 900px) calc((100vw - 24px) / 2), calc((100vw - 40px) / 4)",
    6: "(max-width: 900px) calc((100vw - 24px) / 3), calc((100vw - 56px) / 6)",
    12: "(max-width: 900px) calc((100vw - 40px) / 4), calc((100vw - 104px) / 12)",
  };
  const archiveImageSizes = columnSizes[columns] || "100vw";
  const archiveGridQuality = columns === 3 ? 100 : 75;

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
            <Medium
              medium={medium.medium}
              className={styles.archiveMedium}
              sizes={archiveImageSizes}
              quality={archiveGridQuality}
            />
          </div>
        ))}
      </div>

      {activeIndex !== null && reversedGallery[activeIndex] && (
        <div
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
                quality={100}
                fit="contain"
                showPlaceholderOnMount
              />
            </div>
          </div>

          <div className={styles.fullscreenMeta}>
            <div className={styles.fullscreenControls}>
              {/* <button type="button" onClick={goPrev}>
                ← Previous Image
              </button>
              <button type="button" onClick={goNext}>
                Next Image →
              </button>
              &nbsp;/
              <button type="button" onClick={closeFullscreen}>
                Close
              </button>
              <span>&nbsp;•&nbsp;</span> */}
              <div className={styles.fullscreenLabel}>{reversedGallery[activeIndex]?.medium?.altText || "Untitled"}</div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ArchivePage;
