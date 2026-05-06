import Medium from "@/components/Medium/Medium";

import styles from "../../../ProjectPage.module.css";

const Stack = ({ gallery, onOpenFullscreen }) => {
  return (
    <div className={styles.stack}>
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
          key={medium?.medium?._id || `stack-${index}`}
          className={`${styles.stackItem} ${isImage ? styles.stackItemClickable : ""}`}
          {...interactiveProps}
        >
          <Medium medium={medium.medium} />
        </div>
        );
      })}
    </div>
  );
};

export default Stack;
