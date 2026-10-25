# Full rehearsal checklist

Use this for the first rehearsal tomorrow. It walks through **every major feature** and says what
you should see at each step. The 3-minute script in [`DEMO.md`](./DEMO.md) §3 is a shorter path
through the same flow. Allow about 15 minutes.

**Before you start:** stop the app (Ctrl+C), then `npm run db:reset`, then `npm start`. Open two
windows at http://localhost:3000:

- **City window:** normal Chrome
- **Citizen window:** incognito (Ctrl+Shift+N, or Cmd+Shift+N on a Mac)

Have a small object on the table (a cup or a wrapper) to "clean up."

Tick each box as you go. If something doesn't match "Expect," note the step number and send it to Carter.

---

## A. Landing and login (2 min)

| # | Window | Do | Expect |
| --- | --- | --- | --- |
| A1 | Citizen | Open http://localhost:3000 | Landing page: "Get paid to make your neighborhood cleaner." with three steps |
| A2 | Citizen | **Log in** → type `alex@civicbounty.test` / `wrongpass` → Log in | Red toast: "Invalid email or password" |
| A3 | Citizen | Click **Demo citizen** | Lands on **Cleanups near you** with 3 photo cards ($25, $10, $50). Header shows "Citizen" |
| A4 | Citizen | Change the address bar to `localhost:3000/gov` | Sent back to `/citizen`: citizens can't see city pages |
| A5 | City | Log in, then click **Demo city staff** | Lands on **Dashboard**: Open bounties 3, Awaiting review 0, Paid out $0.00, Unfunded 1 |

## B. City: create, price and fund a bounty (3 min)

| # | Window | Do | Expect |
| --- | --- | --- | --- |
| B1 | City | **New hotspot** | The form, with location prefilled |
| B2 | City | Title `Cups by the demo table`, neighborhood `Riverside` | |
| B3 | City | Click **Small**, then **Medium**, then **Large** | Bounty changes to $10.00, then $25.00, then $50.00, with "Suggested for …" under it |
| B4 | City | Pick **Medium**. Leave the photo empty → **Create hotspot** | Toast; lands on the hotspot page with status **Unfunded** and a **Fund bounty · $25.00** button |
| B5 | City | **Fund bounty** | Stripe Checkout opens: "Cleanup bounty: Cups by the demo table", **$25.00**, Sandbox badge |
| B6 | City | Click **Card**. Untick **Save my information with Link**. Card `4000 0000 0000 0077`, expiry `12/34`, CVC `123`, name anything, ZIP `94103` → **Pay** | Back on the hotspot page; toast "Bounty funded"; status **Open**, "Live: visible to citizens" |
| B7 | City | **Dashboard** | Open bounties now **4**; the new hotspot is in the table |

## C. Citizen: clean up and submit (4 min)

| # | Window | Do | Expect |
| --- | --- | --- | --- |
| C1 | Citizen | **Hotspots** (refresh) | "Cups by the demo table" now appears (with a trash icon, since it has no photo) |
| C2 | Citizen | Open it | Detail page: $25.00 bounty, **Start cleanup** button |
| C3 | Citizen | **Start cleanup** → **Check my location** | ~1 second spinner, then a green check: "Location verified · Riverside · ±8 m" |
| C4 | Citizen | **Continue** → tap the camera box | Chrome asks for camera access → **Allow** → live webcam preview with a round shutter button |
| C5 | Citizen | Point at the cup → press the shutter | The still photo appears with **Use photo** and **Retake** |
| C6 | Citizen | **Retake**, shoot again, then **Use photo** | "Captured" badge; **Continue** turns on |
| C7 | Citizen | **Continue** → remove the cup → take the after photo → **Use photo** → **Continue** | Step 4 of 4: before and after thumbnails side by side |
| C8 | Citizen | **Submit cleanup** | "Verifying your cleanup…" for ~1.5 s, then **Cleanup submitted** with a score of 85–97% and "$25.00 · waiting for city review" |
| C9 | Citizen | **Hotspots** | "Cups by the demo table" is gone (it's claimed) |

## D. City: review, approve and pay (2 min)

| # | Window | Do | Expect |
| --- | --- | --- | --- |
| D1 | City | **Review queue** | One row: Alex Rivera, the AI score, **Review** |
| D2 | City | **Review** | Before and after photos side by side, AI score and reason, "checked in N m from the hotspot", Payout $25.00 "Paid via Stripe sandbox" |
| D3 | City | Click a photo | Opens full size; close it |
| D4 | City | **Approve & pay $25.00** | Toast "Approved: $25.00 sent to Alex Rivera"; back on an empty queue: "You're all caught up" |
| D5 | Citizen | **Earnings** | **Paid out $25.00**; the cleanup is listed as **Paid** |
| D6 | Browser | Stripe dashboard (sandbox) → Connect → Transfers | A new **$25.00** transfer to the demo citizen account |

## E. City: flag suspicious work (2 min)

| # | Window | Do | Expect |
| --- | --- | --- | --- |
| E1 | Citizen | Open **Bottles and wrappers at the bus stop** and submit a cleanup (repeat C3–C8; quick photos are fine) | Submitted |
| E2 | City | **Review queue** → **Review** → **Flag** | A dialog asks for a reason |
| E3 | City | Look at the **Flag cleanup** button before typing | It stays disabled until you type a reason |
| E4 | City | Reason: `After photo shows a different bus stop.` → confirm | Toast "Cleanup flagged"; the queue is empty |
| E5 | Citizen | **Earnings** → open the bus stop cleanup | Red banner "The city flagged this cleanup" with your note |
| E6 | Citizen | **Hotspots** | The bus stop is back (flagging reopens it so someone else can claim it) |

## F. Accounts and fallbacks (2 min)

| # | Window | Do | Expect |
| --- | --- | --- | --- |
| F1 | Citizen | Log out (icon at the top right) → **Sign up** → any name, a new email, password `cleanup123` | Lands on **Cleanups near you** as a new citizen |
| F2 | Citizen | On any submit page, click **Upload instead** and pick an image file | The photo uploads without the camera (the fallback if camera access is blocked) |
| F3 | Citizen | Go to `localhost:3000/nothing-here` | A friendly "Page not found" page with **Go home** |

## G. Reset for the real demo

1. Ctrl+C in the app terminal
2. `npm run db:reset`
3. `npm start`
4. Log both windows in again (city: **Demo city staff**; citizen: **Demo citizen**, incognito)

**Total checks: 35.** Everything above was verified overnight on a fresh clone. If a step fails
tomorrow, it's most likely setup (run `npm run demo:preflight`) or the Stripe Checkout gotchas in B6.
