import { ChevronLeft, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HotspotImage } from "@/components/citizen/hotspot-image";
import { SeverityBadge } from "@/components/citizen/severity-badge";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { getHotspot } from "@/lib/citizen/queries";
import { formatCents } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/citizen/hotspots/[id]">): Promise<Metadata> {
  const { id } = await params;
  const hotspot = await getHotspot(id);
  return { title: hotspot?.title ?? "Hotspot" };
}

export default async function HotspotPage({ params }: PageProps<"/citizen/hotspots/[id]">) {
  await requireUser("citizen");
  const { id } = await params;
  const hotspot = await getHotspot(id);
  if (!hotspot) notFound();
  const open = hotspot.status === "open";

  return (
    <div className="mx-auto max-w-md space-y-5 px-4 py-6">
      <Link href="/citizen" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> All cleanups
      </Link>
      <HotspotImage src={hotspot.beforeImageUrl} alt={hotspot.title} className="aspect-[4/3] w-full rounded-xl" />
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{hotspot.title}</h1>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-4" /> {hotspot.neighborhood}
        </p>
        <div className="flex gap-2">
          <SeverityBadge severity={hotspot.severity} />
          <StatusBadge status={hotspot.status} />
        </div>
        {hotspot.description && <p className="pt-1 text-sm">{hotspot.description}</p>}
      </div>
      <dl className="divide-y rounded-xl border">
        <div className="flex items-center justify-between p-4">
          <dt className="text-sm text-muted-foreground">Bounty</dt>
          <dd className="text-2xl font-semibold text-primary">{formatCents(hotspot.bountyCents)}</dd>
        </div>
        <div className="flex items-center justify-between p-4">
          <dt className="text-sm text-muted-foreground">Location</dt>
          <dd className="font-mono text-sm">
            {hotspot.lat.toFixed(5)}, {hotspot.lng.toFixed(5)}
          </dd>
        </div>
      </dl>
      <div className="space-y-2">
        {open ? (
          <Button size="lg" className="h-12 w-full text-base" asChild>
            <Link href={`/citizen/hotspots/${hotspot.id}/submit`}>Start cleanup</Link>
          </Button>
        ) : (
          <Button size="lg" className="h-12 w-full text-base" disabled>
            Already claimed
          </Button>
        )}
        <p className="text-center text-sm text-muted-foreground">
          {open
            ? "You'll check in at the location and take a before and after photo."
            : "Someone is already cleaning this one up."}
        </p>
      </div>
    </div>
  );
}
