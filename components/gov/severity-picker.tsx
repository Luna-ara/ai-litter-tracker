"use client";

import { SEVERITY_PRICING } from "@/lib/gov/pricing";
import { formatCents } from "@/lib/format";
import type { Severity } from "@/lib/types";

type Props = {
  value: Severity | null;
  onChange: (s: Severity) => void;
};

export function SeverityPicker({ value, onChange }: Props) {
  return (
    <div role="radiogroup" aria-label="Severity" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {(Object.entries(SEVERITY_PRICING) as [Severity, typeof SEVERITY_PRICING[Severity]][]).map(
        ([key, { label, hint, cents }]) => {
          const selected = value === key;
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(key)}
              className={[
                "rounded-lg border-2 p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected
                  ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                  : "border-border hover:border-muted-foreground/50",
              ].join(" ")}
            >
              <div className="font-semibold">{label}</div>
              <div className="text-sm text-muted-foreground mt-0.5">{hint}</div>
              <div className="mt-2 font-mono font-medium">{formatCents(cents)}</div>
            </button>
          );
        }
      )}
    </div>
  );
}
