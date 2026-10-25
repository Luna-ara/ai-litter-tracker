// Read-only readiness check for the demo laptop: npm run demo:preflight
// Checks .env.local, the Stripe sandbox setup and the local database, and says how to fix
// anything that's wrong. It never changes anything.

import { existsSync } from "node:fs";
import Stripe from "stripe";

let failures = 0;
const ok = (msg: string) => console.log(`✓ ${msg}`);
const bad = (msg: string, fix: string) => {
  failures++;
  console.log(`✗ ${msg}\n    → ${fix}`);
};
const warn = (msg: string, fix: string) => console.log(`! ${msg}\n    → ${fix}`);

async function main() {
  console.log("CivicBounty demo pre-flight\n");

  // 1. Environment
  if (!existsSync(".env.local")) {
    bad(".env.local is missing", "Run: cp .env.example .env.local, then paste in the values Carter sent you");
    return;
  }
  const env = process.env;

  const secret = env.AUTH_SECRET ?? "";
  if (!secret) bad("AUTH_SECRET is empty", "Paste the AUTH_SECRET value Carter sent you into .env.local");
  else if (secret.startsWith("dev-only")) warn("AUTH_SECRET is still the example value", "Fine for practice; for the demo paste the AUTH_SECRET Carter sent you");
  else ok("AUTH_SECRET is set");

  const sk = env.STRIPE_SECRET_KEY ?? "";
  const pk = env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
  const acct = env.DEMO_CITIZEN_STRIPE_ACCOUNT_ID ?? "";
  if (!sk) bad("STRIPE_SECRET_KEY is empty", "Paste the sk_test_… value Carter sent you (payments would be 'simulated' without it)");
  else if (!sk.startsWith("sk_test_")) bad("STRIPE_SECRET_KEY is not a sandbox key", "It must start with sk_test_. Never use a live key");
  else ok("STRIPE_SECRET_KEY is a sandbox key");
  if (!pk.startsWith("pk_test_")) bad("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is missing or wrong", "Paste the pk_test_… value Carter sent you");
  else ok("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is a sandbox key");
  if (!acct.startsWith("acct_")) bad("DEMO_CITIZEN_STRIPE_ACCOUNT_ID is missing or wrong", "Paste the acct_… value Carter sent you, then run npm run db:reset");
  else ok("DEMO_CITIZEN_STRIPE_ACCOUNT_ID is set");

  const appUrl = env.NEXT_PUBLIC_APP_URL ?? "";
  if (!appUrl) bad("NEXT_PUBLIC_APP_URL is empty", "Set it to http://localhost:3000 (or your tunnel URL if demoing on a phone)");
  else ok(`NEXT_PUBLIC_APP_URL is ${appUrl}`);

  // 2. Stripe sandbox
  if (sk.startsWith("sk_test_")) {
    try {
      const stripe = new Stripe(sk);
      const balance = await stripe.balance.retrieve();
      const usd = balance.available.find((b) => b.currency === "usd")?.amount ?? 0;
      ok("Stripe keys work");
      if (usd < 5000) {
        warn(`Stripe sandbox balance is $${(usd / 100).toFixed(2)} (each payout is $10–$50)`, "Ask Carter to top it up, otherwise payouts show as 'simulated'");
      } else ok(`Stripe sandbox balance is $${(usd / 100).toFixed(2)}`);

      if (acct.startsWith("acct_")) {
        const v2 = (stripe as unknown as { v2: { core: { accounts: { retrieve: (id: string, p: object) => Promise<{ configuration?: { recipient?: { capabilities?: { stripe_balance?: { stripe_transfers?: { status?: string } } } } } }> } } } }).v2.core.accounts;
        const account = await v2.retrieve(acct, { include: ["configuration.recipient"] }).catch(() => null);
        const status = account?.configuration?.recipient?.capabilities?.stripe_balance?.stripe_transfers?.status;
        if (status === "active") ok("Demo citizen's Stripe account can receive payouts");
        else if (account) bad(`Demo citizen's Stripe account can't receive transfers (${status ?? "not set up"})`, "Message Carter");
        else bad("Couldn't find the demo citizen's Stripe account", "Check DEMO_CITIZEN_STRIPE_ACCOUNT_ID matches what Carter sent you");
      }
    } catch (err) {
      bad("Stripe rejected the key", `Re-copy STRIPE_SECRET_KEY from Carter's message (${err instanceof Error ? err.message : err})`);
    }
  }

  // 3. Database
  const dbFile = (env.DATABASE_URL ?? "file:local.db").replace(/^file:/, "");
  if (!existsSync(dbFile)) {
    bad("The database hasn't been created", "Run: npm run db:reset");
  } else {
    const { db } = await import("@/lib/db");
    const { users, hotspots } = await import("@/db/schema");
    const people = await db.select().from(users);
    const spots = await db.select().from(hotspots);
    const alex = people.find((u) => u.email === "alex@civicbounty.test");
    if (!alex) bad("Demo accounts are missing", "Run: npm run db:reset");
    else if (acct && alex.stripeAccountId !== acct) bad("The demo citizen isn't linked to the Stripe account", "Run: npm run db:reset (after pasting the acct_ value)");
    else ok(`Database ready: ${people.length} demo accounts, ${spots.length} hotspots`);
  }

  if (!existsSync(".next/BUILD_ID")) warn("No production build yet", "Run: npm run build, then npm start");
}

main()
  .catch((err) => bad("Pre-flight crashed", String(err)))
  .finally(() => {
    console.log(failures ? `\n${failures} problem(s) to fix. Run npm run demo:preflight again afterwards.` : "\nAll set. Start the app with: npm start");
    process.exit(failures ? 1 : 0);
  });
