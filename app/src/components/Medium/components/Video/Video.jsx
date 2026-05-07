import { useEffect, useRef } from "react";
import styles from "../../Medium.module.css";

const Video = ({ medium, playerState, fit = "cover" }) => {
  if (!playerState.isInView) return null;
  const hlsSource = `https://stream.mux.com/${medium.playbackId}.m3u8`;
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    let hlsInstance = null;
    let canceled = false;

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

    const staticRenditionFiles = Array.isArray(medium?.staticRenditions)
      ? medium.staticRenditions
      : Array.isArray(medium?.staticRenditions?.files)
        ? medium.staticRenditions.files
        : [];
    const toResolutionRank = (resolution) => {
      if (typeof resolution !== "string") return 0;
      if (resolution === "highest") return 99999;
      const match = resolution.match(/(\d+)/);
      return match ? Number(match[1]) : 0;
    };
    const getCandidateHeight = (rendition) => {
      if (typeof rendition?.height === "number" && rendition.height > 0) return rendition.height;
      if (typeof rendition?.resolution_tier === "string") {
        const tierMatch = rendition.resolution_tier.match(/(\d+)/);
        if (tierMatch) return Number(tierMatch[1]);
      }
      return toResolutionRank(rendition?.resolution);
    };

    const readyMp4Renditions = staticRenditionFiles
      .filter((rendition) => {
        const status = rendition?.status;
        const ext = rendition?.ext;
        const name = rendition?.name;
        return status === "ready" && ext === "mp4" && typeof name === "string" && name.length > 0;
      })
      .sort((a, b) => getCandidateHeight(b) - getCandidateHeight(a));

    (async () => {
      console.log("[Video] Mux media payload", {
        medium,
        playbackId: medium?.playbackId,
        assetId: medium?.assetId,
        status: medium?.status,
        staticRenditions: medium?.staticRenditions,
        staticRenditionFiles,
      });

      if (readyMp4Renditions.length > 0) {
        const dpr = Math.max(1, window.devicePixelRatio || 1);
        const effectiveTargetHeight = Math.round(window.innerHeight * dpr);

        const bestFitRendition =
          readyMp4Renditions.find((rendition) => getCandidateHeight(rendition) <= effectiveTargetHeight) ||
          readyMp4Renditions[readyMp4Renditions.length - 1];

        const selectedMp4Url = `https://stream.mux.com/${medium.playbackId}/${bestFitRendition.name}`;
        const readyMp4Urls = readyMp4Renditions.map(
          (rendition) => `https://stream.mux.com/${medium.playbackId}/${rendition.name}`,
        );

        console.log("[Video] Ready Mux MP4 renditions from static_renditions", {
          playbackId: medium.playbackId,
          urls: readyMp4Urls,
          effectiveTargetHeight,
          selectedRendition: bestFitRendition,
          selectedUrl: selectedMp4Url,
        });
        video.src = selectedMp4Url;
        video.load();
        tryAutoplay();
        return;
      }

      console.log("[Video] No ready MP4 static renditions found; using HLS fallback", {
        playbackId: medium?.playbackId,
        staticRenditions: medium?.staticRenditions,
        staticRenditionFiles,
        videoElement: {
          currentSrc: video.currentSrc,
          src: video.src,
          networkState: video.networkState,
          readyState: video.readyState,
        },
      });

      if (canPlayNativeHls) {
        console.log("[Video] Falling back to native HLS");
        video.src = hlsSource;
        video.load();
        tryAutoplay();
      } else {
        console.log("[Video] Falling back to hls.js HLS");
        try {
          const hlsModule = await import("hls.js");
          if (canceled) return;
          const HlsCtor = hlsModule?.default;
          if (HlsCtor && HlsCtor.isSupported()) {
            hlsInstance = new HlsCtor({
              // Bias startup toward sharper renditions, while still allowing ABR to adapt.
              abrEwmaDefaultEstimate: 8_000_000,
              abrBandWidthFactor: 1.0,
              abrBandWidthUpFactor: 0.9,
              capLevelToPlayerSize: true,
            });
            hlsInstance.loadSource(hlsSource);
            hlsInstance.attachMedia(video);
            hlsInstance.on(HlsCtor.Events.MANIFEST_PARSED, () => {
              const levels = Array.isArray(hlsInstance.levels) ? hlsInstance.levels : [];
              if (levels.length > 0) {
                // Start near the top (second-highest when available) to avoid low-res flashes.
                const preferredStartLevel = Math.max(0, levels.length - 2);
                hlsInstance.nextAutoLevel = preferredStartLevel;
              }
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
      }
    })();

    return () => {
      canceled = true;
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    };
  }, [hlsSource]);

  return (
    <video
      className={styles.nativeVideo}
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
