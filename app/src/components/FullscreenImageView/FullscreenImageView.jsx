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
  const mediumWrapRef = useRef(null);

  useEffect(() => {
    if (activeIndex !== null) return;
    setCursorIndicator({ visible: false, x: 0, y: 0, direction: "right" });
    setCaptionRequiredExtra(0);
    setCaptionExtraSpace(0);
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
        setCaptionExtraSpace((prev) => (prev === 0 ? prev : 0));
        return;
      }
      if (!aspectRatio) {
        const next = Math.ceil(captionRequiredExtra);
        setCaptionExtraSpace((prev) => (prev === next ? prev : next));
        return;
      }

      const currentWrapWidth = mediumWrapRef.current.clientWidth;
      const currentWrapHeight = mediumWrapRef.current.clientHeight;
      setCaptionExtraSpace((prev) => {
        const baseWrapHeight = currentWrapHeight + prev;
        const renderedHeight = Math.min(baseWrapHeight, currentWrapWidth / aspectRatio);
        const naturalBottomSlack = Math.max(0, (baseWrapHeight - renderedHeight) / 2);
        const requiredExtra = Math.max(0, captionRequiredExtra - naturalBottomSlack);
        const next = Math.ceil(requiredExtra);
        return next === prev ? prev : next;
      });
    };

    computeExtraSpace();
    const observer = new ResizeObserver(computeExtraSpace);
    if (mediumWrapRef.current) observer.observe(mediumWrapRef.current);
    window.addEventListener("resize", computeExtraSpace);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", computeExtraSpace);
    };
  }, [activeIndex, captionRequiredExtra, items]);

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
