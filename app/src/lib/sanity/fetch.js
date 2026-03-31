import { production, preview } from "./client";
import { projectsQuery, siteQuery, archiveQuery, aboutQuery } from "./queries";

const isProduction = process.env.VERCEL_ENV === "production";
const isPreview = process.env.VERCEL_ENV === "preview";
const isLocal = !process.env.VERCEL_ENV;
const hasReadToken = Boolean(process.env.SANITY_READ_TOKEN);

export const getSanityClient = () => {
  if (isProduction) return production;
  if ((isPreview || isLocal) && hasReadToken) return preview;

  // Safe fallback: run without drafts when no token is available (common on Vercel preview envs).
  return production;
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
