"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SeverityPicker } from "@/components/gov/severity-picker";
import { CameraCapture } from "@/components/camera/camera-capture";
import { suggestedBounty, SEVERITY_PRICING, MIN_BOUNTY_CENTS, MAX_BOUNTY_CENTS } from "@/lib/gov/pricing";
import { formatCents } from "@/lib/format";
import type { Severity } from "@/lib/types";

export function NewHotspotForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState("37.7749");
  const [lng, setLng] = useState("-122.4194");
  const [severity, setSeverity] = useState<Severity | null>(null);
  const [bountyDollars, setBountyDollars] = useState("");
  const [beforeImageUrl, setBeforeImageUrl] = useState<string | undefined>();
  const [locating, setLocating] = useState(false);

  function handleSeverityChange(s: Severity) {
    setSeverity(s);
    setBountyDollars((suggestedBounty(s) / 100).toFixed(2));
  }

  function useCurrentLocation() {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setLocating(false);
      },
      () => {
        toast.error("Could not get your location");
        setLocating(false);
      }
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!severity) {
      toast.error("Please select a severity level");
      return;
    }
    const bountyCents = Math.round(parseFloat(bountyDollars) * 100);
    if (isNaN(bountyCents) || bountyCents < MIN_BOUNTY_CENTS || bountyCents > MAX_BOUNTY_CENTS) {
      toast.error(`Bounty must be between ${formatCents(MIN_BOUNTY_CENTS)} and ${formatCents(MAX_BOUNTY_CENTS)}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/hotspots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          neighborhood,
          description,
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          severity,
          bountyCents,
          beforeImageUrl,
        }),
      });
      const text = await res.text();
      let data: Record<string, unknown> = {};
      try { data = JSON.parse(text); } catch { /* empty body or HTML error page */ }
      if (!res.ok) {
        toast.error((data.error as string) ?? `Server error ${res.status}`);
        return;
      }
      toast.success("Hotspot created. Fund it to make it live.");
      router.push(`/gov/hotspots/${(data.hotspot as { id: string }).id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  const suggestedText =
    severity
      ? `Suggested for ${SEVERITY_PRICING[severity].label}: ${formatCents(SEVERITY_PRICING[severity].cents)}`
      : "Select a severity to see the suggested bounty";

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Post a cleanup bounty</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Overflowing trash by the creek trail"
              required
              minLength={3}
              maxLength={120}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="neighborhood">Neighborhood</Label>
            <Input
              id="neighborhood"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              placeholder="e.g. Riverside"
              required
              minLength={2}
              maxLength={80}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details about the cleanup needed"
              maxLength={1000}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="lat" className="text-xs text-muted-foreground">Latitude</Label>
                <Input
                  id="lat"
                  type="number"
                  step="any"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lng" className="text-xs text-muted-foreground">Longitude</Label>
                <Input
                  id="lng"
                  type="number"
                  step="any"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={useCurrentLocation}
              disabled={locating}
            >
              {locating ? (
                <Loader2 className="size-4 mr-2 animate-spin" />
              ) : (
                <MapPin className="size-4 mr-2" />
              )}
              Use my current location
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Severity</Label>
            <SeverityPicker value={severity} onChange={handleSeverityChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bounty">Bounty ($)</Label>
            <Input
              id="bounty"
              type="number"
              step="0.01"
              min={(MIN_BOUNTY_CENTS / 100).toFixed(2)}
              max={(MAX_BOUNTY_CENTS / 100).toFixed(2)}
              value={bountyDollars}
              onChange={(e) => setBountyDollars(e.target.value)}
              placeholder="0.00"
              required
            />
            <p className="text-xs text-muted-foreground">{suggestedText}</p>
          </div>

          <div className="max-w-sm">
            <CameraCapture label="Reference photo (optional)" onCapture={(url) => setBeforeImageUrl(url)} />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
            Create hotspot
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
