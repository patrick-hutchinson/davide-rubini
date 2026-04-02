const loadedImageUrls = new Set();

export const isImageLoaded = (src) => !!src && loadedImageUrls.has(src);

export const markImageLoaded = (src) => {
  if (!src) return;
  loadedImageUrls.add(src);
};

export const preloadImage = (src, options = {}) => {
  if (!src || typeof window === "undefined") return;

  const { cacheKey } = options;
  const key = cacheKey || src;

  if (isImageLoaded(src) || isImageLoaded(key)) return;

  const img = new window.Image();
  img.decoding = "async";
  img.onload = () => {
    markImageLoaded(src);
    markImageLoaded(key);
  };
  img.src = src;
};
