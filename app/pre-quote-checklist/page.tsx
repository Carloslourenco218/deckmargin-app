/**
 * app/pre-quote-checklist/page.tsx
 * Lead-magnet landing page — "The Deck Estimator's Pre-Quote Checklist"
 *
 * SERVER COMPONENT. Not linked in the main nav.
 * Traffic arrives via direct link, social posts, and ads.
 *
 * Form submission, contact creation, and the confirmation email are all
 * handled by HubSpot. The redirect to /pre-quote-checklist/thank-you is
 * configured inside HubSpot's own form settings (not in this file).
 */

import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Free Pre-Quote Checklist for Deck Contractors",
  description:
    "Download the exact 5-step checklist DeckMargin runs through on every job before a price goes out. Free. Enter your email and get it instantly.",
  robots: { index: true, follow: true },
};

// ── shared CSS variables (mirrors the main landing page palette) ───────────────
const css = `
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

  :root {
    --bg: #0D0D0D;
    --bg-2: #111827;
    --blue: #3B82F6;
    --amber: #F5A623;
    --text-1: #FFFFFF;
    --text-2: #9CA3AF;
    --border: #1F2937;
    --radius: 12px;
  }

  /* ── Nav ── */
  .pq-nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(13,13,13,0.92);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
  }
  .pq-nav-inner {
    max-width: 960px; margin: 0 auto; padding: 0 24px;
    height: 64px; display: flex; align-items: center; justify-content: space-between;
  }
  .pq-nav-cta {
    font-size: 13px; font-weight: 600;
    background: var(--blue); color: #fff;
    padding: 8px 16px; border-radius: 8px;
    transition: background 0.2s;
  }
  .pq-nav-cta:hover { background: #2563EB; }

  /* ── Page shell ── */
  .pq-page {
    min-height: 100vh;
    display: flex; flex-direction: column;
  }
  .pq-main {
    flex: 1;
    display: flex; flex-direction: column; align-items: center;
    padding: 72px 24px 96px;
  }

  /* ── Content block ── */
  .pq-content {
    width: 100%; max-width: 560px;
    text-align: center;
  }

  /* Badge */
  .pq-badge {
    display: inline-block;
    font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--amber);
    background: rgba(245,166,35,0.12);
    border: 1px solid rgba(245,166,35,0.25);
    border-radius: 20px;
    padding: 4px 12px;
    margin-bottom: 24px;
  }

  /* Headline */
  .pq-headline {
    font-size: clamp(28px, 5vw, 40px);
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1.15;
    margin-bottom: 18px;
    color: var(--text-1);
  }

  /* Subheadline */
  .pq-sub {
    font-size: 16px;
    color: var(--text-2);
    line-height: 1.65;
    margin-bottom: 40px;
  }

  /* Form card */
  .pq-form-card {
    background: var(--bg-2);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 32px 28px;
    text-align: left;
    margin-bottom: 40px;
  }

  /* HubSpot form overrides — keeps it on-brand */
  .pq-form-card .hs-form-frame {
    width: 100%;
  }
  .pq-form-card iframe {
    width: 100% !important;
    border: none;
    min-height: 160px;
  }

  /* What's inside list */
  .pq-inside {
    background: var(--bg-2);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 28px;
    text-align: left;
  }
  .pq-inside-title {
    font-size: 13px; font-weight: 700; letter-spacing: 0.06em;
    text-transform: uppercase; color: var(--text-2);
    margin-bottom: 16px;
  }
  .pq-inside ul {
    list-style: none; padding: 0;
    display: flex; flex-direction: column; gap: 12px;
  }
  .pq-inside li {
    display: flex; align-items: flex-start; gap: 12px;
    font-size: 14px; color: var(--text-1); line-height: 1.5;
  }
  .pq-inside li::before {
    content: "✓";
    color: #10B981;
    font-weight: 700;
    flex-shrink: 0;
    margin-top: 1px;
  }

  /* ── Footer ── */
  .pq-footer {
    background: var(--bg-2);
    border-top: 1px solid var(--border);
    padding: 28px 24px;
  }
  .pq-footer-inner {
    max-width: 960px; margin: 0 auto;
    display: flex; justify-content: space-between; align-items: center;
    flex-wrap: wrap; gap: 12px;
  }
  .pq-footer-copy { font-size: 13px; color: var(--text-2); }
  .pq-footer-links { display: flex; gap: 20px; flex-wrap: wrap; }
  .pq-footer-links a { font-size: 13px; color: var(--text-2); transition: color 0.2s; }
  .pq-footer-links a:hover { color: var(--text-1); }

  @media (max-width: 480px) {
    .pq-main { padding: 48px 16px 80px; }
    .pq-form-card { padding: 24px 18px; }
    .pq-inside { padding: 22px 18px; }
  }
`;

export default function PreQuoteChecklist() {
  return (
    <>
      {/* Inline styles */}
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* HubSpot forms embed script */}
      <Script
        src="https://js-na2.hsforms.net/forms/embed/246156954.js"
        strategy="afterInteractive"
      />

      <div className="pq-page">

        {/* ── NAV ── */}
        <nav className="pq-nav" aria-label="Site navigation">
          <div className="pq-nav-inner">
            <a href="/" aria-label="DeckMargin home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="DeckMargin" height={28} width={185} />
            </a>
            <a href="/signup" className="pq-nav-cta">Start free trial</a>
          </div>
        </nav>

        {/* ── MAIN ── */}
        <main className="pq-main">
          <div className="pq-content">

            {/* Badge */}
            <div className="pq-badge">Free Download</div>

            {/* Headline */}
            <h1 className="pq-headline">
              The 5-Step Pass Before You Send a Price
            </h1>

            {/* Supporting copy */}
            <p className="pq-sub">
              Download the exact pre-quote checklist DeckMargin runs through
              automatically on every job, free. Enter your email and get it instantly.
            </p>

            {/* ── HubSpot form card ── */}
            <div className="pq-form-card">
              <div
                className="hs-form-frame"
                data-region="na2"
                data-form-id="12a3b859-6da9-4df0-a046-e508a1ec195f"
                data-portal-id="246156954"
              />
            </div>

            {/* ── What's inside ── */}
            <div className="pq-inside">
              <div className="pq-inside-title">What&apos;s inside</div>
              <ul>
                <li>Confirm the scope before you price anything</li>
                <li>Catch the site conditions that change your labor cost</li>
                <li>Verify permit and HOA requirements up front</li>
                <li>Lock in the material spec so the price holds</li>
                <li>Set client expectations before the number lands</li>
              </ul>
            </div>

          </div>
        </main>

        {/* ── FOOTER ── */}
        <footer className="pq-footer">
          <div className="pq-footer-inner">
            <p className="pq-footer-copy">© 2026 DeckMargin. All rights reserved.</p>
            <div className="pq-footer-links">
              <a href="/login">Log in</a>
              <a href="/signup">Start free trial</a>
              <a href="mailto:carlos.lourenco@deckmargin.com">Contact</a>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
