import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, CircleAlert } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { requireUser } from "@/lib/auth";
import { getCitizenSubmission } from "@/lib/citizen/queries";
import { formatCents, formatDate } from "@/lib/format";

export const metadata = { title: "Your cleanup" };

export default async function YourCleanupPage({ params }: PageProps<"/citizen/submissions/[id]">) {
  const user = await requireUser("citizen");
  const { id } = await params;
  const result = await getCitizenSubmission(id, user.id);
  if (!result) notFound();
  const { submission, hotspot } = result;
  const flagged = submission.status === "flagged";
  const title = flagged ? "Cleanup flagged" : submission.status === "paid" ? "Cleanup paid" : "Cleanup submitted";

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-6">
      <header className="space-y-3">
        {flagged ? (
          <CircleAlert className="size-12 text-destructive" aria-hidden="true" />
        ) : (
          <CheckCircle2 className="size-12 text-green-700 dark:text-green-400" aria-hidden="true" />
        )}
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="break-words text-sm text-muted-foreground">{hotspot.title}</p>
      </header>

      <Card>
        <CardContent className="space-y-3">
          <h2 className="font-semibold">Photo verification</h2>
          <p className="text-4xl font-bold tabular-nums">{submission.aiScore}%</p>
          <Progress value={submission.aiScore} aria-label="Simulated cleanup verification score" aria-valuenow={submission.aiScore} />
          <p className="text-sm font-medium">Cleanup verified · demo simulation</p>
          <p className="text-sm leading-relaxed text-muted-foreground">{submission.aiReason}</p>
          <p className="text-xs text-muted-foreground">This score is simulated, not an analysis of your photos. City review determines the outcome.</p>
        </CardContent>
      </Card>

      <section className="space-y-3" aria-label="Review and payment status">
        <StatusBadge status={submission.status} />
        {submission.status === "paid" ? (
          <Alert className="border-green-200 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-green-100">
            <CheckCircle2 aria-hidden="true" />
            <AlertTitle>You were paid {formatCents(hotspot.bountyCents)}</AlertTitle>
            <AlertDescription className="text-green-800 dark:text-green-200">Demo payment recorded. No real money moves in this app.</AlertDescription>
          </Alert>
        ) : flagged ? (
          <Alert variant="destructive">
            <CircleAlert aria-hidden="true" />
            <AlertTitle>The city flagged this cleanup</AlertTitle>
            <AlertDescription className="whitespace-pre-wrap break-words">{submission.govNote?.trim() || "The city did not leave a note."}</AlertDescription>
          </Alert>
        ) : (
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
            {formatCents(hotspot.bountyCents)} · waiting for city review
          </p>
        )}
      </section>

      <section className="space-y-3" aria-label="Cleanup photos">
        <h2 className="font-semibold">Your before and after</h2>
        <div className="grid grid-cols-2 gap-3">
          {[{ label: "Before", url: submission.beforeUrl }, { label: "After", url: submission.afterUrl }].map(({ label, url }) => (
            <figure key={label} className="min-w-0 space-y-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`${label} cleanup at ${hotspot.title}`} className="aspect-[4/3] w-full rounded-lg object-cover" />
              <figcaption className="text-center text-sm font-medium">{label}</figcaption>
            </figure>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">Submitted <time dateTime={submission.createdAt.toISOString()}>{formatDate(submission.createdAt)}</time></p>
      </section>

      <nav className="grid gap-3" aria-label="Next steps">
        <Button asChild className="min-h-11"><Link href="/citizen">Back to cleanups</Link></Button>
        <Button asChild variant="outline" className="min-h-11"><Link href="/citizen/earnings">View earnings</Link></Button>
      </nav>
    </div>
  );
}
