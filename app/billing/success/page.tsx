"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function BillingSuccessPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fire Google Ads conversion event
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "conversion", {
        send_to: "AW-17331301984/17331301984", // 
      });
    }

    // Simulate short loading (optional UX polish)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-6">
      <div className="max-w-md w-full bg-zinc-900 rounded-2xl p-8 shadow-xl border border-zinc-800 text-center">
       
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto mb-6" />
            <h1 className="text-xl font-semibold mb-2">
              Finalizing your subscription...
            </h1>
            <p className="text-zinc-400 text-sm">
              Setting up your 14-day free trial.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-3">
              🎉 You're all set
            </h1>

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
      </div>
    </div>
  );
}

