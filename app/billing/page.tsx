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
  if (!value) return "-";
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
      <main className="min-h-screen bg-[#FAFAF8] p-10 text-[#1D2C4B]">
        <div className="mx-auto max-w-3xl">Loading billing...</div>
      </main>
    );
  }

  if (isAdmin) {
    return (
      <main className="min-h-screen bg-[#FAFAF8] p-10 text-[#1D2C4B]">
        <div className="mx-auto max-w-3xl rounded-2xl border border-[#E7E5E0] bg-white p-8">
          <h1 className="text-3xl font-semibold text-[#1D2C4B]">Admin Access</h1>
          <p className="mt-3 text-[#6B7280]">
            Your account is marked as admin, so billing is bypassed.
          </p>

          <div className="mt-6 rounded-xl border border-[#E7E5E0] bg-[#F3F2EF] p-5">
            <div className="text-sm text-[#6B7280]">Role</div>
            <div className="mt-2 text-2xl font-semibold text-[#1D2C4B]">
              {profile?.role ?? "admin"}
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => router.push(next)}
              className="rounded-full bg-[#FBB944] px-4 py-2 text-[#1D2C4B] font-bold hover:bg-[#E8A730]"
            >
              Continue to App
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAF8] p-10 text-[#1D2C4B]">
      <div className="mx-auto max-w-3xl rounded-2xl border border-[#E7E5E0] bg-white p-8">
        <h1 className="text-3xl font-semibold text-[#1D2C4B]">Billing</h1>
        <p className="mt-2 text-[#6B7280]">
          Start your 14-day free trial to unlock DeckMargin.
        </p>

        {checkoutState === "success" ? (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            Subscription started successfully. Your access should unlock in a few
            seconds.
          </div>
        ) : null}

        {checkoutState === "cancelled" ? (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Checkout was cancelled. You can start again whenever you&apos;re ready.
          </div>
        ) : null}

        {err ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        ) : null}

        <div className="mt-6 rounded-xl border border-[#E7E5E0] bg-[#F3F2EF] p-5">
          <div className="text-sm text-[#6B7280]">Subscription Status</div>
          <div className="mt-2 text-2xl font-semibold text-[#1D2C4B]">
            {billing?.subscription_status ?? "none"}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <div>
              <div className="text-[#6B7280]">Trial Ends</div>
              <div className="text-[#2A2E36]">{prettyDate(billing?.trial_ends_at)}</div>
            </div>

            <div>
              <div className="text-[#6B7280]">Current Period End</div>
              <div className="text-[#2A2E36]">{prettyDate(billing?.current_period_end)}</div>
            </div>

            <div>
              <div className="text-[#6B7280]">Cancel At Period End</div>
              <div className="text-[#2A2E36]">{billing?.cancel_at_period_end ? "Yes" : "No"}</div>
            </div>

            <div>
              <div className="text-[#6B7280]">Access</div>
              <div className="text-[#2A2E36]">{accessAllowed ? "Allowed" : "Locked"}</div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {!accessAllowed ? (
            <button
              type="button"
              onClick={startCheckout}
              disabled={checkoutLoading}
              className="rounded-full bg-[#FBB944] px-4 py-2 text-[#1D2C4B] font-bold hover:bg-[#E8A730] disabled:opacity-60"
            >
              {checkoutLoading ? "Redirecting..." : "Start 14-Day Free Trial"}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => router.push(next)}
                className="rounded-full bg-[#FBB944] px-4 py-2 text-[#1D2C4B] font-bold hover:bg-[#E8A730]"
              >
                Continue to App
              </button>

              <button
                type="button"
                onClick={openPortal}
                disabled={portalLoading}
                className="rounded-lg border border-[#E7E5E0] px-4 py-2 text-[#2A2E36] hover:bg-[#F3F2EF] disabled:opacity-60"
              >
                {portalLoading ? "Opening..." : "Manage Billing"}
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
        <main className="min-h-screen bg-[#FAFAF8] p-10 text-[#1D2C4B]">
          <div className="mx-auto max-w-3xl">Loading billing...</div>
        </main>
      }
    >
      <BillingPageContent />
    </Suspense>
  );
}
