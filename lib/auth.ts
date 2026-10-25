import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { error } from "@/lib/http";
import { homeFor, SESSION_COOKIE, SESSION_MAX_AGE, signSession, verifySession } from "@/lib/session";
import type { Role, SessionUser, User } from "@/lib/types";

// Frozen signatures: getCurrentUser, requireUser, apiUser (docs/CONTRACTS.md §5).

/** Current user from the session cookie, or null. Server Components and route handlers. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  return verifySession(jar.get(SESSION_COOKIE)?.value);
}

/** For PAGES: redirects to /login if logged out, or to the user's home if the role is wrong. */
export async function requireUser(role?: Role): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (role && user.role !== role) redirect(homeFor(user.role));
  return user;
}

/** For API ROUTES: the user, or a 401/403 JSON Response to return immediately. */
export async function apiUser(role?: Role): Promise<SessionUser | Response> {
  const user = await getCurrentUser();
  if (!user) return error(401, "You need to log in");
  if (role && user.role !== role) return error(403, "You don't have access to this");
  return user;
}

export function toSessionUser(user: Pick<User, "id" | "email" | "name" | "role">): SessionUser {
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export async function startSession(user: SessionUser): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, await signSession(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function endSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
