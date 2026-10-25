"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Props = { hotspotId: string; sessionId?: string; canceled?: boolean };

export function CheckoutReturn({ hotspotId, sessionId, canceled }: Props) {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    async function handle() {
      if (canceled) {
        toast("Payment canceled");
        router.replace(`/gov/hotspots/${hotspotId}`);
        router.refresh();
        return;
      }
      if (!sessionId) return;

      try {
        const res = await fetch("/api/payments/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, hotspotId }),
        });
        const data = await res.json();
        if (res.ok) {
          toast.success("Bounty funded. The hotspot is now live.");
        } else {
          toast.error(data.error ?? "Could not confirm payment");
        }
      } catch {
        toast.error("Network error confirming payment");
      }

      router.replace(`/gov/hotspots/${hotspotId}`);
      router.refresh();
    }

    void handle();
  }, [hotspotId, sessionId, canceled, router]);

  return null;
}
