import { PagePlaceholder } from "@/components/page-placeholder";
import { requireUser } from "@/lib/auth";

// TODO(Luna): replace this placeholder. Spec: docs/lanes/luna-government.md → Task 5.
export default async function ReviewQueuePage() {
  await requireUser("government");

  return <PagePlaceholder title="Review queue" owner="Luna" task="docs/lanes/luna-government.md (Task 5)" />;
}
