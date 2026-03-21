import MuxPlayer from "@mux/mux-player-react";

const Video = ({ medium, playerState, playerControls }) => {
  if (!playerState.isInView) return null;

  return (
    <MuxPlayer
      ref={playerControls.playerRef}
      playbackId={medium.playbackId}
      autoPlay
      playsInline
      controls={false}
      loop
      muted={playerControls.muted ?? true}
      paused={playerControls.paused ? playerControls.paused : false}
      fill
      style={{
        position: "relative",
        opacity: 1,
        zIndex: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
      onPlaying={() => playerState.setIsLoaded(true)}
      onTimeUpdate={playerControls.onTimeUpdate}
      onLoadedMetadata={playerControls.onLoadedMetadata}
    />
  );
};

export default Video;
