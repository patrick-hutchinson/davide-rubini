import { useAnimatedNavigation } from "./hooks/useAnimatedNavigation";
import { preloadImage } from "@/lib/preloadImage";

const AnimationLink = ({ link, children, className, preloadSrc }) => {
  const { navigate, prefetch } = useAnimatedNavigation();

  const resolveInternalHref = (internalLink) => {
    if (!internalLink) return null;

    const rawSlug = internalLink?.slug?.current ?? internalLink?.slug;

    if (!rawSlug) return null;

    const slug = String(rawSlug).replace(/^\/+/, "");
    if (!slug) return null;

    if (internalLink?._type === "film") return `/films/${slug}`;
    return `/${slug}`;
  };

  const href =
    typeof link === "string"
      ? link
      : link?.href
        ? link.href
        : link?.type === "internal"
          ? resolveInternalHref(link.internalLink)
          : link?.type === "external"
            ? link.url
            : link?.type === "email"
              ? `mailto:${link.email}`
              : "#";

  if (!href || href === "#") return <>{children}</>;

  const isExternal = link?.type === "external" || /^https?:\/\//.test(href);
  const isEmail = link?.type === "email" || href.startsWith("mailto:");

  const handleClick = (e) => {
    // Preserve native behavior for external/email links and modified clicks.
    if (isExternal || isEmail || e.button !== 0 || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;

    e.preventDefault();
    navigate(href);
  };

  const handleIntent = () => {
    if (isExternal || isEmail) return;
    prefetch(href);
    preloadImage(preloadSrc);
  };

  return (
    <a
      href={href}
      className={className}
      onClick={handleClick}
      onMouseEnter={handleIntent}
      onFocus={handleIntent}
      onTouchStart={handleIntent}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  );
};

export default AnimationLink;
