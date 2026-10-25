import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { hotspots } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatCents, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";
import { FundButton } from "@/components/gov/fund-button";
import { CheckoutReturn } from "@/components/gov/checkout-return";
import { getSubmissionsForHotspot } from "@/lib/gov/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CircleDot } from "lucide-react";

export async function generateMetadata({ params }: PageProps<"/gov/hotspots/[id]">) {
  const { id } = await params;
  const [hotspot] = await db.select().from(hotspots).where(eq(hotspots.id, id));
  return { title: hotspot?.title ?? "Hotspot" };
}

export default async function HotspotPage({
  params,
  searchParams,
}: PageProps<"/gov/hotspots/[id]">) {
  await requireUser("government");
  const { id } = await params;
  const sp = await searchParams;
  const sessionId = typeof sp.session_id === "string" ? sp.session_id : undefined;
  const canceled = sp.canceled === "1";

  const [hotspot] = await db.select().from(hotspots).where(eq(hotspots.id, id));
  if (!hotspot) notFound();

  const subs = await getSubmissionsForHotspot(id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {(sessionId || canceled) && (
        <CheckoutReturn hotspotId={id} sessionId={sessionId} canceled={canceled} />
      )}

      <div className="mb-6">
        <Link href="/gov" className="text-sm text-muted-foreground hover:underline">
          ← Dashboard
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {hotspot.beforeImageUrl && (
            <div className="rounded-lg overflow-hidden aspect-video bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={hotspot.beforeImageUrl}
                alt="Reference photo"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="text-2xl font-bold">{hotspot.title}</h1>
              <StatusBadge status={hotspot.status} />
            </div>
            <p className="text-muted-foreground">{hotspot.neighborhood}</p>
            {hotspot.description && (
              <p className="mt-3 text-sm">{hotspot.description}</p>
            )}
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Severity</dt>
                <dd className="capitalize font-medium">{hotspot.severity}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Location</dt>
                <dd className="font-mono text-xs">{hotspot.lat.toFixed(4)}, {hotspot.lng.toFixed(4)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Created</dt>
                <dd>{formatDate(hotspot.createdAt)}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bounty</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-4xl font-bold">{formatCents(hotspot.bountyCents)}</div>
              {hotspot.status === "unfunded" && (
                <FundButton hotspotId={hotspot.id} bountyCents={hotspot.bountyCents} />
              )}
              {hotspot.status === "open" && (
                <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                  <CircleDot className="size-4" />
                  Live: visible to citizens
                </div>
              )}
              {hotspot.status === "in_review" && (
                <p className="text-sm text-amber-600 font-medium">In review</p>
              )}
              {hotspot.status === "closed" && (
                <p className="text-sm text-muted-foreground font-medium">Closed</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Submissions</h2>
        {subs.length === 0 ? (
          <p className="text-muted-foreground text-sm">No submissions yet.</p>
        ) : (
          <div className="space-y-2">
            {subs.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-lg border px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{s.citizenName}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(s.createdAt)}</span>
                  <span className="text-xs">AI: {s.aiScore}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={s.status} />
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/gov/review/${s.id}`}>Review</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
