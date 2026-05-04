const Placeholder = ({ medium, isLoaded, delay = 0.5, fit = "cover", position = "center" }) => {
  let src;

  medium.type === "image"
    ? (src = `${medium.url}?w=20&auto=format`)
    : (src = `https://image.mux.com/${medium.playbackId}/thumbnail.jpg?width=50`);

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
