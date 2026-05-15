"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import FullscreenImageView from "@/components/FullscreenImageView/FullscreenImageView";
import Medium from "@/components/Medium/Medium";
import { getImageResolutionUrl } from "@/components/Medium/hooks/useImageResolution";
import { disableScroll, enableScroll } from "@/helpers/blockScrolling";
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
  const [columns, setColumns] = useState(() => getPreferredDefaultColumns());
  const [activeIndex, setActiveIndex] = useState(null);
  const mediumItemRefs = useRef(new Map());
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
  const fullscreenGallery = useMemo(
    () => reversedGallery.filter((item) => item?.medium?.type === "image"),
    [reversedGallery],
  );
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
      console.log("[ArchivePage] goNext", { prevIndex: prev, nextIndex, fullscreenCount });
      return nextIndex;
    });
  const goPrev = () =>
    setActiveIndex((prev) => {
      const nextIndex = (prev - 1 + fullscreenCount) % fullscreenCount;
      console.log("[ArchivePage] goPrev", { prevIndex: prev, nextIndex, fullscreenCount });
      return nextIndex;
    });

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

  const openFullscreenForImage = (item) => {
    if (item?.medium?.type !== "image") return;
    const imageIndex = fullscreenGallery.findIndex((entry) => entry?.medium?._id === item?.medium?._id);
    if (imageIndex >= 0) {
      console.log("[ArchivePage] openFullscreenForImage", {
        selectedIndex: imageIndex,
        selectedId: item?.medium?._id,
        selectedAltText: item?.medium?.altText,
      });
      setActiveIndex(imageIndex);
    }
  };

  useEffect(() => {
    if (activeIndex === null) return;
    console.log("[ArchivePage] activeIndex changed", {
      activeIndex,
      activeId: fullscreenGallery[activeIndex]?.medium?._id,
      activeAltText: fullscreenGallery[activeIndex]?.medium?.altText,
    });
  }, [activeIndex, fullscreenGallery]);

  // Keep image requests stable across column toggles to prevent flicker from source re-selection.
  const archiveImageSizes =
    "(max-width: 47.99rem) calc((100vw - 24px) / 2), (max-width: 79.99rem) calc((100vw - 40px) / 4), calc((100vw - 56px) / 6)";
  const archiveGridQuality = 100;

  return (
    <main className={styles.main}>
      <div className={activeIndex !== null ? styles.backgroundHidden : undefined}>
        <div className={styles.archiveContainer} style={{ "--archive-columns": columns }}>
          {reversedGallery.map((medium) => (
            <div
              key={medium.medium?._id ?? `${medium._index}`}
              className={styles.archiveMediumContainer}
              ref={(node) => setMediumItemRef(medium?.medium?._id, node)}
            >
              {medium?.medium?.type === "image" ? (
                <button type="button" className={styles.archiveMediumButton} onClick={() => openFullscreenForImage(medium)}>
                  <Medium
                    medium={medium.medium}
                    className={styles.archiveMedium}
                    sizes={archiveImageSizes}
                    quality={archiveGridQuality}
                    fit="contain"
                    position="top"
                  />
                </button>
              ) : (
                <Medium
                  medium={medium.medium}
                  className={styles.archiveMedium}
                  sizes={archiveImageSizes}
                  quality={archiveGridQuality}
                  fit="contain"
                  position="top"
                />
              )}
            </div>
          ))}
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
    </main>
  );
};

export default ArchivePage;
