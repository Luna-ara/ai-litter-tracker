import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { getCurrentUser } from "@/lib/auth";
import { homeFor } from "@/lib/session";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const user = await getCurrentUser();
  if (user) redirect(homeFor(user.role));
  const { next } = await searchParams;

  return (
    <div className="flex justify-center px-4 py-16">
      <AuthForm mode="login" next={typeof next === "string" ? next : undefined} />
    </div>
  );
}
