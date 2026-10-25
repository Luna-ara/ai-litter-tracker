# Lane brief: Luna (government app + payments)

> **For your LLM:** paste the prompt at the bottom of this file, along with `docs/CONTRACTS.md`
> and `AGENTS.md`. They hold everything needed to build this lane without touching anyone else's files.

## Your role

You build everything a **government** user does (create and price hotspots, fund them, review
cleanups, approve or flag) and **all the money** (Stripe Checkout in, Stripe Connect transfers
out). Payments are a "must be real" feature, so they run in Stripe **test mode**.

## Files you own

```
app/gov/**                              # all government pages
app/api/hotspots/**                     # POST create hotspot
app/api/submissions/[id]/**             # PATCH review (approve / flag)
app/api/payments/**                     # checkout, confirm, (connect)
lib/gov/**                              # pricing.ts, queries.ts, anything else you need
lib/payments.ts                         # all Stripe code lives here
components/gov/**                       # your components
```

**Don't edit** anything else. In particular, not `app/api/submissions/route.ts` (Rohan),
`db/schema.ts` (Carter), `components/ui/**` (Carter), or `app/citizen/**` (Rohan). Need a
change? Post `CONTRACT CHANGE: …` in chat.

## What you get from Phase 0 (don't rebuild these)

- `requireUser("government")` for pages, `apiUser("government")` for API routes (`lib/auth.ts`)
- `db` and tables (`lib/db.ts`, `db/schema.ts`), types (`lib/types.ts`)
- `json()` / `error()` (`lib/http.ts`), `formatCents()` / `formatDate()` (`lib/format.ts`)
- `<StatusBadge status=… />`, `<CameraCapture label onCapture />` (for the hotspot's reference
  photo), all shadcn components, nav bar
- Stub files already exist at all your paths, and `stripe` is already installed
- Log in during development with `/dev/login-as` → **Parks Department**

---

## Phase 0 (6:30–7:30 PM, while Carter builds the foundation)

- [ ] Create a Stripe account (or use the team's) and stay in **Test mode**
- [ ] Copy the test keys (`sk_test_…`, `pk_test_…`). **Share them with the team by DM, never in git.**
- [ ] Turn on **Connect** in the dashboard. Create one **Express** connected account for the demo
  citizen and finish onboarding with Stripe's test values:
  phone `000 000 0000`, SMS code `000000`, SSN `000-00-0000`, DOB `01/01/1901`, address line 1 `address_full_match`,
  bank routing `110000000`, account `000123456789`. Copy its `acct_…` ID into
  `DEMO_CITIZEN_STRIPE_ACCOUNT_ID` (shared by DM too).
- [ ] In a scratch file **outside the repo**, prove `stripe.checkout.sessions.create` and
  `stripe.transfers.create` work with your keys.
- [ ] **Important for transfers:** a test-mode platform balance only becomes *available* right
  away if the charge used card **`4000 0000 0000 0077`**. Fund bounties with that card during
  rehearsal, or transfers fail with `balance_insufficient`. (`4242 4242 4242 4242` works for
  Checkout, but its funds stay "pending".)

---

## Task 1: Pricing (`lib/gov/pricing.ts`)

```ts
export const SEVERITY_PRICING = {
  small:  { label: "Small",  cents: 1000, hint: "A few bags, under 30 min" },
  medium: { label: "Medium", cents: 2500, hint: "Several bags, about 1 hour" },
  large:  { label: "Large",  cents: 5000, hint: "Bulky items or a big area, 2+ hours" },
} as const;
export type Severity = keyof typeof SEVERITY_PRICING;
export function suggestedBounty(severity: Severity): number;   // cents
export const MIN_BOUNTY_CENTS = 500, MAX_BOUNTY_CENTS = 50000;
```

## Task 2: Create hotspot (`/gov/hotspots/new` + `POST /api/hotspots`)

**Page** (client form component in `components/gov/new-hotspot-form.tsx`):
- Fields: title, neighborhood, description (textarea), latitude + longitude (number inputs,
  prefilled with the city center `37.7749, -122.4194`, plus a "Use my location" button that
  calls `navigator.geolocation` if available), severity
- **Severity picker** = three selectable cards (label, hint, price). Picking one **sets the bounty**
  to the suggested price. The bounty field is still editable ("Suggested: $25.00").
- Optional reference photo: `<CameraCapture label="Reference photo" onCapture={setBeforeImageUrl} />`
- Submit → `POST /api/hotspots` → `router.push("/gov/hotspots/" + hotspot.id)`

**Route** `app/api/hotspots/route.ts`:
- `apiUser("government")`; zod as in CONTRACTS §6, with `bountyCents` an integer between MIN and MAX
- Insert with `status: "unfunded"`, `createdBy: user.id`; `201 { hotspot }`

## Task 3: Fund a bounty (Stripe Checkout)

**`lib/payments.ts`**: every Stripe call lives here.
```ts
import Stripe from "stripe";
export const stripeEnabled = Boolean(process.env.STRIPE_SECRET_KEY);
const stripe = stripeEnabled ? new Stripe(process.env.STRIPE_SECRET_KEY!) : null;

export async function createFundingCheckout(hotspot: Hotspot): Promise<{ url: string; sessionId: string }>;
//  stripe: checkout.sessions.create({ mode: "payment",
//    line_items: [{ quantity: 1, price_data: { currency: "usd", unit_amount: hotspot.bountyCents,
//                   product_data: { name: `Cleanup bounty: ${hotspot.title}` } } }],
//    success_url: `${APP_URL}/gov/hotspots/${hotspot.id}?session_id={CHECKOUT_SESSION_ID}`,
//    cancel_url:  `${APP_URL}/gov/hotspots/${hotspot.id}?canceled=1`,
//    metadata: { hotspotId: hotspot.id } })
//  simulated (no key): return { url: `${APP_URL}/gov/hotspots/${hotspot.id}?session_id=sim_${crypto.randomUUID()}`, sessionId: "sim_…" }

export async function isCheckoutPaid(sessionId: string, hotspotId: string): Promise<boolean>;
//  "sim_…" → true; else retrieve the session; paid when payment_status === "paid" && metadata.hotspotId === hotspotId

export async function payoutSubmission(submissionId: string): Promise<Payout>;   // Task 5
```

**`POST /api/payments/checkout`** `{ hotspotId }`: gov only; hotspot must be `unfunded` (else
409); create the session, save `checkoutSessionId` on the hotspot, return `{ url }`. The client
then does `window.location.href = url`.

**`POST /api/payments/confirm`** `{ sessionId, hotspotId }`: gov only; load the hotspot; if
it's already `open`, just return it (idempotent); if `isCheckoutPaid(sessionId, hotspotId)`,
set status `open`; return `{ hotspot }`.

**`/gov/hotspots/[id]`** page: photo, details, status badge, bounty.
- `unfunded` → a **Fund bounty ($25.00)** button (calls checkout, then redirects)
- `?session_id=…` in searchParams → a client component calls `/api/payments/confirm` once on
  mount, shows a toast "Bounty funded, hotspot is live", and runs `router.replace` to drop the query
- `?canceled=1` → a toast "Payment canceled"
- It also lists this hotspot's submissions, each linking to `/gov/review/[id]`

## Task 4: Dashboard (`/gov`)

- Stat cards: **Open**, **In review**, **Paid out** (sum of `payouts.amountCents`), **Unfunded**
- Table of all hotspots, newest first: title, neighborhood, severity, bounty, status badge → links to detail
- A "New hotspot" button at the top
- Queries in `lib/gov/queries.ts`

## Task 5: Review (`/gov/review`, `/gov/review/[id]`, `PATCH /api/submissions/[id]/review`)

**`/gov/review`**: pending submissions, oldest first: hotspot title, citizen name, AI score,
time, "Review" button. Tabs: **Pending** · **Flagged** · **Paid** (flagged and paid are below the
cut line if you're short on time).

**`/gov/review/[id]`**:
- **Before and after photos side by side** (stacked on mobile), with large thumbnails that open
  full size in a `Dialog`
- Hotspot title and bounty, citizen name, submitted time, AI score (`Progress`) + AI reason, and
  "Location verified ✓ (within N m)" computed from the lat/lng (simple haversine in `lib/gov/`)
- Optional note textarea
- **Approve & pay $25.00** (primary) and **Flag** (destructive variant; requires a note) buttons
- After the action: a toast, then `router.push("/gov/review")`

**`app/api/submissions/[id]/review/route.ts`** `PATCH { action, note? }`:
```ts
// const { id } = await params;  (Promise in Next 16)
// gov only; submission must be "pending" (else 409)
// flag:    update submission { status: "flagged", govNote: note, reviewedBy, reviewedAt }
//          update hotspot { status: "open" }        → return { submission }
// approve: update submission { status: "approved", govNote, reviewedBy, reviewedAt }
//          update hotspot { status: "closed" }
//          const payout = await payoutSubmission(id)   // sets submission → "paid"
//          return { submission, payout }
```

**`payoutSubmission(submissionId)`** in `lib/payments.ts`:
- Load the submission, its hotspot (for the amount) and its citizen (for `stripeAccountId`)
- If `stripeEnabled && citizen.stripeAccountId`: `stripe.transfers.create({ amount: hotspot.bountyCents, currency: "usd", destination: citizen.stripeAccountId, transfer_group: hotspot.id, metadata: { submissionId } })` → payout `status: "sent"`, `stripeTransferId: transfer.id`
- **If Stripe is off, or the transfer throws:** log the error, payout `status: "simulated"`. **Never fail the approval because of Stripe**; the demo must go on.
- Insert the payout row, set the submission to `"paid"`, return the payout

✅ **Lane done when:** Parks Department can create a medium hotspot ($25 suggested), fund it
(Stripe test Checkout, or simulated with no keys), see it open; after Rohan's flow submits, it
shows in the queue; approve → a payout row exists and a transfer to the demo `acct_…` shows in
the Stripe dashboard; flag → the hotspot reopens and the citizen sees the note.

---

## Below the cut line (only after Gate 2, 11 PM)

- [ ] Flagged and Paid tabs on `/gov/review`
- [ ] `POST /api/payments/connect`: creates an Express account for the current citizen if they
  have none, saves `stripeAccountId`, and returns an Account Link `url` for onboarding. **Ask
  Carter to add it to CONTRACTS** and coordinate the button with Rohan.
- [ ] A "View in Stripe" link on paid payouts (`https://dashboard.stripe.com/test/connect/transfers/<id>`)

---

## Prompt to paste into your LLM

```
You are helping me build the "government app + payments" lane of CivicBounty, a Next.js 16 +
SQLite (Drizzle/libSQL) + shadcn/ui hackathon app with Stripe in TEST mode. Three people build
in parallel and must never edit the same files.

I have attached: AGENTS.md, docs/CONTRACTS.md, docs/lanes/luna-gov-payments.md.
- CONTRACTS.md is the single source of truth for schema, types, shared helpers, API shapes,
  and file ownership. Use the shared helpers exactly as specified (requireUser, apiUser, db,
  json, error, formatCents, StatusBadge, CameraCapture). Do not reimplement them.
- I may ONLY create or edit files under: app/gov/**, app/api/hotspots/**,
  app/api/submissions/[id]/**, app/api/payments/**, lib/gov/**, lib/payments.ts, components/gov/**.
  If something outside those paths seems to need changing, STOP and tell me the exact change
  so I can request it from the owner. Do not add npm dependencies (stripe is installed).
- All Stripe code goes in lib/payments.ts. Everything must still work with STRIPE_SECRET_KEY
  unset ("simulated" mode). A Stripe failure must never block approving a cleanup.
- Use Next.js 16 conventions: params/searchParams are Promises (await them), cookies() is async,
  Server Components by default, "use client" only where needed. Tailwind v4.
- shadcn components, lucide-react icons, sonner toasts.

Current task: <paste the task section, e.g. "Task 5: Review">.
Give me complete file contents for each file, with paths, and a short manual test plan.
```
