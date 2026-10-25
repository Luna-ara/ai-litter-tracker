import { jwtVerify, SignJWT } from "jose";
import type { Role, SessionUser } from "@/lib/types";

// JWT helpers with no Next.js imports, so both proxy.ts and lib/auth.ts can use them.

export const SESSION_COOKIE = "cb_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is not set. Copy .env.example to .env.local.");
  return new TextEncoder().encode(value);
}

export async function signSession(user: SessionUser): Promise<string> {
  return new SignJWT({ role: user.role, name: user.name, email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret());
}

export async function verifySession(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const role = payload.role;
    if (!payload.sub || (role !== "citizen" && role !== "government")) return null;
    return {
      id: payload.sub,
      role: role as Role,
      name: String(payload.name ?? ""),
      email: String(payload.email ?? ""),
    };
  } catch {
    return null;
  }
}

export function homeFor(role: Role): string {
  return role === "government" ? "/gov" : "/citizen";
}
