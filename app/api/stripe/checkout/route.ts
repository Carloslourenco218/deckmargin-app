import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

    if (
      !appUrl ||
      (!appUrl.startsWith("http://") && !appUrl.startsWith("https://"))
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid NEXT_PUBLIC_APP_URL. It must start with http:// or https://",
        },
        { status: 500 }
      );
    }

    const priceId = process.env.STRIPE_PRICE_ID?.trim();

    if (!priceId || !priceId.startsWith("price_")) {
      return NextResponse.json(
        {
          error:
            "Invalid STRIPE_PRICE_ID. It must be a Stripe Price ID starting with price_.",
        },
        { status: 500 }
      );
    }

    const { data: billing } = await supabase
      .from("billing_profiles")
      .select("stripe_customer_id, subscription_status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (
      billing?.subscription_status === "active" ||
      billing?.subscription_status === "trialing"
    ) {
      return NextResponse.json(
        { error: "Already subscribed" },
        { status: 400 }
      );
    }

    let customerId = billing?.stripe_customer_id ?? null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      });

      customerId = customer.id;

      await supabase.from("billing_profiles").upsert({
        user_id: user.id,
        stripe_customer_id: customerId,
        updated_at: new Date().toISOString(),
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: user.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // No card required to start the trial
      payment_method_collection: "if_required",
      success_url: `${appUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/billing`,
      subscription_data: {
        trial_period_days: 14,
        // When trial ends with no payment method, cancel immediately
        trial_settings: {
          end_behavior: {
            missing_payment_method: "cancel",
          },
        },
        metadata: {
          user_id: user.id,
        },
      },
      metadata: {
        user_id: user.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create checkout session";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}