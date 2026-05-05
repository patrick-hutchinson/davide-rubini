const PlaceholderSolid = ({ isLoaded, delay = 0.5 }) => {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        pointerEvents: "none",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        display: "grid",
        placeItems: "center",
        backgroundColor: "#e5e5e5",
        color: "var(--foreground)",
        lineHeight: 1,
        textTransform: "lowercase",
        opacity: isLoaded ? 0 : 1,
        transition: `opacity 0s ${delay}s`,
        zIndex: 3,
      }}
    >
      loading
    </div>
  );
};

export default PlaceholderSolid;
