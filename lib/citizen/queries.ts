import { and, desc, eq, sum } from "drizzle-orm";
import { hotspots, payouts, submissions } from "@/db/schema";
import { db } from "@/lib/db";

export async function listOpenHotspots() {
  return db
    .select()
    .from(hotspots)
    .where(eq(hotspots.status, "open"))
    .orderBy(desc(hotspots.createdAt));
}

export async function getHotspot(id: string) {
  const [hotspot] = await db.select().from(hotspots).where(eq(hotspots.id, id)).limit(1);
  return hotspot;
}

export async function getCitizenSubmission(id: string, citizenId: string) {
  const [result] = await db
    .select({ submission: submissions, hotspot: hotspots })
    .from(submissions)
    .innerJoin(hotspots, eq(submissions.hotspotId, hotspots.id))
    .where(and(eq(submissions.id, id), eq(submissions.citizenId, citizenId)))
    .limit(1);
  return result;
}

export async function getCitizenEarnings(citizenId: string) {
  const [cleanups, [paid]] = await Promise.all([
    db.select({ submission: submissions, hotspot: hotspots })
      .from(submissions)
      .innerJoin(hotspots, eq(submissions.hotspotId, hotspots.id))
      .where(eq(submissions.citizenId, citizenId))
      .orderBy(desc(submissions.createdAt), desc(submissions.id)),
    db.select({ total: sum(payouts.amountCents) })
      .from(payouts).where(eq(payouts.citizenId, citizenId)),
  ]);
  const pendingCents = cleanups.reduce((total, { submission, hotspot }) =>
    submission.status === "pending" || submission.status === "approved"
      ? total + hotspot.bountyCents : total, 0);
  return { cleanups, paidCents: Number(paid?.total ?? 0), pendingCents };
}
