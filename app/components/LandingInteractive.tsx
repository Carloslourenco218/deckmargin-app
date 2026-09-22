"use client";

/**
 * LandingInteractive — thin client component that handles everything needing
 * the browser: UTM param injection into CTA links, scroll effects (sticky bar,
 * nav border), fade-up animations, and GA4 CTA click events.
 *
 * The parent page (app/page.tsx) is a Server Component so all static HTML is
 * SSR'd and crawlable. This component renders null — it only manipulates DOM.
 */

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

function fireCtaEvent(location: string) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "start_free_trial_click", {
      event_category: "CTA",
      event_label: "Start your 14-day free trial",
      cta_location: location,
    });
  }
}

export default function LandingInteractive() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // ── Build signup URL preserving UTM params ────────────────────────────
    const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
    const params = new URLSearchParams();
    utmKeys.forEach((k) => {
      const v = searchParams.get(k);
      if (v) params.set(k, v);
    });
    const qs = params.toString();
    const signupUrl = qs ? `/signup?${qs}` : "/signup";

    // Update every CTA anchor and attach GA4 click tracking
    document.querySelectorAll<HTMLAnchorElement>("[data-cta]").forEach((el) => {
      el.href = signupUrl;
      const loc = el.dataset.cta ?? "unknown";
      // Use anonymous function to avoid duplicate listeners on re-runs
      el.onclick = () => fireCtaEvent(loc);
    });

    // ── Scroll: sticky bar + nav border ──────────────────────────────────
    const stickyBar = document.getElementById("lp-sticky");
    const nav       = document.getElementById("lp-nav");
    const hero      = document.getElementById("lp-hero");

    const onScroll = () => {
      const heroBottom = hero?.getBoundingClientRect().bottom ?? 999;
      const pastHero   = heroBottom < 0;
      if (stickyBar) {
        stickyBar.classList.toggle("visible", pastHero);
        stickyBar.setAttribute("aria-hidden", String(!pastHero));
      }
      nav?.classList.toggle("scrolled", window.scrollY > 40);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // run once on mount to set correct initial state

    // ── Fade-up IntersectionObserver ──────────────────────────────────────
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("visible");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, [searchParams]);

  return null;
}
