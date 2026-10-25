import { PagePlaceholder } from "@/components/page-placeholder";
import { requireUser } from "@/lib/auth";

// TODO(Rohan): replace this placeholder. Spec: docs/lanes/rohan-citizen.md → Task 5.
export default async function SubmitACleanupPage({ params }: PageProps<"/citizen/hotspots/[id]/submit">) {
  await requireUser("citizen");
  const { id } = await params;
  void id;

  return <PagePlaceholder title="Submit a cleanup" owner="Rohan" task="docs/lanes/rohan-citizen.md (Task 5)" />;
}
