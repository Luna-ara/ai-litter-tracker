import Link from "next/link";
import { MapPin, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCents } from "@/lib/format";
import type { Hotspot } from "@/lib/types";

const severityLabels = { small: "Small", medium: "Medium", large: "Large" };

export function HotspotCard({ hotspot }: { hotspot: Hotspot }) {
  return (
    <Link
      href={`/citizen/hotspots/${hotspot.id}`}
      className="block rounded-xl transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4"
    >
      <Card className="gap-0 py-0">
        {hotspot.beforeImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hotspot.beforeImageUrl}
            alt={hotspot.title}
            width={1200}
            height={900}
            loading="lazy"
            className="aspect-[4/3] w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center bg-muted">
            <Trash2 className="size-10 text-muted-foreground" aria-hidden="true" />
            <span className="sr-only">No reference photo available</span>
          </div>
        )}
        <CardContent className="space-y-3 p-4">
          <h2 className="text-lg font-semibold leading-snug break-words">{hotspot.title}</h2>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            <span className="break-words">{hotspot.neighborhood}</span>
          </p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Badge variant="secondary">{severityLabels[hotspot.severity]}</Badge>
            <p className="ml-auto text-2xl font-bold tabular-nums text-green-700 dark:text-green-400">
              <span className="sr-only">Bounty: </span>
              {formatCents(hotspot.bountyCents)}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
