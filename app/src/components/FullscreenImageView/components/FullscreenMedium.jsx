import Medium from "@/components/Medium/Medium";

import styles from "../FullscreenImageView.module.css";
import { useEffect, useRef, useState } from "react";

const FullscreenMedium = ({ medium, captionHeight }) => {
  const ref = useRef(null);
  const baseTopRef = useRef(null);
  const baseDimensionsRef = useRef({ width: 0, height: 0 });

  const [dimensions, setDimensions] = useState({ width: null, height: null });
  const [position, setPosition] = useState({ left: null, top: null });

  useEffect(() => {
    if (!ref.current || !medium?.width || !medium?.height) return;

    const availableHeight = ref.current.getBoundingClientRect().height;
    const availableWidth = ref.current.getBoundingClientRect().width;

    const scale = Math.min(availableWidth / medium.width, availableHeight / medium.height);

    const mediaWidth = medium.width * scale;
    const mediaHeight = medium.height * scale;
    const initialTop = (availableHeight - mediaHeight) / 2;

    setDimensions({ width: mediaWidth, height: mediaHeight });
    baseDimensionsRef.current = { width: mediaWidth, height: mediaHeight };
    baseTopRef.current = initialTop;
    setPosition({ left: (availableWidth - mediaWidth) / 2, top: initialTop });
  }, [medium]);

  useEffect(() => {
    if (!ref.current || !medium?.width || !medium?.height) return;

    const { width: availableWidth, height: availableHeight } = ref.current.getBoundingClientRect();
    const baseWidth = baseDimensionsRef.current.width;
    const baseHeight = baseDimensionsRef.current.height;
    if (!baseWidth || !baseHeight) return;

    const whiteSpaceBottom = Math.max(0, (availableHeight - baseHeight) / 2);
    const requiredCaptionSpace = Math.max(0, captionHeight + 8);
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
