# Carter's runbook: foundation, login, camera, Stripe, integration

You own every shared file, the two "must be real" cross-cutting features (**login** and the
**camera**), the only third-party integration (**Stripe sandbox**), and merging. Rohan and Luna
build in their own folders against what's here.

## ✅ Already done (in the foundation commit)

| Area | Files | Notes |
| --- | --- | --- |
| App scaffold | Next.js 16.4, React 19, Tailwind 4, shadcn (radix, nova preset), green civic theme | `cacheComponents` off on purpose |
| Data | `db/schema.ts`, `drizzle/0000_*.sql`, `lib/db.ts`, `lib/types.ts`, `scripts/seed.ts`, `scripts/reset-db.ts` | `npm run db:reset` |
| **Real auth** | `lib/session.ts` (JWT), `lib/auth.ts`, `proxy.ts`, `app/api/auth/*`, `/login` (with demo buttons), `/signup`, `/dev/login-as` | bcrypt + HS256 JWT cookie `cb_session`, role gating in the proxy |
| Uploads | `app/api/uploads/route.ts`, `app/api/uploads/[name]/route.ts` | Saved to `./uploads/` (gitignored), served by the API route |
| **Payments (sandbox)** | `lib/payments.ts` | Checkout, verify, transfer; refuses non-`sk_test_` keys; falls back to simulated |
| Camera v1 | `components/camera/camera-capture.tsx` | Native camera through a file input; final props |
| Shared UI | `components/nav.tsx`, `brand.tsx`, `status-badge.tsx`, `page-placeholder.tsx`, `logout-button.tsx`, `auth/auth-form.tsx`, `app/page.tsx` (landing) | |
| Stubs | Every page and route Rohan and Luna own | Each has a `TODO(<name>)` comment pointing to its task |
| Guardrails | `scripts/check-lane.mjs` (`npm run check:lane -- rohan`), PR template, `AGENTS.md`, `CLAUDE.md` | |

Verified: typecheck, lint and production build are clean; auth, role redirects, tampered
cookies, uploads, path traversal, duplicate signup and the dev-only route were smoke-tested
against `next start`.

---

## Your remaining tasks

### 1. ✅ Push and kick off (done)
- Push to `main`. Post in the team chat: "Foundation is on main. Clone, follow your runbook in
  `docs/lanes/`, and start with Task 1 (Rohan: Task 0, the photos)."
- Be around for the first 30 minutes in case setup breaks on someone's machine.

### 2. Stripe sandbox setup (~30 min; only the demo machine needs it). **Manual: you do this in the Stripe dashboard**
1. Create a Stripe account → make sure **Test mode / Sandbox** is on → Developers → API keys.
   Put `sk_test_…` / `pk_test_…` in **your** `.env.local` only.
2. Connect → get started (platform). Create an **Express** connected account for the demo
   citizen and complete the hosted onboarding with Stripe's test data (see
   https://docs.stripe.com/connect/testing for the current test phone, SMS code, SSN, address
   and bank values). Copy the `acct_…` into `DEMO_CITIZEN_STRIPE_ACCOUNT_ID`, then `npm run db:reset`.
3. Transfers need an *available* platform balance. Pay test Checkouts with card
   **`4000 0000 0000 0077`** (funds become available right away).
4. Check it: as city staff, fund the unfunded seeded hotspot (needs Luna's Task 4), then approve a
   cleanup (needs Luna's Task 6). A transfer should appear under Connect → Transfers.

### 3. ✅ Real camera viewfinder (PR `carter/3-camera-viewfinder`)
Try it at `/dev/camera` (dev only; log in first). The spec below is kept for reference.
Replace the **inside** of `components/camera/camera-capture.tsx`. **The props must not change.**
- States: `idle → requesting → live → captured → uploading → done`, plus `error`
- `navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 } }, audio: false })`
- `<video autoPlay playsInline muted />` (iOS needs `playsInline` + `muted`)
- Shutter: draw the frame to a canvas (long edge ≤ 1280 px) → `canvas.toBlob(cb, "image/jpeg", 0.75)` → preview with **Retake** / **Use photo**
- Use photo → upload the same way v1 does → `onCapture(url)`
- Stop all tracks after capture and on unmount
- **Keep v1's file input as the fallback** when `getUserMedia` is missing or throws (permission denied, or plain http on a phone)

### 4. Merge and integrate (continuous, plus the 11 PM checkpoint)
- Review PRs: the template checklist, and `npm run check:lane -- <name>` on their branch. Squash merge.
- At 11 PM: `npm run db:reset`, then run the ROADMAP §7 "definition of done" end to end. File bugs to owners.
- Fix anything shared (helpers, nav, theme) and handle `CONTRACT CHANGE` requests fast. Always update `docs/CONTRACTS.md` in the same PR.

### 5. Demo machine (after 11 PM)
- `npx cloudflared tunnel --url http://localhost:3000` → set `NEXT_PUBLIC_APP_URL` to the tunnel
  URL → restart → test the camera on a phone. (`allowedDevOrigins` already covers `*.trycloudflare.com`.)
- Prefer `npm run build && npm start` for the demo, with a fresh `npm run db:reset` beforehand.
- Record the backup video at the 2 AM freeze. Morning checklist: `docs/DEMO.md`.

---

## Prompt for your LLM (Claude Code reads CLAUDE.md → AGENTS.md automatically)

```
I'm Carter; I own the foundation lane of CivicBounty (see docs/lanes/carter-foundation.md).
Task: <e.g. "3. Real camera viewfinder">. docs/CONTRACTS.md is binding: never change an exported
signature, DB column or API shape without also updating CONTRACTS.md, and don't touch Rohan's
or Luna's folders. Run typecheck, lint and build when done and list the files changed.
```
