import { useState } from "react";

import Stack from "./components/Stack";
import Overview from "./components/Overview";

import styles from "../../ProjectPage.module.css";

const ProjectGallery = ({ gallery }) => {
  const [viewMode, setViewMode] = useState("stack");

  const isStack = viewMode === "stack";
  const isOverview = viewMode === "overview";

  return (
    <div className={styles.gallery}>
      <div style={{ marginBottom: "var(--margin-page)" }}>
        <button
          onClick={() => setViewMode("stack")}
          style={{
            fontWeight: isStack && "bold",
            color: isStack ? "var(--foreground)" : "var(--link-color)",
            textDecoration: isStack ? "none" : "underline",
          }}
        >
          Stack
        </button>
        <span>&nbsp;–&nbsp;</span>
        <button
          onClick={() => setViewMode("overview")}
          style={{
            fontWeight: isOverview && "bold",
            color: isOverview ? "var(--foreground)" : "var(--link-color)",
            textDecoration: isOverview ? "none" : "underline",
          }}
        >
          Overview
        </button>
      </div>

      <div>{viewMode === "stack" ? <Stack gallery={gallery} /> : <Overview gallery={gallery} />}</div>
    </div>
  );
};

export default ProjectGallery;
