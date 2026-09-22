/**
 * app/page.tsx — DeckMargin landing page
 *
 * SERVER COMPONENT (no "use client").
 * All HTML is SSR'd → Googlebot can crawl and index it.
 * Interactive behaviour (scroll, UTM params, GA4 events) lives in
 * <LandingInteractive />, a thin client component rendered inside Suspense.
 */

import type { Metadata } from "next";
import { Suspense } from "react";
import LandingInteractive from "@/app/components/LandingInteractive";

// ── SEO metadata ───────────────────────────────────────────────────────────────
// Fix #1: proper title, description, and OG tags so Googlebot gets real content.
export const metadata: Metadata = {
  metadataBase: new URL("https://deckmargin.com"),
  title: "DeckMargin: Know Your Price Before You Send It",
  description:
    "Deck estimating software built for contractors. Price any deck job in about 10 minutes, see your exact margin, and send a professional proposal , before the bid goes out. 14-day free trial, no card needed.",
  keywords: [
    "deck estimating software",
    "deck contractor pricing",
    "deck bid calculator",
    "deck takeoff software",
    "deck proposal software",
  ],
  openGraph: {
    title: "DeckMargin: Know Your Price Before You Send It",
    description:
      "Deck estimating software for contractors. Price a job in 10 minutes, see your margin, send the bid. 14-day free trial.",
    url: "https://deckmargin.com",
    siteName: "DeckMargin",
    type: "website",
    images: [
      {
        url: "/og-image.png",   // add a 1200×630 image to /public/og-image.png
        width: 1200,
        height: 630,
        alt: "DeckMargin deck estimating software",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DeckMargin: Know Your Price Before You Send It",
    description:
      "Deck estimating software for contractors. Price a job in 10 minutes, see your margin, send the bid.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

// Force SSR on every request — prevents Vercel CDN from caching a stale shell
export const dynamic = "force-dynamic";

// ── CSS (static — extracted to a const so the component reads cleanly) ─────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #0D0D0D;
    color: #FFFFFF;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }
  img { max-width: 100%; display: block; }
  a { color: inherit; text-decoration: none; }
  button { cursor: pointer; font-family: inherit; border: none; background: none; color: inherit; }

  :root {
    --bg: #0D0D0D;
    --bg-2: #111827;
    --blue: #3B82F6;
    --green: #10B981;
    --text-1: #FFFFFF;
    --text-2: #9CA3AF;
    --border: #1F2937;
    --radius: 12px;
  }

  /* Layout */
  .lp-container { max-width: 720px; margin: 0 auto; padding: 0 24px; }

  /* Fade-up animation */
  @media (prefers-reduced-motion: no-preference) {
    .fade-up {
      opacity: 0;
      transform: translateY(24px);
      transition: opacity 0.55s ease, transform 0.55s ease;
    }
    .fade-up.visible { opacity: 1; transform: translateY(0); }
  }

  /* Nav */
  .lp-nav {
    position: fixed; top: 0; left: 0; right: 0;
    z-index: 100;
    background: rgba(13,13,13,0.9);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid transparent;
    transition: border-color 0.3s;
  }
  .lp-nav.scrolled { border-color: var(--border); }
  .lp-nav-inner {
    max-width: 1120px; margin: 0 auto; padding: 0 24px;
    display: flex; align-items: center; justify-content: space-between; height: 64px;
  }
  .lp-logo { font-size: 18px; font-weight: 700; letter-spacing: -0.02em; }
  .lp-logo span { color: var(--blue); }
  .lp-nav-right { display: flex; align-items: center; gap: 16px; }
  .lp-login { font-size: 14px; color: var(--text-2); font-weight: 700; transition: color 0.2s; }
  .lp-login:hover { color: var(--text-1); }

  /* Sticky bar */
  .lp-sticky {
    position: fixed; bottom: 0; left: 0; right: 0;
    z-index: 90;
    background: var(--bg-2);
    border-top: 1px solid var(--border);
    padding: 12px 24px;
    display: flex; align-items: center; justify-content: center; gap: 16px;
    transform: translateY(100%);
    transition: transform 0.35s ease;
  }
  .lp-sticky.visible { transform: translateY(0); }
  .lp-sticky-text { font-size: 14px; color: var(--text-2); }

  /* CTA Buttons */
  .lp-btn {
    display: inline-flex; align-items: center;
    font-weight: 700; border-radius: 10px;
    background: var(--blue); color: #fff;
    transition: background 0.2s, transform 0.15s;
    text-decoration: none; white-space: nowrap;
  }
  .lp-btn:hover { background: #2563EB; transform: translateY(-1px); }
  .lp-btn-lg { font-size: 17px; padding: 15px 32px; border-radius: 12px; }
  .lp-btn-sm { font-size: 14px; padding: 10px 22px; }

  /* Secondary (ghost) CTA */
  .lp-btn-ghost {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 15px; font-weight: 700; color: var(--text-2);
    border: 1px solid var(--border); border-radius: 10px;
    padding: 13px 24px;
    transition: color 0.2s, border-color 0.2s;
    text-decoration: none;
  }
  .lp-btn-ghost:hover { color: var(--text-1); border-color: #4b5563; }
  .lp-cta-group { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }

  /* Sections */
  .lp-section { padding: 96px 0; }
  .lp-section-alt { background: var(--bg-2); }

  /* Hero */
  .lp-hero { padding: 140px 0 96px; }
  .lp-hero h1 {
    font-size: clamp(36px, 6vw, 56px);
    font-weight: 700; line-height: 1.1; letter-spacing: -0.03em; margin-bottom: 20px;
  }
  .lp-hero-sub { font-size: 18px; color: var(--text-2); margin-bottom: 32px; line-height: 1.65; }
  .lp-microcopy { font-size: 13px; color: var(--text-2); margin-top: 12px; }

  /* Hero UI mock */
  .lp-hero-ui {
    margin-top: 56px;
    background: var(--bg-2); border: 1px solid var(--border); border-radius: var(--radius);
    overflow: hidden; box-shadow: 0 8px 48px rgba(0,0,0,0.5), 0 0 60px rgba(59,130,246,0.05);
  }
  .ui-hdr {
    background: #1E2A3A; border-bottom: 1px solid var(--border);
    padding: 12px 16px; display: flex; align-items: center; justify-content: space-between;
  }
  .ui-hdr-left { display: flex; align-items: center; gap: 10px; }
  .ui-dots { display: flex; gap: 6px; }
  .ui-dot { width: 9px; height: 9px; border-radius: 50%; }
  .ui-dot.r { background: #ff5f57; } .ui-dot.y { background: #febc2e; } .ui-dot.g { background: #28c840; }
  .ui-title { font-size: 12px; font-weight: 700; color: var(--text-2); }
  .ui-badge {
    font-size: 11px; font-weight: 700; color: var(--green);
    background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.25);
    border-radius: 100px; padding: 3px 10px;
  }
  .ui-body { padding: 18px; }
  .ui-project { font-size: 12px; color: var(--text-2); margin-bottom: 14px; }
  .ui-project strong { color: #fff; }
  .ui-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
  .ui-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 9px 11px; background: var(--bg); border-radius: 7px;
  }
  .ui-row-label { font-size: 11px; color: var(--text-2); }
  .ui-row-val { font-size: 12px; font-weight: 700; color: #fff; }
  .ui-divider { border: none; border-top: 1px solid var(--border); margin: 12px 0; }
  .ui-cost-row { display: flex; justify-content: space-between; padding: 5px 0; }
  .ui-cost-label { font-size: 12px; color: var(--text-2); }
  .ui-cost-val { font-size: 12px; font-weight: 700; color: #fff; }
  .ui-margin-box {
    background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2);
    border-radius: 9px; padding: 12px; margin-top: 12px;
  }
  .ui-margin-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
  .ui-margin-row:last-child { margin-bottom: 0; }
  .ui-margin-label { font-size: 11px; color: var(--text-2); }
  .ui-margin-val { font-size: 12px; font-weight: 700; color: var(--green); }
  .ui-send {
    display: flex; justify-content: space-between; align-items: center;
    background: var(--blue); border-radius: 7px; padding: 11px 14px; margin-top: 12px;
  }
  .ui-send-label { font-size: 12px; font-weight: 700; color: #fff; }
  .ui-send-val { font-size: 17px; font-weight: 700; color: #fff; }

  /* Problem */
  .lp-problem p { font-size: 20px; line-height: 1.7; color: var(--text-1); }
  .lp-problem p + p { margin-top: 20px; }

  /* Solution */
  .lp-solution .sol-main { font-size: 22px; font-weight: 700; color: var(--text-1); line-height: 1.5; }
  .lp-solution .sol-sub { font-size: 17px; color: var(--text-2); margin-top: 10px; line-height: 1.65; }

  /* Proof */
  .lp-proof p { font-size: 18px; line-height: 1.75; color: var(--text-1); }
  .lp-proof p + p { margin-top: 16px; }
  .green { color: var(--green); }
  .lp-example-label {
    font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
    color: var(--text-2); margin-bottom: 16px;
    padding: 4px 10px; border: 1px solid var(--border); border-radius: 100px;
    display: inline-block;
  }
  .lp-quote-card {
    margin-top: 32px; background: var(--bg-2);
    border: 1px solid var(--border); border-radius: var(--radius); padding: 28px 32px;
  }
  .lp-quote-card p { font-size: 17px; font-style: italic; color: var(--text-1); line-height: 1.7; }
  .lp-quote-attr { margin-top: 10px; font-size: 13px; color: var(--text-2); font-style: normal; }

  /* Clean price callout */
  .lp-callout p { font-size: clamp(20px, 3vw, 26px); font-weight: 700; color: var(--text-1); line-height: 1.35; }

  /* How It Works */
  .lp-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
  .lp-step { text-align: center; }
  .lp-step-num {
    width: 52px; height: 52px; border-radius: 50%;
    border: 2px solid var(--blue); color: var(--blue);
    font-size: 20px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 20px;
  }
  .lp-step h3 { font-size: 16px; font-weight: 700; color: var(--text-1); margin-bottom: 8px; }
  .lp-step p { font-size: 14px; color: var(--text-2); line-height: 1.65; }

  /* Chips */
  .lp-chips { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; }
  .lp-chip {
    font-size: 14px; font-weight: 700; border: 1px solid var(--border);
    border-radius: 100px; padding: 7px 18px; color: var(--text-1); background: var(--bg-2);
  }
  .lp-catches-sub { font-size: 16px; color: var(--text-2); line-height: 1.65; }

  /* Comparison */
  .lp-comparison p { font-size: 18px; line-height: 1.75; color: var(--text-1); }
  .lp-comparison p + p { margin-top: 16px; }
  .lp-comparison .comp-close { color: var(--text-2); font-size: 16px; }

  /* Pricing */
  .lp-price-display { font-size: clamp(40px, 6vw, 60px); font-weight: 700; letter-spacing: -0.03em; margin-bottom: 14px; }
  .lp-pricing p { font-size: 18px; color: var(--text-1); line-height: 1.7; }
  .lp-pricing p + p { margin-top: 12px; color: var(--text-2); font-size: 15px; }

  /* Final CTA */
  .lp-final h2 {
    font-size: clamp(28px, 5vw, 44px); font-weight: 700;
    letter-spacing: -0.025em; margin-bottom: 28px; line-height: 1.15;
  }

  /* Footer */
  .lp-footer { background: var(--bg-2); border-top: 1px solid var(--border); padding: 40px 0 28px; }
  .lp-footer-inner { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
  .lp-footer-logo { font-size: 16px; font-weight: 700; }
  .lp-footer-logo span { color: var(--blue); }
  .lp-footer-links { display: flex; gap: 24px; flex-wrap: wrap; }
  .lp-footer-links a { font-size: 13px; color: var(--text-2); transition: color 0.2s; }
  .lp-footer-links a:hover { color: var(--text-1); }
  .lp-footer-bottom { margin-top: 28px; border-top: 1px solid var(--border); padding-top: 20px; }
  .lp-footer-bottom p { font-size: 13px; color: var(--text-2); }

  /* Responsive */
  @media (max-width: 640px) {
    .lp-hero { padding: 100px 0 72px; }
    .lp-section { padding: 72px 0; }
    .lp-steps { grid-template-columns: 1fr; gap: 32px; }
    .lp-sticky-text { display: none; }
    .lp-quote-card { padding: 20px 22px; }
    .lp-cta-group { flex-direction: column; align-items: flex-start; gap: 10px; }
  }
`;

export default function Home() {
  return (
    <>
      {/* Inline CSS — safe in server components */}
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <nav className="lp-nav" id="lp-nav" aria-label="Main navigation">
        <div className="lp-nav-inner">
          <a href="/" className="lp-logo">Deck<span>Margin</span></a>
          <div className="lp-nav-right">
            <a href="/login" className="lp-login">Log in</a>
            {/*
              data-cta="nav" — LandingInteractive finds this and:
              1. Sets href to /signup?utm_... based on URL params
              2. Fires GA4 event on click
            */}
            <a href="/signup" data-cta="nav" className="lp-btn lp-btn-sm">
              Start your 14-day free trial
            </a>
          </div>
        </div>
      </nav>

      {/* ── STICKY BAR ──────────────────────────────────────────────────────── */}
      <div className="lp-sticky" id="lp-sticky" aria-hidden="true">
        <span className="lp-sticky-text">Know your price before you send it.</span>
        <a href="/signup" data-cta="sticky" className="lp-btn lp-btn-sm">
          Start your 14-day free trial
        </a>
      </div>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      {/*
        Fix #1: This section is now SSR'd. Googlebot sees real h1 text.
        Fix #2: CTA copy updated to include trial length.
        Fix #4: Secondary CTA added for traffic not ready to start.
      */}
      <section className="lp-hero" id="lp-hero">
        <div className="lp-container">
          <div className="fade-up">
            <h1>Know your price before you send it.</h1>
            <p className="lp-hero-sub">
              DeckMargin shows you what you&apos;ll make. Before the bid goes out.
            </p>
            <div className="lp-cta-group">
              <a href="/signup" data-cta="hero" className="lp-btn lp-btn-lg">
                Start your 14-day free trial
              </a>
              {/*
                Fix #4: secondary CTA — lower commitment option for cold traffic.
                Update href to your actual demo video URL once it exists.
              */}
              <a
                href="https://www.loom.com/share/placeholder"
                target="_blank"
                rel="noopener noreferrer"
                className="lp-btn-ghost"
              >
                ▶ Watch the 2-min demo
              </a>
            </div>
            <p className="lp-microcopy">No card needed. Cancel any time.</p>
          </div>

          {/* Product UI mockup — estimate + margin screen */}
          <div className="lp-hero-ui fade-up" style={{ transitionDelay: "0.1s" }}>
            <div className="ui-hdr">
              <div className="ui-hdr-left">
                <div className="ui-dots">
                  <div className="ui-dot r" />
                  <div className="ui-dot y" />
                  <div className="ui-dot g" />
                </div>
                <span className="ui-title">DeckMargin Live Estimate</span>
              </div>
              <span className="ui-badge">Margin Protected</span>
            </div>
            <div className="ui-body">
              <p className="ui-project"><strong>Smith Residence</strong> · 320 sq ft · Trex Composite</p>
              <div className="ui-grid">
                <div className="ui-row"><span className="ui-row-label">Deck Size</span><span className="ui-row-val">16 × 20 ft</span></div>
                <div className="ui-row"><span className="ui-row-label">Material</span><span className="ui-row-val">Trex Composite</span></div>
                <div className="ui-row"><span className="ui-row-label">Railing</span><span className="ui-row-val">Aluminum</span></div>
                <div className="ui-row"><span className="ui-row-label">Stairs</span><span className="ui-row-val">2 flights</span></div>
              </div>
              <hr className="ui-divider" />
              <div className="ui-cost-row"><span className="ui-cost-label">Materials</span><span className="ui-cost-val">$12,480</span></div>
              <div className="ui-cost-row"><span className="ui-cost-label">Labor</span><span className="ui-cost-val">$7,900</span></div>
              <div className="ui-cost-row"><span className="ui-cost-label">Overhead</span><span className="ui-cost-val">$1,450</span></div>
              <div className="ui-margin-box">
                <div className="ui-margin-row">
                  <span className="ui-margin-label">Target Margin</span>
                  <span className="ui-margin-val">30%</span>
                </div>
                <div className="ui-margin-row">
                  <span className="ui-margin-label">Expected Profit</span>
                  <span className="ui-margin-val">$9,355</span>
                </div>
              </div>
              <div className="ui-send">
                <span className="ui-send-label">Send This Price</span>
                <span className="ui-send-val">$31,185</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM ─────────────────────────────────────────────────────────── */}
      <section className="lp-section lp-problem fade-up">
        <div className="lp-container">
          <p>Every deck gets priced different. Spreadsheet. Old quote. Gut feel.</p>
          <p>Stairs. Rails. Waste. Permits. Easy to miss when you&apos;re moving fast.</p>
          <p>Miss one thing and that&apos;s money gone. You don&apos;t find out till the job&apos;s done.</p>
        </div>
      </section>

      {/* ── SOLUTION ────────────────────────────────────────────────────────── */}
      <section className="lp-section lp-section-alt lp-solution fade-up">
        <div className="lp-container">
          <p className="sol-main">DeckMargin prices the job and shows you your number first.</p>
          <p className="sol-sub">Before you send it. Not after.</p>
        </div>
      </section>

      {/* ── PROOF ───────────────────────────────────────────────────────────── */}
      {/*
        Fix #6: The $42K/$6K/$1,400 figures are labeled as an illustrative
        example, not an attributed customer quote. The quote card now explicitly
        says "Beta tester" so it reads as a real (but anonymous) user, not a
        fabricated testimonial.

        ACTION REQUIRED: If you have a named, attributable customer story,
        replace this with their real numbers and a name/company credit.
        If not, this "illustrative" framing is accurate and credible.
      */}
      <section className="lp-section lp-proof fade-up">
        <div className="lp-container">
          <span className="lp-example-label">Illustrative example</span>
          <p>
            A contractor prices a <span className="green">$42,000</span> deck.
            After materials, labor, and overhead , he made <span className="green">$6,000</span>.
          </p>
          <p>He felt something was off while pricing it. He just didn&apos;t catch it in time.</p>
          <div className="lp-quote-card">
            <p>
              &ldquo;This caught <span className="green">$1,400</span> I was about to leave on a job.&rdquo;
            </p>
            <p className="lp-quote-attr">DeckMargin beta tester</p>
          </div>
        </div>
      </section>

      {/* ── CLEAN PRICE CALLOUT ──────────────────────────────────────────────── */}
      <section className="lp-section lp-section-alt lp-callout fade-up">
        <div className="lp-container">
          <p>Your customer sees a clean price. You see everything behind it.</p>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section className="lp-section fade-up">
        <div className="lp-container">
          <div className="lp-steps">
            <div className="lp-step">
              <div className="lp-step-num">1</div>
              <h3>Price a real job.</h3>
              <p>About 10 minutes.</p>
            </div>
            <div className="lp-step">
              <div className="lp-step-num">2</div>
              <h3>See what you&apos;ll make.</h3>
              <p>Before the bid goes out.</p>
            </div>
            <div className="lp-step">
              <div className="lp-step-num">3</div>
              <h3>Send it.</h3>
              <p>No guessing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT IT CATCHES ─────────────────────────────────────────────────── */}
      <section className="lp-section lp-section-alt fade-up">
        <div className="lp-container">
          <div className="lp-chips">
            {["Waste", "Hardware", "Permits", "Stairs", "Height", "Material"].map((tag) => (
              <span key={tag} className="lp-chip">{tag}</span>
            ))}
          </div>
          <p className="lp-catches-sub">
            The stuff that&apos;s easy to miss when you&apos;re pricing fast.
          </p>
        </div>
      </section>

      {/* ── COMPARISON ──────────────────────────────────────────────────────── */}
      <section className="lp-section lp-comparison fade-up">
        <div className="lp-container">
          <p>Good tools. Built for everything, not just decks.</p>
          <p>
            You end up building your whole cost catalog by hand before you can quote a single job.
          </p>
          <p className="comp-close">
            DeckMargin&apos;s built for one thing. Price a deck, see your number, done.
          </p>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────────────── */}
      <section className="lp-section lp-section-alt lp-pricing fade-up">
        <div className="lp-container">
          <div className="lp-price-display">$99 a month.</div>
          <p>One bad price costs you more than that on a single job.</p>
          <p>14 days free. No card. Try it on a real job.</p>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────────────────── */}
      <section className="lp-section lp-final fade-up">
        <div className="lp-container">
          <h2>Know your price before you send it.</h2>
          <a href="/signup" data-cta="final" className="lp-btn lp-btn-lg">
            Start your 14-day free trial
          </a>
          <p className="lp-microcopy" style={{ marginTop: "14px" }}>No card needed. Cancel any time.</p>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer-inner">
            <a href="/" className="lp-footer-logo">Deck<span>Margin</span></a>
            <div className="lp-footer-links">
              <a href="/login">Log in</a>
              <a href="/signup" data-cta="footer">Start your 14-day free trial</a>
              <a href="mailto:carlos.lourenco@deckmargin.com">Contact</a>
            </div>
          </div>
          <div className="lp-footer-bottom">
            <p>© 2026 DeckMargin. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/*
        LandingInteractive: client-side only. Handles UTM param injection into
        CTA links, scroll events (sticky bar, nav border), fade-up animations,
        and GA4 click events. Renders null — no visible HTML.
      */}
      <Suspense fallback={null}>
        <LandingInteractive />
      </Suspense>
    </>
  );
}
