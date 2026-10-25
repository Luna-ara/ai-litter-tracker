import { requireUser } from "@/lib/auth";
import { NewHotspotForm } from "@/components/gov/new-hotspot-form";

export const metadata = { title: "New hotspot" };

export default async function NewHotspotPage() {
  await requireUser("government");
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">New hotspot</h1>
        <p className="text-muted-foreground mt-1">Post a cleanup bounty for citizens to claim.</p>
      </div>
      <NewHotspotForm />
    </div>
  );
}
