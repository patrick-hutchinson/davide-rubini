import { createClient } from "@sanity/client";

export const preview = createClient({
  projectId: "kcuxsqwd",
  dataset: "production",
  apiVersion: "2025-09-23", // today’s date or the version you want
  useCdn: false,
  fetch: {
    cache: "no-store",
  },
  token: process.env.SANITY_READ_TOKEN,
  perspective: "drafts",
});

export const production = createClient({
  projectId: "kcuxsqwd",
  dataset: "production",
  apiVersion: "2025-09-23", // today’s date or the version you want
  useCdn: true, // set to false if you want fresh data
  fetch: {
    cache: "no-store",
  },
  token: process.env.SANITY_READ_TOKEN,
  perspective: "drafts",
});
