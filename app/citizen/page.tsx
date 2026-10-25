import { Sparkles } from "lucide-react";
<<<<<<< HEAD
import { HotspotCard } from "@/components/citizen/hotspot-card";
import { requireUser } from "@/lib/auth";
import { listOpenHotspots } from "@/lib/citizen/queries";

export const metadata = { title: "Cleanups near you" };

export default async function CleanupsNearYouPage() {
=======
import type { Metadata } from "next";
import { HotspotCard } from "@/components/citizen/hotspot-card";
import { requireUser } from "@/lib/auth";
import { listOpenHotspots } from "@/lib/citizen/queries";

export const metadata: Metadata = { title: "Cleanups near you" };

export default async function CitizenHomePage() {
>>>>>>> origin/main
  await requireUser("citizen");
  const hotspots = await listOpenHotspots();

  return (
<<<<<<< HEAD
    <main className="mx-auto max-w-md px-4 py-6">
      <header className="mb-6 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Cleanups near you</h1>
        <p className="text-sm text-muted-foreground">
          Funded by your city. Clean one up and get paid.
        </p>
      </header>

      {hotspots.length > 0 ? (
        <ul className="space-y-5" aria-label="Available cleanups">
          {hotspots.map((hotspot) => (
            <li key={hotspot.id}>
              <HotspotCard hotspot={hotspot} />
            </li>
          ))}
        </ul>
      ) : (
        <section className="rounded-xl border border-dashed px-5 py-12 text-center">
          <Sparkles className="mx-auto mb-4 size-8 text-muted-foreground" aria-hidden="true" />
          <h2 className="text-lg font-semibold">No open cleanups right now</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Check back soon. The city adds new ones regularly.
          </p>
        </section>
      )}
    </main>
=======
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
>>>>>>> origin/main
  );
}
