import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { getCitizenEarnings } from "@/lib/citizen/queries";
import { formatCents, formatDate } from "@/lib/format";

export const metadata = { title: "Your earnings" };

export default async function EarningsPage() {
  const user = await requireUser("citizen");
  const { cleanups, paidCents, pendingCents } = await getCitizenEarnings(user.id);

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Your earnings</h1>
        <p className="text-sm text-muted-foreground">Track your cleanups and the bounties you earn.</p>
      </header>
      <div className="grid grid-cols-2 gap-3">
        <Card className="min-w-0">
          <CardContent className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground">Paid out</h2>
            <p className="break-words text-2xl font-bold tabular-nums text-green-700 dark:text-green-400">{formatCents(paidCents)}</p>
          </CardContent>
        </Card>
        <Card className="min-w-0">
          <CardContent className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground">Pending</h2>
            <p className="break-words text-2xl font-bold tabular-nums text-amber-700 dark:text-amber-400">{formatCents(pendingCents)}</p>
          </CardContent>
        </Card>
      </div>
      <p className="text-xs text-muted-foreground">Demo bounties only. No real money moves. Pending includes submissions awaiting review or payment.</p>
      <section className="space-y-3" aria-labelledby="cleanup-history">
        <h2 id="cleanup-history" className="text-lg font-semibold">Your cleanups</h2>
        {cleanups.length === 0 ? (
          <Card>
            <CardContent className="space-y-4 text-center">
              <Sparkles className="mx-auto size-9 text-muted-foreground" aria-hidden="true" />
              <h3 className="font-semibold">No cleanups yet</h3>
              <p className="text-sm text-muted-foreground">Find a funded cleanup to start earning a bounty.</p>
              <Button asChild className="min-h-11"><Link href="/citizen">Find a cleanup</Link></Button>
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-3">
            {cleanups.map(({ submission, hotspot }) => (
              <li key={submission.id}>
                <Link href={`/citizen/submissions/${submission.id}`} className="block space-y-3 rounded-xl border bg-card p-4 transition hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="min-w-0 break-words font-semibold">{hotspot.title}</h3>
                    <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  </div>
                  <time dateTime={submission.createdAt.toISOString()} className="block text-xs text-muted-foreground">{formatDate(submission.createdAt)}</time>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <StatusBadge status={submission.status} />
                    <span className="font-semibold tabular-nums">{formatCents(hotspot.bountyCents)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
