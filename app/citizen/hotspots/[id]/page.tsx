import { PagePlaceholder } from "@/components/page-placeholder";
import { requireUser } from "@/lib/auth";

// TODO(Rohan): replace this placeholder. Spec: docs/lanes/rohan-citizen.md → Task 2.
export default async function HotspotPage({ params }: PageProps<"/citizen/hotspots/[id]">) {
  await requireUser("citizen");
  const { id } = await params;
  void id;

  return <PagePlaceholder title="Hotspot" owner="Rohan" task="docs/lanes/rohan-citizen.md (Task 2)" />;
}
