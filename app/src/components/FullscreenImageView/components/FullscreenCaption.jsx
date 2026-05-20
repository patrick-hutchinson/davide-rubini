import { useViewport } from "@/context/ViewportContext";
import styles from "../FullscreenImageView.module.css";

import { useRef, useState, useLayoutEffect, useEffect } from "react";

const FullscreenCaption = ({ caption, onInteractiveHover, setCaptionHeight }) => {
  const { viewportWidth } = useViewport();

  const [displayCaption, setDisplayCaption] = useState(caption);
  const trimmedRef = useRef("");

  const measureCaptionLength = useRef(null);
  const measureCaptionHeight = useRef(null);
  const measureMore = useRef(null);
  const visibleCaption = useRef(null);

  const measureText = (text) => {
    measureCaptionLength.current.innerText = text;

    return measureCaptionLength.current.getBoundingClientRect().width;
  };

  const setExpandedCaption = () => {
    setDisplayCaption(<FullCaption />);
    setCaptionHeight(measureCaptionHeight.current.getBoundingClientRect().height);
  };

  const setCollapsedCaption = () => {
    setDisplayCaption(<CollapsedCaption trimmed={trimmedRef.current} />);
    setCaptionHeight(0);
  };

  const CollapsedCaption = ({ trimmed }) => (
    <>
      {trimmed}...{" "}
      <a
        onMouseEnter={() => onInteractiveHover?.()}
        onMouseMove={(event) => {
          event.stopPropagation();
          onInteractiveHover?.();
        }}
        onClick={() => setExpandedCaption()}
      >
        (more)
      </a>
    </>
  );

  const FullCaption = () => (
    <>
      {caption}{" "}
      <a
        onMouseEnter={() => onInteractiveHover?.()}
        onMouseMove={(event) => {
          event.stopPropagation();
          onInteractiveHover?.();
        }}
        onClick={() => setCollapsedCaption()}
      >
        (less)
      </a>
    </>
  );

  useLayoutEffect(() => {
    if (!measureCaptionLength.current || !measureMore.current) return;

    const captionWidth = measureText(caption);

    const moreWidth = measureMore.current.getBoundingClientRect().width;

    const totalWidth = captionWidth + moreWidth;

    const rootStyles = window.getComputedStyle(document.documentElement);
    const marginPage = Number.parseFloat(rootStyles.getPropertyValue("--margin-page")) || 16;
    const availableSpace = Math.max(0, viewportWidth - 2 * marginPage);

    // Fits already
    if (totalWidth <= availableSpace) {
      setDisplayCaption(caption);
      return;
    }

    // Needs trimming
    const targetWidth = availableSpace - moreWidth;

    const words = caption.split(" ");

    let trimmed = "";

    for (let i = 0; i < words.length; i++) {
      const next = trimmed ? `${trimmed} ${words[i]}` : words[i];

      const nextWidth = measureText(`${next}...`);

      if (nextWidth > targetWidth) break;

      trimmed = next;
    }

    trimmedRef.current = trimmed;
    setDisplayCaption(<CollapsedCaption trimmed={trimmed} />);
  }, [caption, viewportWidth]);

  return (
    <div style={{ position: "relative" }}>
      {/* Hidden measurement elements */}
      <div className={styles.measureCaptionLength} ref={measureCaptionLength}>
        {caption}
      </div>
      <div className={styles.measureCaptionHeight} ref={measureCaptionHeight}>
        {caption}
      </div>
      <div className={styles.measureMore} ref={measureMore}>
        <a>(more)</a>
      </div>
      {/* Visible caption */}
      <div className={styles.fullscreencaption} ref={visibleCaption}>
        {displayCaption}
      </div>
    </div>
  );
};

export default FullscreenCaption;
