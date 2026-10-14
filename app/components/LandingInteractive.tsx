"use client";

/**
 * LandingInteractive: thin client component for everything needing the browser.
 * - UTM param injection into CTA links
 * - Scroll effects (sticky bar, nav blur)
 * - Fade-up IntersectionObserver
 * - GA4 CTA click events
 * - Custom cursor (dot + trailing ring, desktop fine-pointer only)
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

    // ── Custom cursor (fine-pointer desktops only) ────────────────────────
    const isFinePonter = window.matchMedia("(pointer: fine)").matches;
    const dot  = document.getElementById("dm-cursor-dot");
    const ring = document.getElementById("dm-cursor-ring");

    let ringX = 0, ringY = 0;
    let mouseX = 0, mouseY = 0;
    let rafId = 0;
    let entered = false;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animateRing = () => {
      ringX = lerp(ringX, mouseX, 0.12);
      ringY = lerp(ringY, mouseY, 0.12);
      if (ring) ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      rafId = requestAnimationFrame(animateRing);
    };

    if (isFinePonter && dot && ring) {
      const onMove = (e: MouseEvent) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
        if (!entered) {
          entered = true;
          dot.style.opacity = "1";
          ring.style.opacity = "1";
        }
      };

      const onEnterInteractive = () => ring?.classList.add("hovering");
      const onLeaveInteractive = () => ring?.classList.remove("hovering");

      document.addEventListener("mousemove", onMove);
      document.querySelectorAll("a, button, [role='button']").forEach((el) => {
        el.addEventListener("mouseenter", onEnterInteractive);
        el.addEventListener("mouseleave", onLeaveInteractive);
      });

      animateRing();

      return () => {
        window.removeEventListener("scroll", onScroll);
        observer.disconnect();
        document.removeEventListener("mousemove", onMove);
        document.querySelectorAll("a, button, [role='button']").forEach((el) => {
          el.removeEventListener("mouseenter", onEnterInteractive);
          el.removeEventListener("mouseleave", onLeaveInteractive);
        });
        cancelAnimationFrame(rafId);
      };
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, [searchParams]);

  return null;
}
