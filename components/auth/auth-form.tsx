"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { SessionUser } from "@/lib/types";

const DEMO_ACCOUNTS = [
  { label: "Demo citizen", email: "alex@civicbounty.test" },
  { label: "Demo city staff", email: "city@civicbounty.test" },
];

function homeFor(user: SessionUser) {
  return user.role === "government" ? "/gov" : "/citizen";
}

export function AuthForm({ mode, next }: { mode: "login" | "signup"; next?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function submit(body: Record<string, string>) {
    setPending(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      const user = data.user as SessionUser;
      const safeNext = next?.startsWith(homeFor(user)) ? next : homeFor(user);
      router.push(safeNext);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setPending(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">{mode === "login" ? "Welcome back" : "Create your account"}</CardTitle>
        <CardDescription>
          {mode === "login"
            ? "Log in to find cleanups or review submissions."
            : "Find funded cleanups near you and get paid for verified work."}
        </CardDescription>
      </CardHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit(Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>);
        }}
      >
        <CardContent className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" autoComplete="name" required />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              minLength={mode === "signup" ? 8 : undefined}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="mt-6 flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            {mode === "login" ? "Log in" : "Create account"}
          </Button>
          {mode === "login" && (
            <>
              <div className="flex w-full items-center gap-3 text-xs text-muted-foreground">
                <Separator className="flex-1" /> Demo accounts <Separator className="flex-1" />
              </div>
              <div className="grid w-full grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map((account) => (
                  <Button
                    key={account.email}
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={pending}
                    onClick={() => void submit({ email: account.email, password: "demo1234" })}
                  >
                    {account.label}
                  </Button>
                ))}
              </div>
            </>
          )}
          <p className="text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                New here?{" "}
                <Link href="/signup" className="font-medium text-foreground underline-offset-4 hover:underline">
                  Create an account
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
                  Log in
                </Link>
              </>
            )}
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
