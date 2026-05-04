import AnimationLink from "@/components/Animation/AnimationLink";
import Medium from "@/components/Medium/Medium";
import styles from "../ProjectsPage.module.css";

const eagerPreviewCount = 8;

const GridView = ({ projects }) => {
  return (
    <section className={styles.gridViewSection}>
      <div className={styles.gridView}>
        {projects.map((project, index) => (
          <AnimationLink
            key={project._id}
            className={styles.gridCard}
            link={`/projects/${project.slug.current}`}
            preloadSrc={project.coverMedia?.medium?.url}
          >
            <strong className={styles.gridCardTitle}>{project.title}</strong>
            <Medium
              className={styles.gridCardMedia}
              medium={project.coverMedia?.medium}
              sizes="(max-width: 47.99rem) calc((100vw - 24px) / 2), calc((100vw - 40px) / 4)"
              quality={75}
              eager={index < eagerPreviewCount}
            />
          </AnimationLink>
        ))}
      </div>
    </section>
  );
};

export default GridView;
