import HomePage from "./HomePage";

import { getProjects } from "@/lib/sanity/fetch";

export default async function Page() {
  const [projects] = await Promise.all([getProjects()]);

  return <HomePage projects={projects} />;
}
