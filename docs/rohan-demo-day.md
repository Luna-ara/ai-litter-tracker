# Rohan's demo guide

Thanks for being on the team, Rohan! The app is finished and tested. Follow these steps in order,
copying and pasting each command into your terminal. Allow about 30 minutes.

---

## Part 1: Get the app on your laptop

### Step 1: Save your own work

Open a terminal **in the project folder you've been working in** and run these one at a time:

```bash
git switch -c rohan/my-work
git add -A
git commit -m "Rohan's hackathon work"
git push -u origin rohan/my-work
```

If it says "nothing to commit", that's fine. Go to step 2.

### Step 2: Download the finished app into a new folder

Go to your Desktop in the terminal:

```bash
cd ~/Desktop
```

Then download the app and install it (this takes a minute or two):

```bash
git clone https://github.com/Luna-ara/ai-litter-tracker.git civicbounty-demo
cd civicbounty-demo
npm install
cp .env.example .env.local
```

### Step 3: Add the secret keys

Open the file `.env.local` (in the `civicbounty-demo` folder) in any text editor. Replace these
four lines with the ones Carter sent you, then save the file:

```
AUTH_SECRET=...
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
DEMO_CITIZEN_STRIPE_ACCOUNT_ID=acct_...
```

Don't share these keys anywhere public.

### Step 4: Check everything is ready

```bash
npm run db:reset
npm run demo:preflight
```

You want to see **"All set"** at the bottom. If you see a ✗, follow the hint under it, then run
`npm run demo:preflight` again. If you're stuck, send Carter a screenshot.

### Step 5: Start the app

```bash
npm run build
npm start
```

**Leave this terminal open.** The app runs as long as it's open.

---

## Part 2: Run through the demo

You'll use **two Chrome windows** side by side, one for each kind of user:

- **Window 1 (city staff):** a normal Chrome window
- **Window 2 (citizen):** an incognito window. Press **Ctrl+Shift+N** (Windows) or **Cmd+Shift+N** (Mac)

Have a cup or wrapper on the table to "clean up."

### Step 6: Log in to both windows

1. In **Window 1**, go to **http://localhost:3000/login** and click **Demo city staff**.
2. In **Window 2**, go to **http://localhost:3000/login** and click **Demo citizen**.

### Step 7: The city posts a bounty (Window 1)

1. Click **New hotspot**.
2. Title: `Cups by the demo table`. Neighborhood: `Riverside`.
3. Click **Medium**. The bounty fills in **$25.00**.
4. Click **Create hotspot**.
5. Click **Fund bounty · $25.00**.
6. On the Stripe page:
   - Click **Card**.
   - **Untick "Save my information with Link"** (important, or it asks for a phone number).
   - Card number `4000 0000 0000 0077`, expiry `12/34`, CVC `123`, ZIP `94103`.
   - Click **Pay**.
7. You're back in the app. It should say **"Live: visible to citizens"**.

### Step 8: The citizen cleans it up (Window 2)

1. Click **Hotspots** (refresh if needed) and open **Cups by the demo table**.
2. Click **Start cleanup**.
3. Click **Check my location**. It shows **Location verified**. Click **Continue**.
4. Click the camera box. If Chrome asks, click **Allow**.
5. Point the camera at the cup and press the round button, then **Use photo**. Click **Continue**.
6. Move the cup away. Take the after photo the same way, then **Use photo** and **Continue**.
7. Click **Submit cleanup**. After a second you'll see a **verification score**.

### Step 9: The city approves and pays (Window 1)

1. Click **Review queue**, then **Review**.
2. You'll see the before and after photos side by side.
3. Click **Approve & pay $25.00**.

### Step 10: The citizen gets paid (Window 2)

Click **Earnings**. It shows **Paid out $25.00**. That's the whole demo! 🎉

---

## Part 3: Before presenting

### Step 11: Reset to fresh data

Do this after every practice run, and once more right before you present:

1. Click the terminal running the app and press **Ctrl+C** to stop it.
2. Run:
   ```bash
   npm run db:reset
   npm start
   ```
3. Log both windows in again (step 6).

### Step 12: Practice what to say

| When | Say |
| --- | --- |
| Start | "Litter cleanup depends on volunteers nobody pays and nobody can verify. CivicBounty lets cities post paid bounties and pays citizens for verified cleanups." |
| Step 7 | "The city marks a hotspot, gets a suggested price, and funds it up front with Stripe, so the money is guaranteed." |
| Step 8 | "A citizen checks in at the location and takes before and after photos with the in-app camera. Our verification scores the cleanup." |
| Step 9 | "The city reviews the photos and approves, and the citizen is paid through Stripe. Suspicious work can be flagged instead." (Point at **Flag**.) |
| Step 10 | "Cleaner streets, verified work, and money going to the people who did it. That's CivicBounty." |

**If they ask:**
- *Is the GPS and AI real?* "For the demo they're simulated. The design checks the location against the hotspot and uses AI to compare the photos, and a person still approves every payment."
- *Is the money real?* "It's real Stripe in test mode. Going live just means switching to live keys."

---

## If something goes wrong

| Problem | Fix |
| --- | --- |
| `npm install` fails | Make sure you're in the `civicbounty-demo` folder. Check `node -v` shows 20 or higher |
| A page shows an error | Stop the app (Ctrl+C), run `npm run db:reset`, then `npm start` |
| The camera won't open | Click the camera icon in Chrome's address bar and choose **Allow**, or click **Upload instead** |
| Stripe won't let you pay | Make sure you clicked **Card** and unticked **Save my information with Link** |
| Anything else | Send Carter a screenshot |

You've got this! 🎤
