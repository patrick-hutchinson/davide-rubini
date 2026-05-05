import Medium from "@/components/Medium/Medium";

import styles from "../../../ProjectPage.module.css";

const Stack = ({ gallery, onOpenFullscreen }) => {
  return (
    <div className={styles.stack}>
      {gallery.map((medium, index) => (
        <div
          key={medium?.medium?._id || `stack-${index}`}
          className={styles.stackItem}
          role="button"
          tabIndex={0}
          onClick={() => onOpenFullscreen(index)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onOpenFullscreen(index);
            }
          }}
        >
          <Medium medium={medium.medium} />
        </div>
      ))}
    </div>
  );
};

export default Stack;
