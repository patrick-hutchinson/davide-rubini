import { getProjects } from "@/lib/sanity/fetch";
import { notFound } from "next/navigation";

import ProjectPage from "./ProjectPage";

export default async function Page({ params }) {
  const { slug } = await params;

  const projects = await getProjects();
  const project = projects.find((p) => p.slug.current === slug);
  if (!project) notFound();

  return <ProjectPage projects={projects} project={project} />;
}
