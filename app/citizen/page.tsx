import { Sparkles } from "lucide-react";
import { HotspotCard } from "@/components/citizen/hotspot-card";
import { requireUser } from "@/lib/auth";
import { listOpenHotspots } from "@/lib/citizen/queries";

export const metadata = { title: "Cleanups near you" };

export default async function CleanupsNearYouPage() {
  await requireUser("citizen");
  const hotspots = await listOpenHotspots();

  return (
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
  );
}
