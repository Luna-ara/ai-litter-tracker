"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCents } from "@/lib/format";

type Props = { hotspotId: string; bountyCents: number };

export function FundButton({ hotspotId, bountyCents }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleFund() {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hotspotId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not start checkout");
        return;
      }
      window.location.href = data.url;
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-1">
      <Button onClick={handleFund} disabled={loading} className="w-full">
        {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
        Fund bounty · {formatCents(bountyCents)}
      </Button>
      <p className="text-xs text-muted-foreground text-center">Paid securely with Stripe (sandbox)</p>
    </div>
  );
}
