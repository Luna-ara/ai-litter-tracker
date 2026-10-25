import Link from "next/link";
import { Brand } from "@/components/brand";
import { LogoutButton } from "@/components/logout-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { homeFor } from "@/lib/session";

// Every link the app needs, by role. Don't add links here; request them (CONTRACTS §5).
const LINKS = {
  citizen: [
    { href: "/citizen", label: "Hotspots" },
    { href: "/citizen/earnings", label: "Earnings" },
  ],
  government: [
    { href: "/gov", label: "Dashboard" },
    { href: "/gov/hotspots/new", label: "New hotspot" },
    { href: "/gov/review", label: "Review queue" },
  ],
} as const;

export async function Nav() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Brand href={user ? homeFor(user.role) : "/"} />
        {user && (
          <nav className="hidden items-center gap-1 sm:flex">
            {LINKS[user.role].map((link) => (
              <Button key={link.href} variant="ghost" size="sm" asChild>
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
          </nav>
        )}
        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden text-sm text-muted-foreground md:inline">{user.name}</span>
              <Badge variant="secondary">{user.role === "government" ? "City staff" : "Citizen"}</Badge>
              <LogoutButton />
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
      {user && (
        <nav className="flex gap-1 overflow-x-auto border-t px-2 py-1 sm:hidden">
          {LINKS[user.role].map((link) => (
            <Button key={link.href} variant="ghost" size="sm" asChild>
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </nav>
      )}
    </header>
  );
}
