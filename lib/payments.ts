import Stripe from "stripe";

// The only file that talks to Stripe. Sandbox (test-mode) keys only.
// With no STRIPE_SECRET_KEY, or if Stripe errors, everything runs in "simulated" mode
// so the app keeps working. See docs/CONTRACTS.md §5.

const secretKey = process.env.STRIPE_SECRET_KEY;

if (secretKey && !secretKey.startsWith("sk_test_")) {
  throw new Error("CivicBounty only runs Stripe in sandbox mode. Use an sk_test_ key.");
}

const stripe = secretKey ? new Stripe(secretKey) : null;

export const paymentsMode: "stripe" | "simulated" = stripe ? "stripe" : "simulated";

function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

/** Start a payment that funds a hotspot's bounty. Redirect the browser to `url`. */
export async function createBountyCheckout(input: {
  hotspotId: string;
  title: string;
  amountCents: number;
}): Promise<{ url: string; sessionId: string }> {
  const returnUrl = `${appUrl()}/gov/hotspots/${input.hotspotId}`;

  if (stripe) {
    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: input.amountCents,
              product_data: { name: `Cleanup bounty: ${input.title}` },
            },
          },
        ],
        success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${returnUrl}?canceled=1`,
        metadata: { hotspotId: input.hotspotId },
      });
      if (session.url) return { url: session.url, sessionId: session.id };
    } catch (err) {
      console.error("[payments] Stripe Checkout failed, falling back to simulated", err);
    }
  }

  const sessionId = `sim_${crypto.randomUUID()}`;
  return { url: `${returnUrl}?session_id=${sessionId}`, sessionId };
}

/** True when the checkout session has been paid for this hotspot. */
export async function verifyBountyCheckout(sessionId: string, hotspotId: string): Promise<boolean> {
  if (sessionId.startsWith("sim_")) return true;
  if (!stripe) return false;
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session.payment_status === "paid" && session.metadata?.hotspotId === hotspotId;
  } catch (err) {
    console.error("[payments] Could not verify checkout", err);
    return false;
  }
}

/**
 * Pay a citizen their bounty through a Stripe Connect transfer.
 * Never throws: on any problem it returns status "simulated" so approvals always succeed.
 */
export async function sendBountyPayout(input: {
  amountCents: number;
  stripeAccountId: string | null;
  submissionId: string;
  hotspotId: string;
}): Promise<{ status: "sent" | "simulated"; transferId: string | null }> {
  if (stripe && input.stripeAccountId) {
    try {
      const transfer = await stripe.transfers.create({
        amount: input.amountCents,
        currency: "usd",
        destination: input.stripeAccountId,
        transfer_group: input.hotspotId,
        metadata: { submissionId: input.submissionId },
      });
      return { status: "sent", transferId: transfer.id };
    } catch (err) {
      console.error("[payments] Transfer failed, recording a simulated payout", err);
    }
  }
  return { status: "simulated", transferId: null };
}

/** Dashboard link for a transfer, for "View in Stripe" buttons. */
export function transferDashboardUrl(transferId: string): string {
  return `https://dashboard.stripe.com/test/connect/transfers/${transferId}`;
}
