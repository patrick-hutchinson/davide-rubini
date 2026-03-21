import { useContext, useEffect, useState } from "react";

import useEmblaCarousel from "embla-carousel-react";
import Medium from "@/components/Medium/Medium";

import styles from "./Carousel.module.css";

import { motion } from "framer-motion";

const Carousel = ({ array, onIndexChange }) => {
  if (!array) return;
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, dragResistance: 1, dragFree: true }, []);

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

    const onDragStart = () => setIsDragging(true);
    const onDragEnd = () => setIsDragging(false);

    emblaApi.on("pointerDown", onDragStart);
    emblaApi.on("pointerUp", onDragEnd);
    emblaApi.on("dragEnd", onDragEnd);

    return () => {
      emblaApi.off("pointerDown", onDragStart);
      emblaApi.off("pointerUp", onDragEnd);
      emblaApi.off("dragEnd", onDragEnd);
    };
  }, [emblaApi]);

  return (
    <motion.div className={`${styles.carousel_outer} embla`} ref={emblaRef}>
      <div className={`${styles.carousel_inner} embla__container`}>
        {array.map((item) => {
          return (
            <li key={item._id} className={`${styles.slide} embla__slide`}>
              <Medium medium={item.medium} />
            </li>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Carousel;
