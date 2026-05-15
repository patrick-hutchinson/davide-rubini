import { useViewport } from "@/context/ViewportContext";
import styles from "../FullscreenImageView.module.css";

import { useRef, useState, useEffect, useLayoutEffect } from "react";

const FullscreenCaption = ({ caption, onHeightChange }) => {
  const { viewportWidth } = useViewport();

  const [displayCaption, setDisplayCaption] = useState(caption);
  const trimmedRef = useRef("");

  const measureCaption = useRef(null);
  const measureMore = useRef(null);
  const visibleCaption = useRef(null);

  const measureText = (text) => {
    measureCaption.current.innerText = text;

    return measureCaption.current.getBoundingClientRect().width;
  };

  const CollapsedCaption = ({ trimmed }) => (
    <>
      {trimmed}... <a onClick={() => setDisplayCaption(<FullCaption />)}>(more)</a>
    </>
  );

  const FullCaption = () => (
    <>
      {caption} <a onClick={() => setDisplayCaption(<CollapsedCaption trimmed={trimmedRef.current} />)}>(less)</a>
    </>
  );

  useEffect(() => {
    if (!measureCaption.current || !measureMore.current) return;

    const captionWidth = measureText(caption);

    const moreWidth = measureMore.current.getBoundingClientRect().width;

    const totalWidth = captionWidth + moreWidth;

    const availableSpace = viewportWidth - 32;

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

  useLayoutEffect(() => {
    const node = visibleCaption.current;
    if (!node || typeof onHeightChange !== "function") return undefined;

    const update = () => {
      const height = Math.ceil(node.getBoundingClientRect().height);
      onHeightChange(height);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);

    return () => {
      observer.disconnect();
      onHeightChange(0);
    };
  }, [displayCaption, onHeightChange]);

  return (
    <div style={{ position: "relative" }}>
      {/* Hidden measurement elements */}
      <div className={styles.measureCaption} ref={measureCaption}>
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
