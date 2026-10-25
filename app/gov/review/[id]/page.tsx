import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getSubmissionWithDetails } from "@/lib/gov/queries";
import { db } from "@/lib/db";
import { payouts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { haversineDistance } from "@/lib/gov/geo";
import { formatCents, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";
import { ReviewActions } from "@/components/gov/review-actions";
import { PhotoDialog } from "@/components/gov/photo-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { paymentsMode, transferDashboardUrl } from "@/lib/payments";

export async function generateMetadata({ params }: PageProps<"/gov/review/[id]">) {
  const { id } = await params;
  const row = await getSubmissionWithDetails(id);
  return { title: row ? `Review: ${row.hotspot.title}` : "Review" };
}

export default async function ReviewCleanupPage({ params }: PageProps<"/gov/review/[id]">) {
  await requireUser("government");
  const { id } = await params;

  const row = await getSubmissionWithDetails(id);
  if (!row) notFound();

  const { submission, hotspot, citizen } = row;
  const distM = Math.round(haversineDistance(submission.lat, submission.lng, hotspot.lat, hotspot.lng));

  const [payout] = await db.select().from(payouts).where(eq(payouts.submissionId, id));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-4">
        <Link href="/gov/review" className="text-sm text-muted-foreground hover:underline">
          ← Review queue
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">
          <Link href={`/gov/hotspots/${hotspot.id}`} className="hover:underline">
            {hotspot.title}
          </Link>
        </h1>
        <StatusBadge status={submission.status} />
      </div>
      <p className="text-muted-foreground mb-8">
        {citizen.name} · submitted {formatDate(submission.createdAt)}
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Before / After photos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Before</p>
              <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                <PhotoDialog
                  src={submission.beforeUrl}
                  alt="Before cleanup"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">After</p>
              <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                <PhotoDialog
                  src={submission.afterUrl}
                  alt="After cleanup"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Verification card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-sm font-medium">AI score</span>
                  <span
                    className={`text-2xl font-bold ${submission.aiScore >= 85 ? "text-green-600" : "text-amber-600"}`}
                  >
                    {submission.aiScore}%
                  </span>
                </div>
                <Progress value={submission.aiScore} className="h-2" />
                {submission.aiReason && (
                  <p className="text-sm text-muted-foreground mt-2">{submission.aiReason}</p>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Location: checked in {distM.toLocaleString()} m from the hotspot
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {/* Payout card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payout</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold">{formatCents(hotspot.bountyCents)}</div>
              <p className="text-sm text-muted-foreground">
                {paymentsMode === "stripe" ? "Paid via Stripe sandbox" : "Simulated payout"}
              </p>
              {payout?.stripeTransferId && (
                <a
                  href={transferDashboardUrl(payout.stripeTransferId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  View in Stripe →
                </a>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          {submission.status === "pending" ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Decision</CardTitle>
              </CardHeader>
              <CardContent>
                <ReviewActions
                  submissionId={submission.id}
                  citizenName={citizen.name}
                  bountyCents={hotspot.bountyCents}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Outcome</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <StatusBadge status={submission.status} />
                {submission.govNote && (
                  <p className="text-sm text-muted-foreground">{submission.govNote}</p>
                )}
                {submission.reviewedAt && (
                  <p className="text-xs text-muted-foreground">
                    Reviewed {formatDate(submission.reviewedAt)}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
