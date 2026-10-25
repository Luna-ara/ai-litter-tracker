import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { HotspotStatus, SubmissionStatus } from "@/lib/types";

const STYLES: Record<HotspotStatus | SubmissionStatus, { label: string; className: string }> = {
  unfunded: { label: "Unfunded", className: "bg-muted text-muted-foreground" },
  open: { label: "Open", className: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200" },
  in_review: { label: "In review", className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200" },
  closed: { label: "Closed", className: "bg-muted text-muted-foreground" },
  pending: { label: "Pending review", className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200" },
  approved: { label: "Approved", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200" },
  flagged: { label: "Flagged", className: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200" },
  paid: { label: "Paid", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200" },
};

export function StatusBadge({
  status,
  className,
}: {
  status: HotspotStatus | SubmissionStatus;
  className?: string;
}) {
  const style = STYLES[status];
  return (
    <Badge variant="outline" className={cn("border-transparent", style.className, className)}>
      {style.label}
    </Badge>
  );
}
