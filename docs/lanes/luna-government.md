# Luna's runbook: the government app (with Claude Code)

You build everything **city staff** do: see the dashboard, create and price hotspots, fund
bounties, review before/after photos, and **approve (which pays the citizen) or flag** each
cleanup. It's shown on the laptop during the 9:00 AM Sunday demo.

**You need no external accounts or API keys.** Stripe is wrapped for you in `lib/payments.ts`
(Carter's lane): you call three plain functions, and without keys they run in "simulated" mode,
so everything works on your machine with zero setup.

> **Quickest start:** paste your kickoff line from [`START_HERE.md`](../../START_HERE.md) into your
> assistant. It finds your next task here, works on its own branch (`luna/<task>-<slug>`) and
> opens a PR into `main`. The manual steps below are the same process, spelled out.

---

## 0. One-time setup (~10 minutes)

```bash
git clone git@github.com:Luna-ara/ai-litter-tracker.git
cd ai-litter-tracker
node -v                         # needs 20.9+ (22 recommended)
npm ci
cp .env.example .env.local      # the defaults work; leave the Stripe values blank
npm run db:reset                # creates local.db with demo data
npm run dev                     # http://localhost:3000
```

Check it works: open http://localhost:3000/login and click **Demo city staff**. You should land
on `/gov` and see a "Being built by Luna" card. That card is your first page.

**Claude Code:** run `claude` **from the repo root**. It loads `CLAUDE.md` → `AGENTS.md`
automatically (team rules, Next.js 16 gotchas, where the contracts are). You don't need to paste
them in. Recommended: answer "no" if it asks to edit a file outside your folders. It's been told
to stop and describe the change instead.

---

## 1. The loop: repeat for every task below

```bash
git switch main && git pull                 # always start from the latest main
git switch -c luna/<task-number>-<slug>     # e.g. luna/2-dashboard
claude                                      # then paste the task prompt
```

1. Paste the task's **Prompt** (below) into Claude Code.
2. When it finishes, check its work (it's asked to run these too):
   ```bash
   npm run check:lane -- luna    # MUST pass: every change is inside your folders
   npm run typecheck
   npm run lint
   ```
   If anything fails, paste the output back and say "fix this".
3. Test it by hand in the browser using the task's **Done when** list.
4. Ship it (or ask Claude Code to "commit and push this branch"):
   ```bash
   git add -A && git commit -m "Gov: <what you built>"
   git fetch origin && git rebase origin/main
   git push -u origin HEAD
   ```
   Open a PR on GitHub (the template has a short checklist), then message Carter "PR up: <link>".
   **Don't wait for the merge**: start the next task. If it depends on the last one (Task 6 needs
   Task 5), branch from your previous branch instead of `main`.

**Need a change outside your folders?** Post `CONTRACT CHANGE: <file> - <change> - <why>` in chat
and Carter adds it.

### Your folders (the only places you or Claude Code may write)

```
app/gov/**                          pages
app/api/hotspots/**                 create hotspot
app/api/payments/**                 fund a bounty (checkout + confirm)
app/api/submissions/[id]/**         approve / flag
lib/gov/**                          your helpers and DB queries
components/gov/**                   your components
```

### What already exists (use it; don't rebuild it)

| Need | Use |
| --- | --- |
| The logged-in user (pages) | `const user = await requireUser("government")` from `@/lib/auth` |
| The logged-in user (API) | `const user = await apiUser("government"); if (user instanceof Response) return user;` |
| Database | `db` from `@/lib/db`; tables from `@/db/schema`; `eq, and, desc, asc, sum, count, inArray` from `drizzle-orm` |
| API responses | `json(data, status)` / `error(status, message)` from `@/lib/http` |
| Money and dates | `formatCents(2500)` → "$25.00", `formatDate(d)` from `@/lib/format` |
| Status pill | `<StatusBadge status={x.status} />` from `@/components/status-badge` |
| Camera / photo upload | `<CameraCapture label="Reference photo" onCapture={(url) => …} />` |
| **Payments** | `createBountyCheckout`, `verifyBountyCheckout`, `sendBountyPayout`, `transferDashboardUrl`, `paymentsMode` from `@/lib/payments` (signatures in CONTRACTS §5) |
| UI kit | shadcn: `@/components/ui/{button,card,table,tabs,dialog,textarea,select,badge,progress,alert,…}`, icons from `lucide-react`, `toast` from `sonner` |

Demo logins (password `demo1234`): **city@civicbounty.test** (city staff),
**alex@civicbounty.test** (citizen, for making a test submission once Rohan's flow lands). Run
`npm run db:reset` anytime to start over.

**Testing review before Rohan's submit flow exists:** with the dev server running and logged in
as Alex, run the `fetch` snippet from Task 4 of `docs/lanes/rohan-citizen.md` in the DevTools
console once his API is merged. Or ask Claude Code to write a throwaway script that inserts one
pending submission. Run it with `npx tsx --env-file=.env.local <file>` and **don't commit it**.

---

## 2. Tasks (in order)

| # | Task | Rough time | Branch |
| --- | --- | --- | --- |
| 1 | Pricing + severity picker | 25 min | `luna/1-pricing` |
| 2 | Dashboard (`/gov`) | 45 min | `luna/2-dashboard` |
| 3 | Create hotspot (page + API) | 50 min | `luna/3-new-hotspot` |
| 4 | Hotspot detail + fund the bounty | 50 min | `luna/4-funding` |
| 5 | Review queue | 30 min | `luna/5-review-queue` |
| 6 | Review detail + approve/flag + payout (the demo's payoff) | 60 min | `luna/6-review` |
| — | **Cut line**: only after the 11 PM checkpoint | | |
| 7 | Polish: tabs, Stripe links, skeletons | as time allows | `luna/7-polish` |

The government side of the demo (`docs/DEMO.md`) needs Tasks 3, 4 and 6. Task 2 is the opening shot.

### Task 1: Pricing + severity picker

**Spec**
- `lib/gov/pricing.ts`:
  ```ts
  export const SEVERITY_PRICING = {
    small:  { label: "Small",  cents: 1000, hint: "A few bags · under 30 min" },
    medium: { label: "Medium", cents: 2500, hint: "Several bags · about an hour" },
    large:  { label: "Large",  cents: 5000, hint: "Bulky items or a big area · 2+ hours" },
  } as const;
  export const MIN_BOUNTY_CENTS = 500;
  export const MAX_BOUNTY_CENTS = 50_000;
  export function suggestedBounty(severity: Severity): number;   // Severity from @/lib/types
  ```
- `components/gov/severity-picker.tsx` (`"use client"`): three selectable cards in a row (stacked
  on mobile), each showing the label, hint and price. The selected card gets a primary border
  and ring. Props: `{ value: Severity | null; onChange: (s: Severity) => void }`. Accessible:
  use `role="radiogroup"` / `role="radio"` + `aria-checked`, or real radio inputs.

**Done when:** typecheck and lint pass (it's used in Task 3).

**Prompt**
```
Implement Task 1 (Pricing + severity picker) from docs/lanes/luna-government.md. Only write
inside my lane's folders. Run `npm run check:lane -- luna`, `npm run typecheck` and
`npm run lint`, fix anything that fails, then list the files you changed.
```

### Task 2: Dashboard (`/gov`)

**Spec**
- `app/gov/page.tsx`; queries in `lib/gov/queries.ts`. `metadata.title = "Dashboard"`.
- Layout `mx-auto max-w-6xl px-4 py-8`. Header: "Dashboard" + "Hotspots, cleanups and payouts
  across the city", and a **New hotspot** button on the right (→ `/gov/hotspots/new`).
- Four stat cards: **Open bounties** (count `open`), **Awaiting review** (count of `pending`
  submissions, linking to `/gov/review`), **Paid out** (sum of `payouts.amountCents`, via
  `formatCents`), **Unfunded** (count `unfunded`).
- A "Hotspots" table (shadcn `Table`), newest first: title (links to `/gov/hotspots/<id>`),
  neighborhood, severity, bounty, `StatusBadge`, created date. On mobile, hide the neighborhood
  and date columns (`hidden md:table-cell`).
- Empty state when there are no hotspots: "No hotspots yet" + a button to create one.

**Done when:** as Parks Department you see the counts (3 open, 1 unfunded, $0.00 paid) and 4 rows.

**Prompt**
```
Implement Task 2 (Dashboard) from docs/lanes/luna-government.md. Follow docs/CONTRACTS.md,
including the §9 quality bar. Only write inside my lane's folders. Run
`npm run check:lane -- luna`, `npm run typecheck` and `npm run lint`, fix anything that fails,
then list the files you changed.
```

### Task 3: Create hotspot (`/gov/hotspots/new` + `POST /api/hotspots`)

**Spec: page** (`app/gov/hotspots/new/page.tsx` → client form `components/gov/new-hotspot-form.tsx`)
- `metadata.title = "New hotspot"`. A card titled "Post a cleanup bounty".
- Fields: **Title** (input), **Neighborhood** (input), **Description** (textarea), **Location**
  (latitude + longitude number inputs, prefilled `37.7749` / `-122.4194`, with a "Use my current
  location" button calling `navigator.geolocation.getCurrentPosition`; on failure just toast),
  **Severity** (`<SeverityPicker>`), **Bounty** (a dollar input; picking a severity sets it to
  the suggested price; it stays editable; helper text "Suggested for Medium: $25.00"),
  **Reference photo** (optional, `<CameraCapture label="Reference photo" onCapture={…} />`).
- Submit button "Create hotspot" (shows a spinner while it runs) → `POST /api/hotspots` →
  `router.push("/gov/hotspots/<id>")` + `toast.success("Hotspot created. Fund it to make it live.")`.
- Convert dollars → cents on the client: `Math.round(parseFloat(v) * 100)`.

**Spec: API** (`app/api/hotspots/route.ts` `POST`; shape in CONTRACTS §6)
- `apiUser("government")`; zod: title 3–120 chars, neighborhood 2–80, description ≤ 1000
  (default ""), lat −90..90, lng −180..180, `radiusM` optional int 10–500, severity enum,
  `bountyCents` int between MIN and MAX, `beforeImageUrl` optional string starting with `/api/uploads/`.
- Insert with `status: "unfunded"`, `createdBy: user.id` → `json({ hotspot }, 201)`.

**Done when:** creating a Medium hotspot shows $25.00 suggested, saves, lands on its detail
page (a placeholder until Task 4), and appears as Unfunded on the dashboard.

**Prompt**
```
Implement Task 3 (Create hotspot: page + POST /api/hotspots) from docs/lanes/luna-government.md.
Follow the API shape in docs/CONTRACTS.md §6, use SeverityPicker and pricing from Task 1, and use
the existing CameraCapture component without modifying it. Only write inside my lane's folders.
Run `npm run check:lane -- luna`, `npm run typecheck` and `npm run lint`, fix anything that
fails, then list the files you changed.
```

### Task 4: Hotspot detail + fund the bounty

**Spec: API**
- `app/api/payments/checkout/route.ts` `POST { hotspotId }`: gov only. Load the hotspot (404);
  it must be `unfunded` (else 409 "This bounty is already funded"). Call
  `createBountyCheckout({ hotspotId, title, amountCents: bountyCents })`, save `checkoutSessionId`
  on the hotspot, return `json({ url })`.
- `app/api/payments/confirm/route.ts` `POST { sessionId, hotspotId }`: gov only. Load the hotspot
  (404). If it's already past `unfunded`, return it (so calling twice is harmless). If
  `await verifyBountyCheckout(sessionId, hotspotId)`, update it to `status: "open"`; otherwise
  402 "Payment not completed". Return `json({ hotspot })`.

**Spec: page** `app/gov/hotspots/[id]/page.tsx` (`generateMetadata` → title)
- Left side (or top on mobile): the photo, title, neighborhood, description, location, severity, and a `StatusBadge`.
- Right side: a "Bounty" card with the amount in large type.
  - `unfunded`: a **Fund bounty · $25.00** button (client component `components/gov/fund-button.tsx`):
    `POST /api/payments/checkout`, then `window.location.href = url`. Caption: "Paid securely with Stripe (sandbox)".
  - `open`: "Live: visible to citizens" with a green dot.
  - `in_review` / `closed`: matching text.
- `components/gov/checkout-return.tsx` (`"use client"`), rendered when `searchParams` has
  `session_id` or `canceled`. In a `useEffect` that runs **once** (guard it with a `useRef`):
  for `session_id`, `POST /api/payments/confirm` → `toast.success("Bounty funded. The hotspot is now live.")`;
  for `canceled`, `toast("Payment canceled")`. Then `router.replace("/gov/hotspots/<id>")` and `router.refresh()`.
- Below: "Submissions" for this hotspot (submitter name, date, AI score, `StatusBadge`, link to
  `/gov/review/<id>`), or "No submissions yet".

**Done when:** on your machine (no Stripe keys), clicking Fund goes straight back with
"Bounty funded" and status Open. On the demo machine (Carter's sandbox keys), it opens Stripe
Checkout; pay with card `4000 0000 0000 0077`, any future date, any CVC; it comes back and
shows Open.

**Prompt**
```
Implement Task 4 (Hotspot detail + fund the bounty) from docs/lanes/luna-government.md. Use the
functions in lib/payments.ts exactly as documented in docs/CONTRACTS.md §5 (do NOT import stripe
directly or modify lib/payments.ts). searchParams and params are Promises in Next 16. Only write
inside my lane's folders. Run `npm run check:lane -- luna`, `npm run typecheck` and
`npm run lint`, fix anything that fails, then list the files you changed.
```

### Task 5: Review queue (`/gov/review`)

**Spec**
- `metadata.title = "Review queue"`. Header "Review queue" + "Check each cleanup before paying it out."
- Pending submissions, **oldest first**, as a `Table` (cards on mobile): small before and after
  thumbnails, hotspot title, citizen name, AI score (e.g. "92%", colored green ≥ 85, amber below),
  submitted time, and a **Review** button → `/gov/review/<id>`.
- Join `submissions` → `hotspots` and `users` (the citizen) in `lib/gov/queries.ts`.
- Empty state: a `CheckCircle2` icon, "You're all caught up", "New cleanups will show up here."

**Done when:** after a citizen submits (or you insert one), it appears here.

**Prompt**
```
Implement Task 5 (Review queue) from docs/lanes/luna-government.md. Only write inside my lane's
folders. Run `npm run check:lane -- luna`, `npm run typecheck` and `npm run lint`, fix anything
that fails, then list the files you changed.
```

### Task 6: Review detail + approve/flag + payout (the demo's payoff)

**Spec: API** `app/api/submissions/[id]/review/route.ts` `PATCH { action: "approve" | "flag", note?: string }`
- Gov only. zod; `note` is **required for flag** (400 "Add a note explaining the flag").
- Load the submission with its hotspot and citizen (404). It must be `pending` (409 "Already reviewed").
- **flag:** update the submission `{ status: "flagged", govNote: note, reviewedBy: user.id, reviewedAt: new Date() }`;
  update the hotspot `{ status: "open" }` (it can be claimed again) → `json({ submission })`.
- **approve:**
  1. Update the submission `{ status: "approved", govNote: note ?? null, reviewedBy, reviewedAt }`; hotspot `{ status: "closed" }`
  2. `const result = await sendBountyPayout({ amountCents: hotspot.bountyCents, stripeAccountId: citizen.stripeAccountId, submissionId, hotspotId })` (it never throws)
  3. Insert a `payouts` row `{ submissionId, citizenId, amountCents, stripeTransferId: result.transferId, status: result.status }`
  4. Update the submission `{ status: "paid" }` → `json({ submission, payout })`

**Spec: page** `app/gov/review/[id]/page.tsx` + client `components/gov/review-actions.tsx`
- Header: hotspot title (links to its detail page), citizen name, submitted time, `StatusBadge`.
- **Before | After** photos side by side (stacked on mobile), each `aspect-[4/3]` with a caption.
  Clicking one opens it full size in a `Dialog`.
- A "Verification" card: AI score (large) + `Progress` + `aiReason`; "Location: checked in
  <N> m from the hotspot" (haversine between the submission and the hotspot, computed in
  `lib/gov/geo.ts`).
- A "Payout" card: the bounty amount, and "Paid via Stripe sandbox" or "Simulated payout" depending on `paymentsMode`.
- If `pending`: an optional note `Textarea`, an **Approve & pay $25.00** primary button, and a
  **Flag** button (`variant="destructive"`, outline). Flag opens a `Dialog` that requires the note.
  After either: a toast ("Approved: $25.00 sent to Alex Rivera" / "Cleanup flagged"), then
  `router.push("/gov/review")` and `router.refresh()`.
- If already reviewed: show the outcome instead of the buttons (and a "View in Stripe" link via
  `transferDashboardUrl` when the payout has a `stripeTransferId`).

**Done when:** approving a pending submission pays it out (a `payouts` row exists; the citizen's
earnings show Paid; on the demo machine the transfer appears in the Stripe sandbox dashboard);
flagging needs a note, reopens the hotspot, and the citizen sees the note.

**Prompt**
```
Implement Task 6 (Review detail + approve/flag + payout) from docs/lanes/luna-government.md.
Follow the status rules in docs/CONTRACTS.md §4 exactly and use sendBountyPayout /
transferDashboardUrl / paymentsMode from lib/payments.ts (do not modify it or import stripe).
params is a Promise in Next 16. Only write inside my lane's folders. Run
`npm run check:lane -- luna`, `npm run typecheck` and `npm run lint`, fix anything that fails,
then list the files you changed.
```

### Task 7 (below the cut line): Polish

- Tabs on `/gov/review`: **Pending · Flagged · Paid** (`?tab=` in searchParams)
- "View in Stripe" links on paid rows
- `loading.tsx` skeletons for `/gov` and `/gov/review`

---

## 3. Troubleshooting

| Problem | Fix |
| --- | --- |
| `npm run check:lane` lists a file outside your lane | `git checkout origin/main -- <file>` (or delete it if it's new). Ask Carter if you really need the change. |
| Claude Code wants to install a package or touch `lib/payments.ts` | Say no; point it at CONTRACTS §5. Everything needed exists. |
| "Fund bounty" errors | Check the server terminal. With blank Stripe keys it should always work (simulated). |
| Weird data after testing | `npm run db:reset` |
| `git rebase` conflict | You shouldn't get one if you stay in your folders. If you do, message Carter. |
