# Rohan's runbook: the citizen app (with Codex)

You build everything a **citizen** sees: browse funded cleanups, check in at the location, take
before and after photos, submit, see the verification score, and track earnings. It's demoed
**on a phone** at 9:00 AM Sunday, so build mobile-first.

**You need no external accounts or API keys.** Login, the camera, uploads and payments are
already built. You only write app code, in your own folders.

> **Quickest start:** paste your kickoff line from [`START_HERE.md`](../../START_HERE.md) into your
> assistant. It finds your next task here, works on its own branch (`rohan/<task>-<slug>`) and
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

Check it works: open http://localhost:3000/login and click **Demo citizen**. You should land on
`/citizen` and see a "Being built by Rohan" card. That card is your first task.

**Codex:** install it (`npm i -g @openai/codex`), then run `codex` **from the repo root**. Codex
reads `AGENTS.md` automatically; it holds the team rules and points at the contracts. You don't
need to paste them in.

---

## 1. The loop: repeat for every task below

```bash
git switch main && git pull                 # always start from the latest main
git switch -c rohan/<task-number>-<slug>    # e.g. rohan/1-hotspot-list
codex                                       # then paste the task prompt
```

1. Paste the task's **Prompt** (below) into Codex.
2. When Codex finishes, check its work:
   ```bash
   npm run check:lane -- rohan   # MUST pass: every change is inside your folders
   npm run typecheck
   npm run lint
   ```
   If any fail, paste the output back into Codex and say "fix this".
3. Test it by hand in the browser using the task's **Done when** list. Make the browser
   phone-sized (DevTools → device toolbar → iPhone).
4. Ship it:
   ```bash
   git add -A && git commit -m "Citizen: <what you built>"
   git fetch origin && git rebase origin/main
   git push -u origin HEAD
   ```
   Open a PR on GitHub (the template has a short checklist), then message Carter "PR up: <link>".
   **Don't wait for the merge**: start the next task from `main` right away. If the next task
   depends on the one you just shipped (Task 5 needs Task 4), branch from your previous branch
   instead of `main`.

**If Codex wants to edit a file outside your folders, say no.** It should instead tell you the
exact change; post that in chat as `CONTRACT CHANGE: <file> - <change> - <why>` and Carter adds it.

### Your folders (the only places you or Codex may write)

```
app/citizen/**                   pages
app/api/submissions/route.ts     your one API route
lib/citizen/**                   your helpers and DB queries
components/citizen/**            your components
public/seed/**                   the 4 demo photos
```

### What already exists (use it; don't rebuild it)

| Need | Use |
| --- | --- |
| The logged-in user (pages) | `const user = await requireUser("citizen")` from `@/lib/auth` |
| The logged-in user (API) | `const user = await apiUser("citizen"); if (user instanceof Response) return user;` |
| Database | `db` from `@/lib/db`; tables from `@/db/schema`; `eq, and, desc, sum` from `drizzle-orm` |
| API responses | `json(data, status)` / `error(status, message)` from `@/lib/http` |
| Money and dates | `formatCents(2500)` → "$25.00", `formatDate(d)` from `@/lib/format` |
| Status pill | `<StatusBadge status={x.status} />` from `@/components/status-badge` |
| Camera | `<CameraCapture label="Before photo" onCapture={(url) => …} />` from `@/components/camera/camera-capture` |
| UI kit | shadcn: `@/components/ui/{button,card,badge,progress,alert,skeleton,separator,…}`, icons from `lucide-react`, `toast` from `sonner` |

Demo logins (password `demo1234`): **alex@civicbounty.test** (citizen), **city@civicbounty.test**
(city staff, for checking things from the other side). The **Demo citizen** button on `/login`
logs you in with one click. Run `npm run db:reset` anytime to start over.

---

## 2. Tasks (in order)

| # | Task | Rough time | Branch |
| --- | --- | --- | --- |
| 0 | Seed photos | 15 min | `rohan/0-seed-photos` |
| 1 | Hotspot list | 40 min | `rohan/1-hotspot-list` |
| 2 | Hotspot detail | 30 min | `rohan/2-hotspot-detail` |
| 3 | Fake GPS + fake AI helpers | 20 min | `rohan/3-fakes` |
| 4 | `POST /api/submissions` | 30 min | `rohan/4-submissions-api` |
| 5 | Submit flow (the demo's centerpiece) | 60 min | `rohan/5-submit-flow` |
| 6 | Submission result | 30 min | `rohan/6-submission-result` |
| 7 | Earnings | 30 min | `rohan/7-earnings` |
| — | **Cut line**: only after the 11 PM checkpoint | | |
| 8 | Polish: loading skeletons + map | as time allows | `rohan/8-polish` |

The citizen side of the demo (§3 of `docs/DEMO.md`) needs Tasks 1–6. Task 7 is the closing shot.

### Task 0: Seed photos

No Codex needed. Find 4 landscape photos of litter (Unsplash or Pexels, or take them yourself),
about 1200 px wide, JPEG. Save them as exactly:

```
public/seed/hotspot-1.jpg   overflowing trash by a creek trail
public/seed/hotspot-2.jpg   bottles and wrappers at a bus stop
public/seed/hotspot-3.jpg   dumped furniture in an alley
public/seed/hotspot-4.jpg   litter along a playground fence
```

Delete `public/seed/.gitkeep`. Commit and open a PR.

### Task 1: Hotspot list (`/citizen`)

**Spec**
- File: `app/citizen/page.tsx` (replace the placeholder). Query helper:
  `lib/citizen/queries.ts` → `listOpenHotspots()` returns hotspots with `status = "open"`, newest first.
- `export const metadata = { title: "Cleanups near you" }`
- Layout: `mx-auto max-w-md px-4 py-6`. Heading "Cleanups near you", with a subline "Funded by
  your city. Clean one up and get paid."
- One card per hotspot (`components/citizen/hotspot-card.tsx`): photo on top (`beforeImageUrl`,
  `aspect-[4/3] object-cover`; if null, a muted box with a `Trash2` icon), then the title,
  neighborhood with a `MapPin` icon, a severity badge (Small, Medium or Large), and the **bounty in
  large bold type** on the right (`formatCents`). The whole card links to `/citizen/hotspots/<id>`.
- Empty state: a `Sparkles` icon, "No open cleanups right now", "Check back soon. The city adds new ones regularly."

**Done when:** as Alex you see the 3 open seeded hotspots with photos; the unfunded one is
missing; it looks good at phone width.

**Prompt**
```
Implement Task 1 (Hotspot list) from docs/lanes/rohan-citizen.md. Follow docs/CONTRACTS.md
exactly and only write inside my lane's folders (listed in that runbook). Replace the
placeholder in app/citizen/page.tsx. When done, run `npm run check:lane -- rohan`,
`npm run typecheck` and `npm run lint`, fix anything that fails, then list the files you changed.
```

### Task 2: Hotspot detail (`/citizen/hotspots/[id]`)

**Spec**
- File: `app/citizen/hotspots/[id]/page.tsx`. Query: `getHotspot(id)` in `lib/citizen/queries.ts`; `notFound()` if missing.
- `generateMetadata` → the hotspot title.
- A large photo, then the title, neighborhood, severity badge, `StatusBadge`, the description, and
  a "Bounty" row with the amount in large type. Also a "Location" row showing `lat, lng` (5 decimals).
- `status === "open"`: a full-width primary button **Start cleanup** → `/citizen/hotspots/<id>/submit`,
  with the hint "You'll check in at the location and take a before and after photo."
- Any other status: a disabled button "Already claimed" with the hint "Someone is already cleaning this one up."
- A "← All cleanups" link back to `/citizen`.

**Done when:** each seeded card opens its detail page; a made-up id shows the 404 page.

**Prompt**
```
Implement Task 2 (Hotspot detail) from docs/lanes/rohan-citizen.md. Follow docs/CONTRACTS.md
(remember params is a Promise in Next 16) and only write inside my lane's folders. When done,
run `npm run check:lane -- rohan`, `npm run typecheck` and `npm run lint`, fix anything that
fails, then list the files you changed.
```

### Task 3: Fake GPS + fake AI helpers

GPS and AI verification are **simulated on purpose** (agreed with the team). Make them look
real, and keep them deterministic so the demo never surprises us.

**Spec**
- `lib/citizen/geo.ts` (must be safe to import in client components, so **no** `db` import):
  ```ts
  export function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number; // haversine
  export function getDemoLocation(h: { lat: number; lng: number }): { lat: number; lng: number; accuracy: number };
  // a point 5–15 m from the hotspot centre, in a random direction; accuracy: 8
  ```
- `lib/citizen/ai.ts` (server only):
  ```ts
  export async function fakeVerify(beforeUrl: string, afterUrl: string): Promise<{ score: number; reason: string }>;
  // wait 1500 ms; score = 85 + (a simple string hash of beforeUrl + afterUrl) % 13  → 85–97
  // reason: one of 3 plausible sentences chosen by the same hash, e.g.
  //  "Litter visible in the before photo is no longer present. Ground surface is clear."
  ```

**Done when:** typecheck passes. (They get exercised in Task 4.)

**Prompt**
```
Implement Task 3 (Fake GPS + fake AI helpers) from docs/lanes/rohan-citizen.md, exactly as
specified there. Only write inside my lane's folders. Run `npm run check:lane -- rohan`,
`npm run typecheck` and `npm run lint`, fix anything that fails, then list the files you changed.
```

### Task 4: `POST /api/submissions`

**Spec** (`app/api/submissions/route.ts`; the request and response shapes are in CONTRACTS §6)
1. `apiUser("citizen")`
2. zod body: `hotspotId` string; `beforeUrl` and `afterUrl` strings that start with `/api/uploads/`;
   `location: { lat: number, lng: number, accuracy: number (0–500) }` → otherwise `error(400, "Invalid request", flatten())`
3. Load the hotspot → `404` if missing; `409 "This cleanup isn't open anymore"` if `status !== "open"`
4. `distanceMeters(location, hotspot) > hotspot.radiusM + location.accuracy` → `422 "You need to be at the hotspot to submit"`
5. `const { score, reason } = await fakeVerify(beforeUrl, afterUrl)`
6. `db.transaction(async (tx) => { … })`: insert the submission (`status: "pending"`, `citizenId: user.id`,
   lat/lng from `location`, `aiScore`, `aiReason`); update the hotspot to `status: "in_review"`
7. `return json({ submission }, 201)`

**Done when:** with the dev server running, logged in as Alex in the browser, you can run this
from the DevTools console (swap in a real hotspot id from the URL of a detail page):
```js
await (await fetch("/api/submissions", { method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ hotspotId: "<id>", beforeUrl: "/api/uploads/x.jpg", afterUrl: "/api/uploads/y.jpg",
  location: { lat: 37.7694, lng: -122.4862, accuracy: 8 } }) })).json()
```
It returns `{ submission }` once, then `409` the second time. Run `npm run db:reset` afterwards.

**Prompt**
```
Implement Task 4 (POST /api/submissions) from docs/lanes/rohan-citizen.md, following the request
and response shapes in docs/CONTRACTS.md §6 and the status rules in §4. Use apiUser, json, error,
zod, and the helpers from Task 3. Only write inside my lane's folders. Run
`npm run check:lane -- rohan`, `npm run typecheck` and `npm run lint`, fix anything that fails,
then list the files you changed.
```

### Task 5: Submit flow (`/citizen/hotspots/[id]/submit`), the demo's centerpiece

**Spec**
- `app/citizen/hotspots/[id]/submit/page.tsx` (server): load the hotspot; if it isn't `open`,
  `redirect` to the detail page. Render `<SubmitFlow hotspot={…} />`.
- `components/citizen/submit-flow.tsx` (`"use client"`): a 4-step wizard. At the top, "Step N of
  4" plus a `Progress` bar and the hotspot title.
  1. **Check in**: a button "Check my location" → ~1.2 s spinner "Getting your location…" →
     green check "Location verified · <neighborhood> · ±8 m". Uses `getDemoLocation(hotspot)`.
  2. **Before photo**: `<CameraCapture label="Before photo" onCapture={setBeforeUrl} />`, hint "Show the litter clearly."
  3. **After photo**: `<CameraCapture label="After photo" onCapture={setAfterUrl} />`, hint "Same spot, same angle, all cleaned up."
  4. **Submit**: before and after thumbnails side by side, the bounty amount, and a big **Submit
     cleanup** button → `POST /api/submissions`. While waiting, replace the button with a card:
     spinner + "Verifying your cleanup…" + "Comparing your before and after photos". On success,
     `router.push("/citizen/submissions/<id>")`. On error, `toast.error(data.error)`.
- A **Continue** button moves to the next step and is disabled until the current one is done.
  A small **Back** link goes to the previous step. State lives in `useState`.

**Done when:** on a phone-sized window you can complete all 4 steps with real photos (on a
laptop the file picker opens) and land on the result page; the hotspot no longer appears on `/citizen`.

**Prompt**
```
Implement Task 5 (Submit flow) from docs/lanes/rohan-citizen.md. This is the centerpiece of the
live demo, so make it polished and mobile-first, following §9 of docs/CONTRACTS.md. Use the
existing CameraCapture component as-is (do not modify it) and getDemoLocation from Task 3. Only
write inside my lane's folders. Run `npm run check:lane -- rohan`, `npm run typecheck` and
`npm run lint`, fix anything that fails, then list the files you changed.
```

### Task 6: Submission result (`/citizen/submissions/[id]`)

**Spec**
- Load the submission joined with its hotspot. It must belong to the current user (`citizenId === user.id`), otherwise `notFound()`.
- A header with a big check icon and "Cleanup submitted" (or a title that matches the status).
- **Verification card:** the score as large text ("92%"), a `Progress` bar, "cleanup verified",
  and `aiReason` in muted text.
- A status section with a `StatusBadge`:
  - `pending` / `approved`: "$25.00 · waiting for city review"
  - `paid`: a green `Alert` "You were paid $25.00"
  - `flagged`: a red `Alert` with the title "The city flagged this cleanup" and `govNote` as the body
- Before and after thumbnails side by side, and the submitted time.
- Buttons: "Back to cleanups" (`/citizen`) and "View earnings" (`/citizen/earnings`).

**Done when:** after Task 5 you land here and it looks good. After city staff approve it (Luna's
lane, or flip the status in the DB), it shows the paid state.

**Prompt**
```
Implement Task 6 (Submission result) from docs/lanes/rohan-citizen.md. Only write inside my
lane's folders. Run `npm run check:lane -- rohan`, `npm run typecheck` and `npm run lint`, fix
anything that fails, then list the files you changed.
```

### Task 7: Earnings (`/citizen/earnings`)

**Spec**
- Two stat cards: **Paid out** = the sum of `payouts.amountCents` where `citizenId = user.id`;
  **Pending** = the sum of the hotspot bounties for this user's `pending` and `approved` submissions.
- "Your cleanups": a list, newest first. Each row has the hotspot title, `formatDate(createdAt)`,
  a `StatusBadge` and the amount, and links to `/citizen/submissions/<id>`.
- Empty state: "No cleanups yet", with a button "Find a cleanup" → `/citizen`.

**Done when:** after a submission, it shows under Pending; after approval, under Paid out.

**Prompt**
```
Implement Task 7 (Earnings) from docs/lanes/rohan-citizen.md. Only write inside my lane's
folders. Run `npm run check:lane -- rohan`, `npm run typecheck` and `npm run lint`, fix
anything that fails, then list the files you changed.
```

### Task 8 (below the cut line): Polish

- `loading.tsx` skeletons in `app/citizen/` and `app/citizen/hotspots/[id]/`
- A small map on the detail page: an OpenStreetMap `<iframe>` with
  `https://www.openstreetmap.org/export/embed.html?bbox=<lng-0.003>,<lat-0.002>,<lng+0.003>,<lat+0.002>&layer=mapnik&marker=<lat>,<lng>`
  (no new dependency)

---

## 3. Troubleshooting

| Problem | Fix |
| --- | --- |
| `npm run check:lane` lists a file outside your lane | `git checkout origin/main -- <file>` (or delete it if it's new). Ask Carter if you really need that change. |
| Codex wants to install a package | Say no. Everything needed is already installed. |
| Codex uses `params.id` without `await` | Tell it: "In Next 16 params is a Promise; check AGENTS.md." |
| Weird data after testing | `npm run db:reset` |
| `git rebase` conflict | You shouldn't get one if you stay in your folders. If you do, message Carter. |
| Camera won't open on your phone at `http://192.168…` | Expected: phones need HTTPS for the camera. Test on the laptop; Carter sets up the HTTPS tunnel for the demo. |
