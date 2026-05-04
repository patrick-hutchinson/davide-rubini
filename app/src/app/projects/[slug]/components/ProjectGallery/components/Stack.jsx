import Medium from "@/components/Medium/Medium";

import styles from "../../../ProjectPage.module.css";

const Stack = ({ gallery }) => {
  return (
    <div className={styles.stack}>
      {gallery.map((medium, index) => (
        <Medium medium={medium.medium} />
      ))}
    </div>
  );
};

export default Stack;
