import { z } from "zod";
import { apiUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { hotspots } from "@/db/schema";
import { eq } from "drizzle-orm";
import { json, error } from "@/lib/http";
import { verifyBountyCheckout } from "@/lib/payments";

const schema = z.object({
  sessionId: z.string(),
  hotspotId: z.string(),
});

export async function POST(req: Request) {
  const user = await apiUser("government");
  if (user instanceof Response) return user;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return error(400, "Invalid request", parsed.error.flatten());

  const { sessionId, hotspotId } = parsed.data;

  const [hotspot] = await db.select().from(hotspots).where(eq(hotspots.id, hotspotId));
  if (!hotspot) return error(404, "Hotspot not found");

  if (hotspot.status !== "unfunded") return json({ hotspot });

  const paid = await verifyBountyCheckout(sessionId, hotspotId);
  if (!paid) return error(402, "Payment not completed");

  const [updated] = await db
    .update(hotspots)
    .set({ status: "open" })
    .where(eq(hotspots.id, hotspotId))
    .returning();

  return json({ hotspot: updated });
}
