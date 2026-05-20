"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function AnalyticsPageView({ gaId }: { gaId: string }) {
  const pathname    = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window.gtag !== "function") return;
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
    window.gtag("event", "page_view", {
      page_path:     url,
      page_location: window.location.href,
      page_title:    document.title,
      send_to:       gaId,
    });
  }, [pathname, searchParams, gaId]);

  return null;
}