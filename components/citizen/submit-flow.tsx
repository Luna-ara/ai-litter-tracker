"use client";

import { CheckCircle2, ChevronLeft, Loader2, MapPin, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { CameraCapture } from "@/components/camera/camera-capture";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getDemoLocation } from "@/lib/citizen/geo";
import { formatCents } from "@/lib/format";
import type { Hotspot } from "@/lib/types";

type Location = { lat: number; lng: number; accuracy: number };

const STEPS = ["Check in", "Before photo", "After photo", "Submit"];

export function SubmitFlow({
  hotspot,
}: {
  hotspot: Pick<Hotspot, "id" | "title" | "neighborhood" | "lat" | "lng" | "bountyCents">;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [locating, setLocating] = useState(false);
  const [location, setLocation] = useState<Location | null>(null);
  const [beforeUrl, setBeforeUrl] = useState<string | null>(null);
  const [afterUrl, setAfterUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const stepDone = [Boolean(location), Boolean(beforeUrl), Boolean(afterUrl), false][step];

  function checkLocation() {
    setLocating(true);
    // GPS is simulated for the demo (agreed); the server still checks the distance.
    setTimeout(() => {
      setLocation(getDemoLocation(hotspot));
      setLocating(false);
    }, 1200);
  }

  async function submit() {
    if (!location || !beforeUrl || !afterUrl) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hotspotId: hotspot.id, beforeUrl, afterUrl, location }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      router.push(`/citizen/submissions/${data.submission.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            Step {step + 1} of {STEPS.length} · {STEPS[step]}
          </span>
          <span className="text-muted-foreground">{formatCents(hotspot.bountyCents)} bounty</span>
        </div>
        <Progress value={((step + (stepDone ? 1 : 0)) / STEPS.length) * 100} />
        <p className="text-sm text-muted-foreground">{hotspot.title}</p>
      </div>

      {step === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
            {location ? (
              <>
                <CheckCircle2 className="size-10 text-primary" />
                <div>
                  <p className="font-semibold">Location verified</p>
                  <p className="text-sm text-muted-foreground">
                    {hotspot.neighborhood} · ±{Math.round(location.accuracy)} m
                  </p>
                </div>
              </>
            ) : (
              <>
                <MapPin className="size-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Check in when you&apos;re at the hotspot so the city knows the cleanup happened here.
                </p>
                <Button size="lg" onClick={checkLocation} disabled={locating}>
                  {locating && <Loader2 className="animate-spin" />}
                  {locating ? "Getting your location…" : "Check my location"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <div className="space-y-2">
          <CameraCapture label="Before photo" onCapture={setBeforeUrl} />
          <p className="text-sm text-muted-foreground">Show the litter clearly.</p>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-2">
          <CameraCapture label="After photo" onCapture={setAfterUrl} />
          <p className="text-sm text-muted-foreground">Same spot, same angle, all cleaned up.</p>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Before", beforeUrl],
              ["After", afterUrl],
            ].map(([label, url]) => (
              <figure key={label} className="space-y-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url ?? ""} alt={`${label} photo`} className="aspect-[4/3] w-full rounded-lg border object-cover" />
                <figcaption className="text-xs text-muted-foreground">{label}</figcaption>
              </figure>
            ))}
          </div>
          {submitting ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-2 py-6 text-center">
                <Loader2 className="size-8 animate-spin text-primary" />
                <p className="font-semibold">Verifying your cleanup…</p>
                <p className="text-sm text-muted-foreground">Comparing your before and after photos</p>
              </CardContent>
            </Card>
          ) : (
            <Button size="lg" className="h-12 w-full text-base" onClick={submit}>
              <Sparkles /> Submit cleanup
            </Button>
          )}
        </div>
      )}

      {step < 3 && (
        <Button size="lg" className="h-11 w-full" disabled={!stepDone} onClick={() => setStep(step + 1)}>
          Continue
        </Button>
      )}
      {step > 0 && !submitting && (
        <button
          type="button"
          onClick={() => setStep(step - 1)}
          className="mx-auto flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" /> Back
        </button>
      )}
    </div>
  );
}
