"use client";

import { useEffect } from "react";
import Link from "next/link";

// ── HELPERS ──────────────────────────────────────────────────────────────────

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load: ${src}`));
    document.head.appendChild(s);
  });
}

// ── LAYOUT ───────────────────────────────────────────────────────────────────

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ── Nav scroll ──────────────────────────────────────────────────────────
    const nav = document.getElementById("rs-nav");
    const onScroll = () => {
      if (nav) nav.classList.toggle("rs-nav-scrolled", window.scrollY > 40);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // ── Fade-up scroll reveal ─────────────────────────────────────────────
    if (!prefersReducedMotion) {
      const fadeEls = document.querySelectorAll(".rs-fade-up");
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const delay = parseFloat((entry.target as HTMLElement).dataset.delay || "0");
              setTimeout(() => entry.target.classList.add("rs-visible"), delay * 1000);
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      fadeEls.forEach((el) => io.observe(el));
    } else {
      document.querySelectorAll(".rs-fade-up").forEach((el) => el.classList.add("rs-visible"));
    }

    // ── Lenis smooth scroll (CDN) ─────────────────────────────────────────
    if (!prefersReducedMotion) {
      loadScript("https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js").then(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Lenis = (window as any).Lenis;
        if (!Lenis) return;
        const lenis = new Lenis({ duration: 1.2 });
        const raf = (time: number) => { lenis.raf(time); requestAnimationFrame(raf); };
        requestAnimationFrame(raf);
      }).catch(() => {});
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      {/* ── GLOBAL STYLES ── */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif !important;
          background: #FAFAF8 !important;
          color: #2A2E36 !important;
          line-height: 1.7;
          -webkit-font-smoothing: antialiased;
        }
        img { max-width: 100%; display: block; }
        a { color: inherit; text-decoration: none; }

        :root {
          --bg: #FAFAF8;
          --bg-2: #fff;
          --bg-3: #F3F2EF;
          --orange: #FBB944;
          --navy: #1D2C4B;
          --green: #10B981;
          --text-1: #1D2C4B;
          --text-2: #2A2E36;
          --text-3: #6B7280;
          --border: #E7E5E0;
          --radius: 12px;
        }

        /* Nav */
        .rs-nav {
          position: sticky; top: 0; z-index: 100;
          background: rgba(250,250,248,0.0);
          transition: background 0.3s, backdrop-filter 0.3s, border-color 0.3s, box-shadow 0.3s;
          border-bottom: 1px solid transparent;
        }
        .rs-nav.rs-nav-scrolled {
          background: rgba(250,250,248,0.92);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom-color: #E7E5E0;
          box-shadow: 0 1px 8px rgba(29,44,75,0.06);
        }
        .rs-nav-inner {
          max-width: 1100px; margin: 0 auto; padding: 0 24px;
          height: 64px; display: flex; align-items: center; justify-content: space-between;
          gap: 24px;
        }
        .rs-nav-links {
          display: flex; gap: 28px; align-items: center;
        }
        .rs-nav-links a {
          font-size: 14px; color: #2A2E36; transition: color 0.2s;
        }
        .rs-nav-links a:hover, .rs-nav-links a.active { color: #1D2C4B; }
        .rs-nav-cta {
          font-size: 13px; font-weight: 700;
          background: #FBB944; color: #1D2C4B !important;
          padding: 10px 20px; border-radius: 999px;
          transition: opacity 0.2s; white-space: nowrap;
        }
        .rs-nav-cta:hover { opacity: 0.88 !important; color: #1D2C4B !important; }

        /* Page shell */
        .rs-page { min-height: 100vh; display: flex; flex-direction: column; background: #FAFAF8; }
        .rs-main { flex: 1; padding: 56px 24px 96px; }

        /* Article */
        .rs-article { max-width: 720px; margin: 0 auto; }

        /* Breadcrumb */
        .rs-breadcrumb {
          font-size: 13px; color: var(--text-3); margin-bottom: 32px;
          display: flex; align-items: center; gap: 6px;
        }
        .rs-breadcrumb a { color: var(--text-3); transition: color 0.2s; }
        .rs-breadcrumb a:hover { color: var(--text-2); }
        .rs-breadcrumb span { color: var(--text-3); }

        /* Article header */
        .rs-article-header { margin-bottom: 40px; }
        .rs-article-header h1 {
          font-size: clamp(26px, 4vw, 38px);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.2;
          color: var(--text-1);
          margin-bottom: 16px;
        }
        .rs-article-meta {
          font-size: 13px; color: var(--text-3);
          display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
        }
        .rs-article-meta span { display: flex; align-items: center; gap: 4px; }

        /* Article body typography */
        .rs-body { color: #2A2E36; }
        .rs-body h2 {
          font-size: clamp(18px, 2.5vw, 22px);
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--text-1);
          margin: 44px 0 14px;
          line-height: 1.3;
        }
        .rs-body h3 {
          font-size: 17px; font-weight: 600;
          color: var(--text-1); margin: 32px 0 10px;
        }
        .rs-body p { margin-bottom: 20px; }
        .rs-body ul, .rs-body ol { padding-left: 20px; margin-bottom: 20px; }
        .rs-body li { margin-bottom: 8px; }
        .rs-body strong { color: var(--text-1); font-weight: 600; }
        .rs-body a { color: var(--navy); text-decoration: underline; text-underline-offset: 3px; }
        .rs-body a:hover { color: #0f1d38; }
        .rs-body hr { border: none; border-top: 1px solid var(--border); margin: 40px 0; }

        /* Table */
        .rs-table-wrap { overflow-x: auto; margin: 24px 0 28px; border-radius: var(--radius); }
        .rs-table {
          width: 100%; border-collapse: collapse;
          font-size: 14px;
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-radius: var(--radius);
        }
        .rs-table th {
          padding: 11px 16px; text-align: left;
          background: var(--bg-3); color: var(--text-3);
          font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;
          border-bottom: 1px solid var(--border);
        }
        .rs-table td {
          padding: 12px 16px; color: var(--text-2);
          border-bottom: 1px solid var(--border);
        }
        .rs-table tr:last-child td { border-bottom: none; }
        .rs-table tr:hover td { background: rgba(29,44,75,0.02); }

        /* Placeholder / draft notice */
        .rs-placeholder {
          background: rgba(251,185,68,0.08);
          border: 1px solid rgba(251,185,68,0.3);
          border-radius: 8px;
          padding: 14px 18px;
          font-size: 13px;
          color: #92650A;
          margin: 8px 0 16px;
          font-style: italic;
        }

        /* CTA block */
        .rs-cta {
          margin-top: 56px;
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 36px 32px;
          text-align: center;
        }
        .rs-cta h3 { font-size: 20px; font-weight: 700; color: var(--text-1); margin-bottom: 10px; }
        .rs-cta p { font-size: 15px; color: var(--text-3); margin-bottom: 24px; }
        .rs-cta-btn {
          display: inline-block;
          background: #FBB944; color: #1D2C4B !important;
          font-size: 15px; font-weight: 700;
          padding: 14px 28px; border-radius: 999px;
          transition: opacity 0.2s;
          text-decoration: none !important;
        }
        .rs-cta-btn:hover { opacity: 0.88; color: #1D2C4B !important; text-decoration: none !important; }
        .rs-cta-micro { font-size: 12px; color: var(--text-3); margin-top: 10px; margin-bottom: 0; }

        /* Related reading */
        .rs-related {
          margin-top: 48px;
          padding-top: 32px;
          border-top: 1px solid var(--border);
        }
        .rs-related-title {
          font-size: 12px; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--text-3); margin-bottom: 12px;
        }
        .rs-related ul { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 8px; }
        .rs-related li a { font-size: 14px; color: var(--navy); }
        .rs-related li a:hover { color: #0f1d38; text-decoration: underline; }

        /* Footer */
        .rs-footer {
          background: #141F38; border-top: 1px solid rgba(255,255,255,0.08);
          padding: 28px 24px;
        }
        .rs-footer-inner {
          max-width: 1100px; margin: 0 auto;
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 12px;
        }
        .rs-footer-copy { font-size: 13px; color: rgba(255,255,255,0.35); }
        .rs-footer-links { display: flex; gap: 20px; flex-wrap: wrap; }
        .rs-footer-links a { font-size: 13px; color: rgba(255,255,255,0.45); transition: color 0.2s; }
        .rs-footer-links a:hover { color: #fff; }

        /* Index page */
        .rs-index { max-width: 800px; margin: 0 auto; }
        .rs-index-header { margin-bottom: 48px; }
        .rs-index-header h1 {
          font-size: clamp(28px, 4vw, 40px); font-weight: 800;
          letter-spacing: -0.03em; color: var(--text-1); margin-bottom: 12px;
        }
        .rs-index-header p { font-size: 16px; color: var(--text-3); line-height: 1.6; }
        .rs-article-list { display: flex; flex-direction: column; gap: 2px; }
        .rs-article-card {
          display: block;
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 22px 24px;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s, transform 0.2s;
          text-decoration: none;
          margin-bottom: 10px;
        }
        .rs-article-card:hover {
          border-color: #1D2C4B;
          background: #fff;
          box-shadow: 0 4px 20px rgba(29,44,75,0.07);
          transform: translateY(-1px);
        }
        .rs-article-card-title { font-size: 16px; font-weight: 600; color: var(--text-1); margin-bottom: 6px; }
        .rs-article-card-desc { font-size: 14px; color: var(--text-3); line-height: 1.55; }

        /* Fade-up animation for article sections */
        .rs-fade-up {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .rs-fade-up.rs-visible { opacity: 1; transform: none; }

        @media (prefers-reduced-motion: reduce) {
          .rs-fade-up { opacity: 1; transform: none; transition: none; }
          .rs-article-card { transition: border-color 0.2s; }
          .rs-article-card:hover { transform: none; box-shadow: none; }
        }

        @media (max-width: 640px) {
          .rs-nav-links { gap: 16px; }
          .rs-nav-links a:not(.rs-nav-cta) { display: none; }
          .rs-main { padding: 40px 16px 80px; }
          .rs-cta { padding: 28px 20px; }
          .rs-article-card { padding: 18px 16px; }
        }
      `}</style>

      <div className="rs-page">

        {/* ── NAV ── */}
        <nav id="rs-nav" className="rs-nav" aria-label="Main navigation">
          <div className="rs-nav-inner">
            <Link href="/" aria-label="DeckMargin home" style={{ fontSize: "18px", fontWeight: 700, color: "#1D2C4B", letterSpacing: "-0.02em", textDecoration: "none" }}>
              DeckMargin
            </Link>
            <div className="rs-nav-links">
              <Link href="#how-it-works">How It Works</Link>
              <Link href="#features">Features</Link>
              <Link href="#pricing">Pricing</Link>
              <Link href="/resources">Resources</Link>
              <Link href="/login">Log in</Link>
              <Link href="/signup" className="rs-nav-cta">Start free trial</Link>
            </div>
          </div>
        </nav>

        {/* ── PAGE CONTENT ── */}
        <main className="rs-main">
          {children}
        </main>

        {/* ── FOOTER ── */}
        <footer className="rs-footer">
          <div className="rs-footer-inner">
            <p className="rs-footer-copy">© 2026 DeckMargin. All rights reserved.</p>
            <div className="rs-footer-links">
              <Link href="/resources">Resources</Link>
              <Link href="/login">Log in</Link>
              <Link href="/signup">Start free trial</Link>
              <a href="mailto:carlos.lourenco@deckmargin.com">Contact</a>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
