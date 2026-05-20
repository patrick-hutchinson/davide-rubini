import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FullscreenImageView from "@/components/FullscreenImageView/FullscreenImageView";
import { preloadImage } from "@/lib/preloadImage";
import { getImageResolutionUrl } from "@/components/Medium/hooks/useImageResolution";
import { disableScroll, enableScroll } from "@/helpers/blockScrolling";

import Stack from "./components/Stack";
import Overview from "./components/Overview";

import styles from "../../ProjectPage.module.css";

const ProjectGallery = ({ gallery }) => {
  const [viewMode, setViewMode] = useState("stack");
  const [activeIndex, setActiveIndex] = useState(null);
  const mediumItemRefs = useRef(new Map());

  const isStack = viewMode === "stack";
  const isOverview = viewMode === "overview";
  const mediaGallery = useMemo(() => (Array.isArray(gallery) ? gallery.filter((item) => item?.medium) : []), [gallery]);
  const fullscreenGallery = useMemo(() => mediaGallery.filter((item) => item?.medium?.type === "image"), [mediaGallery]);
  const fullscreenCount = fullscreenGallery.length;

  const setMediumItemRef = useCallback((mediumId, node) => {
    if (!mediumId) return;
    if (node) {
      mediumItemRefs.current.set(mediumId, node);
      return;
    }

    mediumItemRefs.current.delete(mediumId);
  }, []);

  const syncScrollToFullscreenIndex = useCallback(
    (index) => {
      if (typeof window === "undefined" || index === null || index < 0) return;

      const mediumId = fullscreenGallery[index]?.medium?._id;
      if (!mediumId) return;

      const node = mediumItemRefs.current.get(mediumId);
      if (!node) return;

      node.scrollIntoView({
        behavior: "auto",
        block: "center",
        inline: "nearest",
      });
    },
    [fullscreenGallery],
  );

  const closeFullscreen = () => {
    if (activeIndex !== null) {
      syncScrollToFullscreenIndex(activeIndex);
    }
    setActiveIndex(null);
  };
  const goNext = () =>
    setActiveIndex((prev) => {
      const nextIndex = (prev + 1) % fullscreenCount;

      return nextIndex;
    });
  const goPrev = () =>
    setActiveIndex((prev) => {
      const nextIndex = (prev - 1 + fullscreenCount) % fullscreenCount;

      return nextIndex;
    });
  const openFullscreenForImage = (mediumItem) => {
    if (mediumItem?.medium?.type !== "image") return;
    const imageIndex = fullscreenGallery.findIndex((item) => item?.medium?._id === mediumItem?.medium?._id);
    if (imageIndex >= 0) {
      setActiveIndex(imageIndex);
    }
  };

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
    if (activeIndex !== null) {
      disableScroll();
      return () => enableScroll();
    }

    enableScroll();
    return undefined;
  }, [activeIndex]);

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

  useEffect(() => {
    if (activeIndex === null) return;

    syncScrollToFullscreenIndex(activeIndex);
    const rafId = window.requestAnimationFrame(() => {
      syncScrollToFullscreenIndex(activeIndex);
    });

    return () => window.cancelAnimationFrame(rafId);
  }, [activeIndex, syncScrollToFullscreenIndex]);

  useEffect(() => {
    if (activeIndex === null) return;
  }, [activeIndex, fullscreenGallery]);

  return (
    <div className={styles.gallery}>
      <div className={activeIndex !== null ? styles.backgroundHidden : undefined}>
        <div style={{ marginBottom: "var(--margin-page)" }}>
          [
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
          ]
        </div>

        <div>
          {viewMode === "stack" ? (
            <Stack gallery={mediaGallery} onOpenFullscreen={openFullscreenForImage} registerItemRef={setMediumItemRef} />
          ) : (
            <Overview gallery={mediaGallery} onOpenFullscreen={openFullscreenForImage} registerItemRef={setMediumItemRef} />
          )}
        </div>
      </div>

      <FullscreenImageView
        items={fullscreenGallery}
        activeIndex={activeIndex}
        onClose={closeFullscreen}
        onPrev={goPrev}
        onNext={goNext}
        caption={fullscreenGallery[activeIndex]?.medium?.altText || ""}
      />
    </div>
  );
};

export default ProjectGallery;
