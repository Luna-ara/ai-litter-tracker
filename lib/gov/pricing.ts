import type { Severity } from "@/lib/types";

export const SEVERITY_PRICING = {
  small:  { label: "Small",  cents: 1000, hint: "A few bags · under 30 min" },
  medium: { label: "Medium", cents: 2500, hint: "Several bags · about an hour" },
  large:  { label: "Large",  cents: 5000, hint: "Bulky items or a big area · 2+ hours" },
} as const;

export const MIN_BOUNTY_CENTS = 500;
export const MAX_BOUNTY_CENTS = 50_000;

export function suggestedBounty(severity: Severity): number {
  return SEVERITY_PRICING[severity].cents;
}
