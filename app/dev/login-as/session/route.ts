import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { users } from "@/db/schema";
import { startSession, toSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { homeFor } from "@/lib/session";

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") return new Response("Not found", { status: 404 });

  const form = await req.formData();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, String(form.get("userId"))));
  if (!user) return new Response("Unknown user", { status: 404 });

  await startSession(toSessionUser(user));
  return NextResponse.redirect(new URL(homeFor(user.role), req.url), 303);
}
