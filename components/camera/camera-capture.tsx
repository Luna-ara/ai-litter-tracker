"use client";

import { Camera, CheckCircle2, ImageUp, Loader2, RotateCcw, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Frozen props (docs/CONTRACTS.md §5). The capture UI inside can change; the props cannot.
export type CameraCaptureProps = {
  label: string;
  onCapture: (url: string) => void;
  disabled?: boolean;
};

type Phase = "idle" | "requesting" | "live" | "captured" | "uploading" | "done";

const MAX_EDGE = 1280;
const JPEG_QUALITY = 0.75;

// Live viewfinder through getUserMedia (needs localhost or HTTPS). When the camera is
// unavailable or permission is denied, the file input opens the phone's native camera instead.
export function CameraCapture({ label, onCapture, disabled }: CameraCaptureProps) {
  const inputId = useId();
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [shot, setShot] = useState<{ blob: Blob; preview: string } | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const busy = disabled || phase === "requesting" || phase === "uploading";

  function stopStream() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  // Release the camera (and the light) when the component goes away.
  useEffect(() => stopStream, []);

  // Free the captured preview's object URL when it's replaced or unmounted.
  useEffect(() => {
    if (!shot) return;
    return () => URL.revokeObjectURL(shot.preview);
  }, [shot]);

  async function openCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Live camera needs a secure (HTTPS) connection. Upload a photo instead.");
      return;
    }
    setCameraError(null);
    setPhase("requesting");
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1440 } },
        audio: false,
      });
      setPhase("live");
    } catch (err) {
      stopStream();
      const denied = err instanceof DOMException && err.name === "NotAllowedError";
      setCameraError(
        denied
          ? "Camera access was blocked. Allow it in your browser settings, or upload a photo instead."
          : "Couldn't start the camera. Upload a photo instead.",
      );
      setPhase(uploadedUrl ? "done" : "idle");
    }
  }

  function attachStream(video: HTMLVideoElement | null) {
    videoRef.current = video;
    if (video && streamRef.current && video.srcObject !== streamRef.current) {
      video.srcObject = streamRef.current;
    }
  }

  function closeCamera() {
    stopStream();
    setPhase(uploadedUrl ? "done" : "idle");
  }

  function takePhoto() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const scale = Math.min(1, MAX_EDGE / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return toast.error("Couldn't capture the photo. Try again.");
        stopStream();
        setShot({ blob, preview: URL.createObjectURL(blob) });
        setPhase("captured");
      },
      "image/jpeg",
      JPEG_QUALITY,
    );
  }

  async function upload(file: Blob) {
    setPhase("uploading");
    try {
      const body = new FormData();
      body.append("file", file, "photo.jpg");
      const res = await fetch("/api/uploads", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setUploadedUrl(data.url);
      setShot(null);
      setPhase("done");
      onCapture(data.url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
      setPhase(shot ? "captured" : uploadedUrl ? "done" : "idle");
    }
  }

  const frame = "relative aspect-[4/3] w-full overflow-hidden rounded-xl border bg-muted/40";

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>

      {phase === "live" || phase === "requesting" ? (
        <div className={cn(frame, "bg-black")}>
          <video ref={attachStream} autoPlay playsInline muted className="absolute inset-0 size-full object-cover" />
          {phase === "requesting" && (
            <span className="absolute inset-0 flex items-center justify-center text-sm text-white/80">
              <Loader2 className="mr-2 size-5 animate-spin" /> Starting camera…
            </span>
          )}
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            aria-label="Close camera"
            onClick={closeCamera}
            className="absolute right-2 top-2 rounded-full"
          >
            <X />
          </Button>
          <button
            type="button"
            aria-label="Take photo"
            onClick={takePhoto}
            disabled={phase !== "live"}
            className="absolute bottom-3 left-1/2 size-16 -translate-x-1/2 rounded-full border-4 border-white bg-white/30 shadow-lg transition active:scale-95 disabled:opacity-50"
          />
        </div>
      ) : shot && (phase === "captured" || phase === "uploading") ? (
        <div className={frame}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={shot.preview} alt={label} className="absolute inset-0 size-full object-cover" />
          {phase === "uploading" && (
            <span className="absolute inset-0 flex items-center justify-center bg-background/60 text-sm font-medium">
              <Loader2 className="mr-2 size-5 animate-spin" /> Uploading…
            </span>
          )}
        </div>
      ) : uploadedUrl ? (
        <div className={frame}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={uploadedUrl} alt={label} className="absolute inset-0 size-full object-cover" />
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-background/90 px-2 py-1 text-xs font-medium">
            <CheckCircle2 className="size-3.5 text-primary" /> Captured
          </span>
          {phase === "uploading" && (
            <span className="absolute inset-0 flex items-center justify-center bg-background/60 text-sm font-medium">
              <Loader2 className="mr-2 size-5 animate-spin" /> Uploading…
            </span>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={openCamera}
          disabled={busy}
          className={cn(
            frame,
            "flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed text-sm text-muted-foreground transition hover:bg-muted disabled:pointer-events-none disabled:opacity-60",
          )}
        >
          {phase === "uploading" ? <Loader2 className="size-8 animate-spin" /> : <Camera className="size-8" />}
          {phase === "uploading" ? "Uploading…" : "Tap to open the camera"}
        </button>
      )}

      {cameraError && <p className="text-xs text-destructive">{cameraError}</p>}

      <div className="flex flex-wrap gap-2">
        {phase === "captured" && (
          <>
            <Button type="button" size="sm" onClick={() => shot && upload(shot.blob)}>
              <CheckCircle2 /> Use photo
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={openCamera}>
              <RotateCcw /> Retake
            </Button>
          </>
        )}
        {phase === "done" && (
          <Button type="button" variant="outline" size="sm" onClick={openCamera} disabled={busy}>
            <RotateCcw /> Retake
          </Button>
        )}
        {phase !== "live" && phase !== "captured" && (
          <Button type="button" variant="ghost" size="sm" asChild disabled={busy}>
            <label htmlFor={inputId} className={cn("cursor-pointer", busy && "pointer-events-none opacity-50")}>
              <ImageUp /> {uploadedUrl ? "Replace with a file" : "Upload instead"}
            </label>
          </Button>
        )}
      </div>

      <input
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="sr-only"
        disabled={busy}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
