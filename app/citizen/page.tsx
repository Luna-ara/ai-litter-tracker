import { Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { HotspotCard } from "@/components/citizen/hotspot-card";
import { requireUser } from "@/lib/auth";
import { listOpenHotspots } from "@/lib/citizen/queries";

export const metadata: Metadata = { title: "Cleanups near you" };

export default async function CitizenHomePage() {
  await requireUser("citizen");
  const hotspots = await listOpenHotspots();

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Cleanups near you</h1>
        <p className="text-sm text-muted-foreground">Funded by your city. Clean one up and get paid.</p>
      </div>
      {hotspots.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center">
          <Sparkles className="size-8 text-muted-foreground" />
          <p className="font-medium">No open cleanups right now</p>
          <p className="text-sm text-muted-foreground">Check back soon. The city adds new ones regularly.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {hotspots.map((hotspot) => (
            <HotspotCard key={hotspot.id} hotspot={hotspot} />
          ))}
        </div>
      )}
    </div>
  );
}
