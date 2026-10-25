import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { getCurrentUser } from "@/lib/auth";
import { homeFor } from "@/lib/session";

export const metadata: Metadata = { title: "Sign up" };

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect(homeFor(user.role));

  return (
    <div className="flex justify-center px-4 py-16">
      <AuthForm mode="signup" />
    </div>
  );
}
