import { useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

import { useVideoPlayer } from "@/components/Medium/hooks/useVideoPlayer";

import VideoControls from "./VideoControls";

import Video from "./Video";
import Placeholder from "../Placeholder";
import PlaceholderSolid from "../PlaceholderSolid";

import styles from "../../Medium.module.css";

const VideoFrame = ({ medium, className }) => {
  const videoRef = useRef(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [resolvedPlaceholderType, setResolvedPlaceholderType] = useState("low_res_image");
  const [cropped, setCropped] = useState(false);

  const isInView = useInView(videoRef, { once: true, margin: "0px 0px -100px 0px" });

  // Calculate the media's width upon loading

  const [aspectWidth, aspectHeight] = medium.aspect_ratio.split(":");
  const aspectRatio = aspectWidth / aspectHeight;

  const playerState = { isLoaded, setIsLoaded, isInView };
  const playerControls = useVideoPlayer();

  useEffect(() => {
    if (typeof document === "undefined") return;
    const nextType = document.body?.dataset?.placeholderType;
    setResolvedPlaceholderType(nextType === "solid_color" ? "solid_color" : "low_res_image");
  }, []);

  const PlaceholderComponent = resolvedPlaceholderType === "solid_color" ? PlaceholderSolid : Placeholder;

  return (
    <div className={`${styles.mediaContainer} ${className}`}>
      <div ref={videoRef} className={styles.videoPlayer} style={{ aspectRatio: aspectRatio }}>
        <PlaceholderComponent medium={medium} aspectRatio={aspectRatio} isLoaded={isLoaded} />
        <Video medium={medium} playerState={playerState} playerControls={playerControls} />

        <VideoControls className={styles.videoControls} playerState={playerState} playerControls={playerControls} />
      </div>
    </div>
  );
};

export default VideoFrame;
