import { z } from "zod";
import { apiUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { submissions, hotspots, users, payouts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { json, error } from "@/lib/http";
import { sendBountyPayout } from "@/lib/payments";

const schema = z.object({
  action: z.enum(["approve", "flag"]),
  note: z.string().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await apiUser("government");
  if (user instanceof Response) return user;

  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return error(400, "Invalid request", parsed.error.flatten());

  const { action, note } = parsed.data;

  if (action === "flag" && !note?.trim()) {
    return error(400, "Add a note explaining the flag");
  }

  const rows = await db
    .select({ submission: submissions, hotspot: hotspots, citizen: users })
    .from(submissions)
    .innerJoin(hotspots, eq(submissions.hotspotId, hotspots.id))
    .innerJoin(users, eq(submissions.citizenId, users.id))
    .where(eq(submissions.id, id));

  const row = rows[0];
  if (!row) return error(404, "Submission not found");
  if (row.submission.status !== "pending") return error(409, "Already reviewed");

  const now = new Date();

  if (action === "flag") {
    const [updated] = await db
      .update(submissions)
      .set({ status: "flagged", govNote: note ?? null, reviewedBy: user.id, reviewedAt: now })
      .where(eq(submissions.id, id))
      .returning();
    await db
      .update(hotspots)
      .set({ status: "open" })
      .where(eq(hotspots.id, row.submission.hotspotId));
    return json({ submission: updated });
  }

  // approve
  await db
    .update(submissions)
    .set({ status: "approved", govNote: note ?? null, reviewedBy: user.id, reviewedAt: now })
    .where(eq(submissions.id, id));

  await db
    .update(hotspots)
    .set({ status: "closed" })
    .where(eq(hotspots.id, row.submission.hotspotId));

  const result = await sendBountyPayout({
    amountCents: row.hotspot.bountyCents,
    stripeAccountId: row.citizen.stripeAccountId ?? null,
    submissionId: id,
    hotspotId: row.submission.hotspotId,
  });

  const [payout] = await db
    .insert(payouts)
    .values({
      submissionId: id,
      citizenId: row.submission.citizenId,
      amountCents: row.hotspot.bountyCents,
      stripeTransferId: result.transferId,
      status: result.status,
    })
    .returning();

  const [paid] = await db
    .update(submissions)
    .set({ status: "paid" })
    .where(eq(submissions.id, id))
    .returning();

  return json({ submission: paid, payout });
}
