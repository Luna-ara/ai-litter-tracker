import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { getHotspot } from "@/lib/citizen/queries";
import { formatCents } from "@/lib/format";

const severityLabels = { small: "Small", medium: "Medium", large: "Large" };

export async function generateMetadata({ params }: PageProps<"/citizen/hotspots/[id]">): Promise<Metadata> {
  await requireUser("citizen");
  const { id } = await params;
  const hotspot = await getHotspot(id);
  if (!hotspot) notFound();
  return { title: hotspot.title };
}

export default async function HotspotPage({ params }: PageProps<"/citizen/hotspots/[id]">) {
  await requireUser("citizen");
  const { id } = await params;
  const hotspot = await getHotspot(id);
  if (!hotspot) notFound();

  return (
    <main className="mx-auto max-w-md space-y-6 px-4 py-6">
      <Link href="/citizen" className="inline-flex min-h-10 items-center gap-2 rounded text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <ArrowLeft className="size-4" aria-hidden="true" />
        All cleanups
      </Link>

      {hotspot.beforeImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={hotspot.beforeImageUrl} alt={hotspot.title} width={1200} height={900} className="aspect-[4/3] w-full rounded-xl object-cover" />
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-muted">
          <Trash2 className="size-10 text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">No reference photo available</span>
        </div>
      )}

      <header className="space-y-3">
        <h1 className="text-2xl font-bold tracking-tight break-words">{hotspot.title}</h1>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-4 shrink-0" aria-hidden="true" />
          {hotspot.neighborhood}
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{severityLabels[hotspot.severity]}</Badge>
          <StatusBadge status={hotspot.status} />
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-line break-words text-muted-foreground">
          {hotspot.description || "Help your neighborhood by cleaning up litter at this location."}
        </p>
      </header>

      <Card>
        <CardContent>
          <dl className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <dt className="font-medium">Bounty</dt>
              <dd className="text-3xl font-bold tabular-nums text-green-700 dark:text-green-400">{formatCents(hotspot.bountyCents)}</dd>
            </div>
            <div className="space-y-1 border-t pt-4">
              <dt className="font-medium">Location</dt>
              <dd className="text-sm tabular-nums text-muted-foreground">{hotspot.lat.toFixed(5)}, {hotspot.lng.toFixed(5)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <section className="space-y-2" aria-label="Start a cleanup">
        {hotspot.status === "open" ? (
          <>
            <Button asChild className="min-h-11 w-full">
              <Link href={`/citizen/hotspots/${hotspot.id}/submit`}>Start cleanup</Link>
            </Button>
            <p className="text-center text-sm text-muted-foreground">You&apos;ll check in at the location and take a before and after photo.</p>
          </>
        ) : (
          <>
            <Button disabled className="min-h-11 w-full">Already claimed</Button>
            <p className="text-center text-sm text-muted-foreground">Someone is already cleaning this one up.</p>
          </>
        )}
      </section>
    </main>
  );
}
