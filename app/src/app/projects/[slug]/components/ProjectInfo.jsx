import { motion, AnimatePresence } from "framer-motion";

import Medium from "@/components/Medium/Medium";
import Text from "@/components/Text/Text";

import styles from "../../ProjectsPage.module.css";

const ProjectInfo = ({ project }) => {
  const credits = Array.isArray(project?.credits) ? project.credits : [];

  return (
    <motion.div
      className={styles.projectInfoOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className={styles.projectInfoInner}>
        <div className={styles.projectInfoCover}>
          <Medium medium={project?.coverMedia?.medium} />
        </div>

        <div className={styles.projectInfoText}>
          <Text text={project.description} className={styles.description} />

          {credits.length > 0 && <h3>Credits</h3>}

          {credits.map((credit, index) => (
            <li key={`credit-${index}`} className={styles.creditRow}>
              {credit?.role}:&nbsp;
              {Array.isArray(credit?.entries) &&
                credit.entries.map((entry, entryIndex) => (
                  <span key={`credit-${index}-entry-${entryIndex}`}>
                    {entry}
                    {entryIndex < credit.entries.length - 1 && ", "}
                  </span>
                ))}
            </li>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectInfo;
