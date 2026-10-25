# Rohan: demo day setup (about 20 minutes)

Hey Rohan! Thanks for jumping onto this team. **The app is finished and tested**, so this morning
you only need to save your work and get the finished version running on your laptop for the demo.

> **Easiest way:** open Codex and paste this:
> `I'm Rohan. Follow docs/rohan-demo-day.md step by step. Do step 1 in my current project folder and step 2 in a brand-new folder next to it. Stop and ask me whenever a step says "you".`
>
> (If you don't have the new repo files yet, just do the steps below by hand. Copy and paste each block.)

---

## Step 1: Save your own work (2 min)

In the folder where you've been working (your old copy of the project), run:

```bash
git switch -c rohan/my-work
git add -A
git commit -m "Rohan's hackathon work"
git push -u origin rohan/my-work
```

- If it says **"nothing to commit"**, that's fine. Move on.
- If `git switch` says the branch already exists, use `git switch rohan/my-work` instead.

This keeps your contributions in the project on GitHub under your name. **Don't change anything
else in this folder.** We use a fresh copy for the demo.

## Step 2: Get the finished app in a NEW folder (10 min)

Open a terminal **outside** your old project folder (for example your Desktop) and run:

```bash
git clone https://github.com/Luna-ara/ai-litter-tracker.git civicbounty-demo
cd civicbounty-demo
npm ci
cp .env.example .env.local
```

Now **you** open `.env.local` in any text editor (VS Code, Notepad, TextEdit) and replace these
four lines with the values Carter sent you in DM:

```
AUTH_SECRET=...
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
DEMO_CITIZEN_STRIPE_ACCOUNT_ID=acct_...
```

Save the file. **Never post these values anywhere public or commit them.** Then run:

```bash
npm run db:reset
npm run demo:preflight
```

`demo:preflight` checks everything and prints ✓ or ✗. Fix any ✗ (it tells you how), then run it
again until it says **"All set"**.

## Step 3: Start the app (2 min)

```bash
npm run build
npm start
```

Leave that terminal running. Open **http://localhost:3000** in Chrome.

## Step 4: Set up the two windows (2 min)

The demo uses one laptop and two Chrome windows, one per "person":

| Window | How to open it | Log in with | Who drives |
| --- | --- | --- | --- |
| **City staff** | Normal Chrome window | Click **Demo city staff** on the login page | Luna |
| **Citizen** | **Incognito window** (Ctrl+Shift+N, or Cmd+Shift+N on a Mac) | Click **Demo citizen** | You |

The incognito window matters: it keeps the two logins separate. In the citizen window, open any
cleanup → **Start cleanup**, and allow the camera when Chrome asks. Then click the back arrow.

## Step 5: Rehearse twice (15 min)

Follow the script in [`DEMO.md`](./DEMO.md) §3 with Luna. After each run, reset to fresh data:

```bash
# in the terminal running the app: press Ctrl+C to stop it, then
npm run db:reset
npm start
```

**Two Stripe tips for the "Fund bounty" step:** click **Card** first, and **untick "Save my
information with Link"**, otherwise it asks for a phone number. Use card
`4000 0000 0000 0077`, expiry `12/34`, CVC `123`, ZIP `94103`.

## If something goes wrong

| Problem | Fix |
| --- | --- |
| `npm ci` fails | Make sure you're inside `civicbounty-demo`, then try again. Node must be version 20.9 or newer: `node -v` |
| Login doesn't work | Stop the app (Ctrl+C), `npm run db:reset`, `npm start` |
| A page shows an error after resetting | You reset while the app was running. Stop it, reset, start again |
| "Payout simulated" instead of sent | Run `npm run demo:preflight` and message Carter |
| Camera doesn't open | Click the camera icon in Chrome's address bar → Allow. Or use "Upload instead" |
| Anything else | Message Carter in the group chat with a screenshot |

You've got this. The hard part is done, and you get to show it off. 🎤
