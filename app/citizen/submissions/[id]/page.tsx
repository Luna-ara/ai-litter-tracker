import { PagePlaceholder } from "@/components/page-placeholder";
import { requireUser } from "@/lib/auth";

// TODO(Rohan): replace this placeholder. Spec: docs/lanes/rohan-citizen.md → Task 6.
export default async function YourCleanupPage({ params }: PageProps<"/citizen/submissions/[id]">) {
  await requireUser("citizen");
  const { id } = await params;
  void id;

  return <PagePlaceholder title="Your cleanup" owner="Rohan" task="docs/lanes/rohan-citizen.md (Task 6)" />;
}
