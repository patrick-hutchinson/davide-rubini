import { useRouter } from "next/navigation";

export const useAnimatedNavigation = () => {
  const router = useRouter();

  const navigate = (href) => {
    if (!href) return;
    router.push(href);
  };

  const prefetch = (href) => {
    if (!href || typeof router.prefetch !== "function") return;
    router.prefetch(href);
  };

  return { navigate, prefetch };
};
