// utils/useAnimatedNavigation.js
import { useTransitionRouter } from "next-view-transitions";

export const useAnimatedNavigation = () => {
  const router = useTransitionRouter();

  const navigate = (href) => {
    if (!href) return;
    if (typeof window !== "undefined") window.__appTransitionPending = true;

    const pageAnimation = () => {
      const oldAnimation = document.documentElement.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 1000,
        easing: "ease",
        fill: "forwards",
        pseudoElement: "::view-transition-old(root)",
      });

      const newAnimation = document.documentElement.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 1000,
        easing: "ease",
        fill: "forwards",
        pseudoElement: "::view-transition-new(root)",
      });

      Promise.allSettled([oldAnimation.finished, newAnimation.finished]).then(() => {
        if (typeof window === "undefined") return;
        window.__appTransitionPending = false;
        window.dispatchEvent(new CustomEvent("app:view-transition-finished"));
      });
    };

    router.push(href, { onTransitionReady: pageAnimation });
  };

  const prefetch = (href) => {
    if (!href || typeof router.prefetch !== "function") return;
    router.prefetch(href);
  };

  return { navigate, prefetch };
};
