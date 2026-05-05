"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type BillingStatus = {
  accessAllowed: boolean;
  subscription_status?: string | null;
};

export default function BillingGate() {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [trialExpired, setTrialExpired] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkBilling() {
      const res = await fetch("/api/billing/status", { cache: "no-store" });

      if (res.status === 401) {
        router.replace("/login");
        return;
      }

      const data: BillingStatus = await res.json();

      if (!data.accessAllowed) {
        // Detect specifically expired/cancelled trial vs never subscribed
        const isExpiredTrial =
          data.subscription_status === "canceled" ||
          data.subscription_status === "incomplete_expired" ||
          data.subscription_status === "unpaid" ||
          data.subscription_status === "past_due";

        if (isExpiredTrial && !cancelled) {
          setTrialExpired(true);
          return;
        }

        const next = encodeURIComponent(pathname || "/dashboard");
        router.replace(`/billing?next=${next}`);
        return;
      }

      if (!cancelled) {
        setReady(true);
      }
    }

    checkBilling();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  // Trial has expired — show inline banner instead of redirecting
  if (trialExpired) {
    return (
      <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-4">
        <div className="mb-1 text-sm font-semibold text-amber-300">
          Your 14-day free trial has ended
        </div>
        <div className="mb-3 text-sm text-amber-200/80">
          Add a payment method to continue using DeckMargin and keep all your
          quotes.
        </div>
        <a
          href="/billing"
          className="inline-block rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90"
        >
          Add payment method →
        </a>
      </div>
    );
  }

  // Still checking
  if (!ready) {
    return (
      <div className="mb-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
        Checking access…
      </div>
    );
  }

  return null;
}