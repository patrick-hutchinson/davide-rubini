import Medium from "@/components/Medium/Medium";

import styles from "../FullscreenImageView.module.css";
import { useCallback, useEffect, useRef, useState } from "react";

const FullscreenMedium = ({ medium, captionHeight }) => {
  const ref = useRef(null);
  const baseTopRef = useRef(null);
  const baseDimensionsRef = useRef({ width: 0, height: 0 });

  const [dimensions, setDimensions] = useState({ width: null, height: null });
  const [position, setPosition] = useState({ left: null, top: null });

  const updateLayout = useCallback(() => {
    if (!ref.current || !medium?.width || !medium?.height) return;

    const { width: availableWidth, height: availableHeight } = ref.current.getBoundingClientRect();
    if (!availableWidth || !availableHeight) return;

    const scale = Math.min(availableWidth / medium.width, availableHeight / medium.height);

    const baseWidth = medium.width * scale;
    const baseHeight = medium.height * scale;
    const initialTop = (availableHeight - baseHeight) / 2;

    baseDimensionsRef.current = { width: baseWidth, height: baseHeight };
    baseTopRef.current = initialTop;

    const whiteSpaceBottom = Math.max(0, (availableHeight - baseHeight) / 2);
    const requiredCaptionSpace = Math.max(0, captionHeight);
    const requiredShrink = Math.max(0, requiredCaptionSpace - whiteSpaceBottom);
    const nextHeight = Math.max(0, baseHeight - requiredShrink);
    const nextWidth = Math.max(0, nextHeight * (medium.width / medium.height));

    setDimensions({
      width: nextWidth,
      height: nextHeight,
    });
    setPosition({
      left: (availableWidth - nextWidth) / 2,
      top: baseTopRef.current ?? 0,
    });
  }, [captionHeight, medium?.height, medium?.width]);

  useEffect(() => {
    updateLayout();
  }, [updateLayout]);

  useEffect(() => {
    if (!ref.current) return undefined;
    const observer = new ResizeObserver(updateLayout);
    observer.observe(ref.current);
    window.addEventListener("resize", updateLayout);
    window.visualViewport?.addEventListener("resize", updateLayout);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateLayout);
      window.visualViewport?.removeEventListener("resize", updateLayout);
    };
  }, [updateLayout]);

  return (
    <div className={styles.fullscreenStage} ref={ref}>
      <div
        style={{
          width: dimensions.width,
          height: dimensions.height,
          left: position.left,
          top: position.top,
          position: "absolute",
        }}
      >
        <Medium className={styles.fullscreenMedium} medium={medium} sizes="100vw" quality={100} showPlaceholderOnMount />
      </div>
    </div>
  );
};

export default FullscreenMedium;
