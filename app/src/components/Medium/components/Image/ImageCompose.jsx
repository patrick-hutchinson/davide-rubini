import { useEffect, useState } from "react";
import { isImageLoaded } from "@/lib/preloadImage";

import Image from "./Image";
import styles from "../../Medium.module.css";
import Placeholder from "../Placeholder";

const ImageCompose = ({
  medium,
  className,
  eager = false,
  sizes = "100vw",
  quality = 75,
  fit = "cover",
  position = "center",
  placeholderDelay,
}) => {
  const [isLoaded, setIsLoaded] = useState(() => isImageLoaded(medium?.url));

  useEffect(() => {
    setIsLoaded(isImageLoaded(medium?.url));
  }, [medium?.url]);

  return (
    <div className={`${styles.mediaContainer} ${className}`}>
      {!isLoaded && <Placeholder medium={medium} isLoaded={isLoaded} sizes={sizes} delay={placeholderDelay} eager={eager} />}
      <Image
        medium={medium}
        setIsLoaded={setIsLoaded}
        eager={eager}
        sizes={sizes}
        quality={quality}
        fit={fit}
        position={position}
      />
    </div>
  );
};

export default ImageCompose;
