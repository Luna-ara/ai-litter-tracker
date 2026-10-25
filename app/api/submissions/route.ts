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
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    accuracy: z.number().min(0).max(500),
  }),
});

export async function POST(req: Request) {
  const user = await apiUser("citizen");
  if (user instanceof Response) return user;

  const parsed = SubmissionBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return error(400, "Invalid request", parsed.error.flatten());
  const { hotspotId, beforeUrl, afterUrl, location } = parsed.data;

  const [hotspot] = await db.select().from(hotspots).where(eq(hotspots.id, hotspotId));
  if (!hotspot) return error(404, "Hotspot not found");
  if (hotspot.status !== "open") return error(409, "This cleanup isn't open anymore");

  if (distanceMeters(location, hotspot) > hotspot.radiusM + location.accuracy) {
    return error(422, "You need to be at the hotspot to submit");
  }

  const { score, reason } = await fakeVerify(beforeUrl, afterUrl);

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

  return json({ submission }, 201);
}
