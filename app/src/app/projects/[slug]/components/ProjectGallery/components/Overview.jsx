import Medium from "@/components/Medium/Medium";

import styles from "../../../ProjectPage.module.css";

const eagerPreviewCount = 8;

const Overview = ({ gallery, onOpenFullscreen }) => {
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
          {...interactiveProps}
        >
          <Medium
            className={styles.overviewMedia}
            medium={medium.medium}
            sizes="(max-width: 47.99rem) calc((100vw - 24px) / 2), calc((100vw - 56px) / 6)"
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
