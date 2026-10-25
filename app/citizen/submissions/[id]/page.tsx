import { CheckCircle2, CircleAlert, Clock, Wallet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { requireUser } from "@/lib/auth";
import { getCitizenSubmission } from "@/lib/citizen/queries";
import { formatCents, formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Your cleanup" };

export default async function SubmissionPage({ params }: PageProps<"/citizen/submissions/[id]">) {
  const user = await requireUser("citizen");
  const { id } = await params;
  const row = await getCitizenSubmission(id, user.id);
  if (!row) notFound();
  const { submission, hotspot } = row;
  const bounty = formatCents(hotspot.bountyCents);

  return (
    <div className="mx-auto max-w-md space-y-5 px-4 py-6">
      <div className="flex flex-col items-center gap-2 text-center">
        {submission.status === "flagged" ? (
          <CircleAlert className="size-12 text-destructive" />
        ) : (
          <CheckCircle2 className="size-12 text-primary" />
        )}
        <h1 className="text-2xl font-semibold tracking-tight">
          {submission.status === "paid"
            ? "You got paid!"
            : submission.status === "flagged"
              ? "Cleanup flagged"
              : "Cleanup submitted"}
        </h1>
        <p className="text-sm text-muted-foreground">{hotspot.title}</p>
      </div>

      <Card>
        <CardContent className="space-y-3">
          <div className="flex items-end justify-between">
            <p className="text-sm font-medium">Verification</p>
            <p className="text-3xl font-semibold">{submission.aiScore}%</p>
          </div>
          <Progress value={submission.aiScore} />
          <p className="text-sm text-muted-foreground">cleanup verified · {submission.aiReason}</p>
        </CardContent>
      </Card>

      {submission.status === "paid" && (
        <Alert>
          <Wallet />
          <AlertTitle>You were paid {bounty}</AlertTitle>
          <AlertDescription>The city approved your cleanup. Thank you!</AlertDescription>
        </Alert>
      )}
      {submission.status === "flagged" && (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertTitle>The city flagged this cleanup</AlertTitle>
          <AlertDescription>{submission.govNote ?? "No reason given."}</AlertDescription>
        </Alert>
      )}
      {(submission.status === "pending" || submission.status === "approved") && (
        <div className="flex items-center justify-between rounded-xl border p-4">
          <span className="flex items-center gap-2 text-sm">
            <Clock className="size-4 text-muted-foreground" /> {bounty} · waiting for city review
          </span>
          <StatusBadge status={submission.status} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {[
          ["Before", submission.beforeUrl],
          ["After", submission.afterUrl],
        ].map(([label, url]) => (
          <figure key={label} className="space-y-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`${label} photo`} className="aspect-[4/3] w-full rounded-lg border object-cover" />
            <figcaption className="text-xs text-muted-foreground">{label}</figcaption>
          </figure>
        ))}
      </div>
      <p className="text-center text-xs text-muted-foreground">Submitted {formatDate(submission.createdAt)}</p>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" asChild>
          <Link href="/citizen">Back to cleanups</Link>
        </Button>
        <Button asChild>
          <Link href="/citizen/earnings">View earnings</Link>
        </Button>
      </div>
    </div>
  );
}
