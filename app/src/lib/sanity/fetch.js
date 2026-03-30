import { production, preview } from "./client";
import { projectsQuery, siteQuery, archiveQuery, aboutQuery } from "./queries";

const isProduction = process.env.VERCEL_ENV === "production";
const isPreview = process.env.VERCEL_ENV === "preview";
const isLocal = !process.env.VERCEL_ENV;

export const getSanityClient = () => {
  if (isProduction) return production;
  if (isPreview || isLocal) return preview;

  return preview;
};

const client = getSanityClient();

export async function getSite() {
  return client.fetch(siteQuery);
}

export async function getProjects() {
  return client.fetch(projectsQuery);
}

export async function getArchive() {
  return client.fetch(archiveQuery);
}

export async function getAbout() {
  return client.fetch(aboutQuery);
}
