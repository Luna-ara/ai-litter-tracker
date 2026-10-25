# Demo day: Sunday, Oct 25, 2026, 9:00 AM (3 minutes + Q&A)

| Role | Who | Device |
| --- | --- | --- |
| **Presenter** + citizen side | **Rohan** | **Rohan's laptop runs the app** (the demo machine), and his phone does the citizen flow |
| Government side | **Luna** | Drives the city-staff screens in a browser on Rohan's laptop (or her own laptop pointed at the tunnel URL) |
| Integration + on call | **Carter** | Merges everything 7:00–8:00 AM, then on chat until the demo ends |

---

## 1. Morning timeline

| Time | Who | What |
| --- | --- | --- |
| By **7:00** | Rohan, Luna | Every finished task is pushed **with a PR open** (even if it isn't perfect) |
| 7:00–7:45 | Carter | Merge PRs in the order in §2, run `npm run verify:demo` after each batch, and ping owners about failures |
| 7:45 | Carter | Post "main is frozen" in chat. Nothing else merges after this unless it fixes the demo path. |
| 7:45–8:15 | Rohan | Demo machine setup (§3) |
| 8:15–8:45 | Rohan + Luna | Two full rehearsals of the script (§4), then `npm run db:reset` and pre-fund one hotspot |
| 8:45 | Everyone | Phones charged, tabs open, backup video ready |

## 2. Merge order (Carter)

Merge in dependency order, so each step can be checked as it lands. After each group:
`git switch main && git pull && npm ci && npm run db:reset`, start the app, then run `npm run verify:demo`.

1. Carter: camera (#3) and the morning kit
2. Rohan 0–3 (photos, list, detail, fakes) and Luna 1–3 (pricing, dashboard, new hotspot). These never conflict across lanes.
3. Rohan 4 (submissions API) and Luna 4 (funding)
4. Rohan 5–6 (submit flow, result) and Luna 5–6 (review queue, approve/pay)
5. Rohan 7 (earnings) and anything else

`npm run verify:demo` prints ✓/✗ for every step of the demo path and every page still showing a
placeholder, and names the owner and task for each failure. If a lane is missing by 7:45,
**cut that scene from the script** (§4 notes what to skip) rather than writing it at 8 AM.

## 3. Demo machine setup (Rohan's laptop)

> **Rohan:** paste this into Codex: `I'm Rohan. Follow docs/DEMO.md §3 to set up this laptop as
> the demo machine. Don't change any code.` Codex runs the commands; you do the browser and phone parts.

1. Get the latest code and a clean database:
   ```bash
   git switch main && git pull
   npm ci
   ```
2. In `.env.local`, set the four values **Carter sent you by DM** (never commit them):
   `AUTH_SECRET`, `STRIPE_SECRET_KEY` (`sk_test_…`), `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (`pk_test_…`),
   `DEMO_CITIZEN_STRIPE_ACCOUNT_ID` (`acct_…`).
3. Start the tunnel so the phone gets HTTPS (needed for the camera):
   ```bash
   npx cloudflared tunnel --url http://localhost:3000
   ```
   Copy the `https://….trycloudflare.com` URL it prints into `NEXT_PUBLIC_APP_URL` in `.env.local`.
   Leave this terminal running.
4. In a second terminal, build and run the production app:
   ```bash
   npm run db:reset
   npm run build
   npm start
   ```
5. In a third terminal: `npm run verify:demo`. It should print "Demo path is green", and the
   payout line should say `payout sent` (not `simulated`). Then **run `npm run db:reset` again**,
   because the check leaves test data behind, and restart `npm start`.
6. **Phone:** open the tunnel URL, log in with **Demo citizen**, open any hotspot's submit page
   and allow camera access once.
7. **Laptop browser:** log in with **Demo city staff** at the tunnel URL. In a second tab, open the
   Stripe dashboard (Connect → Transfers). Ask Carter for a team invite if you can't see it.
8. Pre-fund one hotspot so the story starts with something live: as city staff, open the unfunded
   "Litter along the playground fence" hotspot → **Fund bounty** → card `4000 0000 0000 0077`,
   any future date, any CVC.

**If the tunnel or the phone fails:** do the citizen side in a laptop browser at
`http://localhost:3000`. The camera works on localhost, or use "Upload instead".

## 4. The script

| Time | Who / screen | Action | Say |
| --- | --- | --- | --- |
| 0:00–0:20 | Rohan, landing page | none | "Litter cleanup depends on volunteers nobody pays and nobody can verify. CivicBounty lets cities post paid bounties and pays citizens for verified cleanups." |
| 0:20–1:00 | Luna, `/gov/hotspots/new` | Fill in the title, pick **Medium** → $25 appears, create, **Fund bounty**, pay with `4000 0000 0000 0077` | "The city marks a hotspot and picks a severity, and our pricing suggests a bounty. They fund it up front through Stripe, so the money is guaranteed." |
| 1:00–2:05 | Rohan, phone `/citizen` | Open the new hotspot → **Start cleanup** → **Check my location** → before photo of a cup on the table → remove the cup → after photo → **Submit** → AI score appears | "A citizen nearby checks in with GPS and takes before and after photos with the in-app camera. Our verification scores the cleanup." |
| 2:05–2:45 | Luna, `/gov/review` | Open the submission → photos side by side → **Approve & pay** → switch to the Stripe tab showing the $25 transfer | "The city reviews the photos and approves, and the citizen is paid through Stripe Connect. Suspicious work can be flagged instead." (Point at **Flag**.) |
| 2:45–3:00 | Rohan, phone `/citizen/earnings` | Show "Paid $25.00" | "Cleaner streets, verified work, and money going to the people who did it. That's CivicBounty." |

**If a lane isn't finished:** without Luna's Task 4, start from the pre-funded seeded hotspot and
skip "fund it". Without Rohan's Task 7, end on the submission result page instead of earnings.
Without the Stripe tab, show "Paid" in the app and say "settled through Stripe Connect".

## 5. Q&A prep

- **How do you prevent fraud?** Three layers: a GPS geofence check (simulated in this demo; the
  server already checks distance), an AI before/after comparison (simulated), and a required city
  review with flagging. Next up: photo timestamps and duplicate-image detection.
- **Is the AI real?** Not in this demo. The design sends both photos to a vision model that
  returns a completion percentage and a reason, and a human still approves every payment.
- **Is the money real?** It's real Stripe, in sandbox mode: Checkout collects the bounty and
  Connect transfers it. Going live means live keys; Stripe handles identity checks and taxes.
- **Who funds bounties?** City cleanup budgets, business districts, local sponsors. Bounties are
  funded up front and held until a cleanup is approved.
- **What if two people clean the same spot?** The first valid submission claims the hotspot. If
  it's flagged, the hotspot reopens.
- **What did you build?** All of it, overnight: Next.js, SQLite + Drizzle, shadcn/ui, Stripe
  Checkout + Connect, an in-browser camera.

## 6. Backup plan

- Record a screen video of one full run as soon as the demo path is green (on Rohan's machine
  after §3). If anything breaks live, play it and narrate.
- Phone hotspot if the venue Wi-Fi fails (Stripe and the tunnel need internet).
