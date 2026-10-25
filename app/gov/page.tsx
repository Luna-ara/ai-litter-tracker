import { PagePlaceholder } from "@/components/page-placeholder";
import { requireUser } from "@/lib/auth";

// TODO(Luna): replace this placeholder. Spec: docs/lanes/luna-government.md → Task 2.
export default async function DashboardPage() {
  await requireUser("government");

  return <PagePlaceholder title="Dashboard" owner="Luna" task="docs/lanes/luna-government.md (Task 2)" />;
}
