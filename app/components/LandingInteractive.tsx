"use client";

/**
 * LandingInteractive: thin client component for everything needing the browser.
 * - UTM param injection into CTA links
 * - Scroll effects (sticky bar, nav blur)
 * - Fade-up IntersectionObserver
 * - GA4 CTA click events
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
    // ── UTM params → signup URL ───────────────────────────────────────────
    const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
    const params = new URLSearchParams();
    utmKeys.forEach((k) => {
      const v = searchParams.get(k);
      if (v) params.set(k, v);
    });
    const qs = params.toString();
    const signupUrl = qs ? `/signup?${qs}` : "/signup";

    document.querySelectorAll<HTMLAnchorElement>("[data-cta]").forEach((el) => {
      el.href = signupUrl;
      const loc = el.dataset.cta ?? "unknown";
      el.onclick = () => fireCtaEvent(loc);
    });

    // ── Scroll: sticky bar + nav blur ─────────────────────────────────────
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
    onScroll();

    // ── Mobile hamburger menu ─────────────────────────────────────────────
    const hamburger  = document.getElementById("lp-hamburger");
    const mobileMenu = document.getElementById("lp-mobile-menu");

    const toggleMenu = (open: boolean) => {
      hamburger?.classList.toggle("open", open);
      mobileMenu?.classList.toggle("open", open);
      hamburger?.setAttribute("aria-expanded", String(open));
      mobileMenu?.setAttribute("aria-hidden", String(!open));
      document.body.style.overflow = open ? "hidden" : "";
    };

    hamburger?.addEventListener("click", () => {
      const isOpen = mobileMenu?.classList.contains("open") ?? false;
      toggleMenu(!isOpen);
    });

    // Close menu when any link inside it is clicked
    mobileMenu?.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => toggleMenu(false));
    });

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
      document.body.style.overflow = "";
    };
  }, [searchParams]);

  return null;
}
