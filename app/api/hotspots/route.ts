import { z } from "zod";
import { apiUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { hotspots } from "@/db/schema";
import { json, error } from "@/lib/http";
import { MIN_BOUNTY_CENTS, MAX_BOUNTY_CENTS } from "@/lib/gov/pricing";

const schema = z.object({
  title: z.string().min(3).max(120),
  neighborhood: z.string().min(2).max(80),
  description: z.string().max(1000).default(""),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  radiusM: z.number().int().min(10).max(500).optional(),
  severity: z.enum(["small", "medium", "large"]),
  bountyCents: z.number().int().min(MIN_BOUNTY_CENTS).max(MAX_BOUNTY_CENTS),
  beforeImageUrl: z.string().startsWith("/api/uploads/").optional(),
});

export async function POST(req: Request) {
  const user = await apiUser("government");
  if (user instanceof Response) return user;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return error(400, "Invalid request", parsed.error.flatten());

  const { title, neighborhood, description, lat, lng, radiusM, severity, bountyCents, beforeImageUrl } =
    parsed.data;

  const [hotspot] = await db
    .insert(hotspots)
    .values({
      title,
      neighborhood,
      description,
      lat,
      lng,
      radiusM: radiusM ?? 75,
      severity,
      bountyCents,
      beforeImageUrl: beforeImageUrl ?? null,
      status: "unfunded",
      createdBy: user.id,
    })
    .returning();

  return json({ hotspot }, 201);
}
