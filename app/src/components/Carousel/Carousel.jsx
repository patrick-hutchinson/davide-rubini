import { useEffect, useRef } from "react";

import useEmblaCarousel from "embla-carousel-react";
import Medium from "@/components/Medium/Medium";

import styles from "./Carousel.module.css";

import { motion } from "framer-motion";

const Carousel = ({ array, onIndexChange, initialOffsetPx = 0, deferInitialOffsetUntilTransitionEnd = false }) => {
  if (!array) return;
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, dragResistance: 1, dragFree: true }, []);
  const hasAppliedInitialOffset = useRef(false);

  // Triple the date in case it is not long enough to fill the width of the screen

  useEffect(() => {
    if (!emblaApi) return;

    const updateIndex = () => {
      const index = emblaApi.selectedScrollSnap();
      onIndexChange?.(index % array.length); // normalize for tripled array
    };

    updateIndex();
    emblaApi.on("select", updateIndex);
    emblaApi.on("scroll", updateIndex);

    return () => {
      emblaApi.off("select", updateIndex);
      emblaApi.off("scroll", updateIndex);
    };
  }, [emblaApi, array.length, onIndexChange]);

  useEffect(() => {
    if (!emblaApi) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        emblaApi.scrollNext();
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        emblaApi.scrollPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || !initialOffsetPx || hasAppliedInitialOffset.current) return;

    const applyInitialOffset = () => {
      if (hasAppliedInitialOffset.current) return;
      emblaApi.internalEngine().scrollTo.distance(initialOffsetPx, false);
      hasAppliedInitialOffset.current = true;
    };

    if (deferInitialOffsetUntilTransitionEnd && typeof window !== "undefined" && window.__appTransitionPending) {
      const onTransitionFinished = () => requestAnimationFrame(applyInitialOffset);
      window.addEventListener("app:view-transition-finished", onTransitionFinished, { once: true });
      return () => window.removeEventListener("app:view-transition-finished", onTransitionFinished);
    }

    requestAnimationFrame(applyInitialOffset);
  }, [emblaApi, initialOffsetPx, deferInitialOffsetUntilTransitionEnd]);

  return (
    <motion.div className={`${styles.carousel_outer} embla carousel`} ref={emblaRef}>
      <div className={`${styles.carousel_inner} embla__container`}>
        {array.map((item) => {
          return (
            <div key={item._id} className={`${styles.slide} embla__slide`}>
              <Medium medium={item.medium} />
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Carousel;
