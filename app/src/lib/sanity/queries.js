import { mediaAssetFragment } from "./fragments";

export const siteQuery = `*[_type=="site"][0]{
  title,
  owner,
  linkColors{
    linkColorLight,
    linkColorDark
  },
  themeColorsLight{
    fontColorLight,
    backgroundColorLight
  },
  themeColorsDark{
    fontColorDark,
    backgroundColorDark
  },
  placeholderType,
  defaultTheme,
  favicon{
    asset->{
      url
    }
  },
  description,
  address,
  email,
  phone,
  socials[]{
    platform,
    link
  },
}`;

export const projectsQuery = `*[_type=="project"] | order(orderRank asc, _createdAt desc){
  _id,
  title,
  client,
  categories[]->{
    _id,
    name,
  },
  year,
  description,
  credits[]{
    role,
    entries
  },
  coverMedia[0] ${mediaAssetFragment},
  gallery[] ${mediaAssetFragment},
  slug
}`;

export const archiveQuery = `*[_type=="archive"][0]{
  gallery[] ${mediaAssetFragment},
}`;

export const aboutQuery = `*[_type=="about"][0]{
  description,
  selectedClients,
  contact[]{
    platform,
    link
  },
}`;
