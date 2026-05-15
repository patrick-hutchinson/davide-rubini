"use client";

import { useEffect, useState } from "react";

import Medium from "@/components/Medium/Medium";
import styles from "./FullscreenImageView.module.css";

import { useContext } from "react";
import { DeviceContext } from "@/context/DeviceContext";
import FullscreenCaption from "./components/FullscreenCaption";

const FullscreenImageView = ({ items, activeIndex, onClose, onPrev, onNext, caption }) => {
  const { isTouch } = useContext(DeviceContext);
  const [cursorIndicator, setCursorIndicator] = useState({ visible: false, x: 0, y: 0, direction: "right" });
  const [captionExtraSpace, setCaptionExtraSpace] = useState(0);

  useEffect(() => {
    if (activeIndex !== null) return;
    setCursorIndicator({ visible: false, x: 0, y: 0, direction: "right" });
    setCaptionExtraSpace(0);
  }, [activeIndex]);

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
      style={{ "--fullscreen-caption-space": `${captionExtraSpace}px` }}
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
        <div className={styles.fullscreenMediumWrap}>
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
            onHeightChange={setCaptionExtraSpace}
            onInteractiveHover={() => setCursorIndicator((prev) => ({ ...prev, visible: false }))}
          />
        </div>
      </div>
    </div>
  );
};

export default FullscreenImageView;
