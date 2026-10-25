import { PagePlaceholder } from "@/components/page-placeholder";
import { requireUser } from "@/lib/auth";

// TODO(Rohan): replace this placeholder. Spec: docs/lanes/rohan-citizen.md → Task 1.
export default async function CleanupsNearYouPage() {
  await requireUser("citizen");

  return <PagePlaceholder title="Cleanups near you" owner="Rohan" task="docs/lanes/rohan-citizen.md (Task 1)" />;
}
