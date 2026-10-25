import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getPendingSubmissions } from "@/lib/gov/queries";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export const metadata = { title: "Review queue" };

export default async function ReviewQueuePage() {
  await requireUser("government");
  const pending = await getPendingSubmissions();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Review queue</h1>
        <p className="text-muted-foreground mt-1">Check each cleanup before paying it out.</p>
      </div>

      {pending.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <CheckCircle2 className="size-12 text-green-500" />
          <p className="font-semibold text-lg">You&apos;re all caught up</p>
          <p className="text-muted-foreground">New cleanups will show up here.</p>
        </div>
      ) : (
        <>
          {/* Table layout for md+ */}
          <Card className="hidden md:block">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Before</TableHead>
                    <TableHead>After</TableHead>
                    <TableHead>Hotspot</TableHead>
                    <TableHead>Citizen</TableHead>
                    <TableHead>AI score</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pending.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={s.beforeUrl}
                          alt="Before"
                          className="size-12 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={s.afterUrl}
                          alt="After"
                          className="size-12 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{s.hotspotTitle}</TableCell>
                      <TableCell>{s.citizenName}</TableCell>
                      <TableCell>
                        <span
                          className={
                            s.aiScore >= 85 ? "text-green-600 font-semibold" : "text-amber-600 font-semibold"
                          }
                        >
                          {s.aiScore}%
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(s.createdAt)}</TableCell>
                      <TableCell>
                        <Button asChild size="sm">
                          <Link href={`/gov/review/${s.id}`}>Review</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Card layout for mobile */}
          <div className="space-y-3 md:hidden">
            {pending.map((s) => (
              <div key={s.id} className="rounded-lg border p-4 space-y-3">
                <div className="flex gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.beforeUrl} alt="Before" className="size-16 object-cover rounded flex-shrink-0" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.afterUrl} alt="After" className="size-16 object-cover rounded flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{s.hotspotTitle}</p>
                    <p className="text-sm text-muted-foreground">{s.citizenName}</p>
                    <p className="text-sm">
                      <span className={s.aiScore >= 85 ? "text-green-600 font-semibold" : "text-amber-600 font-semibold"}>
                        {s.aiScore}%
                      </span>
                      {" · "}{formatDate(s.createdAt)}
                    </p>
                  </div>
                </div>
                <Button asChild size="sm" className="w-full">
                  <Link href={`/gov/review/${s.id}`}>Review</Link>
                </Button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
