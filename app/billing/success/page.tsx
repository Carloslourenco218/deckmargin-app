"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type PollStatus = "polling" | "ready" | "timeout";

export default function BillingSuccessPage() {
  const [status, setStatus] = useState<PollStatus>("polling");

  useEffect(() => {
    // Fire Google Ads conversion event
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "conversion", {
        send_to: "AW-17331301984/17331301984",
      });
    }

    let attempts = 0;
    const maxAttempts = 20; // 20 × 1.5s = 30 seconds max wait
    let cancelled = false;

    async function poll() {
      if (cancelled) return;

      try {
        const res = await fetch("/api/billing/status", { cache: "no-store" });
        const data = await res.json();

        if (data.accessAllowed) {
          if (!cancelled) setStatus("ready");
          return;
        }
      } catch {
        // Network error — keep trying
      }

      attempts++;

      if (attempts >= maxAttempts) {
        if (!cancelled) setStatus("timeout");
        return;
      }

      // Try again in 1.5 seconds
      setTimeout(poll, 1500);
    }

    // Start polling after a brief initial delay
    const initial = setTimeout(poll, 1000);

    return () => {
      cancelled = true;
      clearTimeout(initial);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-6">
      <div className="max-w-md w-full bg-zinc-900 rounded-2xl p-8 shadow-xl border border-zinc-800 text-center">

        {status === "polling" && (
          <>
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto mb-6" />
            <h1 className="text-xl font-semibold mb-2">
              Finalizing your subscription...
            </h1>
            <p className="text-zinc-400 text-sm">
              Setting up your 14-day free trial.
            </p>
          </>
        )}

        {status === "ready" && (
          <>
            <h1 className="text-2xl font-bold mb-3">🎉 You're all set</h1>
            <p className="text-zinc-400 mb-6">
              Your 14-day free trial has started.
              <br />
              You now have full access to DeckMargin.
            </p>
            <Link
              href="/dashboard"
              className="inline-block w-full bg-blue-600 hover:bg-blue-700 transition rounded-lg py-3 font-semibold"
            >
              Go to Dashboard
            </Link>
            <p className="text-xs text-zinc-500 mt-4">
              You can cancel anytime before your trial ends.
            </p>
          </>
        )}

        {status === "timeout" && (
          <>
            <h1 className="text-2xl font-bold mb-3">🎉 You're all set</h1>
            <p className="text-zinc-400 mb-6">
              Your 14-day free trial has started.
              <br />
              It may take a moment for your access to activate.
            </p>
            <Link
              href="/dashboard"
              className="inline-block w-full bg-blue-600 hover:bg-blue-700 transition rounded-lg py-3 font-semibold"
            >
              Go to Dashboard
            </Link>
            <p className="text-xs text-zinc-500 mt-4">
              If you see a billing screen, wait 30 seconds and refresh.
            </p>
          </>
        )}

      </div>
    </div>
  );
}