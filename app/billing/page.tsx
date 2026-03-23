"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

type BillingProfile = {
  subscription_status: string | null;
  trial_ends_at: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
};

type Profile = {
  role: string | null;
};

function prettyDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US");
}

function BillingPageContent() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [err, setErr] = useState("");
  const [billing, setBilling] = useState<BillingProfile | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [accessAllowed, setAccessAllowed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkoutState = searchParams.get("checkout");
  const next = searchParams.get("next") || "/dashboard";

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErr("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const res = await fetch("/api/billing/status", { cache: "no-store" });
      const data = await res.json();

      setBilling(data.billing ?? null);
      setProfile(data.profile ?? null);
      setAccessAllowed(!!data.accessAllowed);
      setIsAdmin(!!data.isAdmin);
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
      setErr(data.error ?? "Could not start checkout.");
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
      setErr(data.error ?? "Could not open billing portal.");
      setPortalLoading(false);
      return;
    }

    window.location.href = data.url;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0e0e10] p-10 text-white">
        <div className="mx-auto max-w-3xl">Loading billing…</div>
      </main>
    );
  }

  if (isAdmin) {
    return (
      <main className="min-h-screen bg-[#0e0e10] p-10 text-white">
        <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-8">
          <h1 className="text-3xl font-semibold">Admin Access</h1>
          <p className="mt-3 text-gray-400">
            Your account is marked as admin, so billing is bypassed.
          </p>

          <div className="mt-6 rounded-xl border border-white/10 bg-[#111827] p-5">
            <div className="text-sm text-white/60">Role</div>
            <div className="mt-2 text-2xl font-semibold">
              {profile?.role ?? "admin"}
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => router.push(next)}
              className="rounded bg-white px-4 py-2 text-black hover:bg-white/90"
            >
              Continue to App
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0e0e10] p-10 text-white">
      <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-3xl font-semibold">Billing</h1>
        <p className="mt-2 text-gray-400">
          Start your 14-day free trial to unlock DeckMargin.
        </p>

        {checkoutState === "success" ? (
          <div className="mt-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            Subscription started successfully. Your access should unlock in a few
            seconds.
          </div>
        ) : null}

        {checkoutState === "cancelled" ? (
          <div className="mt-4 rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
            Checkout was cancelled. You can start again whenever you’re ready.
          </div>
        ) : null}

        {err ? (
          <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {err}
          </div>
        ) : null}

        <div className="mt-6 rounded-xl border border-white/10 bg-[#111827] p-5">
          <div className="text-sm text-white/60">Subscription Status</div>
          <div className="mt-2 text-2xl font-semibold">
            {billing?.subscription_status ?? "none"}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <div>
              <div className="text-white/50">Trial Ends</div>
              <div>{prettyDate(billing?.trial_ends_at)}</div>
            </div>

            <div>
              <div className="text-white/50">Current Period End</div>
              <div>{prettyDate(billing?.current_period_end)}</div>
            </div>

            <div>
              <div className="text-white/50">Cancel At Period End</div>
              <div>{billing?.cancel_at_period_end ? "Yes" : "No"}</div>
            </div>

            <div>
              <div className="text-white/50">Access</div>
              <div>{accessAllowed ? "Allowed" : "Locked"}</div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {!accessAllowed ? (
            <button
              type="button"
              onClick={startCheckout}
              disabled={checkoutLoading}
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-60"
            >
              {checkoutLoading ? "Redirecting…" : "Start 14-Day Free Trial"}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => router.push(next)}
                className="rounded bg-white px-4 py-2 text-black hover:bg-white/90"
              >
                Continue to App
              </button>

              <button
                type="button"
                onClick={openPortal}
                disabled={portalLoading}
                className="rounded border border-white/20 px-4 py-2 text-white hover:bg-white/10 disabled:opacity-60"
              >
                {portalLoading ? "Opening…" : "Manage Billing"}
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function BillingPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#0e0e10] p-10 text-white">
          <div className="mx-auto max-w-3xl">Loading billing…</div>
        </main>
      }
    >
      <BillingPageContent />
    </Suspense>
  );
}

