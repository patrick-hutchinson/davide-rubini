import { mediaAssetFragment } from "./fragments";

export const siteQuery = `*[_type=="site"][0]{
  title,
  owner,
  site,
  description,
  address,
  email,
  phone,
  socials[]{
    platform,
    link
  },
}`;

export const projectsQuery = `*[_type=="project"]{
  _id,
  title,
  client,
  year,
  description,
  coverMedia[0] ${mediaAssetFragment},
  gallery[] ${mediaAssetFragment},
  slug
}`;
