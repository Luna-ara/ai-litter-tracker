import { Badge } from "@/components/ui/badge";
import type { Severity } from "@/lib/types";

const LABELS: Record<Severity, string> = { small: "Small", medium: "Medium", large: "Large" };

export function SeverityBadge({ severity }: { severity: Severity }) {
  return <Badge variant="secondary">{LABELS[severity]}</Badge>;
}
