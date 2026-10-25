import { db } from "@/lib/db";
import { hotspots, submissions, payouts, users } from "@/db/schema";
import { eq, count, sum, desc } from "drizzle-orm";

export async function getDashboardStats() {
  const [openCount] = await db
    .select({ value: count() })
    .from(hotspots)
    .where(eq(hotspots.status, "open"));

  const [pendingCount] = await db
    .select({ value: count() })
    .from(submissions)
    .where(eq(submissions.status, "pending"));

  const [paidOut] = await db
    .select({ value: sum(payouts.amountCents) })
    .from(payouts);

  const [unfundedCount] = await db
    .select({ value: count() })
    .from(hotspots)
    .where(eq(hotspots.status, "unfunded"));

  return {
    open: openCount?.value ?? 0,
    pending: pendingCount?.value ?? 0,
    paidOutCents: Number(paidOut?.value ?? 0),
    unfunded: unfundedCount?.value ?? 0,
  };
}

export async function getAllHotspots() {
  return db.select().from(hotspots).orderBy(desc(hotspots.createdAt));
}

export async function getPendingSubmissions() {
  return db
    .select({
      id: submissions.id,
      hotspotId: submissions.hotspotId,
      citizenId: submissions.citizenId,
      beforeUrl: submissions.beforeUrl,
      afterUrl: submissions.afterUrl,
      aiScore: submissions.aiScore,
      aiReason: submissions.aiReason,
      status: submissions.status,
      createdAt: submissions.createdAt,
      hotspotTitle: hotspots.title,
      citizenName: users.name,
    })
    .from(submissions)
    .innerJoin(hotspots, eq(submissions.hotspotId, hotspots.id))
    .innerJoin(users, eq(submissions.citizenId, users.id))
    .where(eq(submissions.status, "pending"))
    .orderBy(submissions.createdAt);
}

export async function getSubmissionsForHotspot(hotspotId: string) {
  return db
    .select({
      id: submissions.id,
      aiScore: submissions.aiScore,
      status: submissions.status,
      createdAt: submissions.createdAt,
      citizenName: users.name,
    })
    .from(submissions)
    .innerJoin(users, eq(submissions.citizenId, users.id))
    .where(eq(submissions.hotspotId, hotspotId))
    .orderBy(desc(submissions.createdAt));
}

export async function getSubmissionWithDetails(id: string) {
  const rows = await db
    .select({
      submission: submissions,
      hotspot: hotspots,
      citizen: users,
    })
    .from(submissions)
    .innerJoin(hotspots, eq(submissions.hotspotId, hotspots.id))
    .innerJoin(users, eq(submissions.citizenId, users.id))
    .where(eq(submissions.id, id));
  return rows[0] ?? null;
}
