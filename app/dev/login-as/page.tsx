import { asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { users } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";

// Development-only one-click login. Returns 404 in production builds.
export default async function LoginAsPage() {
  if (process.env.NODE_ENV === "production") notFound();
  const all = await db.select().from(users).orderBy(asc(users.role), asc(users.name));

  return (
    <div className="flex justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Log in as…</CardTitle>
          <CardDescription>Development only. Picks a seeded account without a password.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {all.map((user) => (
            <form key={user.id} action="/dev/login-as/session" method="post">
              <input type="hidden" name="userId" value={user.id} />
              <Button type="submit" variant="outline" className="w-full justify-between">
                <span>{user.name}</span>
                <Badge variant="secondary">{user.role}</Badge>
              </Button>
            </form>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
