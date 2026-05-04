import Medium from "@/components/Medium/Medium";

import styles from "../../../ProjectPage.module.css";

const Overview = ({ gallery }) => {
  return (
    <div className={styles.overview}>
      {gallery.map((medium, index) => (
        <Medium medium={medium.medium} />
      ))}
    </div>
  );
};

export default Overview;
