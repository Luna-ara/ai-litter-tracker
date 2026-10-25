import { notFound, redirect } from "next/navigation";
import { SubmitFlow } from "@/components/citizen/submit-flow";
import { requireUser } from "@/lib/auth";
import { getHotspot } from "@/lib/citizen/queries";

export const metadata = { title: "Submit a cleanup" };

export default async function SubmitACleanupPage({ params }: PageProps<"/citizen/hotspots/[id]/submit">) {
  await requireUser("citizen");
  const { id } = await params;
  const hotspot = await getHotspot(id);
  if (!hotspot) notFound();
  if (hotspot.status !== "open") redirect(`/citizen/hotspots/${hotspot.id}`);

  return (
    <SubmitFlow key={hotspot.id} hotspot={{
      id: hotspot.id,
      title: hotspot.title,
      neighborhood: hotspot.neighborhood,
      lat: hotspot.lat,
      lng: hotspot.lng,
      bountyCents: hotspot.bountyCents,
    }} />
  );
}
