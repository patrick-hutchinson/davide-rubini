import ArchivePage from "./ArchivePage";

import { getArchive } from "@/lib/sanity/fetch";

export default async function Page() {
  const [archive] = await Promise.all([getArchive()]);

  return <ArchivePage archive={archive} />;
}
