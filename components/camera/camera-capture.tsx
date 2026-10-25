"use client";

import { Camera, CheckCircle2, Loader2, RotateCcw } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Frozen props (docs/CONTRACTS.md §5). The capture UI inside can change; the props cannot.
export type CameraCaptureProps = {
  label: string;
  onCapture: (url: string) => void;
  disabled?: boolean;
};

// v1: native camera via a file input (`capture` opens the rear camera on phones).
// Carter's lane replaces the inside with a live getUserMedia viewfinder (Task 3).
export function CameraCapture({ label, onCapture, disabled }: CameraCaptureProps) {
  const inputId = useId();
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function upload(file: File) {
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setPreview(data.url);
      onCapture(data.url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <label
        htmlFor={inputId}
        className={cn(
          "relative flex aspect-[4/3] w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-muted/40 transition hover:bg-muted",
          (disabled || uploading) && "pointer-events-none opacity-60",
          preview && "border-solid",
        )}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={label} className="absolute inset-0 size-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
            {uploading ? <Loader2 className="size-8 animate-spin" /> : <Camera className="size-8" />}
            {uploading ? "Uploading…" : "Tap to take a photo"}
          </span>
        )}
        {preview && (
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-background/90 px-2 py-1 text-xs font-medium">
            <CheckCircle2 className="size-3.5 text-emerald-600" /> Captured
          </span>
        )}
      </label>
      <input
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="sr-only"
        disabled={disabled || uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
          e.target.value = "";
        }}
      />
      {preview && (
        <Button type="button" variant="outline" size="sm" asChild disabled={disabled || uploading}>
          <label htmlFor={inputId} className="cursor-pointer">
            <RotateCcw className="size-4" /> Retake
          </label>
        </Button>
      )}
    </div>
  );
}
