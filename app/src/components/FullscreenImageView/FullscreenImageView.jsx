"use client";

import { useEffect, useState } from "react";

import FullscreenMedium from "./components/FullscreenMedium";
import styles from "./FullscreenImageView.module.css";

import FullscreenCaption from "./components/FullscreenCaption";

const FullscreenImageView = ({ items, activeIndex, onClose, onPrev, onNext, caption }) => {
  const [cursorIndicator, setCursorIndicator] = useState({ visible: false, x: 0, y: 0, direction: "right" });
  const [captionHeight, setCaptionHeight] = useState(0);

  useEffect(() => {
    if (activeIndex !== null) return;
    setCursorIndicator({ visible: false, x: 0, y: 0, direction: "right" });
  }, [activeIndex]);

  const handleClick = (event) => {
    if (event.defaultPrevented) return;
    const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
    if (event.clientX < viewportWidth / 2) {
      onPrev?.();
      return;
    }
    onNext?.();
  };

  const handleMouseMove = (event) => {
    const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
    setCursorIndicator({
      visible: true,
      x: event.clientX - 16,
      y: event.clientY - 16,
      direction: event.clientX < viewportWidth / 2 ? "left" : "right",
    });
  };

  const handleMouseLeave = () => {
    setCursorIndicator((prev) => ({ ...prev, visible: false }));
  };

  if (activeIndex === null || !items?.[activeIndex]) return null;

  return (
    <div
      className={styles.fullscreenOverlay}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {cursorIndicator.visible ? (
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
      <FullscreenMedium medium={items[activeIndex].medium} captionHeight={captionHeight} />
      <div
        className={styles.fullscreenMeta}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <div className={styles.fullscreenControls}>
          <FullscreenCaption
            caption={caption}
            setCaptionHeight={setCaptionHeight}
            onInteractiveHover={() => setCursorIndicator((prev) => ({ ...prev, visible: false }))}
          />
        </div>
      </div>
    </div>
  );
};

export default FullscreenImageView;
