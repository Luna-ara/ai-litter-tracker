<<<<<<< HEAD
=======
import type { Metadata } from "next";
>>>>>>> origin/main
import { notFound, redirect } from "next/navigation";
import { SubmitFlow } from "@/components/citizen/submit-flow";
import { requireUser } from "@/lib/auth";
import { getHotspot } from "@/lib/citizen/queries";
<<<<<<< HEAD

export const metadata = { title: "Submit a cleanup" };

export default async function SubmitACleanupPage({ params }: PageProps<"/citizen/hotspots/[id]/submit">) {
=======

export const metadata: Metadata = { title: "Submit a cleanup" };

export default async function SubmitCleanupPage({ params }: PageProps<"/citizen/hotspots/[id]/submit">) {
>>>>>>> origin/main
  await requireUser("citizen");
  const { id } = await params;
  const hotspot = await getHotspot(id);
  if (!hotspot) notFound();
<<<<<<< HEAD
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
=======
  if (hotspot.status !== "open") redirect(`/citizen/hotspots/${id}`);

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <SubmitFlow
        hotspot={{
          id: hotspot.id,
          title: hotspot.title,
          neighborhood: hotspot.neighborhood,
          lat: hotspot.lat,
          lng: hotspot.lng,
          bountyCents: hotspot.bountyCents,
        }}
      />
    </div>
>>>>>>> origin/main
  );
}
