import { getImageResolutionUrl } from "@/components/Medium/hooks/useImageResolution";
import { markImageLoaded } from "@/lib/preloadImage";
import { useEffect, useRef, useState } from "react";

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
  enableGestureZoom = false,
}) => {
  const MAX_ZOOM = 4;
  const imageSource = medium.url;
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const gestureRef = useRef({
    isPanning: false,
    lastPanX: 0,
    lastPanY: 0,
    pinchDistance: 0,
    pinchZoom: 1,
    suppressClickUntil: 0,
  });

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

  useEffect(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, [medium?.url]);

  const clampZoom = (value) => Math.max(1, Math.min(MAX_ZOOM, value));

  const onTouchStart = (event) => {
    if (!enableGestureZoom) return;
    event.stopPropagation();

    if (event.touches.length === 2) {
      const [first, second] = event.touches;
      const dx = second.clientX - first.clientX;
      const dy = second.clientY - first.clientY;
      gestureRef.current.pinchDistance = Math.hypot(dx, dy);
      gestureRef.current.pinchZoom = zoom;
      gestureRef.current.isPanning = false;
      gestureRef.current.suppressClickUntil = Date.now() + 300;
      return;
    }

    if (event.touches.length === 1 && zoom > 1) {
      gestureRef.current.isPanning = true;
      gestureRef.current.lastPanX = event.touches[0].clientX;
      gestureRef.current.lastPanY = event.touches[0].clientY;
      gestureRef.current.suppressClickUntil = Date.now() + 300;
    }
  };

  const onTouchMove = (event) => {
    if (!enableGestureZoom) return;

    if (event.touches.length === 2) {
      event.preventDefault();
      event.stopPropagation();
      const [first, second] = event.touches;
      const dx = second.clientX - first.clientX;
      const dy = second.clientY - first.clientY;
      const nextDistance = Math.hypot(dx, dy);
      if (!gestureRef.current.pinchDistance) return;

      const rawZoom = gestureRef.current.pinchZoom * (nextDistance / gestureRef.current.pinchDistance);
      const nextZoom = clampZoom(rawZoom);
      setZoom(nextZoom);

      if (nextZoom <= 1) {
        setOffset({ x: 0, y: 0 });
      }
      return;
    }

    if (event.touches.length === 1 && gestureRef.current.isPanning && zoom > 1) {
      event.preventDefault();
      event.stopPropagation();

      const touch = event.touches[0];
      const dx = touch.clientX - gestureRef.current.lastPanX;
      const dy = touch.clientY - gestureRef.current.lastPanY;
      gestureRef.current.lastPanX = touch.clientX;
      gestureRef.current.lastPanY = touch.clientY;

      setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    }
  };

  const onTouchEnd = (event) => {
    if (!enableGestureZoom) return;
    event.stopPropagation();

    if (event.touches.length < 2) {
      gestureRef.current.pinchDistance = 0;
    }
    if (event.touches.length === 0) {
      gestureRef.current.isPanning = false;
      if (zoom <= 1) {
        setOffset({ x: 0, y: 0 });
      }
    }
  };

  const onDoubleClick = (event) => {
    if (!enableGestureZoom) return;
    event.stopPropagation();
    setZoom((prev) => {
      if (prev > 1) {
        setOffset({ x: 0, y: 0 });
        return 1;
      }
      return 2;
    });
  };

  const onClickCapture = (event) => {
    if (!enableGestureZoom) return;
    if (zoom > 1 || Date.now() < gestureRef.current.suppressClickUntil) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
      onDoubleClick={onDoubleClick}
      onClickCapture={onClickCapture}
      style={{
        display: "block",
        width: "100%",
        height: constrainToContainer ? "100%" : "auto",
        aspectRatio: resolutionWidth / resolutionHeight,
        position: "relative",
        touchAction: enableGestureZoom ? "none" : "auto",
        overflow: "hidden",
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
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoom})`,
          transformOrigin: "center center",
          transition: zoom === 1 ? "transform 120ms ease-out" : "none",
          willChange: enableGestureZoom ? "transform" : undefined,
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
