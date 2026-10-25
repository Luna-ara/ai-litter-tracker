import { Camera, MapPin, Wallet } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { homeFor } from "@/lib/session";

const STEPS = [
  {
    icon: MapPin,
    title: "The city posts a bounty",
    body: "Staff mark a litter hotspot, set a fair price and fund it up front.",
  },
  {
    icon: Camera,
    title: "Neighbors clean it up",
    body: "Check in on location and capture before and after photos in the app.",
  },
  {
    icon: Wallet,
    title: "Verified work gets paid",
    body: "Each cleanup is verified and reviewed, then the bounty is paid out.",
  },
];

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect(homeFor(user.role));

  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="flex flex-col items-center gap-6 py-20 text-center sm:py-28">
        <span className="rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
          Community cleanup, verified
        </span>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
          Get paid to make your neighborhood cleaner.
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          CivicBounty turns litter hotspots into funded bounties. Clean one up, prove it with photos, and get
          paid when it&apos;s verified.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/signup">Start cleaning</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">City staff log in</Link>
          </Button>
        </div>
      </section>
      <section className="grid gap-4 pb-24 sm:grid-cols-3">
        {STEPS.map((step) => (
          <div key={step.title} className="rounded-xl border p-6">
            <step.icon className="mb-4 size-6 text-primary" />
            <h2 className="font-semibold">{step.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
