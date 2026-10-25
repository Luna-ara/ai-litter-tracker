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
