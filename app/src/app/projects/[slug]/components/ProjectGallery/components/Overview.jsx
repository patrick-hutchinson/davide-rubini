import Medium from "@/components/Medium/Medium";

import styles from "../../../ProjectPage.module.css";

const eagerPreviewCount = 8;

const Overview = ({ gallery }) => {
  return (
    <div className={styles.overview}>
      {gallery.map((medium, index) => (
        <div key={medium?.medium?._id || `overview-${index}`} className={styles.overviewItem}>
          <Medium
            className={styles.overviewMedia}
            medium={medium.medium}
            sizes="(max-width: 47.99rem) calc((100vw - 24px) / 2), calc((100vw - 40px) / 4)"
            quality={75}
            eager={index < eagerPreviewCount}
          />
        </div>
      ))}
    </div>
  );
};

export default Overview;
