import AnimationLink from "@/components/Animation/AnimationLink";
import styles from "../../../ProjectsPage.module.css";

const ListItem = ({ project, index, canHover, onMouseEnterProject, onMouseLeaveProject }) => {
  return (
    <tr
      className={styles.listRow}
      onMouseEnter={canHover ? () => onMouseEnterProject(project) : undefined}
      onMouseLeave={canHover ? () => onMouseLeaveProject() : undefined}
    >
      <td className={styles.listIndex}>{index + 1}</td>
      <td className={styles.listTitle}>
        <AnimationLink link={`/projects/${project.slug.current}`} preloadSrc={project.coverMedia?.medium?.url}>
          {project.title}
        </AnimationLink>
      </td>
      <td className={styles.listYear}>{project.year}</td>
      <td className={styles.listClient}>{project.client}</td>
    </tr>
  );
};

export default ListItem;
