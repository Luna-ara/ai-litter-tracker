# Lane brief: Rohan (citizen app)

> **For your LLM:** paste the prompt at the bottom of this file, along with `docs/CONTRACTS.md`
> and `AGENTS.md`. They hold everything needed to build this lane without touching anyone else's files.

## Your role

You build everything a **citizen** sees: finding a hotspot, proving they're there, taking
before and after photos, submitting, and tracking what they've earned. The citizen flow is
**demoed on a phone**, so build mobile-first.

## Files you own

```
app/citizen/**                          # all citizen pages
app/api/submissions/route.ts            # POST create submission
lib/citizen/**                          # geo.ts, ai.ts, queries.ts, anything else you need
components/citizen/**                   # your components
public/seed/**                          # the 4 seed photos
```

**Don't edit** anything else. In particular, not `components/camera/**` (Carter),
`components/ui/**` (Carter), `db/schema.ts` (Carter), `app/api/submissions/[id]/**` (Luna), or
`app/gov/**` (Luna). Need a change? Post `CONTRACT CHANGE: …` in chat.

## What you get from Phase 0 (don't rebuild these)

- `requireUser("citizen")` for pages, `apiUser("citizen")` for your API route (`lib/auth.ts`)
- `db` and tables (`lib/db.ts`, `db/schema.ts`), types (`lib/types.ts`)
- `json()` / `error()` (`lib/http.ts`), `formatCents()` / `formatDate()` (`lib/format.ts`)
- `<StatusBadge status=… />`, `<CameraCapture label onCapture />`, all shadcn components, nav bar
- Stub files already exist at all your paths. Replace their contents.
- Log in during development with `/dev/login-as` → **Alex Rivera**

---

## Phase 0 (6:30–7:30 PM, while Carter builds the foundation)

- [ ] Find 4 litter photos (free stock, or take them yourself). Landscape, ~1200 px wide, JPEG.
  Name them `hotspot-1.jpg` … `hotspot-4.jpg` to match the seed table in CONTRACTS §7. Commit
  them to `public/seed/` in your first PR.
- [ ] Sketch the 5 screens below on paper or in Figma, phone-sized.

---

## Task 1: Hotspot list (`/citizen`)

- Server Component. `await requireUser("citizen")`.
- Query in `lib/citizen/queries.ts`: `listOpenHotspots()` returns hotspots with `status = "open"`, newest first.
- Mobile-first (`max-w-md mx-auto p-4`): a header ("Cleanups near you"), then one card per hotspot:
  photo (`beforeImageUrl`, or a neutral placeholder with a trash icon), title, neighborhood
  with a `MapPin` icon, a severity badge, and the **bounty in large type** (`formatCents`).
  The whole card links to `/citizen/hotspots/[id]`.
- Empty state: "No open cleanups right now. Check back soon."

✅ The 3 seeded open hotspots appear; the unfunded one does not.

## Task 2: Hotspot detail (`/citizen/hotspots/[id]`)

- `const { id } = await params;` (params is a Promise in Next 16)
- `getHotspot(id)` → `notFound()` if missing
- Large photo, title, neighborhood, description, bounty, severity, and a static "Location" row with the lat/lng
- If `status === "open"`: a big **Start cleanup** button → `/citizen/hotspots/[id]/submit`
- Otherwise: a disabled button with "Already claimed / under review"

## Task 3: Submit flow (`/citizen/hotspots/[id]/submit`)

A server `page.tsx` loads the hotspot (redirects to the detail page if it isn't `open`) and
renders a client component `components/citizen/submit-flow.tsx` with the hotspot as a prop.

A step-by-step wizard, with progress shown at the top (step 1 of 4):

1. **Verify location**: a button "Check my location" → spinner for ~1.2 s with "Checking GPS…" →
   green check "Location verified: you're at <neighborhood>". Use `getDemoLocation(hotspot)`
   from `lib/citizen/geo.ts` (below). *GPS is faked on purpose; that's agreed.*
2. **Before photo**: `<CameraCapture label="Before photo" onCapture={setBeforeUrl} />`, with a
   hint: "Show the litter clearly."
3. **After photo**: `<CameraCapture label="After photo" onCapture={setAfterUrl} />`, with a
   hint: "Same spot, same angle, all cleaned up."
4. **Review & submit**: both thumbnails side by side, a **Submit cleanup** button →
   `POST /api/submissions` with `{ hotspotId, beforeUrl, afterUrl, location }`. While waiting,
   show "AI is verifying your cleanup…" with a spinner (the server takes ~1.5 s on purpose).
   On `201`: `router.push("/citizen/submissions/" + submission.id)`. On error: a toast with the `error` message.

Each step's button stays disabled until the step is done. Keep the state in `useState`; no
global store needed.

## Task 4: `POST /api/submissions` (`app/api/submissions/route.ts`)

```ts
export async function POST(req: Request) {
  const user = await apiUser("citizen");
  if (user instanceof Response) return user;
  // 1. zod: { hotspotId: string, beforeUrl: string startsWith "/api/uploads/", afterUrl: same,
  //          location: { lat: number, lng: number, accuracy: number } }
  // 2. load hotspot → 404 if missing; 409 "This hotspot isn't open" if status !== "open"
  // 3. distanceMeters(location, hotspot) > hotspot.radiusM + location.accuracy → 422 "You're not at the hotspot"
  // 4. const { score, reason } = await fakeVerify(beforeUrl, afterUrl)   // ~1.5 s delay
  // 5. in a transaction: insert the submission (status "pending", lat/lng from location, aiScore, aiReason);
  //    update hotspots set status = "in_review" where id = hotspotId
  // 6. return json({ submission }, 201)
}
```

## Task 5: `lib/citizen/geo.ts` and `lib/citizen/ai.ts` (the fakes)

```ts
// geo.ts
export function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number; // haversine
export function getDemoLocation(h: { lat: number; lng: number }): { lat: number; lng: number; accuracy: number } {
  // a point ~5–15 m from the hotspot center, accuracy 8 (looks real, always inside the geofence)
}

// ai.ts
export async function fakeVerify(beforeUrl: string, afterUrl: string): Promise<{ score: number; reason: string }> {
  // await a 1500 ms delay; score = 85 + (simple hash of the two URLs % 13) → 85–97, deterministic
  // reason, e.g. "Litter visible in the before photo is no longer present. Ground surface is clear."
}
```
`geo.ts` must stay safe to import in client components (no `db` imports in it).

## Task 6: Submission result (`/citizen/submissions/[id]`)

- Loads the submission (must belong to the current user, otherwise `notFound()`) joined with its hotspot
- Shows: big **AI score** (`Progress` bar + "92% cleanup verified"), the AI reason, a status
  badge, before/after thumbnails, and the bounty amount ("$25.00 pending city review")
- If `flagged`: show the `govNote` in an `Alert`. If `paid`: a green "Paid $25.00" banner.
- A "Back to cleanups" link

## Task 7: Earnings (`/citizen/earnings`)

- Top card: **Total paid** (sum of this citizen's `payouts.amountCents`) and **Pending** (sum of
  bounties for their `pending` and `approved` submissions)
- A list of their submissions, newest first: hotspot title, date, status badge, amount. Each links to the result page.

✅ **Lane done when:** as Alex on a phone-sized screen, you can open a hotspot → verify →
before photo → after photo → submit → see the score; the hotspot disappears from `/citizen`;
after Luna approves, earnings shows it as paid.

---

## Below the cut line (only after Gate 2, 11 PM)

- [ ] A small static map on the detail page (an OpenStreetMap embed iframe with `bbox` around
  the lat/lng; no new dependency)
- [ ] "Get paid faster: connect payouts" button on earnings, calling Luna's
  `POST /api/payments/connect` (coordinate with Luna first)
- [ ] Pull-to-refresh feel, skeleton loading states (`loading.tsx` in your folders)

---

## Prompt to paste into your LLM

```
You are helping me build the "citizen app" lane of CivicBounty, a Next.js 16 + SQLite
(Drizzle/libSQL) + shadcn/ui hackathon app. Three people build in parallel and must never edit
the same files.

I have attached: AGENTS.md, docs/CONTRACTS.md, docs/lanes/rohan-citizen.md.
- CONTRACTS.md is the single source of truth for schema, types, shared helpers, API shapes,
  and file ownership. Use the shared helpers exactly as specified (requireUser, apiUser, db,
  json, error, formatCents, StatusBadge, CameraCapture). Do not reimplement them.
- I may ONLY create or edit files under: app/citizen/**, app/api/submissions/route.ts,
  lib/citizen/**, components/citizen/**, public/seed/**.
  If something outside those paths seems to need changing, STOP and tell me the exact change
  so I can request it from the owner. Do not add npm dependencies.
- Use Next.js 16 conventions: params/searchParams are Promises (await them), cookies() is async,
  Server Components by default, "use client" only where needed. Tailwind v4.
- Mobile-first UI (it will be demoed on a phone), shadcn components, lucide-react icons, sonner toasts.

Current task: <paste the task section, e.g. "Task 3: Submit flow">.
Give me complete file contents for each file, with paths, and a short manual test plan.
```
