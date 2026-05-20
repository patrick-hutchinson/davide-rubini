import Medium from "@/components/Medium/Medium";

import styles from "../FullscreenImageView.module.css";
import { useEffect, useRef, useState } from "react";

const FullscreenMedium = ({ medium, captionHeight }) => {
  const ref = useRef(null);

  const [dimensions, setDimensions] = useState({ width: null, height: null });
  const [baseDimensions, setBaseDimensions] = useState({ width: null, height: null });
  const [position, setPosition] = useState({ left: null, top: null });

  useEffect(() => {
    if (!ref.current || !medium?.width || !medium?.height) return;

    const availableHeight = ref.current.getBoundingClientRect().height;
    const availableWidth = ref.current.getBoundingClientRect().width;

    const scale = Math.min(availableWidth / medium.width, availableHeight / medium.height);

    const mediaWidth = medium.width * scale;
    const mediaHeight = medium.height * scale;

    setDimensions({ width: mediaWidth, height: mediaHeight });
    setBaseDimensions({ width: mediaWidth, height: mediaHeight });
    setPosition({ top: (availableHeight - mediaHeight) / 2 });
  }, [medium]);

  useEffect(() => {
    if (!ref.current || !medium?.width || !medium?.height) return;

    const availableHeight = ref.current.getBoundingClientRect().height;

    const whiteSpace = availableHeight - dimensions.height;
    const whiteSpaceBottom = whiteSpace / 2;

    const additionalCaptionSpace = captionHeight - 34.5;

    if (additionalCaptionSpace > whiteSpaceBottom) {
      const newHeight = dimensions.height - additionalCaptionSpace;
      const scale = newHeight / medium.height;

      setDimensions({
        width: medium.width * scale,
        height: medium.height * scale,
      });
    } else {
      setDimensions({
        width: baseDimensions.width,
        height: baseDimensions.height,
      });
    }

    console.log(whiteSpace, "whiteSpace");
  }, [captionHeight, baseDimensions, medium]);

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
