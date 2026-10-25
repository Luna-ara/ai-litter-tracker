import { eq } from "drizzle-orm";
import { z } from "zod";
import { users } from "@/db/schema";
import { hashPassword, startSession, toSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { error, json } from "@/lib/http";

const SignupBody = z.object({
  name: z.string().trim().min(1, "Enter your name").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "Use at least 8 characters").max(200),
});

// Public signup always creates a citizen. Government accounts are provisioned by the city.
export async function POST(req: Request) {
  const parsed = SignupBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return error(400, "Invalid request", parsed.error.flatten());
  const { name, email, password } = parsed.data;

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  if (existing.length > 0) return error(409, "An account with that email already exists");

  const [user] = await db
    .insert(users)
    .values({ name, email, passwordHash: await hashPassword(password), role: "citizen" })
    .returning();

  const sessionUser = toSessionUser(user);
  await startSession(sessionUser);
  return json({ user: sessionUser }, 201);
}
