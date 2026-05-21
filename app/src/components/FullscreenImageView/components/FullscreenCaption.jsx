import { useViewport } from "@/context/ViewportContext";
import styles from "../FullscreenImageView.module.css";

import { useRef, useState, useLayoutEffect } from "react";

const FullscreenCaption = ({ caption, onInteractiveHover, setCaptionHeight }) => {
  const { viewportWidth } = useViewport();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [trimmed, setTrimmed] = useState(caption);
  const trimmedRef = useRef("");
  const rafRef = useRef(null);

  const measureCaptionLength = useRef(null);
  const measureCaptionHeight = useRef(null);
  const measureMore = useRef(null);
  const FIT_BUFFER_PX = 6;
  const HYSTERESIS_PX = 8;

  const measureText = (text) => {
    measureCaptionLength.current.innerText = text;

    return measureCaptionLength.current.getBoundingClientRect().width;
  };

  const setExpandedCaption = () => {
    setIsExpanded(true);
    const expandedHeight = measureCaptionHeight.current.getBoundingClientRect().height;
    const computed = window.getComputedStyle(measureCaptionHeight.current);
    const parsedLineHeight = Number.parseFloat(computed.lineHeight);
    const fallbackLineHeight = Number.parseFloat(computed.fontSize) * 1.2;
    const singleLineHeight = Number.isFinite(parsedLineHeight) ? parsedLineHeight : fallbackLineHeight;
    setCaptionHeight(Math.max(0, expandedHeight - singleLineHeight));
  };

  const setCollapsedCaption = () => {
    setIsExpanded(false);
    setIsCollapsed(true);
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
    if (isExpanded) return;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const captionWidth = measureText(caption);
      const moreWidth = measureMore.current.getBoundingClientRect().width;
      const totalWidth = captionWidth + moreWidth;

      const rootStyles = window.getComputedStyle(document.documentElement);
      const marginPage = Number.parseFloat(rootStyles.getPropertyValue("--margin-page")) || 16;
      const availableSpace = Math.max(0, viewportWidth - 2 * marginPage - FIT_BUFFER_PX);

      const collapseThreshold = availableSpace;
      const expandThreshold = availableSpace + HYSTERESIS_PX;

      if (isCollapsed) {
        if (totalWidth <= expandThreshold) {
          setIsCollapsed(false);
          setTrimmed(caption);
        }
        return;
      }

      if (totalWidth <= collapseThreshold) {
        setIsCollapsed(false);
        setTrimmed(caption);
        return;
      }

      const targetWidth = availableSpace - moreWidth;
      const words = caption.split(" ");
      let nextTrimmed = "";

      for (let i = 0; i < words.length; i++) {
        const next = nextTrimmed ? `${nextTrimmed} ${words[i]}` : words[i];
        const nextWidth = measureText(`${next}...`);
        if (nextWidth > targetWidth) break;
        nextTrimmed = next;
      }

      trimmedRef.current = nextTrimmed;
      setTrimmed(nextTrimmed);
      setIsCollapsed(true);
    });

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [caption, isCollapsed, isExpanded, viewportWidth]);

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
      <div className={styles.fullscreencaption}>
        {isExpanded ? <FullCaption /> : isCollapsed ? <CollapsedCaption trimmed={trimmed} /> : caption}
      </div>
    </div>
  );
};

export default FullscreenCaption;
