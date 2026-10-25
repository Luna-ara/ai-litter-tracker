import { z } from "zod";
import { apiUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { hotspots } from "@/db/schema";
import { eq } from "drizzle-orm";
import { json, error } from "@/lib/http";
import { createBountyCheckout } from "@/lib/payments";

const schema = z.object({ hotspotId: z.string() });

export async function POST(req: Request) {
  const user = await apiUser("government");
  if (user instanceof Response) return user;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return error(400, "Invalid request", parsed.error.flatten());

  const [hotspot] = await db.select().from(hotspots).where(eq(hotspots.id, parsed.data.hotspotId));
  if (!hotspot) return error(404, "Hotspot not found");
  if (hotspot.status !== "unfunded") return error(409, "This bounty is already funded");

  const { url, sessionId } = await createBountyCheckout({
    hotspotId: hotspot.id,
    title: hotspot.title,
    amountCents: hotspot.bountyCents,
  });

  await db
    .update(hotspots)
    .set({ checkoutSessionId: sessionId })
    .where(eq(hotspots.id, hotspot.id));

  return json({ url });
}
