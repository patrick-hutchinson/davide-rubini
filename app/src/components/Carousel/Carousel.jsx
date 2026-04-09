import { useEffect, useRef } from "react";

import useEmblaCarousel from "embla-carousel-react";
import Medium from "@/components/Medium/Medium";

import styles from "./Carousel.module.css";

import { motion } from "framer-motion";

const Carousel = ({ array, onIndexChange, initialOffsetPx = 0, autoScrollPxPerSecond = 0, stopAutoScrollOnFirstInteraction = false }) => {
  if (!array) return;
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: false, dragResistance: 1, dragFree: true, skipSnaps: true, containScroll: true, duration: 0 },
    [],
  );
  const hasAppliedInitialOffset = useRef(false);
  const autoScrollStoppedRef = useRef(false);
  const autoScrollRafRef = useRef(null);

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

  useEffect(() => {
    if (!emblaApi || !stopAutoScrollOnFirstInteraction || autoScrollPxPerSecond <= 0) return;

    const stopAutoScroll = () => {
      autoScrollStoppedRef.current = true;
      if (autoScrollRafRef.current) {
        window.cancelAnimationFrame(autoScrollRafRef.current);
        autoScrollRafRef.current = null;
      }
    };

    const interactionEvents = ["pointerdown", "touchstart", "wheel", "keydown"];
    interactionEvents.forEach((eventName) => {
      window.addEventListener(eventName, stopAutoScroll, { passive: true, once: true });
    });

    emblaApi.on("pointerDown", stopAutoScroll);

    return () => {
      interactionEvents.forEach((eventName) => {
        window.removeEventListener(eventName, stopAutoScroll);
      });
      emblaApi.off("pointerDown", stopAutoScroll);
    };
  }, [emblaApi, autoScrollPxPerSecond, stopAutoScrollOnFirstInteraction]);

  useEffect(() => {
    if (!emblaApi || autoScrollPxPerSecond <= 0 || array.length <= 1) return undefined;

    autoScrollStoppedRef.current = false;
    let previousTimestamp;

    const tick = (timestamp) => {
      if (autoScrollStoppedRef.current) return;

      if (typeof previousTimestamp !== "number") {
        previousTimestamp = timestamp;
        autoScrollRafRef.current = window.requestAnimationFrame(tick);
        return;
      }

      const deltaSeconds = Math.max(0, (timestamp - previousTimestamp) / 1000);
      previousTimestamp = timestamp;

      const requestedDistance = -(autoScrollPxPerSecond * deltaSeconds);
      const engine = emblaApi.internalEngine();
      engine.scrollBody.useDuration(0).useBaseFriction();
      const currentTarget = engine.target.get();
      const clampedTarget = engine.limit.constrain(currentTarget + requestedDistance);
      const clampedDistance = clampedTarget - currentTarget;

      if (!clampedDistance) {
        autoScrollStoppedRef.current = true;
        return;
      }

      engine.scrollTo.distance(clampedDistance, false);
      autoScrollRafRef.current = window.requestAnimationFrame(tick);
    };

    autoScrollRafRef.current = window.requestAnimationFrame(tick);

    return () => {
      autoScrollStoppedRef.current = true;
      previousTimestamp = undefined;
      if (autoScrollRafRef.current) {
        window.cancelAnimationFrame(autoScrollRafRef.current);
        autoScrollRafRef.current = null;
      }
    };
  }, [emblaApi, autoScrollPxPerSecond, array.length]);

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
