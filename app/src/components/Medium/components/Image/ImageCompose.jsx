import { useEffect, useState } from "react";
import { isImageLoaded } from "@/lib/preloadImage";

import Image from "./Image";
import styles from "../../Medium.module.css";
import Placeholder from "../Placeholder";
import PlaceholderSolid from "../PlaceholderSolid";

const ImageCompose = ({
  medium,
  className,
  eager = false,
  sizes = "100vw",
  quality = 75,
  fit = "cover",
  position = "center",
  placeholderDelay,
  showPlaceholderOnMount = false,
  constrainToContainer = false,
}) => {
  const [isLoaded, setIsLoaded] = useState(() => (showPlaceholderOnMount ? false : isImageLoaded(medium?.url)));
  const [resolvedPlaceholderType, setResolvedPlaceholderType] = useState("low_res_image");

  useEffect(() => {
    setIsLoaded(showPlaceholderOnMount ? false : isImageLoaded(medium?.url));
  }, [medium?.url, showPlaceholderOnMount]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const nextType = document.body?.dataset?.placeholderType;
    setResolvedPlaceholderType(nextType === "solid_color" ? "solid_color" : "low_res_image");
  }, []);

  const PlaceholderComponent = resolvedPlaceholderType === "solid_color" ? PlaceholderSolid : Placeholder;

  return (
    <div className={`${styles.mediaContainer} ${className}`}>
      {!isLoaded && (
        <PlaceholderComponent
          medium={medium}
          isLoaded={isLoaded}
          sizes={sizes}
          delay={placeholderDelay}
          eager={eager}
          fit={fit}
          position={position}
        />
      )}
      <Image
        medium={medium}
        setIsLoaded={setIsLoaded}
        eager={eager}
        sizes={sizes}
        quality={quality}
        fit={fit}
        position={position}
        constrainToContainer={constrainToContainer}
      />
    </div>
  );
};

export default ImageCompose;
