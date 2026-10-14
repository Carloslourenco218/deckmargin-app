/**
 * app/page.tsx — DeckMargin landing page
 *
 * SERVER COMPONENT (no "use client").
 * All HTML is SSR'd → Googlebot can crawl and index it.
 * Interactive behaviour (scroll, UTM params, GA4 events, cursor) lives in
 * <LandingInteractive />, a thin client component rendered inside Suspense.
 */

import type { Metadata } from "next";
import { Suspense } from "react";
import LandingInteractive from "@/app/components/LandingInteractive";

// ── SEO metadata ───────────────────────────────────────────────────────────────
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
        url: "/og-image.png",
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

// ── CSS ────────────────────────────────────────────────────────────────────────
const css = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    background: #FAFAF8;
    color: #2A2E36;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }
  img { max-width: 100%; display: block; }
  a { color: inherit; text-decoration: none; }
  button { cursor: pointer; font-family: inherit; border: none; background: none; color: inherit; }

  :root {
    --bg:        #FAFAF8;
    --bg-2:      #FFFFFF;
    --bg-dark:   #141F38;
    --navy:      #1D2C4B;
    --orange:    #FBB944;
    --orange-h:  #E8A730;
    --charcoal:  #2A2E36;
    --mute:      #6B7280;
    --border:    #E7E5E0;
    --radius:    12px;
  }

  /* Custom cursor — desktop fine pointer only */
  @media (pointer: fine) {
    body { cursor: none; }
    a, button, [role="button"] { cursor: none; }
  }
  #dm-cursor-dot {
    position: fixed; top: 0; left: 0; pointer-events: none; z-index: 9999;
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--navy);
    transform: translate(-50%, -50%);
    transition: transform 0.08s ease, opacity 0.2s;
    opacity: 0;
    will-change: transform;
  }
  #dm-cursor-ring {
    position: fixed; top: 0; left: 0; pointer-events: none; z-index: 9998;
    width: 32px; height: 32px; border-radius: 50%;
    border: 1.5px solid rgba(29,44,75,0.35);
    transform: translate(-50%, -50%);
    transition: width 0.2s ease, height 0.2s ease, border-color 0.2s, opacity 0.2s;
    opacity: 0;
    will-change: transform;
  }
  #dm-cursor-ring.hovering {
    width: 48px; height: 48px;
    border-color: var(--orange);
  }

  /* Layout */
  .lp-container { max-width: 720px; margin: 0 auto; padding: 0 24px; }

  /* Fade-up */
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
    background: transparent;
    border-bottom: 1px solid transparent;
    transition: background 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease;
  }
  .lp-nav.scrolled {
    background: rgba(250,250,248,0.95);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-color: var(--border);
  }
  .lp-nav-inner {
    max-width: 1120px; margin: 0 auto; padding: 0 24px;
    display: flex; align-items: center; justify-content: space-between; height: 64px;
  }
  .lp-logo { display: flex; align-items: center; }
  .lp-logo img { height: 32px; width: auto; display: block; filter: brightness(0); }
  .lp-nav-right { display: flex; align-items: center; gap: 16px; }
  .lp-login { font-size: 14px; color: var(--charcoal); font-weight: 700; transition: color 0.2s; }
  .lp-login:hover { color: var(--navy); }

  /* Sticky bar */
  .lp-sticky {
    position: fixed; bottom: 0; left: 0; right: 0;
    z-index: 90;
    background: var(--navy);
    border-top: 1px solid rgba(255,255,255,0.08);
    padding: 12px 24px;
    display: flex; align-items: center; justify-content: center; gap: 16px;
    transform: translateY(100%);
    transition: transform 0.35s ease;
  }
  .lp-sticky.visible { transform: translateY(0); }
  .lp-sticky-text { font-size: 14px; color: rgba(255,255,255,0.75); }

  /* CTA Buttons — orange pills */
  .lp-btn {
    display: inline-flex; align-items: center;
    font-weight: 700; border-radius: 999px;
    background: var(--orange); color: var(--navy);
    transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
    text-decoration: none; white-space: nowrap;
  }
  .lp-btn:hover {
    background: var(--orange-h);
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(251,185,68,0.35);
  }
  .lp-btn-lg { font-size: 17px; padding: 15px 32px; }
  .lp-btn-sm { font-size: 14px; padding: 10px 22px; }

  /* Ghost CTA */
  .lp-btn-ghost {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 15px; font-weight: 700;
    color: var(--navy);
    border: 2px solid var(--navy); border-radius: 999px;
    padding: 13px 24px;
    transition: background 0.2s, color 0.2s;
    text-decoration: none;
  }
  .lp-btn-ghost:hover {
    background: var(--navy);
    color: #fff;
  }
  .lp-cta-group { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }

  /* Sections */
  .lp-section { padding: 96px 0; background: var(--bg); }
  .lp-section-alt { background: var(--bg-2); }

  /* Hero */
  .lp-hero { padding: 140px 0 96px; background: var(--bg); }
  .lp-hero h1 {
    font-size: clamp(36px, 6vw, 56px);
    font-weight: 700; line-height: 1.1; letter-spacing: -0.03em; margin-bottom: 20px;
    color: var(--navy);
  }
  .lp-hero-sub { font-size: 18px; color: var(--mute); margin-bottom: 32px; line-height: 1.65; }
  .lp-microcopy { font-size: 13px; color: var(--mute); margin-top: 12px; }

  /* Hero UI mock — dark app style for contrast on light bg */
  .lp-hero-ui {
    margin-top: 56px;
    background: #111827; border: 1px solid #1F2937; border-radius: var(--radius);
    overflow: hidden; box-shadow: 0 12px 48px rgba(20,31,56,0.15), 0 2px 8px rgba(0,0,0,0.06);
  }
  .ui-hdr {
    background: #1E2A3A; border-bottom: 1px solid #1F2937;
    padding: 12px 16px; display: flex; align-items: center; justify-content: space-between;
  }
  .ui-hdr-left { display: flex; align-items: center; gap: 10px; }
  .ui-dots { display: flex; gap: 6px; }
  .ui-dot { width: 9px; height: 9px; border-radius: 50%; }
  .ui-dot.r { background: #ff5f57; } .ui-dot.y { background: #febc2e; } .ui-dot.g { background: #28c840; }
  .ui-title { font-size: 12px; font-weight: 700; color: #9CA3AF; }
  .ui-badge {
    font-size: 11px; font-weight: 700; color: #10B981;
    background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.25);
    border-radius: 100px; padding: 3px 10px;
  }
  .ui-body { padding: 18px; }
  .ui-project { font-size: 12px; color: #9CA3AF; margin-bottom: 14px; }
  .ui-project strong { color: #fff; }
  .ui-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
  .ui-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 9px 11px; background: #0D1117; border-radius: 7px;
  }
  .ui-row-label { font-size: 11px; color: #9CA3AF; }
  .ui-row-val { font-size: 12px; font-weight: 700; color: #fff; }
  .ui-divider { border: none; border-top: 1px solid #1F2937; margin: 12px 0; }
  .ui-cost-row { display: flex; justify-content: space-between; padding: 5px 0; }
  .ui-cost-label { font-size: 12px; color: #9CA3AF; }
  .ui-cost-val { font-size: 12px; font-weight: 700; color: #fff; }
  .ui-margin-box {
    background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2);
    border-radius: 9px; padding: 12px; margin-top: 12px;
  }
  .ui-margin-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
  .ui-margin-row:last-child { margin-bottom: 0; }
  .ui-margin-label { font-size: 11px; color: #9CA3AF; }
  .ui-margin-val { font-size: 12px; font-weight: 700; color: #10B981; }
  .ui-send {
    display: flex; justify-content: space-between; align-items: center;
    background: var(--orange); border-radius: 7px; padding: 11px 14px; margin-top: 12px;
  }
  .ui-send-label { font-size: 12px; font-weight: 700; color: var(--navy); }
  .ui-send-val { font-size: 17px; font-weight: 700; color: var(--navy); }

  /* Problem — navy-deep dark section */
  .lp-problem { background: var(--bg-dark) !important; }
  .lp-problem p { font-size: 20px; line-height: 1.7; color: rgba(255,255,255,0.88); }
  .lp-problem p + p { margin-top: 20px; }

  /* Solution */
  .lp-solution .sol-main { font-size: 22px; font-weight: 700; color: var(--navy); line-height: 1.5; }
  .lp-solution .sol-sub { font-size: 17px; color: var(--mute); margin-top: 10px; line-height: 1.65; }

  /* Proof */
  .lp-proof p { font-size: 18px; line-height: 1.75; color: var(--charcoal); }
  .lp-proof p + p { margin-top: 16px; }
  .green { color: #1E6B3C; }
  .lp-example-label {
    font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
    color: var(--mute); margin-bottom: 16px;
    padding: 4px 10px; border: 1px solid var(--border); border-radius: 100px;
    display: inline-block;
  }
  .lp-quote-card {
    margin-top: 32px; background: #fff;
    border: 1px solid var(--border); border-radius: var(--radius); padding: 28px 32px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  }
  .lp-quote-card p { font-size: 17px; font-style: italic; color: var(--navy); line-height: 1.7; }
  .lp-quote-attr { margin-top: 10px; font-size: 13px; color: var(--mute); font-style: normal; }

  /* Callout — orange accent section */
  .lp-callout { background: var(--orange) !important; }
  .lp-callout p { font-size: clamp(20px, 3vw, 26px); font-weight: 700; color: var(--navy); line-height: 1.35; }

  /* How It Works */
  .lp-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
  .lp-step { text-align: center; }
  .lp-step-num {
    width: 52px; height: 52px; border-radius: 50%;
    background: var(--orange); color: var(--navy);
    font-size: 20px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 20px;
  }
  .lp-step h3 { font-size: 16px; font-weight: 700; color: var(--navy); margin-bottom: 8px; }
  .lp-step p { font-size: 14px; color: var(--mute); line-height: 1.65; }

  /* Chips */
  .lp-chips { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; }
  .lp-chip {
    font-size: 14px; font-weight: 700; border: 1px solid var(--border);
    border-radius: 100px; padding: 7px 18px; color: var(--navy); background: #fff;
  }
  .lp-catches-sub { font-size: 16px; color: var(--mute); line-height: 1.65; }

  /* Comparison */
  .lp-comparison p { font-size: 18px; line-height: 1.75; color: var(--charcoal); }
  .lp-comparison p + p { margin-top: 16px; }
  .lp-comparison .comp-close { color: var(--navy); font-size: 16px; font-weight: 700; }

  /* Pricing — navy-deep dark section */
  .lp-pricing { background: var(--bg-dark) !important; }
  .lp-price-display { font-size: clamp(40px, 6vw, 60px); font-weight: 700; letter-spacing: -0.03em; margin-bottom: 14px; color: #fff; }
  .lp-pricing p { font-size: 18px; color: rgba(255,255,255,0.85); line-height: 1.7; }
  .lp-pricing p + p { margin-top: 12px; color: rgba(255,255,255,0.55); font-size: 15px; }

  /* Testimonials */
  .lp-testimonials { padding: 72px 0; background: var(--bg); }
  .lp-testimonials h2 {
    font-size: clamp(22px, 3.5vw, 30px); font-weight: 700;
    letter-spacing: -0.02em; margin-bottom: 40px; text-align: center; color: var(--navy);
  }
  .lp-testimonial-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  @media (max-width: 700px) { .lp-testimonial-grid { grid-template-columns: 1fr; } }
  .lp-testimonial-card {
    background: #fff; border: 1px solid var(--border); border-radius: var(--radius);
    padding: 24px; display: flex; flex-direction: column; gap: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
  .lp-testimonial-stars { color: #F59E0B; font-size: 15px; letter-spacing: 1px; }
  .lp-testimonial-quote { font-size: 15px; line-height: 1.65; color: var(--charcoal); flex: 1; }
  .lp-testimonial-author { display: flex; align-items: center; gap: 10px; margin-top: 4px; }
  .lp-testimonial-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: var(--navy);
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 700; color: #fff; flex-shrink: 0;
  }
  .lp-testimonial-name { font-size: 13px; font-weight: 600; color: var(--navy); }
  .lp-testimonial-source { font-size: 12px; color: var(--mute); text-decoration: none; transition: color 0.2s; }
  .lp-testimonial-source:hover { color: var(--charcoal); }

  /* Final CTA */
  .lp-final h2 {
    font-size: clamp(28px, 5vw, 44px); font-weight: 700;
    letter-spacing: -0.025em; margin-bottom: 28px; line-height: 1.15;
    color: var(--navy);
  }

  /* Footer */
  .lp-footer { background: var(--bg-dark); border-top: none; padding: 40px 0 88px; }
  .lp-footer-inner { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
  .lp-footer-logo { display: flex; align-items: center; }
  .lp-footer-logo img { height: 26px; width: auto; display: block; filter: brightness(0) invert(1); opacity: 0.9; }
  .lp-footer-links { display: flex; gap: 24px; flex-wrap: wrap; }
  .lp-footer-links a { font-size: 13px; color: rgba(255,255,255,0.5); transition: color 0.2s; }
  .lp-footer-links a:hover { color: rgba(255,255,255,0.9); }
  .lp-footer-bottom { margin-top: 28px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
  .lp-footer-bottom p { font-size: 13px; color: rgba(255,255,255,0.35); }
  .lp-social-icons { display: flex; gap: 16px; align-items: center; }
  .lp-social-icons a { color: rgba(255,255,255,0.35); transition: color 0.2s; display: flex; align-items: center; }
  .lp-social-icons a:hover { color: rgba(255,255,255,0.9); }

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
      {/* Inline CSS */}
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* Custom cursor — LandingInteractive drives these via JS */}
      <div id="dm-cursor-dot" aria-hidden="true" />
      <div id="dm-cursor-ring" aria-hidden="true" />

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <nav className="lp-nav" id="lp-nav" aria-label="Main navigation">
        <div className="lp-nav-inner">
          <a href="/" className="lp-logo" aria-label="DeckMargin home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="DeckMargin" height={32} width={210} />
          </a>
          <div className="lp-nav-right">
            <a href="/resources" className="lp-login">Resources</a>
            <a href="/login" className="lp-login">Log in</a>
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
              <a
                href="https://www.loom.com/share/c88482e71aca42cbafb935d511ed7aea"
                target="_blank"
                rel="noopener noreferrer"
                className="lp-btn-ghost"
              >
                ▶ Watch the 4-min demo
              </a>
            </div>
            <p className="lp-microcopy">No card needed. Cancel any time.</p>
          </div>

          {/* Product UI mockup */}
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

      {/* ── CLEAN PRICE CALLOUT ─────────────────────────────────────────────── */}
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

      {/* ── TESTIMONIALS ────────────────────────────────────────────────────── */}
      <section className="lp-testimonials fade-up">
        <div className="lp-container">
          <h2>Contractors using DeckMargin send better quotes.</h2>
          <div className="lp-testimonial-grid">

            {/* Card 1 — Brian Costa */}
            <div className="lp-testimonial-card">
              <div className="lp-testimonial-stars">★★★★★</div>
              <p className="lp-testimonial-quote">
                &ldquo;I always felt like I was leaving money on the table or not fully accounting for everything.
                This makes it a lot clearer&hellip; you put in the deck details and it actually breaks down
                materials, labor, and profit in a way that makes sense.&rdquo;
              </p>
              <div className="lp-testimonial-author">
                <div className="lp-testimonial-avatar">BC</div>
                <div>
                  <div className="lp-testimonial-name">Brian Costa</div>
                  <a
                    href="https://www.google.com/maps/contrib/111548464633551301647/reviews?hl=en"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lp-testimonial-source"
                  >Google Review</a>
                </div>
              </div>
            </div>

            {/* Card 2 — Antonio Costa */}
            <div className="lp-testimonial-card">
              <div className="lp-testimonial-stars">★★★★★</div>
              <p className="lp-testimonial-quote">
                &ldquo;I can plug in the numbers and know we&apos;re covering materials, labor, and actually
                hitting the margins we want. Makes it easier to feel confident sending out quotes.&rdquo;
              </p>
              <div className="lp-testimonial-author">
                <div className="lp-testimonial-avatar">AC</div>
                <div>
                  <div className="lp-testimonial-name">Antonio Costa</div>
                  <a
                    href="https://www.google.com/maps/contrib/109998043235384848374/reviews?hl=en"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lp-testimonial-source"
                  >Google Review</a>
                </div>
              </div>
            </div>

            {/* Card 3 — Steven Hellinger */}
            <div className="lp-testimonial-card">
              <div className="lp-testimonial-stars">★★★★★</div>
              <p className="lp-testimonial-quote">
                &ldquo;Great program if you are looking to do accurate quotes for your deck building business.
                Will definitely help you become more profitable.&rdquo;
              </p>
              <div className="lp-testimonial-author">
                <div className="lp-testimonial-avatar">SH</div>
                <div>
                  <div className="lp-testimonial-name">Steven Hellinger</div>
                  <a
                    href="https://www.google.com/maps/contrib/105221505249182030807/reviews?hl=en"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lp-testimonial-source"
                  >Google Review</a>
                </div>
              </div>
            </div>

          </div>
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
            <a href="/" className="lp-footer-logo" aria-label="DeckMargin home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="DeckMargin" height={26} width={175} />
            </a>
            <div className="lp-footer-links">
              <a href="/resources">Resources</a>
              <a href="/login">Log in</a>
              <a href="/signup" data-cta="footer">Start your 14-day free trial</a>
              <a href="mailto:carlos.lourenco@deckmargin.com">Contact</a>
            </div>
          </div>
          <div className="lp-footer-bottom">
            <p>© 2026 DeckMargin. All rights reserved.</p>
            <div className="lp-social-icons">
              {/* Facebook */}
              <a href="https://www.facebook.com/people/DeckMargin/61589107767219/" target="_blank" rel="noopener noreferrer" aria-label="DeckMargin on Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.514c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a href="https://www.instagram.com/deckmargin/" target="_blank" rel="noopener noreferrer" aria-label="DeckMargin on Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="https://www.linkedin.com/company/deckmargin" target="_blank" rel="noopener noreferrer" aria-label="DeckMargin on LinkedIn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/*
        LandingInteractive: handles UTM params, scroll events, fade-up,
        GA4 events, and custom cursor. Renders null.
      */}
      <Suspense fallback={null}>
        <LandingInteractive />
      </Suspense>
    </>
  );
}
