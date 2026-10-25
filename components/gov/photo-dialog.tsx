"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type Props = { src: string; alt: string; className?: string };

export function PhotoDialog({ src, alt, className }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={`cursor-pointer ${className ?? ""}`}
        onClick={() => setOpen(true)}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} className="w-full rounded object-contain max-h-[80vh]" />
        </DialogContent>
      </Dialog>
    </>
  );
}
