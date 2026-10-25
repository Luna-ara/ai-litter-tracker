# Demo day: Sunday, Oct 25, 2026, 9:00 AM (3 minutes + Q&A)

**Status: `main` is complete and verified.** Every feature works end to end, including real Stripe
sandbox funding and payouts. `main` is **frozen**: no merges before the demo unless they fix
something on the demo path.

| Role | Who | Where |
| --- | --- | --- |
| **Presenter**, citizen side | **Rohan** | Rohan's laptop runs the app. Citizen in an **incognito** Chrome window |
| Government side | **Luna** | Normal Chrome window on Rohan's laptop (city staff) |
| On call | **Carter** | Group chat until the demo ends |

**Rohan's setup instructions: [`rohan-demo-day.md`](./rohan-demo-day.md)** (save his work to
`rohan/my-work`, fresh clone, `.env.local`, `npm run demo:preflight`, build, start).

## 1. Morning timeline

| Time | Who | What |
| --- | --- | --- |
| 7:00–7:30 | Rohan | [`rohan-demo-day.md`](./rohan-demo-day.md) steps 1–4. Carter is on chat for any ✗ in `demo:preflight` |
| 7:30–8:15 | Rohan + Luna | First run: the full feature checklist in [`REHEARSAL.md`](./REHEARSAL.md) (~15 min). Second run: the 3-minute script in §3. `npm run db:reset` between them (stop the app first) |
| 8:15–8:30 | Rohan | Record a backup screen video of one full run (§5) |
| 8:30 | Rohan | Stop the app, `npm run db:reset`, `npm start`, log both windows in, close other tabs, charge the laptop |

## 2. What was verified overnight

- `npm run verify:demo`: 20/20 API checks pass, including a real `payout sent` Stripe transfer
- Full browser rehearsal on the production build: create hotspot → pay $25 via Stripe Checkout →
  live → citizen check-in → camera before/after → submit with AI score → approve & pay → earnings
  show $25.00 paid; flag with a note → the citizen sees the note; new citizen signup. Zero console errors.
- Every page renders at phone (390 px) and laptop width with no layout overflow
- The Stripe sandbox account can receive transfers, with about $190 of payout balance

## 3. The script

| Time | Who / window | Action | Say |
| --- | --- | --- | --- |
| 0:00–0:20 | Rohan | Landing page (or the citizen list) | "Litter cleanup depends on volunteers nobody pays and nobody can verify. CivicBounty lets cities post paid bounties and pays citizens for verified cleanups." |
| 0:20–1:00 | Luna, city window | **New hotspot** → title "Cups by the demo table", neighborhood → pick **Medium** ($25 appears) → **Create** → **Fund bounty** → Stripe: click **Card**, untick **Save with Link**, card `4000 0000 0000 0077`, `12/34`, `123`, ZIP `94103` → Pay | "The city marks a hotspot, our pricing suggests a fair bounty, and they fund it up front through Stripe, so the money is guaranteed." |
| 1:00–2:05 | Rohan, citizen window | Refresh **Hotspots** → open the new one → **Start cleanup** → **Check my location** → before photo of a cup on the table → remove the cup → after photo → **Submit** → score appears | "A citizen checks in at the location and takes before and after photos with the in-app camera. Our verification scores the cleanup." |
| 2:05–2:45 | Luna, city window | **Review queue** → open the submission → photos side by side → **Approve & pay $25.00** | "The city reviews the photos and approves, and the citizen is paid instantly through Stripe Connect. Suspicious work can be flagged instead." (Point at **Flag**.) |
| 2:45–3:00 | Rohan, citizen window | **Earnings**: "Paid out $25.00" | "Cleaner streets, verified work, and money going to the people who did it. That's CivicBounty." |

## 4. Q&A prep

- **How do you prevent fraud?** Three layers: a GPS geofence (simulated in this demo; the server
  already rejects submissions too far from the hotspot), an AI before/after comparison
  (simulated), and a required city review with flagging. Next up: photo timestamps and
  duplicate-image detection.
- **Is the AI real?** Not in this demo. The design sends both photos to a vision model that returns
  a completion percentage, and a human still approves every payment.
- **Is the money real?** It's real Stripe, in sandbox mode: Checkout collects the bounty and
  Connect transfers it to the citizen. Going live means live keys; Stripe handles identity
  checks and taxes.
- **Who funds bounties?** City cleanup budgets, business districts, local sponsors. Bounties are
  funded up front and only paid out after approval.
- **What if two people clean the same spot?** The first valid submission claims the hotspot. If
  it's flagged, the hotspot reopens.
- **What did you build it with?** Next.js, React, SQLite + Drizzle, shadcn/ui, Stripe Checkout +
  Connect, and an in-browser camera.

## 5. Backup plan

- If anything breaks live, play the backup video and narrate.
- If Stripe or the Wi-Fi fails, use a phone hotspot. As a last resort, remove the Stripe keys from
  `.env.local` and restart: payments switch to "simulated" and the whole flow still works.

## 6. Optional: citizen side on a phone

Only if setup finishes early. Run `npx cloudflared tunnel --url http://localhost:3000`, set the
printed `https://…trycloudflare.com` URL as `NEXT_PUBLIC_APP_URL` in `.env.local`, then
`npm run build && npm start`. Open the tunnel URL on the phone and log in as the demo citizen.
The laptop-only setup above is the safe default.

## 7. Merge and maintenance notes (Carter)

- `npm run verify:demo` checks the whole demo path against a running app (stop the app,
  `npm run db:reset`, start it, then run the check; it leaves test data behind).
- Rohan's own work lands on `rohan/my-work` as his contribution. It is **not** merged before the
  demo. Review it together afterwards.
