/**
 * app/resources/layout.tsx
 * Shared layout for all /resources/* pages.
 * Provides nav, footer, and article typography, wraps every page automatically.
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://deckmargin.com"),
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #0D0D0D;
    color: #E5E7EB;
    line-height: 1.7;
    -webkit-font-smoothing: antialiased;
  }
  img { max-width: 100%; display: block; }
  a { color: inherit; text-decoration: none; }

  :root {
    --bg: #0D0D0D;
    --bg-2: #111827;
    --bg-3: #1F2937;
    --blue: #3B82F6;
    --amber: #F5A623;
    --green: #10B981;
    --text-1: #F9FAFB;
    --text-2: #9CA3AF;
    --text-3: #6B7280;
    --border: #1F2937;
    --radius: 10px;
  }

  /* ── Nav ── */
  .rs-nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(13,13,13,0.92);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
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
    font-size: 14px; color: var(--text-2); transition: color 0.2s;
  }
  .rs-nav-links a:hover, .rs-nav-links a.active { color: var(--text-1); }
  .rs-nav-cta {
    font-size: 13px; font-weight: 600;
    background: var(--blue); color: #fff !important;
    padding: 8px 16px; border-radius: 8px;
    transition: background 0.2s; white-space: nowrap;
  }
  .rs-nav-cta:hover { background: #2563EB !important; }

  /* ── Page shell ── */
  .rs-page { min-height: 100vh; display: flex; flex-direction: column; }
  .rs-main { flex: 1; padding: 56px 24px 96px; }

  /* ── Article ── */
  .rs-article {
    max-width: 720px; margin: 0 auto;
  }

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
  .rs-body { color: #D1D5DB; }
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
  .rs-body ul, .rs-body ol {
    padding-left: 20px; margin-bottom: 20px;
  }
  .rs-body li { margin-bottom: 8px; }
  .rs-body strong { color: var(--text-1); font-weight: 600; }
  .rs-body a { color: var(--blue); text-decoration: underline; text-underline-offset: 3px; }
  .rs-body a:hover { color: #93C5FD; }
  .rs-body hr {
    border: none; border-top: 1px solid var(--border);
    margin: 40px 0;
  }

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
    background: var(--bg-3); color: var(--text-2);
    font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;
    border-bottom: 1px solid var(--border);
  }
  .rs-table td {
    padding: 12px 16px; color: var(--text-1);
    border-bottom: 1px solid var(--border);
  }
  .rs-table tr:last-child td { border-bottom: none; }
  .rs-table tr:hover td { background: rgba(255,255,255,0.02); }

  /* Placeholder / draft notice */
  .rs-placeholder {
    background: rgba(245,166,35,0.08);
    border: 1px solid rgba(245,166,35,0.25);
    border-radius: 8px;
    padding: 14px 18px;
    font-size: 13px;
    color: #FCD34D;
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
  .rs-cta p { font-size: 15px; color: var(--text-2); margin-bottom: 24px; }
  .rs-cta-btn {
    display: inline-block;
    background: var(--blue); color: #fff !important;
    font-size: 15px; font-weight: 700;
    padding: 14px 28px; border-radius: 10px;
    transition: background 0.2s;
    text-decoration: none !important;
  }
  .rs-cta-btn:hover { background: #2563EB; color: #fff !important; text-decoration: none !important; }
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
  .rs-related li a { font-size: 14px; color: var(--blue); }
  .rs-related li a:hover { color: #93C5FD; }

  /* ── Footer ── */
  .rs-footer {
    background: var(--bg-2); border-top: 1px solid var(--border);
    padding: 28px 24px;
  }
  .rs-footer-inner {
    max-width: 1100px; margin: 0 auto;
    display: flex; justify-content: space-between; align-items: center;
    flex-wrap: wrap; gap: 12px;
  }
  .rs-footer-copy { font-size: 13px; color: var(--text-3); }
  .rs-footer-links { display: flex; gap: 20px; flex-wrap: wrap; }
  .rs-footer-links a { font-size: 13px; color: var(--text-3); transition: color 0.2s; }
  .rs-footer-links a:hover { color: var(--text-1); }

  /* ── Index page ── */
  .rs-index { max-width: 800px; margin: 0 auto; }
  .rs-index-header { margin-bottom: 48px; }
  .rs-index-header h1 {
    font-size: clamp(28px, 4vw, 40px); font-weight: 800;
    letter-spacing: -0.03em; color: var(--text-1); margin-bottom: 12px;
  }
  .rs-index-header p { font-size: 16px; color: var(--text-2); line-height: 1.6; }
  .rs-article-list { display: flex; flex-direction: column; gap: 2px; }
  .rs-article-card {
    display: block;
    background: var(--bg-2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 22px 24px;
    transition: border-color 0.2s, background 0.2s;
    text-decoration: none;
    margin-bottom: 10px;
  }
  .rs-article-card:hover { border-color: #374151; background: #161f2e; }
  .rs-article-card-title { font-size: 16px; font-weight: 600; color: var(--text-1); margin-bottom: 6px; }
  .rs-article-card-desc { font-size: 14px; color: var(--text-2); line-height: 1.55; }

  @media (max-width: 640px) {
    .rs-nav-links { gap: 16px; }
    .rs-nav-links a:not(.rs-nav-cta) { display: none; }
    .rs-main { padding: 40px 16px 80px; }
    .rs-cta { padding: 28px 20px; }
    .rs-article-card { padding: 18px 16px; }
  }
`;

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div className="rs-page">

        {/* ── NAV ── */}
        <nav className="rs-nav" aria-label="Main navigation">
          <div className="rs-nav-inner">
            <a href="/" aria-label="DeckMargin home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="DeckMargin" height={28} width={185} />
            </a>
            <div className="rs-nav-links">
              <a href="/resources">Resources</a>
              <a href="/login">Log in</a>
              <a href="/signup" className="rs-nav-cta">Start free trial</a>
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
              <a href="/resources">Resources</a>
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
