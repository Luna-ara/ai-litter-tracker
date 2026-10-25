import { PagePlaceholder } from "@/components/page-placeholder";
import { requireUser } from "@/lib/auth";

// TODO(Luna): replace this placeholder. Spec: docs/lanes/luna-government.md → Task 6.
export default async function ReviewCleanupPage({ params }: PageProps<"/gov/review/[id]">) {
  await requireUser("government");
  const { id } = await params;
  void id;

  return <PagePlaceholder title="Review cleanup" owner="Luna" task="docs/lanes/luna-government.md (Task 6)" />;
}
