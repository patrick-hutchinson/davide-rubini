import { production, preview } from "./client";
import { projectsQuery, siteQuery } from "./queries";

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
