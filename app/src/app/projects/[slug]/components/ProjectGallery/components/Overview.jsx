import Medium from "@/components/Medium/Medium";

import styles from "../../../ProjectPage.module.css";

const eagerPreviewCount = 8;

const Overview = ({ gallery, onOpenFullscreen, registerItemRef }) => {
  return (
    <div className={styles.overview}>
      {gallery.map((medium, index) => {
        const isImage = medium?.medium?.type === "image";
        const interactiveProps = isImage
          ? {
              role: "button",
              tabIndex: 0,
              onClick: () => onOpenFullscreen(medium),
              onKeyDown: (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onOpenFullscreen(medium);
                }
              },
            }
          : {};

        return (
          <div
            key={medium?.medium?._id || `overview-${index}`}
            className={`${styles.overviewItem} ${isImage ? styles.overviewItemClickable : ""}`}
            ref={(node) => registerItemRef?.(medium?.medium?._id, node)}
            {...interactiveProps}
          >
            <Medium
              className={styles.overviewMedia}
              medium={medium.medium}
              sizes="(max-width: 59.99rem) calc((100vw - 24px) / 2), (min-width: 60rem) and (min-aspect-ratio: 16/10) calc((100vw - 56px) / 6), (min-width: 60rem) and (min-aspect-ratio: 3/2) calc((100vw - 48px) / 5), (min-width: 60rem) and (max-aspect-ratio: 4/3) calc((100vw - 32px) / 3), calc((100vw - 40px) / 4)"
              quality={75}
              eager={index < eagerPreviewCount}
            />
          </div>
        );
      })}
    </div>
  );
};

export default Overview;
