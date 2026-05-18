"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import Medium from "@/components/Medium/Medium";
import styles from "./FullscreenImageView.module.css";

import { useContext } from "react";
import { DeviceContext } from "@/context/DeviceContext";
import FullscreenCaption from "./components/FullscreenCaption";

const FullscreenImageView = ({ items, activeIndex, onClose, onPrev, onNext, caption }) => {
  const { isTouch } = useContext(DeviceContext);
  const [cursorIndicator, setCursorIndicator] = useState({ visible: false, x: 0, y: 0, direction: "right" });
  const [captionRequiredExtra, setCaptionRequiredExtra] = useState(0);
  const [captionExtraSpace, setCaptionExtraSpace] = useState(0);
  const [viewportBottomInset, setViewportBottomInset] = useState(0);
  const mediumWrapRef = useRef(null);

  useEffect(() => {
    if (activeIndex !== null) return;
    setCursorIndicator({ visible: false, x: 0, y: 0, direction: "right" });
    setCaptionRequiredExtra(0);
    setCaptionExtraSpace(0);
    setViewportBottomInset(0);
  }, [activeIndex]);

  useEffect(() => {
    if (activeIndex === null || typeof window === "undefined") return undefined;

    const vv = window.visualViewport;
    let rafId = null;

    const updateViewportInset = () => {
      const nextInset = vv
        ? Math.max(0, window.innerHeight - (vv.offsetTop + vv.height))
        : 0;
      setViewportBottomInset(Math.round(nextInset));
    };

    const queueUpdate = () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(updateViewportInset);
    };

    updateViewportInset();
    window.addEventListener("resize", queueUpdate);
    window.addEventListener("orientationchange", queueUpdate);
    vv?.addEventListener("resize", queueUpdate);
    vv?.addEventListener("scroll", queueUpdate);

    return () => {
      window.removeEventListener("resize", queueUpdate);
      window.removeEventListener("orientationchange", queueUpdate);
      vv?.removeEventListener("resize", queueUpdate);
      vv?.removeEventListener("scroll", queueUpdate);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      setViewportBottomInset(0);
    };
  }, [activeIndex]);

  useLayoutEffect(() => {
    if (activeIndex === null) return undefined;

    const medium = items?.[activeIndex]?.medium;
    const mediumWidth = Number(medium?.width);
    const mediumHeight = Number(medium?.height);
    const aspectRatio = mediumWidth > 0 && mediumHeight > 0 ? mediumWidth / mediumHeight : null;

    const computeExtraSpace = () => {
      if (!mediumWrapRef.current) return;
      if (!captionRequiredExtra || captionRequiredExtra <= 0) {
        setCaptionExtraSpace(0);
        return;
      }
      if (!aspectRatio) {
        setCaptionExtraSpace(captionRequiredExtra);
        return;
      }

      const currentWrapWidth = mediumWrapRef.current.clientWidth;
      const currentWrapHeight = mediumWrapRef.current.clientHeight;
      const baseWrapHeight = currentWrapHeight + captionExtraSpace;

      const renderedHeight = Math.min(baseWrapHeight, currentWrapWidth / aspectRatio);
      const naturalBottomSlack = Math.max(0, (baseWrapHeight - renderedHeight) / 2);
      const requiredExtra = Math.max(0, captionRequiredExtra - naturalBottomSlack);

      setCaptionExtraSpace(Math.ceil(requiredExtra));
    };

    computeExtraSpace();
    const observer = new ResizeObserver(computeExtraSpace);
    if (mediumWrapRef.current) observer.observe(mediumWrapRef.current);
    window.addEventListener("resize", computeExtraSpace);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", computeExtraSpace);
    };
  }, [activeIndex, captionRequiredExtra, items, captionExtraSpace]);

  if (activeIndex === null || !items?.[activeIndex]) return null;

  const handleClick = (event) => {
    if (event.defaultPrevented) return;
    if (event.clientX < window.innerWidth / 2) {
      onPrev?.();
      return;
    }
    onNext?.();
  };

  const handleMouseMove = (event) => {
    setCursorIndicator({
      visible: true,
      x: event.clientX - 16,
      y: event.clientY - 16,
      direction: event.clientX < window.innerWidth / 2 ? "left" : "right",
    });
  };

  const handleMouseLeave = () => {
    setCursorIndicator((prev) => ({ ...prev, visible: false }));
  };

  return (
    <div
      className={styles.fullscreenOverlay}
      style={{
        "--fullscreen-caption-space": `${captionExtraSpace}px`,
        "--fullscreen-viewport-bottom-inset": `${viewportBottomInset}px`,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {!isTouch && cursorIndicator.visible ? (
        <div
          className={styles.fullscreenCursorArrow}
          style={{
            left: `${cursorIndicator.x}px`,
            top: `${cursorIndicator.y}px`,
          }}
        >
          {cursorIndicator.direction === "left" ? "←" : "→"}
        </div>
      ) : null}
      <button
        type="button"
        className={styles.fullscreenCloseButton}
        onMouseEnter={() => setCursorIndicator((prev) => ({ ...prev, visible: false }))}
        onMouseMove={(event) => {
          event.stopPropagation();
          setCursorIndicator((prev) => ({ ...prev, visible: false }));
        }}
        onClick={(event) => {
          event.stopPropagation();
          onClose?.();
        }}
      >
        Close
      </button>
      <div className={styles.fullscreenStage}>
        <div className={styles.fullscreenMediumWrap} ref={mediumWrapRef}>
          <Medium
            className={styles.fullscreenMedium}
            medium={items[activeIndex].medium}
            sizes="100vw"
            quality={100}
            fit="contain"
            showPlaceholderOnMount
            constrainToContainer
          />
        </div>
      </div>

      <div
        className={styles.fullscreenMeta}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <div className={styles.fullscreenControls}>
          <FullscreenCaption
            caption={caption}
            onHeightChange={setCaptionRequiredExtra}
            onInteractiveHover={() => setCursorIndicator((prev) => ({ ...prev, visible: false }))}
          />
        </div>
      </div>
    </div>
  );
};

export default FullscreenImageView;
