import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabaseServer";

export const runtime = "nodejs";

function toIsoOrNull(unixSeconds?: number | null) {
  if (!unixSeconds) return null;
  return new Date(unixSeconds * 1000).toISOString();
}

async function upsertBillingFromSubscription(
  subscription: Stripe.Subscription,
  fallbackUserId?: string | null
) {
  const supabase = await createClient();

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const userId =
    subscription.metadata?.user_id ||
    fallbackUserId ||
    null;

  let finalUserId = userId;

  if (!finalUserId && customerId) {
    const { data: existing } = await supabase
      .from("billing_profiles")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();

    finalUserId = existing?.user_id ?? null;
  }

  if (!finalUserId) return;

  await supabase.from("billing_profiles").upsert({
    user_id: finalUserId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    subscription_status: subscription.status,
current_period_end: toIsoOrNull((subscription as any).current_period_end),
    updated_at: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Invalid webhook signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (
          session.mode === "subscription" &&
          session.subscription &&
          session.customer
        ) {
          const subscription = await stripe.subscriptions.retrieve(
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id
          );

          await upsertBillingFromSubscription(
            subscription,
            session.client_reference_id
          );
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await upsertBillingFromSubscription(subscription);
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Webhook handler failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

