import { useEffect, useMemo, useState } from "react";
import { preloadImage } from "@/lib/preloadImage";
import { getImageResolutionUrl } from "@/components/Medium/hooks/useImageResolution";
import Medium from "@/components/Medium/Medium";

import Stack from "./components/Stack";
import Overview from "./components/Overview";

import styles from "../../ProjectPage.module.css";

const ProjectGallery = ({ gallery }) => {
  const SWIPE_THRESHOLD_PX = 36;
  const [viewMode, setViewMode] = useState("stack");
  const [activeIndex, setActiveIndex] = useState(null);

  const isStack = viewMode === "stack";
  const isOverview = viewMode === "overview";
  const fullscreenGallery = useMemo(() => (Array.isArray(gallery) ? gallery.filter((item) => item?.medium) : []), [gallery]);
  const fullscreenCount = fullscreenGallery.length;

  const closeFullscreen = () => setActiveIndex(null);
  const goNext = () => setActiveIndex((prev) => (prev + 1) % fullscreenCount);
  const goPrev = () => setActiveIndex((prev) => (prev - 1 + fullscreenCount) % fullscreenCount);

  useEffect(() => {
    if (activeIndex === null || fullscreenCount === 0) return undefined;

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
  }, [activeIndex, fullscreenCount]);

  useEffect(() => {
    if (activeIndex === null || fullscreenCount === 0) return undefined;

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
  }, [activeIndex, fullscreenCount]);

  useEffect(() => {
    if (activeIndex === null || fullscreenCount === 0) return;

    const current = fullscreenGallery[activeIndex];
    const next = fullscreenGallery[(activeIndex + 1) % fullscreenCount];
    const prev = fullscreenGallery[(activeIndex - 1 + fullscreenCount) % fullscreenCount];
    const fullscreenTargetWidth = Math.max(1, Math.round(window.innerWidth * (window.devicePixelRatio || 1)));

    const urls = [current, next, prev]
      .map((item) => item?.medium)
      .filter(Boolean)
      .map((medium) =>
        getImageResolutionUrl(medium, {
          width: fullscreenTargetWidth,
          quality: 100,
        }),
      )
      .filter(Boolean);

    urls.forEach((url) => preloadImage(url));
  }, [activeIndex, fullscreenCount, fullscreenGallery]);

  return (
    <div className={styles.gallery}>
      <div style={{ marginBottom: "var(--margin-page)" }}>
        <button
          onClick={() => setViewMode("stack")}
          style={{
            fontWeight: isStack && "bold",
            color: isStack ? "var(--foreground)" : "var(--link-color)",
            textDecoration: isStack ? "none" : "underline",
          }}
        >
          Stack
        </button>
        <span>&nbsp;–&nbsp;</span>
        <button
          onClick={() => setViewMode("overview")}
          style={{
            fontWeight: isOverview && "bold",
            color: isOverview ? "var(--foreground)" : "var(--link-color)",
            textDecoration: isOverview ? "none" : "underline",
          }}
        >
          Overview
        </button>
      </div>

      <div>
        {viewMode === "stack" ? (
          <Stack gallery={fullscreenGallery} onOpenFullscreen={setActiveIndex} />
        ) : (
          <Overview gallery={fullscreenGallery} onOpenFullscreen={setActiveIndex} />
        )}
      </div>

      {activeIndex !== null && fullscreenGallery[activeIndex] && (
        <div className={styles.fullscreenOverlay}>
          <div className={styles.fullscreenStage}>
            <div className={styles.fullscreenMediumWrap}>
              <Medium
                className={styles.fullscreenMedium}
                medium={fullscreenGallery[activeIndex].medium}
                sizes="100vw"
                quality={100}
                fit="contain"
                showPlaceholderOnMount
                constrainToContainer
              />
            </div>
          </div>

          <div className={styles.fullscreenMeta}>
            <div className={styles.fullscreenControls}>
              <div className={styles.fullscreenLabel}>{fullscreenGallery[activeIndex]?.medium?.altText || "Untitled"}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectGallery;
