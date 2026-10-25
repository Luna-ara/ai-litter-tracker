import Link from "next/link";
import { Sprout } from "lucide-react";

export function Brand({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Sprout className="size-4" />
      </span>
      CivicBounty
    </Link>
  );
}
