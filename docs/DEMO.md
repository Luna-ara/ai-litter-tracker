# Demo script: 3 minutes + Q&A

**When:** Sunday, Oct 25, 2026, 9:00 AM
**Roles:** one presenter drives the laptop (government side), one holds the phone (citizen side).
The screen should be mirrored or visible to the judges.

## Morning checklist (7:30–8:30 AM)

- [ ] `git pull` on the demo laptop, `npm ci`, `npm run build`
- [ ] `npm run db:reset`, then `npm start`
- [ ] Tunnel running (`npx cloudflared tunnel --url http://localhost:3000`) and `NEXT_PUBLIC_APP_URL` set to it
- [ ] Phone: open the tunnel URL, log in as **Alex**, allow camera access once ahead of time
- [ ] Laptop: log in as **Parks Department** in one tab; Stripe dashboard (test mode) → Connect → Transfers in another
- [ ] A cup or wrapper on the table as the "litter"
- [ ] Backup screen recording ready to play if anything breaks
- [ ] Devices charged, Wi-Fi tested, phone hotspot as a backup

## The run

| Time | Who / screen | Action | Say |
| --- | --- | --- | --- |
| 0:00–0:20 | Laptop, landing page | none | "Litter cleanup depends on volunteers nobody pays and nobody can verify. CivicBounty lets cities post paid bounties and pays citizens for verified cleanups." |
| 0:20–1:00 | Laptop, `/gov/hotspots/new` | Fill in the title, pick **Medium** → $25 appears, create, **Fund bounty**, Stripe Checkout with card `4000 0000 0000 0077` | "The city marks a hotspot and picks a severity, and our pricing suggests a bounty. They fund it up front through Stripe, so the money is guaranteed." |
| 1:00–2:05 | Phone, `/citizen` | Open the new hotspot → **Start cleanup** → **Check my location** → before photo of the cup → remove the cup → after photo → **Submit** → AI score appears | "A citizen nearby sees it, checks in with GPS, and takes before and after photos with the in-app camera. Our verification scores the cleanup." |
| 2:05–2:45 | Laptop, `/gov/review` | Open the submission → photos side by side → **Approve & pay** → switch to the Stripe tab showing the $25 transfer | "The city reviews the photos side by side and approves, and the citizen is paid instantly through Stripe Connect. If something looks off, they can flag it." (Point at **Flag**.) |
| 2:45–3:00 | Phone, `/citizen/earnings` | Show "Paid $25.00" | "Cleaner streets, verified work, and money going to the people who did it. That's CivicBounty." |

## Q&A prep

- **How do you prevent fraud?** Three layers: a GPS geofence and freshness check (simulated in
  this demo, though the server already checks distance), an AI before/after comparison
  (simulated), and a required government review with flagging. Next up: EXIF and timestamp
  checks and duplicate-image detection.
- **Is the AI real?** Not in this demo. The design sends both photos to a vision model that
  returns a completion percentage and a reason, and a human still approves every payment.
- **Is the money real?** Yes, it's real Stripe in test mode: Checkout collects the bounty and
  Connect transfers it. Going live means switching keys; Stripe handles identity checks and taxes.
- **Who funds bounties?** City cleanup budgets, business improvement districts, local sponsors.
  Bounties are funded up front and held until a cleanup is approved.
- **What if two people clean the same spot?** The first valid submission claims the hotspot
  (`in_review`). If it gets flagged, the hotspot reopens.
- **What did you build in this hackathon?** All of it, overnight: Next.js, SQLite + Drizzle,
  shadcn/ui, Stripe Checkout + Connect, an in-browser camera.
