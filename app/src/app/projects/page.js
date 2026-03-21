import ProjectsPage from "./ProjectsPage";

import { getProjects } from "@/lib/sanity/fetch";

export default async function Page() {
  const [projects] = await Promise.all([getProjects()]);

  return <ProjectsPage projects={projects} />;
}
