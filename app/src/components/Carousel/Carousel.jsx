import { useEffect, useRef } from "react";

import useEmblaCarousel from "embla-carousel-react";
import Medium from "@/components/Medium/Medium";

import styles from "./Carousel.module.css";

import { motion } from "framer-motion";

const Carousel = ({ array, onIndexChange, initialOffsetPx = 0 }) => {
  if (!array) return;
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: false, dragResistance: 1, dragFree: true, skipSnaps: true, containScroll: true, duration: 0 },
    [],
  );
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
    if (!emblaApi) return;

    const root = emblaApi.rootNode?.();
    if (!root) return;

    const onWheel = (event) => {
      const hasHorizontalIntent = Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.shiftKey;
      if (!hasHorizontalIntent) return;

      const delta = event.shiftKey && Math.abs(event.deltaX) < Math.abs(event.deltaY) ? event.deltaY : event.deltaX;
      if (!delta) return;

      event.preventDefault();
      const engine = emblaApi.internalEngine();
      engine.scrollBody.useDuration(0).useBaseFriction();
      const currentTarget = engine.target.get();
      const requestedDistance = -delta;
      const clampedTarget = engine.limit.constrain(currentTarget + requestedDistance);
      const clampedDistance = clampedTarget - currentTarget;
      if (!clampedDistance) return;

      engine.scrollTo.distance(clampedDistance, false);
    };

    root.addEventListener("wheel", onWheel, { passive: false });
    return () => root.removeEventListener("wheel", onWheel);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const engine = emblaApi.internalEngine();
    engine.scrollBounds.toggleActive(false);

    const clampWithinLimits = () => {
      const clampedTarget = engine.limit.constrain(engine.target.get());
      if (clampedTarget !== engine.target.get()) {
        engine.target.set(clampedTarget);
      }

      const clampedLocation = engine.limit.constrain(engine.location.get());
      if (clampedLocation !== engine.location.get()) {
        engine.location.set(clampedLocation);
        engine.offsetLocation.set(clampedLocation);
        engine.previousLocation.set(clampedLocation);
        engine.translate.to(clampedLocation);
      }
    };

    emblaApi.on("settle", clampWithinLimits);
    clampWithinLimits();

    return () => {
      emblaApi.off("settle", clampWithinLimits);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || !initialOffsetPx || hasAppliedInitialOffset.current) return;

    const applyInitialOffset = () => {
      if (hasAppliedInitialOffset.current) return;
      emblaApi.internalEngine().scrollTo.distance(initialOffsetPx, false);
      hasAppliedInitialOffset.current = true;
    };

    requestAnimationFrame(applyInitialOffset);
  }, [emblaApi, initialOffsetPx]);

  return (
    <motion.div className={`${styles.carousel_outer} embla carousel`} ref={emblaRef}>
      <div className={`${styles.carousel_inner} embla__container`}>
        {array.map((item, index) => {
          const slideKey = item?._id || item?.medium?._id || `${item?.medium?.url || "slide"}-${index}`;
          return (
            <div key={slideKey} className={`${styles.slide} embla__slide`}>
              <Medium medium={item.medium} />
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Carousel;
