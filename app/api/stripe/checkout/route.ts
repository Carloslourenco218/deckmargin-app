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

    const { data: billing } = await supabase
      .from("billing_profiles")
      .select("stripe_customer_id, subscription_status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (
      billing?.subscription_status === "active" ||
      billing?.subscription_status === "trialing"
    ) {
      return NextResponse.json({ error: "Already subscribed" }, { status: 400 });
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
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      payment_method_collection: "always",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
      subscription_data: {
        trial_period_days: 14,
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
      error instanceof Error ? error.message : "Failed to create checkout session";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

