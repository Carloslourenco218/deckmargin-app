"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

type BillingProfile = {
  subscription_status: string | null;
  current_period_end: string | null;
};

export default function BillingPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [err, setErr] = useState("");
  const [billing, setBilling] = useState<BillingProfile | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErr("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("billing_profiles")
        .select("subscription_status,current_period_end")
        .eq("user_id", user.id)
        .maybeSingle();

      setBilling(data ?? null);
      setLoading(false);
    }

    load();
  }, [router, supabase]);

  async function startCheckout() {
    setCheckoutLoading(true);
    setErr("");

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
    });

    const data = await res.json();

    if (!res.ok) {
      setErr(data.error ?? "Could not start checkout");
      setCheckoutLoading(false);
      return;
    }

    window.location.href = data.url;
  }

  async function openPortal() {
    setPortalLoading(true);
    setErr("");

    const res = await fetch("/api/stripe/portal", {
      method: "POST",
    });

    const data = await res.json();

    if (!res.ok) {
      setErr(data.error ?? "Could not open billing portal");
      setPortalLoading(false);
      return;
    }

    window.location.href = data.url;
  }

  const active =
    billing?.subscription_status === "trialing" ||
    billing?.subscription_status === "active";

  return (
    <main className="min-h-screen bg-[#0e0e10] p-10 text-white">
      <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-3xl font-semibold">Billing</h1>
        <p className="mt-2 text-gray-400">
          Start your DeckMargin subscription with a 14-day free trial.
        </p>

        {err ? (
          <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {err}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-6 text-sm text-white/70">Loading billing status…</div>
        ) : (
          <>
            <div className="mt-6 rounded-xl border border-white/10 bg-[#111827] p-5">
              <div className="text-sm text-white/60">Current Status</div>
              <div className="mt-2 text-2xl font-semibold">
                {billing?.subscription_status ?? "not started"}
              </div>

              <div className="mt-2 text-sm text-white/60">
                {billing?.current_period_end
                  ? `Current period ends: ${new Date(
                      billing.current_period_end
                    ).toLocaleDateString()}`
                  : "No active billing period yet."}
              </div>
            </div>

            {!active ? (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={startCheckout}
                  disabled={checkoutLoading}
                  className="rounded bg-blue-500 px-5 py-3 text-white hover:bg-blue-600 disabled:opacity-60"
                >
                  {checkoutLoading
                    ? "Redirecting…"
                    : "Start 14-Day Free Trial"}
                </button>
              </div>
            ) : (
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="rounded bg-white px-5 py-3 text-black hover:bg-white/90"
                >
                  Go to Dashboard
                </button>

                <button
                  type="button"
                  onClick={openPortal}
                  disabled={portalLoading}
                  className="rounded border border-white/20 px-5 py-3 hover:bg-white/10 disabled:opacity-60"
                >
                  {portalLoading ? "Opening…" : "Manage Billing"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

