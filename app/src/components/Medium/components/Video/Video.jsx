import { useEffect, useRef } from "react";
import styles from "../../Medium.module.css";

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

const Video = ({ medium, playerState, fit = "cover" }) => {
  if (!playerState.isInView) return null;
  const vimeoId = extractVimeoId(medium?.vimeoUrl);
  const isVimeo = Boolean(vimeoId);
  const hlsSource = `https://stream.mux.com/${medium.playbackId}.m3u8`;
  const videoRef = useRef(null);

  useEffect(() => {
    if (isVimeo) return undefined;

    const video = videoRef.current;
    if (!video) return undefined;

    let hlsInstance = null;
    let minAllowedLevelIndex = -1;
    let canceled = false;

    const tryAutoplay = () => {
      // Autoplay disabled intentionally.
      return;
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

        video.src = selectedMp4Url;
        video.load();
        tryAutoplay();
        return;
      }

      if (canPlayNativeHls) {
        video.src = hlsSource;
        video.load();
        tryAutoplay();
      } else {
        try {
          const hlsModule = await import("hls.js");
          if (canceled) return;
          const HlsCtor = hlsModule?.default;
          if (HlsCtor && HlsCtor.isSupported()) {
            const MIN_START_HEIGHT = 720;
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
                const dpr = Math.max(1, window.devicePixelRatio || 1);
                const effectiveTargetHeight = Math.round(window.innerHeight * dpr);

                // Enforce a minimum quality floor (e.g. 720p) whenever possible.
                minAllowedLevelIndex = levels.findIndex((level) => (level?.height || 0) >= MIN_START_HEIGHT);
                if (minAllowedLevelIndex < 0) minAllowedLevelIndex = 0;

                // Pick the highest level that doesn't overshoot the display need, but never below the floor.
                let preferredStartLevel = minAllowedLevelIndex;
                for (let i = levels.length - 1; i >= minAllowedLevelIndex; i -= 1) {
                  const height = levels[i]?.height || 0;
                  if (height <= effectiveTargetHeight) {
                    preferredStartLevel = i;
                    break;
                  }
                }

                const minAllowedBitrate = levels[minAllowedLevelIndex]?.bitrate;
                if (typeof minAllowedBitrate === "number" && minAllowedBitrate > 0) {
                  hlsInstance.config.minAutoBitrate = minAllowedBitrate;
                }

                hlsInstance.startLevel = preferredStartLevel;
                hlsInstance.nextAutoLevel = preferredStartLevel;
              }
              tryAutoplay();
            });

            hlsInstance.on(HlsCtor.Events.LEVEL_SWITCHING, (_event, data) => {
              if (typeof data?.level !== "number") return;
              if (minAllowedLevelIndex >= 0 && data.level < minAllowedLevelIndex) {
                hlsInstance.nextAutoLevel = minAllowedLevelIndex;
              }
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
  }, [hlsSource, isVimeo, medium?.playbackId, medium?.staticRenditions]);

  if (isVimeo) {
    const vimeoSrc = `https://player.vimeo.com/video/${vimeoId}?autoplay=0&muted=0&loop=1&title=0&byline=0&portrait=0`;
    return (
      <iframe
        src={vimeoSrc}
        title={medium?.altText || "Vimeo video"}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        style={{
          position: "relative",
          opacity: 1,
          zIndex: 0,
          width: "100%",
          height: "100%",
          border: 0,
        }}
        onLoad={() => playerState.setIsLoaded(true)}
      />
    );
  }

  return (
    <video
      className={styles.nativeVideo}
      ref={videoRef}
      src={hlsSource}
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
