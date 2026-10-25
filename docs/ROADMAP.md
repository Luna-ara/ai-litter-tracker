# CivicBounty roadmap: tonight to the 9 AM demo

**Demo:** Sunday, Oct 25, 2026, 9:00 AM. A 3-minute live demo, then Q&A.
**Team:** Carter (foundation, login, camera, Stripe) · Rohan (citizen app, using Codex) · Luna (government app, using Claude Code)

> **Status:** Phase 0 (the foundation) is **done and on `main`**: real login, database, seed
> data, uploads, sandbox payments, camera v1, nav, and a placeholder for every page. Rohan and
> Luna: open your runbook in [`lanes/`](./lanes) and start at "One-time setup".

> Read order for humans: your runbook in [`lanes/`](./lanes), then this file. LLMs get their
> rules from [`../AGENTS.md`](../AGENTS.md) and [`CONTRACTS.md`](./CONTRACTS.md).

---

## 1. What we're building

CivicBounty turns community cleanup into paid, verifiable work.

1. A **government** user marks a litter **hotspot** on the map, chooses a severity, gets a
   suggested **bounty price**, and **funds** it with a real (Stripe test mode) payment.
2. A **citizen** opens the hotspot, gets their **location verified**, takes a **before photo**
   with the in-app camera, cleans up, takes an **after photo**, and submits.
3. The submission gets an **AI verification score**.
4. The government user **reviews** the before/after photos side by side and either **marks it
   complete** (which **pays the citizen** through a Stripe transfer) or **flags** it with a note.

### Required features (from the team brief)

| Feature | Real or faked | Owner |
| --- | --- | --- |
| Camera system | **Real**: in-browser `getUserMedia`, captured to JPEG, uploaded | Carter |
| Separate logins for citizens and government | **Real**: email + password, hashed, JWT cookie, role-gated routes | Carter |
| Pricing system | **Real**: severity → suggested price, editable | Luna |
| Payment to users | **Real** (Stripe **sandbox**): Checkout funds the bounty, Connect transfer pays the citizen | Luna (screens) · Carter (Stripe wrapper + account) |
| Government can flag or mark complete | **Real** | Luna |
| GPS location validation | **Faked**: snaps to the hotspot location and shows "Location verified" (the server still runs a real geofence check on the coordinates) | Rohan |
| AI verification | **Faked**: 1.5-second "analyzing" delay, deterministic 85–97% score | Rohan |

### Why we're rebuilding from scratch

The previous repo was an export from OpenAI's "Sites" builder (Vinext + Cloudflare D1). The
source folders (`app/`, `lib/`, `db/`, `scripts/`) were never uploaded, nobody has a copy, and
its build tooling depended on files we can't recreate. A plain Next.js + SQLite app is faster to
build in one night and has no special infrastructure to debug at 3 AM.

---

## 2. How we avoid blocking each other

1. **Folder ownership.** Every file has exactly one owner ([CONTRACTS §2](./CONTRACTS.md#2-file-ownership)).
   If two people never edit the same file, merge conflicts can't happen.
2. **Contracts first.** Schema, types, auth helpers, the camera props and every API shape are
   fixed in Phase 0, so you can build against them before the other lanes exist.
3. **Stubs with final signatures.** Phase 0 ships a fake login (`/dev/login-as`) and a
   file-input camera that already have the real signatures. Real versions replace them later
   without anyone else changing a line.
4. **Everything up front.** All dependencies, all shadcn components, all DB columns, all nav
   links and all page stubs are created in Phase 0, so nobody needs to touch shared files later.
5. **Third parties stay in one lane.** Stripe lives only in `lib/payments.ts` (Carter). With no
   keys it runs in "simulated" mode, so Rohan and Luna need **no accounts, keys or external setup**.
6. **Mechanical guardrail.** `npm run check:lane -- <name>` fails if a branch touches files
   outside its lane. Each runbook has the LLM run it before finishing.

---

## 3. Timeline and gates

| Time (Sat → Sun) | Phase | Carter | Rohan | Luna |
| --- | --- | --- | --- | --- |
| ✅ done | **Phase 0: foundation** | Built: scaffold, schema, seed, real auth, uploads, payments wrapper, camera v1, stubs (§4) | | |
| **On push** | **Gate 1** | Push to `main`, announce in chat | Setup (§0 of runbook), then Task 0 (photos) | Setup (§0 of runbook), then Task 1 |
| Push → 11:00 PM | **Phase 1: parallel build** | Stripe sandbox account + Connect test account, real camera viewfinder, merging PRs | Tasks 1–6: list, detail, fakes, submissions API, submit flow, result | Tasks 1–6: pricing, dashboard, new hotspot, funding, review queue, review + payout |
| Every ~90 min | Merge checkpoints | Merges PRs, keeps `main` green | Small PRs | Small PRs |
| **11:00 PM** | **Gate 2: happy path** | The full demo flow works end to end on `main` with real login. Each lane's leftover work below the cut line gets **dropped** | ← | ← |
| 11 PM–1:30 AM | **Phase 2: polish** | Phone HTTPS tunnel, Stripe end-to-end on the demo machine, bug fixes | Task 7 (earnings), then Task 8 (polish) | Task 7 (polish) and fixes |
| **1:30–2:00 AM** | **Gate 3: feature freeze** | Full dry run of the demo script; record a **backup screen recording** | ← | ← |
| 2:00–7:00 AM | Sleep | Bug fixes only, and only if critical | | |
| 7:30–8:30 AM | Rehearse | `npm run db:reset`, fund one hotspot, rehearse twice, charge devices | Phone ready, logged in as Alex | Stripe dashboard tab open, Q&A notes |
| **9:00 AM** | **Demo** | | | |

---

## 4. Phase 0: foundation ✅ done

Everything below is in the foundation commit. It's kept here as a record of what exists.

- [x] Next.js 16.4 app (TypeScript, Tailwind 4, ESLint, App Router, import alias `@/*`), `cacheComponents` off
- [x] Dependencies: `drizzle-orm @libsql/client bcryptjs jose zod stripe sonner lucide-react` + shadcn's (`radix-ui`, `cn`, …); dev: `drizzle-kit tsx shadcn`
- [x] shadcn (radix base, nova preset, green civic theme) + every component in [CONTRACTS §5](./CONTRACTS.md#shadcn-components-installed-in-phase-0)
- [x] `db/schema.ts` exactly as in CONTRACTS §4, `drizzle.config.ts`, first migration in `drizzle/`
- [x] `scripts/seed.ts` + `scripts/reset-db.ts` (cross-platform) and npm scripts `db:generate`, `db:seed`, `db:reset`, `typecheck`, `check:lane`
- [x] `lib/db.ts`, `lib/types.ts`, `lib/http.ts`, `lib/format.ts`, `lib/session.ts`, `lib/auth.ts` (**real** JWT auth), `lib/payments.ts` (**sandbox** Stripe + simulated fallback)
- [x] `components/nav.tsx`, `status-badge.tsx`, `page-placeholder.tsx`, `camera/camera-capture.tsx` (v1: native camera)
- [x] `/login` (with demo-account buttons), `/signup`, `/dev/login-as`, landing page, `app/api/auth/*`, `app/api/uploads/*`
- [x] A placeholder page for **every** page in CONTRACTS §6, and a `501` stub for every API route, each with a `TODO(<owner>)` comment naming its task
- [x] `proxy.ts` role gating for `/citizen/*` and `/gov/*`
- [x] `.env.example` (works as-is), `.gitignore`, `.nvmrc`, PR template, `scripts/check-lane.mjs`
- [x] `npm run typecheck && npm run lint && npm run build` pass

Stubs exist for every file so **each lane's first commit only edits files it owns**. Nobody
has to create a file in a folder another lane will also create.

---

## 5. Lane summaries (full detail lives in each brief)

### Carter: foundation, login, camera, Stripe → [`lanes/carter-foundation.md`](./lanes/carter-foundation.md)
1. ~~Phase 0~~ ✅ · ~~Real auth~~ ✅ · ~~Payments wrapper~~ ✅
2. Stripe sandbox account + Connect test account (demo machine only)
3. Real `<CameraCapture>` viewfinder (same props)
4. Integration: merge PRs, keep `main` green, run the end-to-end flow at Gate 2
5. Demo machine: HTTPS tunnel, backup video

### Rohan: citizen app, with Codex → [`lanes/rohan-citizen.md`](./lanes/rohan-citizen.md)
0. Seed photos · 1. Hotspot list · 2. Hotspot detail · 3. Fake GPS + AI helpers ·
4. `POST /api/submissions` · 5. Submit flow · 6. Submission result · 7. Earnings ·
*cut line* · 8. Polish

### Luna: government app, with Claude Code → [`lanes/luna-government.md`](./lanes/luna-government.md)
1. Pricing + severity picker · 2. Dashboard · 3. Create hotspot · 4. Hotspot detail + funding ·
5. Review queue · 6. Review detail + approve/flag + payout · *cut line* · 7. Polish

---

## 6. Git workflow

1. `main` must always build and run. Never push directly to `main` (the foundation commit was the one exception).
2. Branch per task: `<name>/<task-number>-<slug>`, for example `rohan/5-submit-flow`, `luna/5-review-queue`.
3. Before opening a PR: `git fetch origin && git rebase origin/main`, then `npm run check:lane -- <name> && npm run typecheck && npm run lint`.
4. Open small PRs, at least one every ~90 minutes. Carter merges (squash merge).
5. **Only edit files you own.** The PR template asks you to confirm this.
6. If `package-lock.json` conflicts (it shouldn't, since only Carter adds deps): `git checkout --theirs package-lock.json && npm install`.
7. After pulling a change to `db/` or `drizzle/`: `npm run db:reset`. All data is seed data, so nothing is lost.
8. Never commit `.env.local`, `local.db`, or `uploads/`.

### Requesting a contract change

Post in chat:

```
CONTRACT CHANGE: <file> - <exact change> - <why> - blocking? yes/no
```

Carter replies with a PR link. In the meantime, keep a local stand-in **inside your own folder**
(for example a helper in `lib/citizen/`) and delete it once the shared version merges.

---

## 7. Definition of done for the demo

- [ ] Log in as government, create a hotspot, see the suggested price, fund it with Stripe sandbox card `4000 0000 0000 0077`, and the hotspot becomes **open**
- [ ] Log in as a citizen on a phone, open that hotspot, see **Location verified**, take before and after photos with the **real camera**, submit, and see an **AI score**
- [ ] Back as government, the submission is in the review queue with photos side by side; **Approve** creates a payout (a Stripe transfer shows in the dashboard, or "simulated" without keys) and the citizen's earnings show it as **paid**
- [ ] **Flag** works and shows the note to the citizen
- [ ] Logging in as the wrong role can't reach the other side's pages (`/gov` as a citizen redirects)
- [ ] `npm run db:reset` produces a clean demo state in under 10 seconds

---

## 8. Risks and fallbacks

| Risk | Decide by | Fallback |
| --- | --- | --- |
| Stripe Connect transfers fail | Gate 2 (11 PM) | `lib/payments.ts` already records a `simulated` payout when Stripe errors or keys are missing; the demo still shows "Paid $25" |
| Phone camera blocked (it needs HTTPS outside localhost) | Gate 3 | Demo the citizen side in a laptop browser at localhost, or use the file-input fallback, which opens the phone's native camera |
| Venue Wi-Fi drops (Stripe needs internet) | Morning | Phone hotspot; the backup video from Gate 3 |
| A lane falls behind | Gate 2 | Drop everything below its cut line; Carter picks up whatever blocks the demo path |
| Messy demo data | 7:30 AM | `npm run db:reset`, then fund one hotspot ahead of time |
| Conflicts in shared files | Every merge | Ownership rules; Carter resolves |

---

## 9. After the demo (for Q&A, not tonight)

- Real GPS: browser geolocation + freshness window + accuracy check against the hotspot geofence (the server already validates distance)
- Real AI: send both photos to a vision model, get a structured `{ completionPercent, reason }`, auto-flag anything below a threshold
- Photo integrity: EXIF timestamps, camera-only capture, duplicate-image detection
- Real payouts: Stripe Connect Express onboarding with Stripe-handled identity checks, live keys
- Hosting: Vercel + Turso (libSQL), S3 or R2 for photos
