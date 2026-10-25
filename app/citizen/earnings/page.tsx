import { PagePlaceholder } from "@/components/page-placeholder";
import { requireUser } from "@/lib/auth";

// TODO(Rohan): replace this placeholder. Spec: docs/lanes/rohan-citizen.md → Task 7.
export default async function EarningsPage() {
  await requireUser("citizen");

  return <PagePlaceholder title="Earnings" owner="Rohan" task="docs/lanes/rohan-citizen.md (Task 7)" />;
}
