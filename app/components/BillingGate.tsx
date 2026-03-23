"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function BillingGate() {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkBilling() {
      const res = await fetch("/api/billing/status", { cache: "no-store" });

      if (res.status === 401) {
        router.replace("/login");
        return;
      }

      const data = await res.json();

      if (!data.accessAllowed) {
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

  if (!ready) {
    return (
      <div className="mb-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
        Checking access…
      </div>
    );
  }

  return null;
}

