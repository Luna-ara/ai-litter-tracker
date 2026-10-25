# CivicBounty contracts (single source of truth)

This file is the agreement between the three lanes. Everyone, and every LLM working for them,
codes against what is written here. **Once Phase 0 merges, only Carter changes it**, and only
after posting `CONTRACT CHANGE: …` in the team chat. If your code needs something that isn't
here, ask for it. Don't invent it in your own lane.

---

## 1. Stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript (strict) | `npm run dev` on http://localhost:3000 |
| Styling | Tailwind CSS v4 + shadcn/ui ("new-york" style, neutral base) | No `tailwind.config.js` in v4; theme tokens live in `app/globals.css` |
| Database | SQLite file (`local.db`) through Drizzle ORM + `@libsql/client` | Prebuilt binaries, so no native compile step on Windows or macOS |
| Auth | `bcryptjs` password hashes + `jose` HS256 JWT in an httpOnly cookie | Cookie name `cb_session` |
| Validation | `zod` | Validate every API request body |
| Payments | `stripe` (Node SDK), **test mode only** | Checkout to fund bounties, Connect transfers to pay citizens |
| Script runner | `tsx` | For `scripts/*.ts` (seed, reset) |
| Package manager | **npm only** | Commit `package-lock.json`. Never add yarn or pnpm lockfiles |
| Node | 22 LTS or newer | `.nvmrc` says 22 |

### Next.js 16 rules (LLMs often get these wrong; older training data predates them)

- `params` and `searchParams` are **Promises** in pages, layouts and route handlers:
  ```ts
  export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
  }
  export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
  }
  ```
- `cookies()` and `headers()` from `next/headers` are **async**: `const store = await cookies();`
- Middleware is now **`proxy.ts`** at the repo root and exports `function proxy(req)`, not `middleware.ts`.
- Components are Server Components by default. Add `"use client"` only for hooks, browser APIs or event handlers.
- Tailwind v4: utility classes work as usual; `@import "tailwindcss";` is in `globals.css`. Don't create a Tailwind config file.

---

## 2. File ownership

**You may only create or edit files inside your own paths.** Everything not listed belongs to Carter.

| Owner | Paths |
| --- | --- |
| **Carter** (foundation, auth, camera) | `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `proxy.ts`, `drizzle.config.ts`, `.env.example`, `.gitignore`, `db/**`, `drizzle/**`, `scripts/**`, `lib/auth.ts`, `lib/db.ts`, `lib/types.ts`, `lib/format.ts`, `lib/http.ts`, `lib/utils.ts`, `app/layout.tsx`, `app/globals.css`, `app/page.tsx`, `app/login/**`, `app/signup/**`, `app/dev/**`, `app/api/auth/**`, `app/api/uploads/**`, `components/ui/**`, `components/camera/**`, `components/nav.tsx`, `components/status-badge.tsx`, `docs/**`, `AGENTS.md`, `CLAUDE.md`, `README.md` |
| **Rohan** (citizen app) | `app/citizen/**`, `app/api/submissions/route.ts`, `lib/citizen/**`, `components/citizen/**`, `public/seed/**` |
| **Luna** (government app + payments) | `app/gov/**`, `app/api/hotspots/**`, `app/api/submissions/[id]/**`, `app/api/payments/**`, `lib/gov/**`, `lib/payments.ts`, `components/gov/**` |

Notice that `app/api/submissions/route.ts` (Rohan) and `app/api/submissions/[id]/review/route.ts`
(Luna) are different files, so there's no overlap.

Need something in a file you don't own (a dependency, a column, a shadcn component, a nav link, a
shared helper)? Post `CONTRACT CHANGE: <what and why>` in chat. Carter merges a small PR within
about 15 minutes. Meanwhile, keep working with a local stand-in **inside your own folder**.

---

## 3. Environment variables (`.env.local`, never committed)

```bash
# Database
DATABASE_URL=file:local.db

# Auth: generate with `openssl rand -base64 32` (any long random string works)
AUTH_SECRET=change-me-to-a-long-random-string

# App URL, used for Stripe redirect URLs. Change it to the tunnel URL when demoing on a phone.
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe TEST keys. Luna shares these privately. Leave them blank to run in "simulated payments" mode.
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# A Stripe Connect test account (acct_...) the seed script attaches to the demo citizen
DEMO_CITIZEN_STRIPE_ACCOUNT_ID=
```

Every feature must still **work with the Stripe keys blank** (payments fall back to "simulated").
That way Carter and Rohan never need Stripe set up to test their lanes.

---

## 4. Database schema (`db/schema.ts`)

All IDs are UUID strings from `crypto.randomUUID()`. All money is **integer cents**. All timestamps
are `Date` objects, stored as integer milliseconds. **Every column below exists from Phase 0 on**,
so no lane should need a migration.

```ts
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

const id = () => text("id").primaryKey().$defaultFn(() => crypto.randomUUID());
const createdAt = () =>
  integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date());

export const users = sqliteTable("users", {
  id: id(),
  email: text("email").notNull().unique(),          // always lowercase
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: ["citizen", "government"] }).notNull(),
  stripeAccountId: text("stripe_account_id"),       // Connect acct_... (citizens only)
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
    .notNull().default("unfunded"),
  beforeImageUrl: text("before_image_url"),         // gov's reference photo (optional)
  createdBy: text("created_by").notNull().references(() => users.id),
  checkoutSessionId: text("checkout_session_id"),
  createdAt: createdAt(),
});

export const submissions = sqliteTable("submissions", {
  id: id(),
  hotspotId: text("hotspot_id").notNull().references(() => hotspots.id),
  citizenId: text("citizen_id").notNull().references(() => users.id),
  beforeUrl: text("before_url").notNull(),
  afterUrl: text("after_url").notNull(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  aiScore: integer("ai_score").notNull(),           // 0–100, simulated
  aiReason: text("ai_reason").notNull(),
  status: text("status", { enum: ["pending", "approved", "flagged", "paid"] })
    .notNull().default("pending"),
  govNote: text("gov_note"),
  reviewedBy: text("reviewed_by").references(() => users.id),
  reviewedAt: integer("reviewed_at", { mode: "timestamp_ms" }),
  createdAt: createdAt(),
});

export const payouts = sqliteTable("payouts", {
  id: id(),
  submissionId: text("submission_id").notNull().references(() => submissions.id),
  citizenId: text("citizen_id").notNull().references(() => users.id),
  amountCents: integer("amount_cents").notNull(),
  stripeTransferId: text("stripe_transfer_id"),     // null when simulated
  status: text("status", { enum: ["sent", "simulated", "failed"] }).notNull(),
  createdAt: createdAt(),
});
```

### Status lifecycles and who moves them

```
hotspot:     unfunded --(Luna: Checkout paid)--> open
             open --(Rohan: citizen submits)--> in_review
             in_review --(Luna: approve)--> closed
             in_review --(Luna: flag)--> open          (it can be claimed again)

submission:  (Rohan: created) pending
             pending --(Luna: approve)--> approved --(Luna: payout recorded)--> paid
             pending --(Luna: flag)--> flagged
```

Only those transitions, and only by that lane's code.

---

## 5. Shared modules (built by Carter in Phase 0; signatures are frozen)

### `lib/db.ts`
```ts
export const db: LibSQLDatabase<typeof schema>;   // import { db } from "@/lib/db"
export * as schema from "@/db/schema";            // also: import { users, hotspots, ... } from "@/db/schema"
```
Queries are async: `await db.select().from(hotspots).where(eq(hotspots.status, "open"))`.

### `lib/types.ts`
```ts
export type Role = "citizen" | "government";
export type User = typeof users.$inferSelect;
export type Hotspot = typeof hotspots.$inferSelect;
export type Submission = typeof submissions.$inferSelect;
export type Payout = typeof payouts.$inferSelect;
export type SessionUser = { id: string; email: string; name: string; role: Role };
```

### `lib/auth.ts`
```ts
/** Current user from the cb_session cookie, or null. Server components and route handlers. */
export async function getCurrentUser(): Promise<SessionUser | null>;

/** For PAGES: redirects to /login?next=... if logged out, or to "/" if the role is wrong. */
export async function requireUser(role?: Role): Promise<SessionUser>;

/** For API ROUTES: returns the user, or a 401/403 JSON Response to return right away. */
export async function apiUser(role?: Role): Promise<SessionUser | Response>;
// usage:
//   const user = await apiUser("government");
//   if (user instanceof Response) return user;
```
Phase 0 ships a **stub**: the cookie holds a plain user ID, set by the `/dev/login-as` page.
Carter then swaps the stub for real JWTs **without changing these signatures**, so nobody else's
code changes.

### `lib/http.ts`
```ts
export function json<T>(data: T, status = 200): Response;
export function error(status: number, message: string, details?: unknown): Response; // body: { error, details? }
```

### `lib/format.ts`
```ts
export function formatCents(cents: number): string;      // 2500 -> "$25.00"
export function formatDate(d: Date | number): string;    // "Oct 25, 9:02 AM"
```

### `components/status-badge.tsx`
```tsx
<StatusBadge status={hotspot.status} />     // any hotspot or submission status -> a colored shadcn Badge
```

### `components/camera/camera-capture.tsx` (client component)
```tsx
"use client";
type CameraCaptureProps = {
  label: string;                         // "Before photo", "After photo"
  onCapture: (url: string) => void;      // called with the uploaded URL, e.g. "/api/uploads/3f2a….jpg"
  disabled?: boolean;
};
export function CameraCapture(props: CameraCaptureProps): JSX.Element;
```
Until the real camera lands, Phase 0 ships a version with the same props that renders a plain
`<input type="file" accept="image/*">` and uploads it. **Rohan builds against this from minute
one.**

### `components/nav.tsx`
Already holds every link the app will ever need, chosen by role:
- citizen: Hotspots `/citizen`, Earnings `/citizen/earnings`
- government: Dashboard `/gov`, New hotspot `/gov/hotspots/new`, Review queue `/gov/review`
- everyone logged in: name, role badge, Log out

### shadcn components installed in Phase 0
`button card input label textarea select badge dialog tabs table sonner avatar skeleton separator alert progress dropdown-menu`.
Import them like `import { Button } from "@/components/ui/button"`. Toasts:
`import { toast } from "sonner"` (the `<Toaster />` is already in the root layout).

---

## 6. Routes

### Pages

| Path | Owner | Access | What it shows |
| --- | --- | --- | --- |
| `/` | Carter | public | Landing pitch; logged-in users are sent to their home |
| `/login`, `/signup` | Carter | public | Login (with demo-account quick-fill buttons); citizen signup |
| `/dev/login-as` | Carter | dev only | One-click login as any seeded user |
| `/citizen` | Rohan | citizen | Open hotspots |
| `/citizen/hotspots/[id]` | Rohan | citizen | Hotspot detail + "Start cleanup" |
| `/citizen/hotspots/[id]/submit` | Rohan | citizen | Location check, before photo, after photo, submit |
| `/citizen/submissions/[id]` | Rohan | citizen | Result: AI score, status |
| `/citizen/earnings` | Rohan | citizen | My submissions + total paid |
| `/gov` | Luna | government | Counts + table of all hotspots |
| `/gov/hotspots/new` | Luna | government | Create hotspot with pricing |
| `/gov/hotspots/[id]` | Luna | government | Detail + "Fund bounty"; Stripe returns here with `?session_id=` |
| `/gov/review` | Luna | government | Queue of pending submissions |
| `/gov/review/[id]` | Luna | government | Before/after side by side + Approve / Flag |

**Pages read the database directly** in Server Components (`await db.select()…`). Put your read
queries in your own lane (`lib/citizen/queries.ts`, `lib/gov/queries.ts`), never in a shared file.
**Writes go through the API routes below.**

### API routes

Every request and response body is JSON unless noted. Errors are always `{ "error": string, "details"?: any }`.

| Method + path | Owner | Auth | Request | Success response |
| --- | --- | --- | --- | --- |
| `POST /api/auth/signup` | Carter | public | `{ name, email, password }` (password ≥ 8 chars) | `201 { user: SessionUser }` + sets cookie. Always creates a **citizen** |
| `POST /api/auth/login` | Carter | public | `{ email, password }` | `200 { user: SessionUser }` + sets cookie |
| `POST /api/auth/logout` | Carter | any | none | `200 { ok: true }`, clears cookie |
| `GET /api/auth/me` | Carter | any | none | `200 { user: SessionUser \| null }` |
| `POST /api/uploads` | Carter | logged in | **multipart**, field `file` (jpeg/png/webp, ≤ 8 MB) | `201 { url: "/api/uploads/<uuid>.jpg" }` |
| `GET /api/uploads/[name]` | Carter | public | none | the image bytes |
| `POST /api/hotspots` | Luna | government | `{ title, neighborhood, description?, lat, lng, radiusM?, severity, bountyCents, beforeImageUrl? }` | `201 { hotspot }` (status `unfunded`) |
| `POST /api/payments/checkout` | Luna | government | `{ hotspotId }` | `200 { url }`: redirect the browser to it |
| `POST /api/payments/confirm` | Luna | government | `{ sessionId, hotspotId }` | `200 { hotspot }` (now `open`); safe to call twice |
| `POST /api/payments/connect` | Luna | citizen | none | `200 { url }`: Stripe Connect onboarding link. *Below the cut line* |
| `POST /api/submissions` | Rohan | citizen | `{ hotspotId, beforeUrl, afterUrl, location: { lat, lng, accuracy } }` | `201 { submission }` |
| `PATCH /api/submissions/[id]/review` | Luna | government | `{ action: "approve" \| "flag", note?: string }` | `200 { submission, payout? }` |

Errors: `400` validation, `401` logged out, `403` wrong role, `404` not found, `409` wrong status
(for example submitting to a hotspot that isn't `open`), `422` location outside the geofence.

---

## 7. Seed data (`npm run db:reset`)

All passwords are **`demo1234`**.

| Email | Name | Role |
| --- | --- | --- |
| `city@civicbounty.test` | Parks Department | government |
| `inspector@civicbounty.test` | Dana Inspector | government |
| `alex@civicbounty.test` | Alex Rivera | citizen (gets `DEMO_CITIZEN_STRIPE_ACCOUNT_ID`) |
| `sam@civicbounty.test` | Sam Chen | citizen |

Hotspots (coordinates are placeholders around San Francisco; change them to your city if you like):

| Title | Neighborhood | Severity | Bounty | Status | Photo |
| --- | --- | --- | --- | --- | --- |
| Overflowing trash by the creek trail | Riverside | medium | $25 | open | `/seed/hotspot-1.jpg` |
| Bottles and wrappers at the bus stop | Mission | small | $10 | open | `/seed/hotspot-2.jpg` |
| Dumped furniture in the alley | Tenderloin | large | $50 | open | `/seed/hotspot-3.jpg` |
| Litter along the playground fence | Sunset | small | $10 | unfunded | `/seed/hotspot-4.jpg` |

Rohan drops four photos into `public/seed/` with **exactly** those file names. Until then the
UI shows a placeholder.

---

## 8. Conventions

- Validate API bodies with `zod`; on failure, `return error(400, "Invalid request", parsed.error.flatten())`.
- Check permissions with `apiUser(role)` at the top of every route handler.
- Show money only through `formatCents`. Never use floats for money.
- Client-side fetches: `fetch("/api/...", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(...) })`, then `router.refresh()` or `router.push()`.
- UI: shadcn components, `lucide-react` icons, mobile-first layouts (`max-w-md mx-auto` for citizen screens; the citizen flow is demoed on a phone).
- Use toasts (`sonner`) for success and error feedback. No `alert()`.
- No new dependencies without a `CONTRACT CHANGE`.
