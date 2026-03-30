const loadedImageUrls = new Set();

export const isImageLoaded = (src) => !!src && loadedImageUrls.has(src);

export const markImageLoaded = (src) => {
  if (!src) return;
  loadedImageUrls.add(src);
};

export const preloadImage = (src) => {
  if (!src || isImageLoaded(src) || typeof window === "undefined") return;

  const img = new window.Image();
  img.onload = () => markImageLoaded(src);
  img.src = src;
};
