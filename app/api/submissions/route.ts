<<<<<<< HEAD
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { hotspots, submissions } from "@/db/schema";
import { apiUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { error, json } from "@/lib/http";
import { distanceMeters } from "@/lib/citizen/geo";
import { fakeVerify } from "@/lib/citizen/ai";

const requestSchema = z.object({
  hotspotId: z.string().min(1),
  beforeUrl: z.string().startsWith("/api/uploads/"),
  afterUrl: z.string().startsWith("/api/uploads/"),
=======
import { eq } from "drizzle-orm";
import { z } from "zod";
import { hotspots, submissions } from "@/db/schema";
import { apiUser } from "@/lib/auth";
import { fakeVerify } from "@/lib/citizen/ai";
import { distanceMeters } from "@/lib/citizen/geo";
import { db } from "@/lib/db";
import { error, json } from "@/lib/http";

const uploadUrl = z.string().startsWith("/api/uploads/");

const SubmissionBody = z.object({
  hotspotId: z.string().min(1),
  beforeUrl: uploadUrl,
  afterUrl: uploadUrl,
>>>>>>> origin/main
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    accuracy: z.number().min(0).max(500),
  }),
});

export async function POST(req: Request) {
  const user = await apiUser("citizen");
  if (user instanceof Response) return user;

<<<<<<< HEAD
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return error(400, "Invalid request");
  }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return error(400, "Invalid request", parsed.error.flatten());

  const { hotspotId, beforeUrl, afterUrl, location } = parsed.data;
  const [hotspot] = await db.select().from(hotspots).where(eq(hotspots.id, hotspotId)).limit(1);
  if (!hotspot) return error(404, "Hotspot not found");
  if (hotspot.status !== "open") return error(409, "This cleanup isn't open anymore");
=======
  const parsed = SubmissionBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return error(400, "Invalid request", parsed.error.flatten());
  const { hotspotId, beforeUrl, afterUrl, location } = parsed.data;

  const [hotspot] = await db.select().from(hotspots).where(eq(hotspots.id, hotspotId));
  if (!hotspot) return error(404, "Hotspot not found");
  if (hotspot.status !== "open") return error(409, "This cleanup isn't open anymore");

>>>>>>> origin/main
  if (distanceMeters(location, hotspot) > hotspot.radiusM + location.accuracy) {
    return error(422, "You need to be at the hotspot to submit");
  }

  const { score, reason } = await fakeVerify(beforeUrl, afterUrl);
<<<<<<< HEAD
  const submission = await db.transaction(async (tx) => {
    // Claim inside the transaction: another citizen may submit during verification.
    const claimed = await tx.update(hotspots).set({ status: "in_review" })
      .where(and(eq(hotspots.id, hotspotId), eq(hotspots.status, "open")))
      .returning({ id: hotspots.id });
    if (claimed.length === 0) return null;

    const [created] = await tx.insert(submissions).values({
      hotspotId,
      citizenId: user.id,
      beforeUrl,
      afterUrl,
      lat: location.lat,
      lng: location.lng,
      aiScore: score,
      aiReason: reason,
      status: "pending",
    }).returning();
    return created;
  });
  if (!submission) return error(409, "This cleanup isn't open anymore");
=======

  const submission = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(submissions)
      .values({
        hotspotId,
        citizenId: user.id,
        beforeUrl,
        afterUrl,
        lat: location.lat,
        lng: location.lng,
        aiScore: score,
        aiReason: reason,
        status: "pending",
      })
      .returning();
    await tx.update(hotspots).set({ status: "in_review" }).where(eq(hotspots.id, hotspotId));
    return created;
  });

>>>>>>> origin/main
  return json({ submission }, 201);
}
