const Video = ({ medium, playerState }) => {
  if (!playerState.isInView) return null;
  const hlsSource = `https://stream.mux.com/${medium.playbackId}.m3u8`;

  return (
    <video
      src={hlsSource}
      autoPlay
      playsInline
      controls
      loop
      muted
      preload="metadata"
      style={{
        position: "relative",
        opacity: 1,
        zIndex: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
      onCanPlay={() => playerState.setIsLoaded(true)}
      onPlaying={() => playerState.setIsLoaded(true)}
    >
      <source src={hlsSource} type="application/x-mpegURL" />
    </video>
  );
};

export default Video;
