import { NextResponse, type NextRequest } from "next/server";
import { homeFor, SESSION_COOKIE, verifySession } from "@/lib/session";

// Role gating for the two app areas. Pages also call requireUser() as a second check.
export async function proxy(req: NextRequest) {
  const user = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  const { pathname, search } = req.nextUrl;

  if (!user) {
    const login = new URL("/login", req.url);
    login.searchParams.set("next", pathname + search);
    return NextResponse.redirect(login);
  }

  const area = pathname.startsWith("/gov") ? "government" : "citizen";
  if (user.role !== area) {
    return NextResponse.redirect(new URL(homeFor(user.role), req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/citizen/:path*", "/gov/:path*"],
};
