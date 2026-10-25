import { PagePlaceholder } from "@/components/page-placeholder";
import { requireUser } from "@/lib/auth";

// TODO(Luna): replace this placeholder. Spec: docs/lanes/luna-government.md → Task 4.
export default async function HotspotPage({ params }: PageProps<"/gov/hotspots/[id]">) {
  await requireUser("government");
  const { id } = await params;
  void id;

  return <PagePlaceholder title="Hotspot" owner="Luna" task="docs/lanes/luna-government.md (Task 4)" />;
}
