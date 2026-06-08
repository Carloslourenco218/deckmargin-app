"use client";

import { useEffect } from "react";

// ─── CSS ────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'Inter', -apple-system, sans-serif; background: #080d18; color: #f0f4ff; line-height: 1.6; -webkit-font-smoothing: antialiased; }
  img { max-width: 100%; display: block; }
  a { color: inherit; text-decoration: none; }
  ul { list-style: none; }
  button { cursor: pointer; font-family: inherit; border: none; }

  :root {
    --bg: #080d18; --bg-2: #0e1525; --bg-card: #121c2e; --bg-card-2: #172035;
    --border: rgba(255,255,255,0.07); --border-2: rgba(255,255,255,0.12);
    --green: #22c55e; --green-dim: #16a34a; --green-glow: rgba(34,197,94,0.15);
    --amber: #f59e0b; --amber-dim: #d97706;
    --text-1: #f0f4ff; --text-2: #8899b8; --text-3: #556070;
    --radius: 12px; --radius-lg: 18px;
    --shadow: 0 4px 24px rgba(0,0,0,0.4); --shadow-lg: 0 8px 48px rgba(0,0,0,0.6);
  }

  h1 { font-size: clamp(36px, 5vw, 60px); font-weight: 900; line-height: 1.08; letter-spacing: -0.03em; }
  h2 { font-size: clamp(28px, 3.5vw, 44px); font-weight: 800; line-height: 1.15; letter-spacing: -0.025em; }
  h3 { font-size: 20px; font-weight: 700; line-height: 1.3; }
  p  { color: var(--text-2); }

  .container { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
  .section { padding: 100px 0; }
  .section-label {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--green); background: var(--green-glow);
    border: 1px solid rgba(34,197,94,0.25); border-radius: 100px; padding: 5px 14px; margin-bottom: 20px;
  }
  .section-header { text-align: center; max-width: 680px; margin: 0 auto 64px; }
  .section-header p { font-size: 18px; margin-top: 16px; }

  .btn { display: inline-flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 700; border-radius: 10px; padding: 14px 28px; transition: all 0.2s ease; white-space: nowrap; }
  .btn-primary { background: var(--green); color: #000; }
  .btn-primary:hover { background: #1db854; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(34,197,94,0.35); }
  .btn-outline { background: transparent; color: var(--text-1); border: 1.5px solid var(--border-2); }
  .btn-outline:hover { border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.05); }
  .btn-lg { font-size: 18px; padding: 17px 36px; border-radius: 12px; }
  .btn-sm { font-size: 14px; padding: 10px 20px; }

  .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(8,13,24,0.85); backdrop-filter: blur(16px); border-bottom: 1px solid transparent; transition: border-color 0.3s; }
  .nav.scrolled { border-color: var(--border); }
  .nav-inner { display: flex; align-items: center; justify-content: space-between; height: 68px; }
  .nav-logo { font-size: 20px; font-weight: 900; letter-spacing: -0.03em; color: var(--text-1); }
  .nav-logo span { color: var(--green); }
  .nav-links { display: flex; align-items: center; gap: 32px; }
  .nav-links a { font-size: 14px; font-weight: 500; color: var(--text-2); transition: color 0.2s; }
  .nav-links a:hover { color: var(--text-1); }
  .nav-actions { display: flex; align-items: center; gap: 12px; }
  .nav-login { font-size: 14px; font-weight: 600; color: var(--text-2); transition: color 0.2s; }
  .nav-login:hover { color: var(--text-1); }
  .nav-mobile-btn { display: none; background: none; color: var(--text-1); font-size: 24px; }

  .hero { padding: 160px 0 100px; background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(34,197,94,0.08) 0%, transparent 70%); }
  .hero-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
  .hero-badge { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: var(--text-2); background: var(--bg-card); border: 1px solid var(--border-2); border-radius: 100px; padding: 7px 16px; margin-bottom: 24px; }
  .hero-badge .dot { width: 7px; height: 7px; background: var(--green); border-radius: 50%; }
  .hero h1 { margin-bottom: 24px; }
  .hero h1 .stat { color: var(--green); }
  .hero-sub { font-size: 18px; line-height: 1.7; color: var(--text-2); margin-bottom: 36px; }
  .hero-ctas { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 40px; }
  .hero-trust { display: flex; gap: 24px; flex-wrap: wrap; }
  .hero-trust-item { display: flex; flex-direction: column; }
  .hero-trust-item .trust-num { font-size: 22px; font-weight: 800; color: var(--text-1); letter-spacing: -0.03em; }
  .hero-trust-item .trust-label { font-size: 12px; color: var(--text-3); font-weight: 500; }
  .hero-divider { width: 1px; height: 40px; background: var(--border-2); align-self: center; }

  .hero-ui { background: var(--bg-card); border: 1px solid var(--border-2); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-lg), 0 0 80px rgba(34,197,94,0.06); }
  .ui-header { background: var(--bg-card-2); border-bottom: 1px solid var(--border); padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; }
  .ui-header-left { display: flex; align-items: center; gap: 10px; }
  .ui-dots { display: flex; gap: 6px; }
  .ui-dot { width: 10px; height: 10px; border-radius: 50%; }
  .ui-dot.r { background: #ff5f57; } .ui-dot.y { background: #febc2e; } .ui-dot.g { background: #28c840; }
  .ui-title { font-size: 13px; font-weight: 600; color: var(--text-2); }
  .ui-badge { font-size: 11px; font-weight: 700; background: rgba(34,197,94,0.15); color: var(--green); border: 1px solid rgba(34,197,94,0.3); border-radius: 100px; padding: 3px 10px; }
  .ui-body { padding: 20px; }
  .ui-project { font-size: 13px; color: var(--text-3); margin-bottom: 16px; }
  .ui-project strong { color: var(--text-2); }
  .ui-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
  .ui-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: var(--bg-2); border-radius: 8px; }
  .ui-row-label { font-size: 12px; color: var(--text-3); }
  .ui-row-val { font-size: 13px; font-weight: 600; color: var(--text-1); }
  .ui-divider { border: none; border-top: 1px solid var(--border); margin: 14px 0; }
  .ui-cost-row { display: flex; justify-content: space-between; padding: 6px 0; }
  .ui-cost-label { font-size: 13px; color: var(--text-2); }
  .ui-cost-val { font-size: 13px; font-weight: 600; color: var(--text-1); }
  .ui-margin-box { background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.2); border-radius: 10px; padding: 14px; margin-top: 14px; }
  .ui-margin-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .ui-margin-label { font-size: 12px; color: var(--text-2); }
  .ui-margin-val { font-size: 13px; font-weight: 700; color: var(--green); }
  .ui-send-price { display: flex; justify-content: space-between; align-items: center; background: var(--green); border-radius: 8px; padding: 12px 16px; margin-top: 14px; }
  .ui-send-label { font-size: 13px; font-weight: 700; color: #000; }
  .ui-send-val { font-size: 18px; font-weight: 900; color: #000; }
  .ui-footer { border-top: 1px solid var(--border); padding: 12px 20px; display: flex; align-items: center; justify-content: space-between; }
  .ui-footer-time { font-size: 12px; color: var(--text-3); }
  .ui-footer-time span { color: var(--amber); font-weight: 600; }

  .proof-bar { background: var(--bg-2); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 20px 0; }
  .proof-bar-inner { display: flex; align-items: center; justify-content: center; gap: 40px; flex-wrap: wrap; }
  .proof-item { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 500; color: var(--text-2); }
  .proof-item .icon { font-size: 18px; }
  .proof-item strong { color: var(--text-1); font-weight: 700; }

  .problem-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 16px; }
  .problem-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 28px; transition: border-color 0.2s; }
  .problem-card:hover { border-color: var(--border-2); }
  .problem-icon { font-size: 28px; margin-bottom: 14px; }
  .problem-card h3 { color: var(--text-1); margin-bottom: 10px; font-size: 17px; }
  .problem-card p { font-size: 14px; line-height: 1.7; }

  .new-features { background: var(--bg-2); }
  .new-badge { display: inline-block; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; background: var(--amber); color: #000; border-radius: 100px; padding: 3px 10px; margin-bottom: 14px; }
  .new-features-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .new-feature-card { background: var(--bg-card); border: 1px solid var(--border-2); border-radius: var(--radius-lg); padding: 32px; position: relative; overflow: hidden; }
  .new-feature-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, var(--green), transparent); }
  .new-feature-card .feature-icon-lg { font-size: 36px; margin-bottom: 16px; }
  .new-feature-card h3 { font-size: 22px; color: var(--text-1); margin-bottom: 10px; }
  .new-feature-card > p { font-size: 15px; line-height: 1.7; margin-bottom: 20px; }
  .feature-bullets { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
  .feature-bullet { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; color: var(--text-2); }
  .feature-bullet .check { color: var(--green); font-size: 15px; margin-top: 1px; flex-shrink: 0; }

  .canvas-mock { background: var(--bg-2); border: 1px solid var(--border); border-radius: 10px; padding: 16px; overflow: hidden; }
  .canvas-toolbar { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
  .canvas-tool { font-size: 11px; font-weight: 600; background: var(--bg-card); border: 1px solid var(--border-2); border-radius: 6px; padding: 5px 10px; color: var(--text-2); }
  .canvas-tool.active { background: var(--green); color: #000; border-color: var(--green); }
  .canvas-grid { display: grid; grid-template-columns: 3fr 1fr; gap: 8px; margin-bottom: 10px; }
  .canvas-cell { background: rgba(34,197,94,0.08); border: 1.5px solid rgba(34,197,94,0.3); border-radius: 8px; padding: 12px 10px; display: flex; flex-direction: column; justify-content: space-between; min-height: 80px; }
  .canvas-cell-label { font-size: 11px; font-weight: 700; color: var(--green); }
  .canvas-cell-size { font-size: 13px; font-weight: 600; color: var(--text-1); }
  .canvas-cell-mat { font-size: 11px; color: var(--text-2); }
  .canvas-stair { background: rgba(245,158,11,0.08); border: 1.5px dashed rgba(245,158,11,0.4); border-radius: 8px; padding: 8px; text-align: center; }
  .canvas-stair-label { font-size: 11px; font-weight: 600; color: var(--amber); }
  .canvas-stair-count { font-size: 13px; font-weight: 700; color: var(--text-1); }
  .canvas-apply-btn { width: 100%; background: var(--green); color: #000; border: none; border-radius: 7px; padding: 9px; font-size: 12px; font-weight: 800; cursor: default; display: flex; align-items: center; justify-content: center; gap: 6px; }
  .canvas-railing { background: rgba(99,102,241,0.08); border: 1.5px dashed rgba(99,102,241,0.35); border-radius: 8px; padding: 8px; text-align: center; margin-bottom: 8px; }
  .canvas-railing-label { font-size: 11px; font-weight: 600; color: #818cf8; }
  .canvas-railing-val { font-size: 13px; font-weight: 700; color: var(--text-1); }

  .takeoff-mock { background: var(--bg-2); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
  .takeoff-header { background: var(--bg-card-2); border-bottom: 1px solid var(--border); padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; }
  .takeoff-header-label { font-size: 12px; font-weight: 700; color: var(--text-2); }
  .takeoff-header-badge { font-size: 11px; font-weight: 600; color: var(--amber); background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.2); border-radius: 100px; padding: 2px 8px; }
  .takeoff-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-bottom: 1px solid var(--border); }
  .takeoff-row:last-child { border-bottom: none; }
  .takeoff-item { font-size: 13px; color: var(--text-2); }
  .takeoff-item strong { color: var(--text-1); font-weight: 600; }
  .takeoff-qty { font-size: 13px; font-weight: 700; color: var(--text-1); }
  .takeoff-unit { font-size: 11px; color: var(--text-3); font-weight: 400; }
  .takeoff-total { background: var(--bg-card-2); padding: 12px 14px; display: flex; justify-content: space-between; align-items: center; }
  .takeoff-total-label { font-size: 13px; font-weight: 700; color: var(--text-2); }
  .takeoff-total-val { font-size: 16px; font-weight: 800; color: var(--green); }

  .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  .feature-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 28px; transition: border-color 0.2s, transform 0.2s; }
  .feature-card:hover { border-color: var(--border-2); transform: translateY(-2px); }
  .feature-card .feature-icon { font-size: 28px; margin-bottom: 14px; }
  .feature-card h3 { font-size: 17px; margin-bottom: 10px; color: var(--text-1); }
  .feature-card p { font-size: 14px; line-height: 1.7; }

  .how-it-works { background: var(--bg-2); }
  .steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; position: relative; }
  .steps-grid::before { content: ''; position: absolute; top: 28px; left: calc(16.67% + 28px); right: calc(16.67% + 28px); height: 1px; background: linear-gradient(90deg, var(--green), var(--green-dim), var(--green)); opacity: 0.3; }
  .step { text-align: center; }
  .step-num { width: 56px; height: 56px; border-radius: 50%; background: var(--bg-card); border: 2px solid var(--green); color: var(--green); font-size: 20px; font-weight: 900; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
  .step h3 { color: var(--text-1); margin-bottom: 10px; }
  .step p { font-size: 15px; line-height: 1.7; }
  .step-time { display: inline-block; font-size: 12px; font-weight: 700; color: var(--amber); margin-top: 12px; background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.2); border-radius: 100px; padding: 4px 12px; }

  .testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  .testimonial-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 28px; }
  .stars { color: var(--amber); font-size: 14px; margin-bottom: 16px; letter-spacing: 2px; }
  .testimonial-card blockquote { font-size: 15px; line-height: 1.75; color: var(--text-2); font-style: italic; margin-bottom: 20px; }
  blockquote::before { content: '"'; } blockquote::after { content: '"'; }
  .testimonial-author { display: flex; align-items: center; gap: 12px; }
  .avatar { width: 42px; height: 42px; border-radius: 50%; background: var(--green-dim); color: #fff; font-size: 15px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .avatar.b { background: #2563eb; } .avatar.a { background: #7c3aed; }
  .author-info .name { font-size: 14px; font-weight: 700; color: var(--text-1); }
  .author-info .role { font-size: 12px; color: var(--text-3); }

  .comparison-wrap { overflow-x: auto; border-radius: var(--radius-lg); border: 1px solid var(--border-2); }
  .comparison-table { width: 100%; border-collapse: collapse; min-width: 640px; }
  .comparison-table th { padding: 18px 20px; text-align: left; font-size: 13px; border-bottom: 1px solid var(--border); background: var(--bg-card-2); }
  .comparison-table th.highlight { background: rgba(34,197,94,0.08); color: var(--green); font-size: 15px; font-weight: 800; text-align: center; border-left: 1px solid rgba(34,197,94,0.2); border-right: 1px solid rgba(34,197,94,0.2); }
  .comparison-table td { padding: 16px 20px; font-size: 14px; color: var(--text-2); border-bottom: 1px solid var(--border); }
  .comparison-table tr:last-child td { border-bottom: none; }
  .comparison-table td.highlight { background: rgba(34,197,94,0.04); text-align: center; font-weight: 700; color: var(--text-1); border-left: 1px solid rgba(34,197,94,0.1); border-right: 1px solid rgba(34,197,94,0.1); }
  .comparison-table td.center { text-align: center; }
  .check-yes { color: var(--green); font-size: 18px; } .check-no { color: var(--text-3); font-size: 18px; }

  .pricing-inner { max-width: 600px; margin: 0 auto; }
  .pricing-card { background: var(--bg-card); border: 1px solid rgba(34,197,94,0.3); border-radius: var(--radius-lg); padding: 48px; text-align: center; box-shadow: 0 0 60px rgba(34,197,94,0.06); position: relative; }
  .pricing-badge { position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: var(--green); color: #000; font-size: 12px; font-weight: 800; border-radius: 100px; padding: 5px 20px; white-space: nowrap; }
  .pricing-vs { font-size: 14px; color: var(--text-3); text-decoration: line-through; margin-bottom: 4px; }
  .pricing-price { font-size: 72px; font-weight: 900; color: var(--text-1); letter-spacing: -0.04em; line-height: 1; }
  .pricing-price sup { font-size: 32px; vertical-align: top; margin-top: 12px; }
  .pricing-price sub { font-size: 18px; font-weight: 400; color: var(--text-2); letter-spacing: 0; }
  .pricing-desc { font-size: 16px; color: var(--text-2); margin: 16px 0 32px; }
  .pricing-features { text-align: left; display: flex; flex-direction: column; gap: 14px; margin-bottom: 36px; }
  .pricing-feat { display: flex; align-items: flex-start; gap: 12px; font-size: 15px; color: var(--text-2); }
  .pricing-feat .pf-check { color: var(--green); font-size: 17px; flex-shrink: 0; margin-top: 2px; }
  .pricing-feat strong { color: var(--text-1); }
  .pricing-roi { background: rgba(34,197,94,0.06); border: 1px solid rgba(34,197,94,0.15); border-radius: 10px; padding: 16px 20px; margin-bottom: 28px; font-size: 14px; color: var(--text-2); line-height: 1.6; }
  .pricing-roi strong { color: var(--green); }
  .pricing-fine { font-size: 13px; color: var(--text-3); margin-top: 16px; }

  .faq-list { max-width: 720px; margin: 0 auto; display: flex; flex-direction: column; gap: 4px; }
  .faq-item { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
  .faq-question { width: 100%; background: none; text-align: left; display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; font-size: 16px; font-weight: 600; color: var(--text-1); transition: background 0.2s; }
  .faq-question:hover { background: rgba(255,255,255,0.02); }
  .faq-chevron { font-size: 18px; color: var(--text-3); transition: transform 0.3s; }
  .faq-item.open .faq-chevron { transform: rotate(180deg); }
  .faq-answer { display: none; padding: 0 24px 20px; font-size: 15px; color: var(--text-2); line-height: 1.75; }
  .faq-item.open .faq-answer { display: block; }

  .final-cta { background: radial-gradient(ellipse 80% 80% at 50% 100%, rgba(34,197,94,0.1) 0%, transparent 70%); text-align: center; padding: 120px 0; }
  .final-cta h2 { margin-bottom: 16px; }
  .final-cta p { font-size: 18px; max-width: 480px; margin: 0 auto 40px; }
  .final-cta-ctas { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; margin-bottom: 20px; }
  .final-cta-meta { font-size: 14px; color: var(--text-3); }
  .final-cta-meta span { margin: 0 8px; }

  .footer { background: var(--bg-2); border-top: 1px solid var(--border); padding: 48px 0 32px; }
  .footer-inner { display: flex; justify-content: space-between; align-items: flex-start; gap: 40px; flex-wrap: wrap; margin-bottom: 40px; }
  .footer-brand .nav-logo { font-size: 22px; margin-bottom: 10px; }
  .footer-brand p { font-size: 14px; max-width: 260px; line-height: 1.6; }
  .footer-links { display: flex; gap: 48px; flex-wrap: wrap; }
  .footer-col h4 { font-size: 13px; font-weight: 700; color: var(--text-1); margin-bottom: 14px; letter-spacing: 0.05em; text-transform: uppercase; }
  .footer-col a { display: block; font-size: 14px; color: var(--text-3); margin-bottom: 10px; transition: color 0.2s; }
  .footer-col a:hover { color: var(--text-1); }
  .footer-bottom { border-top: 1px solid var(--border); padding-top: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
  .footer-bottom p { font-size: 13px; color: var(--text-3); }

  .modal-overlay { display: none; position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); align-items: center; justify-content: center; }
  .modal-overlay.open { display: flex; }
  .modal-inner { width: 90%; max-width: 900px; background: var(--bg-card); border: 1px solid var(--border-2); border-radius: var(--radius-lg); overflow: hidden; position: relative; }
  .modal-close { position: absolute; top: 12px; right: 12px; z-index: 10; width: 36px; height: 36px; background: rgba(255,255,255,0.1); border: none; border-radius: 50%; color: #fff; font-size: 18px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s; }
  .modal-close:hover { background: rgba(255,255,255,0.2); }
  .modal-video-wrap { position: relative; padding-bottom: 56.25%; height: 0; }
  .modal-video-wrap iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }

  @media (max-width: 900px) {
    .hero-inner { grid-template-columns: 1fr; }
    .hero-ui { display: none; }
    .new-features-grid { grid-template-columns: 1fr; }
    .features-grid { grid-template-columns: repeat(2, 1fr); }
    .steps-grid { grid-template-columns: 1fr; gap: 32px; }
    .steps-grid::before { display: none; }
    .testimonials-grid { grid-template-columns: 1fr; }
    .problem-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 640px) {
    .section { padding: 64px 0; }
    .features-grid { grid-template-columns: 1fr; }
    .nav-links { display: none; }
    .nav-mobile-btn { display: block; }
    .hero { padding: 120px 0 64px; }
    .hero-ctas { flex-direction: column; }
    .hero-ctas .btn { text-align: center; justify-content: center; }
    .pricing-card { padding: 32px 24px; }
    .proof-bar-inner { gap: 20px; }
    .footer-inner { flex-direction: column; }
    .footer-links { gap: 24px; }
  }
`;

// ─── COMPONENT ──────────────────────────────────────────────────────────────
export default function Home() {
  useEffect(() => {
    const VIDEO_EMBED_URL = "https://www.youtube.com/embed/iUYQTmmHecQ?autoplay=1&rel=0";

    const modal = document.getElementById("videoModal") as HTMLDivElement | null;
    const videoFrame = document.getElementById("videoFrame") as HTMLIFrameElement | null;
    const closeBtn = document.getElementById("closeVideoBtn");

    const openVideo = () => {
      if (videoFrame) videoFrame.src = VIDEO_EMBED_URL;
      modal?.classList.add("open");
      document.body.style.overflow = "hidden";
    };
    const closeVideo = () => {
      modal?.classList.remove("open");
      if (videoFrame) videoFrame.src = "";
      document.body.style.overflow = "";
    };

    document.getElementById("openVideoBtn")?.addEventListener("click", openVideo);
    document.getElementById("openVideoBtn2")?.addEventListener("click", openVideo);
    document.getElementById("openVideoBtn3")?.addEventListener("click", openVideo);
    closeBtn?.addEventListener("click", closeVideo);
    modal?.addEventListener("click", (e) => { if (e.target === modal) closeVideo(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeVideo(); });

    const nav = document.getElementById("nav");
    const handleScroll = () => nav?.classList.toggle("scrolled", window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);

    document.querySelectorAll(".faq-question").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = btn.parentElement;
        const isOpen = item?.classList.contains("open");
        document.querySelectorAll(".faq-item").forEach((i) => i.classList.remove("open"));
        if (!isOpen) item?.classList.add("open");
      });
    });

    document.getElementById("mobileMenuBtn")?.addEventListener("click", () => {
      const links = document.querySelector(".nav-links") as HTMLElement | null;
      if (links) {
        const isShown = links.style.display === "flex";
        if (isShown) {
          links.removeAttribute("style");
        } else {
          Object.assign(links.style, {
            display: "flex", flexDirection: "column", position: "absolute",
            top: "68px", left: "0", right: "0", background: "#0e1525",
            padding: "24px", gap: "20px",
            borderBottom: "1px solid rgba(255,255,255,0.07)", zIndex: "99",
          });
        }
      }
    });

    document.querySelectorAll("a[href^='#']").forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        e.preventDefault();
        const href = (anchor as HTMLAnchorElement).getAttribute("href");
        if (href) document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    return () => { window.removeEventListener("scroll", handleScroll); };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* ── NAV ─────────────────────────────────────────────────── */}
      <nav className="nav" id="nav">
        <div className="container">
          <div className="nav-inner">
            <a href="/" className="nav-logo">Deck<span>Margin</span></a>
            <ul className="nav-links">
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
            <div className="nav-actions">
              <a href="/login" className="nav-login">Log in</a>
              <a href="/signup" className="btn btn-primary btn-sm">Start Free Trial</a>
            </div>
            <button className="nav-mobile-btn" id="mobileMenuBtn" aria-label="Menu">☰</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="hero" id="hero">
        <div className="container">
          <div className="hero-inner">
            <div className="hero-content">
              <div className="hero-badge">
                <span className="dot"></span>
                Built exclusively for deck contractors
              </div>
              <h1>Deck Builders Underprice Jobs by <span className="stat">20–30%.</span></h1>
              <p className="hero-sub">
                DeckMargin is the only tool built for deck contractors — design your deck visually, calculate exact material quantities, protect your margin, and send a professional proposal. All in one workflow, in under 10 minutes.
              </p>
              <div className="hero-ctas">
                <a href="/signup" className="btn btn-primary btn-lg">Start Free 14-Day Trial →</a>
                <button className="btn btn-outline btn-lg" id="openVideoBtn">▶ Watch 3-Min Demo</button>
              </div>
              <div className="hero-trust">
                <div className="hero-trust-item"><span className="trust-num">14</span><span className="trust-label">Day Free Trial</span></div>
                <div className="hero-divider"></div>
                <div className="hero-trust-item"><span className="trust-num">$99</span><span className="trust-label">Per Month</span></div>
                <div className="hero-divider"></div>
                <div className="hero-trust-item"><span className="trust-num">20 min</span><span className="trust-label">To Set Up</span></div>
                <div className="hero-divider"></div>
                <div className="hero-trust-item"><span className="trust-num">5–8 min</span><span className="trust-label">Per Estimate</span></div>
              </div>
            </div>

            <div className="hero-ui">
              <div className="ui-header">
                <div className="ui-header-left">
                  <div className="ui-dots">
                    <div className="ui-dot r"></div><div className="ui-dot y"></div><div className="ui-dot g"></div>
                  </div>
                  <span className="ui-title">DeckMargin — Live Estimate</span>
                </div>
                <span className="ui-badge">✓ Margin Protected</span>
              </div>
              <div className="ui-body">
                <div className="ui-project"><strong>Smith Residence</strong> · 320 sq ft · Trex Composite</div>
                <div className="ui-grid">
                  <div className="ui-row"><span className="ui-row-label">Deck Size</span><span className="ui-row-val">16 ft × 20 ft</span></div>
                  <div className="ui-row"><span className="ui-row-label">Material</span><span className="ui-row-val">Trex Composite</span></div>
                  <div className="ui-row"><span className="ui-row-label">Railing</span><span className="ui-row-val">Aluminum</span></div>
                  <div className="ui-row"><span className="ui-row-label">Stairs</span><span className="ui-row-val">2 sections</span></div>
                </div>
                <hr className="ui-divider" />
                <div className="ui-cost-row"><span className="ui-cost-label">Materials</span><span className="ui-cost-val">$12,480</span></div>
                <div className="ui-cost-row"><span className="ui-cost-label">Labor</span><span className="ui-cost-val">$7,900</span></div>
                <div className="ui-cost-row"><span className="ui-cost-label">Overhead</span><span className="ui-cost-val">$1,450</span></div>
                <div className="ui-cost-row"><span className="ui-cost-label">Total Job Cost</span><span className="ui-cost-val">$21,830</span></div>
                <div className="ui-margin-box">
                  <div className="ui-margin-row"><span className="ui-margin-label">Target Margin</span><span className="ui-margin-val">30%</span></div>
                  <div className="ui-margin-row" style={{marginBottom:0}}><span className="ui-margin-label">Expected Profit</span><span className="ui-margin-val">$9,355</span></div>
                </div>
                <div className="ui-send-price"><span className="ui-send-label">Send This Price</span><span className="ui-send-val">$31,185</span></div>
              </div>
              <div className="ui-footer">
                <span className="ui-footer-time">Estimate built in <span>⚡ 6 minutes</span></span>
                <span className="ui-footer-time">Margin verified ✓</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROOF BAR ───────────────────────────────────────────── */}
      <div className="proof-bar">
        <div className="container">
          <div className="proof-bar-inner">
            <div className="proof-item"><span className="icon">🔨</span><span>Built <strong>exclusively</strong> for deck contractors</span></div>
            <div className="proof-item"><span className="icon">⭐</span><span><strong>5-star</strong> rated by builders</span></div>
            <div className="proof-item"><span className="icon">💰</span><span>Recover margin on <strong>one job</strong> and it pays for itself</span></div>
            <div className="proof-item"><span className="icon">⚡</span><span>Set up in <strong>under 20 minutes</strong></span></div>
            <div className="proof-item"><span className="icon">🛠️</span><span><strong>Personal onboarding</strong> from the founder</span></div>
          </div>
        </div>
      </div>

      {/* ── PROBLEM ─────────────────────────────────────────────── */}
      <section className="section" id="problem">
        <div className="container">
          <div className="section-header">
            <div className="section-label">The Cost of Guessing</div>
            <h2>Deck Builders Are Losing Money on Jobs They Worked Hard to Complete.</h2>
            <p>It&apos;s not a skills problem. It&apos;s a pricing problem — and it shows up at the end of a job when the margin isn&apos;t where you thought it would be.</p>
          </div>
          <div className="problem-grid">
            <div className="problem-card"><div className="problem-icon">📋</div><h3>Estimating from memory leads to inconsistent pricing</h3><p>Every job priced differently. No standard. No baseline. One month you make money, the next you can&apos;t figure out why you didn&apos;t.</p></div>
            <div className="problem-card"><div className="problem-icon">📊</div><h3>Spreadsheets miss labor, stairs, framing, and overhead</h3><p>You built it yourself. You update it when you remember. Every time you&apos;re in a rush, something gets missed — and that something costs you.</p></div>
            <div className="problem-card"><div className="problem-icon">⏱️</div><h3>Slow quote turnaround costs you jobs</h3><p>Homeowner asks &quot;roughly what&apos;s this gonna cost?&quot; You go home to figure it up. By the time you send the quote, they&apos;ve called someone else.</p></div>
            <div className="problem-card"><div className="problem-icon">💸</div><h3>One missed cost wipes out profit on the entire job</h3><p>Forget demolition. Forget the permit allowance. Forget the site is elevated. There goes your margin — and sometimes more than that.</p></div>
          </div>
          <div style={{maxWidth:"680px",margin:"48px auto 0",background:"var(--bg-card)",border:"1px solid var(--border-2)",borderLeft:"3px solid var(--green)",borderRadius:"var(--radius)",padding:"28px 32px"}}>
            <p style={{fontSize:"18px",lineHeight:"1.75",color:"var(--text-1)",fontStyle:"italic",marginBottom:"16px"}}>&ldquo;My accountant taught me this as I was about to call it quits because I lost so much money on so many jobs. Changed my business — and still can&apos;t keep up with all the work.&rdquo;</p>
            <p style={{fontSize:"14px",color:"var(--text-3)",fontWeight:600}}>— Jay A., Deck Contractor</p>
          </div>
        </div>
      </section>

      {/* ── NEW FEATURES ────────────────────────────────────────── */}
      <section className="section new-features" id="new-features">
        <div className="container">
          <div className="section-header">
            <div className="section-label">Just Launched</div>
            <h2>Design, Calculate, and Price — All Before You Leave the Backyard.</h2>
            <p>Two new features that close the gap between what you design on-site and what you price from the office.</p>
          </div>
          <div className="new-features-grid">
            <div className="new-feature-card">
              <div className="new-badge">✦ New Feature</div>
              <div className="feature-icon-lg">🎨</div>
              <h3>Design Canvas</h3>
              <p>Lay out the deck visually on a drag-and-drop canvas. Add sections, stairs, and railing — then hit one button to push everything directly into the estimate.</p>
              <div className="feature-bullets">
                <div className="feature-bullet"><span className="check">✓</span>Drag-and-drop deck sections with real dimensions</div>
                <div className="feature-bullet"><span className="check">✓</span>Add stair modules, railing runs, and custom sections</div>
                <div className="feature-bullet"><span className="check">✓</span><strong style={{color:"var(--green)"}}>&ldquo;Apply to Estimate&rdquo;</strong> — one click updates dimensions, material type, stair count, and cost automatically</div>
                <div className="feature-bullet"><span className="check">✓</span>Design summary auto-appears in your proposal PDF — total sq ft, railing footage, stair count, material type</div>
              </div>
              <div className="canvas-mock">
                <div className="canvas-toolbar">
                  <span className="canvas-tool active">🎨 Design</span>
                  <span className="canvas-tool">📐 Deck Section</span>
                  <span className="canvas-tool">⬆ Stairs</span>
                  <span className="canvas-tool">〰 Railing</span>
                </div>
                <div className="canvas-railing"><div className="canvas-railing-label">Aluminum Railing</div><div className="canvas-railing-val">72 linear ft</div></div>
                <div className="canvas-grid">
                  <div className="canvas-cell"><div className="canvas-cell-label">Main Deck</div><div className="canvas-cell-size">16 ft × 20 ft</div><div className="canvas-cell-mat">Trex Composite · 320 sqft</div></div>
                  <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                    <div className="canvas-cell" style={{minHeight:"unset",flex:1}}><div className="canvas-cell-label">Extension</div><div className="canvas-cell-size">8 × 10 ft</div><div className="canvas-cell-mat">80 sqft</div></div>
                    <div className="canvas-stair"><div className="canvas-stair-label">Stairs</div><div className="canvas-stair-count">2 sections</div></div>
                  </div>
                </div>
                <button className="canvas-apply-btn">⬆ Apply to Estimate</button>
              </div>
            </div>

            <div className="new-feature-card">
              <div className="new-badge">✦ New Feature</div>
              <div className="feature-icon-lg">📋</div>
              <h3>Material Takeoff</h3>
              <p>Know exactly what to order before you price the job. DeckMargin calculates every material quantity automatically from your project inputs — no manual counting.</p>
              <div className="feature-bullets">
                <div className="feature-bullet"><span className="check">✓</span>Auto-calculated board counts, linear footage, and hardware quantities</div>
                <div className="feature-bullet"><span className="check">✓</span>Pulls directly from your deck dimensions, material type, and layout</div>
                <div className="feature-bullet"><span className="check">✓</span>Eliminates the &quot;forgot to order enough&quot; problem on composite and PVC jobs</div>
                <div className="feature-bullet"><span className="check">✓</span>Run it before you price — know your material cost is accurate before the quote goes out</div>
              </div>
              <div className="takeoff-mock">
                <div className="takeoff-header"><span className="takeoff-header-label">📋 Material Takeoff — Smith Residence</span><span className="takeoff-header-badge">320 sqft Trex</span></div>
                <div className="takeoff-row"><span className="takeoff-item"><strong>Trex Composite Decking</strong></span><span className="takeoff-qty">285 <span className="takeoff-unit">boards</span></span></div>
                <div className="takeoff-row"><span className="takeoff-item"><strong>2×8 Framing Lumber</strong></span><span className="takeoff-qty">124 <span className="takeoff-unit">pieces</span></span></div>
                <div className="takeoff-row"><span className="takeoff-item"><strong>Aluminum Post Caps</strong></span><span className="takeoff-qty">18 <span className="takeoff-unit">units</span></span></div>
                <div className="takeoff-row"><span className="takeoff-item"><strong>Joist Hangers</strong></span><span className="takeoff-qty">248 <span className="takeoff-unit">units</span></span></div>
                <div className="takeoff-row"><span className="takeoff-item"><strong>Concrete (Footings)</strong></span><span className="takeoff-qty">12 <span className="takeoff-unit">bags</span></span></div>
                <div className="takeoff-total"><span className="takeoff-total-label">Total Material Cost</span><span className="takeoff-total-val">$12,480</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CORE FEATURES ───────────────────────────────────────── */}
      <section className="section" id="features">
        <div className="container">
          <div className="section-header">
            <div className="section-label">What DeckMargin Covers</div>
            <h2>Every Input That Actually Shapes a Deck Job&apos;s Profitability.</h2>
            <p>Built for real deck jobs — not generic construction, not roofers, not siders. Every field, every add-on, every cost line was put here because a deck contractor asked for it.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card"><div className="feature-icon">📐</div><h3>Price the Job On the Spot</h3><p>Sq ft, linear ft of rail, height tier, stairs, material type — put it all in and get a number you can stand behind while you&apos;re still in the backyard.</p></div>
            <div className="feature-card"><div className="feature-icon">🎯</div><h3>Know Your Margin Before the Homeowner Sees a Price</h3><p>View total cost, expected profit, target margin, and final price before you send anything. You&apos;ll never leave money on the table again.</p></div>
            <div className="feature-card"><div className="feature-icon">📄</div><h3>Send Proposals That Win Jobs</h3><p>Generate clean, client-facing proposals that explain the scope clearly and make you look like a professional operation. Signature lines included.</p></div>
            <div className="feature-card"><div className="feature-icon">⚙️</div><h3>Set Your Rates Once, Use Them Forever</h3><p>Your labor rate, your overhead, your markup — saved. Every estimate you build uses your numbers automatically. Standardized pricing across every job.</p></div>
            <div className="feature-card"><div className="feature-icon">🏗️</div><h3>Built for Real Deck Jobs</h3><p>Framing, decking, railing, stairs, footings, fascia, demolition, permit allowance, height tiers, composite vs pressure treated — it&apos;s all in there.</p></div>
            <div className="feature-card"><div className="feature-icon">➕</div><h3>Custom Line Items for Jobs That Need Them</h3><p>Every job has something unique. Add custom line items so nothing gets missed — no more missed costs wiping out your margin after the quote goes out.</p></div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────── */}
      <section className="section how-it-works" id="how-it-works">
        <div className="container">
          <div className="section-header">
            <div className="section-label">The Workflow</div>
            <h2>Three Steps. One Workflow. Done.</h2>
            <p>Set your pricing rules once. Build estimates in minutes. Send proposals that make you look like a $5M operation — even if it&apos;s just you and a crew.</p>
          </div>
          <div className="steps-grid">
            <div className="step"><div className="step-num">1</div><h3>Set Your Pricing Rules Once</h3><p>Enter your labor rates, material assumptions, overhead, and target margin. Do it once. DeckMargin uses those numbers on every estimate you build from that point forward.</p><div className="step-time">⚡ 15–20 minutes, one time</div></div>
            <div className="step"><div className="step-num">2</div><h3>Design the Deck &amp; Build the Estimate</h3><p>Sketch the layout on the Design Canvas, run your Material Takeoff, then build the full estimate. Deck size, material, stairs, railing, height tier, add-ons — all calculated automatically.</p><div className="step-time">⚡ 5–8 minutes per job</div></div>
            <div className="step"><div className="step-num">3</div><h3>Review Your Margin and Send the Proposal</h3><p>See your total cost, expected profit, and target margin before the homeowner sees a price. Generate a clean proposal — with design summary — in the same workflow.</p><div className="step-time">⚡ Know your number before you leave</div></div>
          </div>
          <div style={{textAlign:"center",marginTop:"48px"}}>
            <button className="btn btn-outline" id="openVideoBtn2">▶ Watch the Full 3-Minute Tutorial</button>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────── */}
      <section className="section" id="testimonials">
        <div className="container">
          <div className="section-header">
            <div className="section-label">Real Builders Using DeckMargin</div>
            <h2>What Contractors Are Saying.</h2>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card"><div className="stars">★★★★★</div><blockquote>DeckMargin is definitely quicker than spreadsheets and old quotes. The biggest thing for me is seeing the profit breakdown clearly before I send a price. I know exactly where I stand before the homeowner sees a number.</blockquote><div className="testimonial-author"><div className="avatar">M</div><div className="author-info"><div className="name">Mario R.</div><div className="role">Deck Contractor</div></div></div></div>
            <div className="testimonial-card"><div className="stars">★★★★★</div><blockquote>This helped me tighten up my numbers and stop relying only on gut feel. I like how clearly it breaks down materials, labor, and profit. I can actually see what I&apos;m making on each job before I commit to a price.</blockquote><div className="testimonial-author"><div className="avatar b">B</div><div className="author-info"><div className="name">Brian T.</div><div className="role">Deck Builder</div></div></div></div>
            <div className="testimonial-card"><div className="stars">★★★★★</div><blockquote>DeckMargin helped us standardize quoting and keep pricing more consistent across jobs. It makes it easier to know we&apos;re covering costs and hitting the margins we want on every single project.</blockquote><div className="testimonial-author"><div className="avatar a">A</div><div className="author-info"><div className="name">Antonio S.</div><div className="role">Small Crew Owner</div></div></div></div>
          </div>
        </div>
      </section>

      {/* ── COMPARISON ──────────────────────────────────────────── */}
      <section className="section" style={{background:"var(--bg-2)"}} id="compare">
        <div className="container">
          <div className="section-header">
            <div className="section-label">How DeckMargin Stacks Up</div>
            <h2>Not Another All-In-One Platform.</h2>
            <p>We do three things — estimate, protect margin, send proposal — and we do them better than any all-in-one tool built for every trade under the sun.</p>
          </div>
          <div className="comparison-wrap">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th style={{width:"40%"}}>Feature</th>
                  <th style={{textAlign:"center"}}>Spreadsheets</th>
                  <th style={{textAlign:"center"}}>All-In-One Software</th>
                  <th className="highlight">DeckMargin</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Built specifically for deck contractors</td><td className="center"><span className="check-no">✕</span></td><td className="center"><span className="check-no">✕</span></td><td className="highlight"><span className="check-yes">✓</span></td></tr>
                <tr><td>Visual Design Canvas for deck layout</td><td className="center"><span className="check-no">✕</span></td><td className="center"><span className="check-no">✕</span></td><td className="highlight"><span className="check-yes">✓</span></td></tr>
                <tr><td>Auto material takeoff from job inputs</td><td className="center"><span className="check-no">✕</span></td><td className="center"><span className="check-no">✕</span></td><td className="highlight"><span className="check-yes">✓</span></td></tr>
                <tr><td>Margin visible before quote goes out</td><td className="center"><span className="check-no">✕</span></td><td className="center"><span className="check-yes">✓</span></td><td className="highlight"><span className="check-yes">✓</span></td></tr>
                <tr><td>Professional proposal in same workflow</td><td className="center"><span className="check-no">✕</span></td><td className="center"><span className="check-yes">✓</span></td><td className="highlight"><span className="check-yes">✓</span></td></tr>
                <tr><td>Deck-specific inputs (height tiers, stair sections, composite)</td><td className="center"><span className="check-no">✕</span></td><td className="center"><span className="check-no">✕</span></td><td className="highlight"><span className="check-yes">✓</span></td></tr>
                <tr><td>Setup time</td><td className="center" style={{color:"var(--text-2)"}}>Hours building it yourself</td><td className="center" style={{color:"var(--text-2)"}}>Days to weeks</td><td className="highlight" style={{color:"var(--green)"}}>20 minutes</td></tr>
                <tr><td>Monthly cost</td><td className="center" style={{color:"var(--text-2)"}}>Free (costs you margin)</td><td className="center" style={{color:"var(--text-2)"}}>$199–$400/mo</td><td className="highlight" style={{color:"var(--green)",fontSize:"18px"}}>$99/mo</td></tr>
              </tbody>
            </table>
          </div>
          <p style={{textAlign:"center",fontSize:"14px",color:"var(--text-3)",marginTop:"24px",maxWidth:"600px",marginLeft:"auto",marginRight:"auto"}}>Most all-in-one contractor software costs $200–$400/month and makes you pay for crew scheduling, punch lists, and time tracking you&apos;ll never use as a deck contractor. DeckMargin does three things and charges $99/month.</p>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────── */}
      <section className="section" id="pricing">
        <div className="container">
          <div className="section-header">
            <div className="section-label">Simple Pricing</div>
            <h2>One Price. No Surprises.</h2>
            <p>No tiers. No annual contracts. No features locked behind an upgrade. Everything included — cancel anytime.</p>
          </div>
          <div className="pricing-inner">
            <div className="pricing-card">
              <div className="pricing-badge">Everything Included · Cancel Anytime</div>
              <div className="pricing-vs">vs. $199–$400/mo for all-in-one tools</div>
              <div className="pricing-price"><sup>$</sup>99<sub>/month</sub></div>
              <p className="pricing-desc">Built for deck contractors only. Free for 14 days — no credit card required to start.</p>
              <div className="pricing-features">
                <div className="pricing-feat"><span className="pf-check">✓</span><span><strong>Design Canvas</strong> — visual deck layout with one-click estimate sync</span></div>
                <div className="pricing-feat"><span className="pf-check">✓</span><span><strong>Material Takeoff</strong> — auto-calculated quantities from your job inputs</span></div>
                <div className="pricing-feat"><span className="pf-check">✓</span><span><strong>Full Estimating Workflow</strong> — deck size, materials, stairs, railing, height tiers, custom line items</span></div>
                <div className="pricing-feat"><span className="pf-check">✓</span><span><strong>Margin &amp; Profit Visibility</strong> — see total cost, profit, and target margin before the quote goes out</span></div>
                <div className="pricing-feat"><span className="pf-check">✓</span><span><strong>Professional Proposal PDF</strong> — includes design summary, clean scope, and signature block</span></div>
                <div className="pricing-feat"><span className="pf-check">✓</span><span><strong>Saved Pricing Rules</strong> — set your rates once, used on every future estimate automatically</span></div>
                <div className="pricing-feat"><span className="pf-check">✓</span><span><strong>Personal Onboarding From the Founder</strong> — you&apos;re not figuring this out alone</span></div>
              </div>
              <div className="pricing-roi"><strong>The math is simple:</strong> At $99/month, you only need to recover margin on <strong>one job per year</strong> to pay for the whole subscription. Most contractors recover that in the first week.</div>
              <a href="/signup" className="btn btn-primary btn-lg" style={{width:"100%",justifyContent:"center"}}>Start Free 14-Day Trial →</a>
              <p className="pricing-fine">Free for 14 days · No credit card required · Set up in 20 minutes</p>
              <p className="pricing-fine" style={{marginTop:"10px"}}>Questions? <a href="mailto:carlos.lourenco@deckmargin.com" style={{color:"var(--green)"}}>Email the founder directly →</a></p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────── */}
      <section className="section" style={{background:"var(--bg-2)"}} id="faq">
        <div className="container">
          <div className="section-header">
            <div className="section-label">Common Questions</div>
            <h2>Everything You Need to Know.</h2>
          </div>
          <div className="faq-list">
            <div className="faq-item"><button className="faq-question">Do I need to be tech-savvy to use DeckMargin?<span className="faq-chevron">⌄</span></button><div className="faq-answer">No. DeckMargin is built for contractors, not software engineers. Most builders are fully set up and running their first estimate within 20 minutes. If you get stuck, we set up your account with you personally — the founder does every onboarding call.</div></div>
            <div className="faq-item"><button className="faq-question">What&apos;s the Design Canvas exactly?<span className="faq-chevron">⌄</span></button><div className="faq-answer">It&apos;s a visual drag-and-drop tool inside your project where you can lay out the actual deck — deck sections with dimensions, stair modules, and railing runs. Once you&apos;ve built the layout, one click on &quot;Apply to Estimate&quot; pushes all the dimensions, material type, stair count, and costs directly into your estimate. The design summary also appears automatically in your proposal PDF.</div></div>
            <div className="faq-item"><button className="faq-question">What does the Material Takeoff give me?<span className="faq-chevron">⌄</span></button><div className="faq-answer">A complete material quantity list calculated from your project inputs — board counts, linear footage for railing, hardware quantities, footing concrete, framing lumber. It&apos;s the &quot;what to order&quot; output before you price the job, so your material cost in the estimate is accurate before the quote goes out.</div></div>
            <div className="faq-item"><button className="faq-question">I build different job types — new builds, resurfaces, railing only. Does DeckMargin handle all of them?<span className="faq-chevron">⌄</span></button><div className="faq-answer">Yes. DeckMargin supports New Build, Resurface, Railing Only, Repair, and Addition job types. Each type adjusts the relevant inputs so you&apos;re only filling in what actually applies to that job.</div></div>
            <div className="faq-item"><button className="faq-question">Will this replace my CRM or scheduling software?<span className="faq-chevron">⌄</span></button><div className="faq-answer">No — and that&apos;s intentional. DeckMargin does three things: estimate, protect margin, and send proposal. It&apos;s not trying to replace your CRM, your scheduling tool, or your QuickBooks. Use it alongside whatever else you use.</div></div>
            <div className="faq-item"><button className="faq-question">What happens after the 14-day trial?<span className="faq-chevron">⌄</span></button><div className="faq-answer">After 14 days, your account moves to $99/month. You&apos;re never charged during the trial — no credit card is required to start. If DeckMargin isn&apos;t right for you, just cancel before the trial ends. No questions, no friction.</div></div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────── */}
      <section className="final-cta">
        <div className="container">
          <div className="section-label">Ready to Stop Underpricing?</div>
          <h2>Know Your Number.<br />Every Job. Every Time.</h2>
          <p>Stop pricing from spreadsheets, gut feel, and old quotes. Design your deck, calculate your materials, and send a margin-protected proposal — before you leave the backyard.</p>
          <div className="final-cta-ctas">
            <a href="/signup" className="btn btn-primary btn-lg">Start Free 14-Day Trial →</a>
            <button className="btn btn-outline btn-lg" id="openVideoBtn3">▶ Watch 3-Min Demo</button>
          </div>
          <div className="final-cta-meta">Free for 14 days <span>·</span> No credit card required <span>·</span> Set up in 20 minutes</div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="footer">
        <div className="container">
          <div className="footer-inner">
            <div className="footer-brand">
              <a href="/" className="nav-logo">Deck<span>Margin</span></a>
              <p>The only estimating, design, and margin tool built exclusively for deck contractors.</p>
            </div>
            <div className="footer-links">
              <div className="footer-col"><h4>Product</h4><a href="#how-it-works">How It Works</a><a href="#features">Features</a><a href="#new-features">What&apos;s New</a><a href="#pricing">Pricing</a></div>
              <div className="footer-col"><h4>Account</h4><a href="/signup">Start Free Trial</a><a href="/login">Log In</a></div>
              <div className="footer-col"><h4>Support</h4><a href="mailto:carlos.lourenco@deckmargin.com">Contact Us</a><a href="#faq">FAQ</a></div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 DeckMargin. All rights reserved.</p>
            <p>Built for deck contractors. Nobody else.</p>
          </div>
        </div>
      </footer>

      {/* ── VIDEO MODAL ─────────────────────────────────────────── */}
      <div className="modal-overlay" id="videoModal">
        <div className="modal-inner">
          <button className="modal-close" id="closeVideoBtn">✕</button>
          <div className="modal-video-wrap">
            <iframe
              id="videoFrame"
              src=""
              frameBorder={0}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </>
  );
}
