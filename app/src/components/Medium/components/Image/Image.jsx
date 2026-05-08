import { getImageResolutionUrl } from "@/components/Medium/hooks/useImageResolution";
import { markImageLoaded } from "@/lib/preloadImage";

import NextImage from "next/image";

const Image = ({
  medium,
  setIsLoaded,
  isLoaded,
  eager = false,
  sizes = "100vw",
  quality = 75,
  fit = "cover",
  position = "center",
  constrainToContainer = false,
}) => {
  const imageSource = medium.url;

  const resolutionWidth = medium.width;
  const resolutionHeight = medium.height;
  const imageLoader = ({ src, width: nextWidth, quality: nextQuality }) =>
    getImageResolutionUrl(
      { ...medium, url: src },
      {
        width: nextWidth,
        quality: nextQuality ?? quality,
      }
    );

  return (
    <div
      style={{
        display: "block",
        width: "100%",
        height: constrainToContainer ? "100%" : "auto",
        aspectRatio: resolutionWidth / resolutionHeight,
        position: "relative",
      }}
    >
      <NextImage
        src={imageSource}
        alt="image"
        loader={imageLoader}
        width={resolutionWidth}
        height={resolutionHeight}
        sizes={sizes}
        quality={quality}
        priority={eager}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "low"}
        decoding={eager ? "sync" : "async"}
        draggable={false}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          left: 0,
          top: 0,
          objectFit: fit,
          objectPosition: position,
          opacity: isLoaded ? 1 : 0,
        }}
        onLoad={(event) => {
          markImageLoaded(imageSource);
          markImageLoaded(event?.currentTarget?.currentSrc);
          setIsLoaded?.(true);
        }}
      />
    </div>
  );
};

export default Image;
