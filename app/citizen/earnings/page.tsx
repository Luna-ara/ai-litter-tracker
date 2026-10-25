<<<<<<< HEAD
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
=======
import { Leaf } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { getEarnings, listCitizenSubmissions } from "@/lib/citizen/queries";
import { formatCents, formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Earnings" };

export default async function EarningsPage() {
  const user = await requireUser("citizen");
  const [{ paidCents, pendingCents }, rows] = await Promise.all([
    getEarnings(user.id),
    listCitizenSubmissions(user.id),
  ]);

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Earnings</h1>
        <p className="text-sm text-muted-foreground">What you&apos;ve earned for verified cleanups.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border bg-primary/5 p-4">
          <p className="text-sm text-muted-foreground">Paid out</p>
          <p className="text-2xl font-semibold text-primary">{formatCents(paidCents)}</p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-semibold">{formatCents(pendingCents)}</p>
        </div>
      </div>
      <section className="space-y-3">
        <h2 className="font-semibold">Your cleanups</h2>
        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-12 text-center">
            <Leaf className="size-8 text-muted-foreground" />
            <p className="font-medium">No cleanups yet</p>
            <Button asChild size="sm">
              <Link href="/citizen">Find a cleanup</Link>
            </Button>
          </div>
        ) : (
          <ul className="divide-y rounded-xl border">
            {rows.map(({ submission, hotspot }) => (
              <li key={submission.id}>
                <Link
                  href={`/citizen/submissions/${submission.id}`}
                  className="flex items-center justify-between gap-3 p-4 hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{hotspot.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(submission.createdAt)}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="font-semibold">{formatCents(hotspot.bountyCents)}</span>
                    <StatusBadge status={submission.status} />
>>>>>>> origin/main
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
