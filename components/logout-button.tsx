"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Log out"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          router.push("/login");
          router.refresh();
        })
      }
    >
      <LogOut className="size-4" />
    </Button>
  );
}
