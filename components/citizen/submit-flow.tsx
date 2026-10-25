"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { CameraCapture } from "@/components/camera/camera-capture";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getDemoLocation } from "@/lib/citizen/geo";
import { formatCents } from "@/lib/format";
import type { Hotspot } from "@/lib/types";

type SubmitHotspot = Pick<Hotspot, "id" | "title" | "neighborhood" | "lat" | "lng" | "bountyCents">;
const stepTitles = ["Check in", "Before photo", "After photo", "Review and submit"];

export function SubmitFlow({ hotspot }: { hotspot: SubmitHotspot }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [location, setLocation] = useState<ReturnType<typeof getDemoLocation> | null>(null);
  const [locating, setLocating] = useState(false);
  const [beforeUrl, setBeforeUrl] = useState<string | null>(null);
  const [afterUrl, setAfterUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const requestInFlight = useRef(false);
  const ready = step === 1 ? Boolean(location) : step === 2 ? Boolean(beforeUrl) : Boolean(afterUrl);

  async function checkLocation() {
    if (locating) return;
    setLocating(true);
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 1200));
      setLocation(getDemoLocation(hotspot));
    } catch {
      toast.error("Could not check your location. Please try again.");
    } finally {
      setLocating(false);
    }
  }

  async function submitCleanup() {
    if (requestInFlight.current || !location || !beforeUrl || !afterUrl) return;
    requestInFlight.current = true;
    setSubmitting(true);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hotspotId: hotspot.id, beforeUrl, afterUrl, location }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(typeof data?.error === "string" ? data.error : "Submission failed. Please try again.");
      }
      if (typeof data?.submission?.id !== "string" || !data.submission.id) {
        throw new Error("The server returned an incomplete response. Check your cleanups before retrying.");
      }
      toast.success("Cleanup submitted for city review.");
      router.push(`/citizen/submissions/${encodeURIComponent(data.submission.id)}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit your cleanup. Please try again.");
      requestInFlight.current = false;
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-6">
      {!submitting && (
        <Link href={`/citizen/hotspots/${hotspot.id}`} className="inline-flex min-h-10 items-center gap-2 rounded text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <ArrowLeft className="size-4" aria-hidden="true" /> Cleanup details
        </Link>
      )}
      <header className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">Step {step} of 4</p>
        <Progress value={step * 25} aria-label="Cleanup submission progress" aria-valuenow={step * 25} aria-valuetext={`Step ${step} of 4`} />
        <h1 className="text-2xl font-bold tracking-tight">{stepTitles[step - 1]}</h1>
        <p className="text-sm leading-relaxed break-words text-muted-foreground">{hotspot.title}</p>
      </header>

      <section hidden={step !== 1} className="space-y-4" aria-label="Check in">
        <Card>
          <CardContent className="space-y-4">
            <MapPin className="size-8 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">Check in at the cleanup location before taking your photos.</p>
            <p className="text-xs text-muted-foreground">Demo mode: location is simulated.</p>
            {location ? (
              <p role="status" className="flex items-start gap-2 text-sm font-medium text-green-700 dark:text-green-400">
                <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
                Location verified · {hotspot.neighborhood} · ±8 m
              </p>
            ) : (
              <Button type="button" className="min-h-11 w-full" disabled={locating} onClick={() => void checkLocation()}>
                {locating && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                {locating ? "Getting your location…" : "Check my location"}
              </Button>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Keep both capture components mounted so Back preserves their previews. */}
      <section hidden={step !== 2} className="space-y-3" aria-label="Before photo"
        onChangeCapture={(event) => {
          if (event.target instanceof HTMLInputElement && event.target.files?.length) setBeforeUrl(null);
        }}>
        <p className="text-sm text-muted-foreground">Show the litter clearly.</p>
        <CameraCapture label="Before photo" onCapture={setBeforeUrl} disabled={step !== 2 || submitting} />
        <p className="text-xs text-muted-foreground">Capture this before you start cleaning. Continue once it has uploaded.</p>
      </section>

      <section hidden={step !== 3} className="space-y-3" aria-label="After photo"
        onChangeCapture={(event) => {
          if (event.target instanceof HTMLInputElement && event.target.files?.length) setAfterUrl(null);
        }}>
        <p className="text-sm text-muted-foreground">Same spot, same angle, all cleaned up.</p>
        <CameraCapture label="After photo" onCapture={setAfterUrl} disabled={step !== 3 || submitting} />
      </section>

      <section hidden={step !== 4} className="space-y-4" aria-label="Review your cleanup">
        <div className="grid grid-cols-2 gap-3">
          {[{ label: "Before", url: beforeUrl }, { label: "After", url: afterUrl }].map(({ label, url }) => (
            <figure key={label} className="space-y-2">
              {url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt={`${label} cleanup`} className="aspect-[4/3] w-full rounded-lg object-cover" />
              )}
              <figcaption className="text-center text-sm font-medium">{label}</figcaption>
            </figure>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-4">
          <span className="text-sm font-medium">Cleanup bounty</span>
          <span className="text-2xl font-bold tabular-nums text-green-700 dark:text-green-400">{formatCents(hotspot.bountyCents)}</span>
        </div>
        <p className="text-xs text-muted-foreground">Photo verification is simulated for this demo. City staff review submissions before payment.</p>
        {submitting ? (
          <Card role="status" aria-live="polite">
            <CardContent className="space-y-2 text-center">
              <Loader2 className="mx-auto mb-3 size-7 animate-spin" aria-hidden="true" />
              <p className="font-semibold">Verifying your cleanup…</p>
              <p className="text-sm text-muted-foreground">Comparing your before and after photos</p>
            </CardContent>
          </Card>
        ) : (
          <Button type="button" className="min-h-12 w-full" disabled={!location || !beforeUrl || !afterUrl} onClick={() => void submitCleanup()}>
            Submit cleanup
          </Button>
        )}
      </section>

      {!submitting && (
        <nav className="space-y-2" aria-label="Submission steps">
          {step < 4 && (
            <Button type="button" className="min-h-11 w-full" disabled={!ready || locating} onClick={() => setStep((current) => Math.min(4, current + 1))}>
              Continue
            </Button>
          )}
          {step > 1 && (
            <Button type="button" variant="ghost" className="min-h-10 w-full" onClick={() => setStep((current) => Math.max(1, current - 1))}>
              <ArrowLeft className="size-4" aria-hidden="true" /> Back
            </Button>
          )}
        </nav>
      )}
    </div>
  );
}
