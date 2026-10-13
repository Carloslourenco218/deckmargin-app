/**
 * app/pre-quote-checklist/thank-you/page.tsx
 * Thank-you page shown after a visitor submits the Pre-Quote Checklist form.
 *
 * SERVER COMPONENT. HubSpot's form settings redirect here after submission.
 * A "lead_magnet_download" GA4 event fires on page load (client-side, via
 * the inline script) so this converts as its own tracked event separate from
 * trial signups.
 *
 * No form on this page.
 */

import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Your checklist is on the way | DeckMargin",
  description: "Check your inbox — we just sent the Pre-Quote Checklist to your email.",
  robots: { index: false, follow: false }, // thank-you pages shouldn't be indexed
};

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
    --green: #10B981;
    --text-1: #FFFFFF;
    --text-2: #9CA3AF;
    --border: #1F2937;
  }

  /* ── Nav ── */
  .ty-nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(13,13,13,0.92);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
  }
  .ty-nav-inner {
    max-width: 960px; margin: 0 auto; padding: 0 24px;
    height: 64px; display: flex; align-items: center; justify-content: space-between;
  }

  /* ── Page ── */
  .ty-page { min-height: 100vh; display: flex; flex-direction: column; }
  .ty-main {
    flex: 1;
    display: flex; align-items: center; justify-content: center;
    padding: 72px 24px 96px;
  }
  .ty-content {
    width: 100%; max-width: 520px;
    text-align: center;
  }

  /* Check icon */
  .ty-check {
    width: 64px; height: 64px;
    background: rgba(16,185,129,0.12);
    border: 2px solid rgba(16,185,129,0.3);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 28px;
    font-size: 28px;
  }

  /* Headline */
  .ty-headline {
    font-size: clamp(26px, 5vw, 36px);
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1.2;
    margin-bottom: 18px;
    color: var(--text-1);
  }

  /* Body */
  .ty-body {
    font-size: 16px;
    color: var(--text-2);
    line-height: 1.65;
    margin-bottom: 40px;
  }

  /* Divider */
  .ty-divider {
    border: none;
    border-top: 1px solid var(--border);
    margin: 0 auto 36px;
    width: 80%;
  }

  /* CTA card */
  .ty-cta-card {
    background: var(--bg-2);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 32px 28px;
  }
  .ty-cta-card p {
    font-size: 14px; color: var(--text-2); margin-bottom: 20px;
  }
  .ty-btn {
    display: inline-block;
    background: var(--blue); color: #fff;
    font-size: 15px; font-weight: 700;
    padding: 14px 28px; border-radius: 10px;
    transition: background 0.2s;
  }
  .ty-btn:hover { background: #2563EB; }
  .ty-microcopy {
    font-size: 12px; color: var(--text-2);
    margin-top: 12px;
  }

  /* ── Footer ── */
  .ty-footer {
    background: var(--bg-2);
    border-top: 1px solid var(--border);
    padding: 28px 24px;
  }
  .ty-footer-inner {
    max-width: 960px; margin: 0 auto;
    display: flex; justify-content: space-between; align-items: center;
    flex-wrap: wrap; gap: 12px;
  }
  .ty-footer-copy { font-size: 13px; color: var(--text-2); }
  .ty-footer-links { display: flex; gap: 20px; flex-wrap: wrap; }
  .ty-footer-links a { font-size: 13px; color: var(--text-2); transition: color 0.2s; }
  .ty-footer-links a:hover { color: var(--text-1); }

  @media (max-width: 480px) {
    .ty-main { padding: 48px 16px 80px; }
    .ty-cta-card { padding: 24px 18px; }
  }
`;

// GA4 event script — fires lead_magnet_download on page load
const ga4Script = `
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'lead_magnet_download', {
      event_category: 'lead_magnet',
      event_label: 'pre_quote_checklist',
    });
  }
`;

export default function ThankYou() {
  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* GA4 lead_magnet_download event */}
      <Script id="ga4-lead-magnet" strategy="afterInteractive">
        {ga4Script}
      </Script>

      <div className="ty-page">

        {/* ── NAV ── */}
        <nav className="ty-nav" aria-label="Site navigation">
          <div className="ty-nav-inner">
            <a href="/" aria-label="DeckMargin home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="DeckMargin" height={28} width={185} />
            </a>
          </div>
        </nav>

        {/* ── MAIN ── */}
        <main className="ty-main">
          <div className="ty-content">

            {/* Check icon */}
            <div className="ty-check" aria-hidden="true">✓</div>

            {/* Headline */}
            <h1 className="ty-headline">Your checklist is on the way.</h1>

            {/* Body */}
            <p className="ty-body">
              Check your inbox — we just sent the Pre-Quote Checklist to your email.
            </p>

            <hr className="ty-divider" />

            {/* Secondary CTA */}
            <div className="ty-cta-card">
              <p>
                While you&apos;re here: see what it looks like when this entire process runs itself.
              </p>
              <a href="/signup" className="ty-btn">
                Start Your 14-Day Free Trial
              </a>
              <p className="ty-microcopy">No card needed. Cancel any time.</p>
            </div>

          </div>
        </main>

        {/* ── FOOTER ── */}
        <footer className="ty-footer">
          <div className="ty-footer-inner">
            <p className="ty-footer-copy">© 2026 DeckMargin. All rights reserved.</p>
            <div className="ty-footer-links">
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
