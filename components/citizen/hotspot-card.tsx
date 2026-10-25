import { MapPin } from "lucide-react";
import Link from "next/link";
import { HotspotImage } from "@/components/citizen/hotspot-image";
import { SeverityBadge } from "@/components/citizen/severity-badge";
import { formatCents } from "@/lib/format";
import type { Hotspot } from "@/lib/types";

export function HotspotCard({ hotspot }: { hotspot: Hotspot }) {
  return (
    <Link
      href={`/citizen/hotspots/${hotspot.id}`}
      className="block overflow-hidden rounded-xl border bg-card transition hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <HotspotImage src={hotspot.beforeImageUrl} alt={hotspot.title} className="aspect-[4/3] w-full" />
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0 space-y-1.5">
          <h2 className="font-semibold leading-snug">{hotspot.title}</h2>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" /> {hotspot.neighborhood}
          </p>
          <SeverityBadge severity={hotspot.severity} />
        </div>
        <p className="shrink-0 text-2xl font-semibold text-primary">{formatCents(hotspot.bountyCents)}</p>
      </div>
    </Link>
  );
}
