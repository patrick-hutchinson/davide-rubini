const Placeholder = ({ medium, isLoaded, delay = 0.5, fit = "cover", position = "center" }) => {
  let src;
  const extractVimeoId = (vimeoUrl) => {
    if (!vimeoUrl || typeof vimeoUrl !== "string") return null;

    try {
      const parsed = new URL(vimeoUrl);
      const pathSegments = parsed.pathname.split("/").filter(Boolean);
      for (let i = pathSegments.length - 1; i >= 0; i -= 1) {
        if (/^\d+$/.test(pathSegments[i])) return pathSegments[i];
      }
    } catch {
      // Fallback to regex parsing below.
    }

    const regexMatch = vimeoUrl.match(/(?:vimeo\.com\/(?:.*\/)?|player\.vimeo\.com\/video\/)(\d+)/);
    return regexMatch?.[1] || null;
  };

  medium.type === "image"
    ? (src = `${medium.url}?w=20&auto=format`)
    : medium.vimeoUrl
      ? (src = (() => {
          const vimeoId = extractVimeoId(medium.vimeoUrl);
          return vimeoId ? `https://vumbnail.com/${vimeoId}.jpg` : "";
        })())
      : (src = `https://image.mux.com/${medium.playbackId}/thumbnail.jpg?width=50`);

  if (!src) return null;

  return (
    <img
      src={src}
      loading="eager"
      fetchPriority="high"
      decoding="async"
      alt="placeholder image"
      style={{
        position: "absolute",
        pointerEvents: "none",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        objectFit: fit,
        objectPosition: position,
        // filter: "blur(20px) brightness(1.3)",
        // transform: "scale(1.5)",
        opacity: isLoaded ? 0 : 1,
        transition: `opacity 0s ${delay}s`,
        zIndex: 3,
      }}
    />
  );
};

export default Placeholder;
