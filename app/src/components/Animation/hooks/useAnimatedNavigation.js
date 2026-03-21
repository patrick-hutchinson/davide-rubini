// utils/useAnimatedNavigation.js
import { useTransitionRouter } from "next-view-transitions";

export const useAnimatedNavigation = () => {
  const router = useTransitionRouter();

  const navigate = (href) => {
    if (!href) return;

    const pageAnimation = () => {
      document.documentElement.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 1000,
        easing: "ease",
        fill: "forwards",
        pseudoElement: "::view-transition-old(root)",
      });

      document.documentElement.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 1000,
        easing: "ease",
        fill: "forwards",
        pseudoElement: "::view-transition-new(root)",
      });
    };

    router.push(href, { onTransitionReady: pageAnimation });
  };

  return navigate;
};
