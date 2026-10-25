import { PagePlaceholder } from "@/components/page-placeholder";
import { requireUser } from "@/lib/auth";

// TODO(Luna): replace this placeholder. Spec: docs/lanes/luna-government.md → Task 3.
export default async function NewHotspotPage() {
  await requireUser("government");

  return <PagePlaceholder title="New hotspot" owner="Luna" task="docs/lanes/luna-government.md (Task 3)" />;
}
