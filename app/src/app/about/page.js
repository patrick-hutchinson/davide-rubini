import AboutPage from "./AboutPage";

import { getAbout } from "@/lib/sanity/fetch";

export default async function Page() {
  const [about] = await Promise.all([getAbout()]);

  return <AboutPage about={about} />;
}
