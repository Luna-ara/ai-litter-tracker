import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// Single source of truth for the data model. See docs/CONTRACTS.md §4.
// Only Carter edits this file; request changes with a CONTRACT CHANGE.

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());
const createdAt = () =>
  integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date());

export const users = sqliteTable("users", {
  id: id(),
  email: text("email").notNull().unique(), // always lowercase
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: ["citizen", "government"] }).notNull(),
  stripeAccountId: text("stripe_account_id"), // Connect acct_... (citizens only)
  createdAt: createdAt(),
});

export const hotspots = sqliteTable("hotspots", {
  id: id(),
  title: text("title").notNull(),
  neighborhood: text("neighborhood").notNull(),
  description: text("description").notNull().default(""),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  radiusM: integer("radius_m").notNull().default(75),
  severity: text("severity", { enum: ["small", "medium", "large"] }).notNull(),
  bountyCents: integer("bounty_cents").notNull(),
  status: text("status", { enum: ["unfunded", "open", "in_review", "closed"] })
    .notNull()
    .default("unfunded"),
  beforeImageUrl: text("before_image_url"),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id),
  checkoutSessionId: text("checkout_session_id"),
  createdAt: createdAt(),
});

export const submissions = sqliteTable("submissions", {
  id: id(),
  hotspotId: text("hotspot_id")
    .notNull()
    .references(() => hotspots.id),
  citizenId: text("citizen_id")
    .notNull()
    .references(() => users.id),
  beforeUrl: text("before_url").notNull(),
  afterUrl: text("after_url").notNull(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  aiScore: integer("ai_score").notNull(), // 0–100, simulated
  aiReason: text("ai_reason").notNull(),
  status: text("status", { enum: ["pending", "approved", "flagged", "paid"] })
    .notNull()
    .default("pending"),
  govNote: text("gov_note"),
  reviewedBy: text("reviewed_by").references(() => users.id),
  reviewedAt: integer("reviewed_at", { mode: "timestamp_ms" }),
  createdAt: createdAt(),
});

export const payouts = sqliteTable("payouts", {
  id: id(),
  submissionId: text("submission_id")
    .notNull()
    .references(() => submissions.id),
  citizenId: text("citizen_id")
    .notNull()
    .references(() => users.id),
  amountCents: integer("amount_cents").notNull(),
  stripeTransferId: text("stripe_transfer_id"), // null when simulated
  status: text("status", { enum: ["sent", "simulated", "failed"] }).notNull(),
  createdAt: createdAt(),
});
