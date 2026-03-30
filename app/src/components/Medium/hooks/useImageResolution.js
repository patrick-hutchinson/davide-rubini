export const getImageResolutionUrl = (medium, options = {}) => {
  if (!medium?.url) return "";

  const { width, quality = 75 } = options;
  const maxSourceWidth = Number(medium.width) || width;
  const targetWidth = Math.max(1, Math.round(Math.min(width || maxSourceWidth || 1, maxSourceWidth || width || 1)));

  const separator = medium.url.includes("?") ? "&" : "?";
  return `${medium.url}${separator}w=${targetWidth}&q=${quality}&auto=format`;
};
