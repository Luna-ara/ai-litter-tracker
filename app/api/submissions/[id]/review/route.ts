import { error } from "@/lib/http";

// TODO(Luna): implement. Spec: docs/CONTRACTS.md §6 and docs/lanes/luna-government.md → Task 6.
export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  void id;
  return error(501, "Not implemented yet");
}
