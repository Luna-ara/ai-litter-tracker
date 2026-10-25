import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getDashboardStats, getAllHotspots } from "@/lib/gov/queries";
import { formatCents, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, ClipboardList } from "lucide-react";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  await requireUser("government");
  const [stats, hotspots] = await Promise.all([getDashboardStats(), getAllHotspots()]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Hotspots, cleanups and payouts across the city
          </p>
        </div>
        <Button asChild>
          <Link href="/gov/hotspots/new">
            <Plus className="size-4 mr-2" />
            New hotspot
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open bounties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.open}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Awaiting review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Link href="/gov/review" className="hover:underline text-primary">
                {stats.pending}
              </Link>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Paid out</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCents(stats.paidOutCents)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unfunded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unfunded}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hotspots</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {hotspots.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center px-4">
              <ClipboardList className="size-10 text-muted-foreground" />
              <p className="text-muted-foreground">No hotspots yet</p>
              <Button asChild>
                <Link href="/gov/hotspots/new">
                  <Plus className="size-4 mr-2" />
                  Create one
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell">Neighborhood</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Bounty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hotspots.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell>
                      <Link href={`/gov/hotspots/${h.id}`} className="font-medium hover:underline">
                        {h.title}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {h.neighborhood}
                    </TableCell>
                    <TableCell className="capitalize">{h.severity}</TableCell>
                    <TableCell>{formatCents(h.bountyCents)}</TableCell>
                    <TableCell>
                      <StatusBadge status={h.status} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {formatDate(h.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
