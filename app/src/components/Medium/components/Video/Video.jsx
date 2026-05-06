import { useEffect, useRef } from "react";

const Video = ({ medium, playerState, fit = "cover" }) => {
  if (!playerState.isInView) return null;
  const hlsSource = `https://stream.mux.com/${medium.playbackId}.m3u8`;
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    let hlsInstance = null;

    const tryAutoplay = () => {
      video.muted = true;
      const maybePlayPromise = video.play();
      if (maybePlayPromise && typeof maybePlayPromise.catch === "function") {
        maybePlayPromise.catch(() => {
          // Browser blocked autoplay; user interaction will start playback.
        });
      }
    };

    const canPlayNativeHls =
      video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL");

    if (canPlayNativeHls) {
      video.src = hlsSource;
      video.load();
      tryAutoplay();
    } else {
      (async () => {
        try {
          const hlsModule = await import("hls.js");
          const HlsCtor = hlsModule?.default;
          if (HlsCtor && HlsCtor.isSupported()) {
            hlsInstance = new HlsCtor();
            hlsInstance.loadSource(hlsSource);
            hlsInstance.attachMedia(video);
            hlsInstance.on(HlsCtor.Events.MANIFEST_PARSED, () => {
              tryAutoplay();
            });
            return;
          }
        } catch {
          // Fall through to direct src assignment below.
        }

        video.src = hlsSource;
        video.load();
        tryAutoplay();
      })();
    }

    return () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    };
  }, [hlsSource]);

  return (
    <video
      ref={videoRef}
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
        objectFit: fit,
      }}
      onCanPlay={() => playerState.setIsLoaded(true)}
      onPlaying={() => playerState.setIsLoaded(true)}
    >
      <source src={hlsSource} type="application/x-mpegURL" />
    </video>
  );
};

export default Video;
