import type { hotspots, payouts, submissions, users } from "@/db/schema";

export type Role = "citizen" | "government";
export type User = typeof users.$inferSelect;
export type Hotspot = typeof hotspots.$inferSelect;
export type Submission = typeof submissions.$inferSelect;
export type Payout = typeof payouts.$inferSelect;
export type HotspotStatus = Hotspot["status"];
export type SubmissionStatus = Submission["status"];
export type Severity = Hotspot["severity"];
export type SessionUser = { id: string; email: string; name: string; role: Role };
