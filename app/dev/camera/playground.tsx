"use client";

import { useState } from "react";
import { CameraCapture } from "@/components/camera/camera-capture";

export function CameraPlayground() {
  const [url, setUrl] = useState<string | null>(null);
  return (
    <div className="space-y-4">
      <CameraCapture label="Test photo" onCapture={setUrl} />
      <p className="break-all text-xs text-muted-foreground" data-testid="captured-url">
        {url ? `onCapture: ${url}` : "Nothing captured yet. Log in first (any account) so uploads work."}
      </p>
    </div>
  );
}
