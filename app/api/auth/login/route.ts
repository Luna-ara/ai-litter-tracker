import { eq } from "drizzle-orm";
import { z } from "zod";
import { users } from "@/db/schema";
import { startSession, toSessionUser, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { error, json } from "@/lib/http";

const LoginBody = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const parsed = LoginBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return error(401, "Invalid email or password");

  const [user] = await db.select().from(users).where(eq(users.email, parsed.data.email));
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return error(401, "Invalid email or password");
  }

  const sessionUser = toSessionUser(user);
  await startSession(sessionUser);
  return json({ user: sessionUser });
}
