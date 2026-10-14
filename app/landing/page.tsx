"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

// ── DATA ────────────────────────────────────────────────────────────────────

const whoItems = [
  {
    title: "You're still pricing from spreadsheets or old quotes",
    body: "You copy last month's estimate, change a few numbers, and hope the material costs haven't changed too much.",
  },
  {
    title: "You've finished a job and the margin wasn't there",
    body: "You worked hard, the customer was happy, but when you looked at the numbers - something was off. You're not sure what.",
  },
  {
    title: "You quote on the spot and you're not fully confident",
    body: "Homeowner asks for a number in the backyard. You give one. You drive home wondering if it was right.",
  },
  {
    title: "You build a new estimate from scratch every time",
    body: "No template. No saved rates. Every job starts from zero and takes twice as long as it should.",
  },
  {
    title: "You want to look more professional without hiring office staff",
    body: "Your work is excellent. Your proposals don't reflect that. You're sending quotes that look like they came from a legal pad.",
  },
  {
    title: "You're tired of paying for software built for roofers",
    body: "You tried the all-in-one platforms. They're $200–$400/month and 80% of the features don't apply to a deck contractor.",
  },
];

const painCards = [
  {
    icon: "📋",
    title: "Estimating from memory leads to inconsistent pricing",
    body: "Every job priced differently. No standard. No baseline. One job you make money, the next you don't know why you didn't.",
  },
  {
    icon: "📊",
    title: "Spreadsheets make it easy to miss labor, stairs, framing, and overhead",
    body: "You built the spreadsheet yourself. You update it when you remember. And every time you're in a rush, something gets missed.",
  },
  {
    icon: "⏱️",
    title: "Slow quote turnaround costs you jobs",
    body: "Homeowner asks \"roughly what's this gonna cost?\" You go home to figure it up. By the time you send the quote, they've already called someone else.",
  },
  {
    icon: "💸",
    title: "One missed cost wipes out profit on the entire project",
    body: "Forget demolition. Forget permit allowance. Forget that the site is elevated. There goes your margin, and sometimes more.",
  },
];

const steps = [
  {
    step: "01",
    title: "Set Your Pricing Rules Once",
    body: "Enter your labor rates, material assumptions, overhead, and target margin. Do it once. DeckMargin uses those numbers on every estimate you build from that point forward.",
    time: "15–20 minutes, one time",
  },
  {
    step: "02",
    title: "Build the Estimate from Real Job Inputs",
    body: "Enter deck size, material type, stairs, railing, height tier, and any custom line items. DeckMargin calculates materials, labor, overhead, and your final price automatically.",
    time: "5–8 minutes per job",
  },
  {
    step: "03",
    title: "Review Your Margin and Send the Proposal",
    body: "See your total cost, expected profit, and target margin before the homeowner sees a price. Then generate a clean, professional proposal in the same workflow. No extra steps.",
    time: "Know your number before you leave the backyard",
  },
];

const features = [
  {
    icon: "📐",
    title: "Price the Job on the Spot",
    body: "Sq ft, linear ft of rail, height tier, stairs, material type: put it all in and get a number you can stand behind while you're still in the backyard. No more going home to figure it up and losing the job to someone who quoted on the spot.",
  },
  {
    icon: "🎯",
    title: "Know Your Margin Before the Homeowner Sees a Price",
    body: "View total cost, expected profit, target margin, and final price before you send anything. You'll never wonder if you left money on the table again, because you'll see the number in black and white first.",
  },
  {
    icon: "📄",
    title: "Send Proposals That Win Jobs",
    body: "Generate clean, client-facing proposals that explain the scope clearly and make you look like a professional operation. Signature lines included. Homeowners trust what they can read and understand.",
  },
  {
    icon: "⚙️",
    title: "Set Your Rates Once, Use Them Forever",
    body: "Your labor rate, your overhead, your markup, saved. Every estimate you build uses your numbers automatically. Standardized pricing across every job, every time, without starting from scratch.",
  },
  {
    icon: "🏗️",
    title: "Built for Real Deck Jobs, Not Generic Construction",
    body: "Framing, decking, railing, stairs, footings, fascia, demolition, permit allowance, height tiers, composite vs pressure treated. It is all in there because we built this specifically for deck contractors, not roofers or siders.",
  },
  {
    icon: "➕",
    title: "Custom Line Items for Jobs That Need Them",
    body: "Every job has something unique. Add custom line items to any estimate so nothing gets missed. That is the missed line item that wipes out your margin, accounted for before the quote goes out.",
  },
];

const compareRows = [
  {
    feature: "Built specifically for deck contractors",
    spreadsheet: false,
    allInOne: false,
    deckmargin: true,
  },
  {
    feature: "Margin visible before quote goes out",
    spreadsheet: false,
    allInOne: true,
    deckmargin: true,
  },
  {
    feature: "Professional proposal in same workflow",
    spreadsheet: false,
    allInOne: true,
    deckmargin: true,
  },
  {
    feature: "Setup time",
    spreadsheet: "Hours building it yourself",
    allInOne: "Days to weeks",
    deckmargin: "20 minutes",
    highlight: true,
  },
  {
    feature: "Deck-specific inputs (height tiers, composite, stair sections)",
    spreadsheet: false,
    allInOne: false,
    deckmargin: true,
  },
  {
    feature: "Monthly cost",
    spreadsheet: "Free (costs you margin)",
    allInOne: "$199–$400/mo",
    deckmargin: "$99/month",
    highlight: true,
  },
];

const testimonials = [
  {
    name: "Mario R.",
    role: "Deck Contractor",
    initial: "M",
    quote:
      "DeckMargin is definitely quicker than spreadsheets and old quotes. The biggest thing for me is seeing the profit breakdown clearly before I send a price. I know exactly where I stand before the homeowner sees a number.",
  },
  {
    name: "Brian T.",
    role: "Deck Builder",
    initial: "B",
    quote:
      "This helped me tighten up my numbers and stop relying only on gut feel. I like how clearly it breaks down materials, labor, and profit. I can actually see what I'm making on each job before I commit to a price.",
  },
  {
    name: "Antonio S.",
    role: "Small Crew Owner",
    initial: "A",
    quote:
      "DeckMargin helped us standardize quoting and keep pricing more consistent across jobs. It makes it easier to know we're covering costs and hitting the margins we want on every single project.",
  },
];

const pricingFeatures = [
  {
    title: "Full Estimating Workflow",
    body: "Deck size, materials, stairs, railing, height tiers, custom line items. All of it.",
  },
  {
    title: "Margin & Profit Visibility",
    body: "See total cost, expected profit, and target margin before the quote goes out.",
  },
  {
    title: "Professional Proposal Generation",
    body: "Clean, client-facing proposals in the same workflow. No extra steps.",
  },
  {
    title: "Saved Pricing Rules",
    body: "Set your rates once. Every future estimate uses your numbers automatically.",
  },
  {
    title: "Personal Onboarding From the Founder",
    body: "We'll set up your account with you personally. You're not figuring this out alone.",
  },
];

const VIDEO_ID = "iUYQTmmHecQ";

const estimateLines = [
  { label: "Materials", value: "$12,480", sub: "16×20 Trex Composite" },
  { label: "Labor", value: "$7,900", sub: "Framing, decking, railing, stairs" },
  { label: "Overhead", value: "$1,450", sub: "Permit allowance + misc" },
  { label: "Total Job Cost", value: "$21,830", sub: null, isTotal: true },
  { label: "Target Margin", value: "30%", sub: null, isMargin: true },
  { label: "Expected Profit", value: "$9,355", sub: null, isMargin: true },
  { label: "Selling Price", value: "$31,185", sub: "Send this number", isFinal: true },
];

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

// ── COMPONENTS ───────────────────────────────────────────────────────────────

function SectionLabel({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <div style={{
      fontSize: "11px",
      fontWeight: 700,
      letterSpacing: "0.2em",
      textTransform: "uppercase" as const,
      color: light ? "#FBB944" : "#FBB944",
      marginBottom: "16px",
    }}>
      {children}
    </div>
  );
}

function PrimaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="dm-primary-btn"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#FBB944",
        color: "#1D2C4B",
        borderRadius: "999px",
        padding: "14px 32px",
        fontSize: "15px",
        fontWeight: 700,
        textDecoration: "none",
        fontFamily: "inherit",
        border: "none",
        cursor: "pointer",
        whiteSpace: "nowrap" as const,
      }}
    >
      {children}
    </Link>
  );
}

function GhostButton({ onClick, children, dark }: { onClick: () => void; children: React.ReactNode; dark?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="dm-ghost-btn"
      data-dark={dark ? "true" : undefined}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        background: "transparent",
        color: dark ? "#fff" : "#1D2C4B",
        borderRadius: "999px",
        padding: "14px 28px",
        fontSize: "15px",
        fontWeight: 600,
        border: `1.5px solid ${dark ? "rgba(255,255,255,0.4)" : "#1D2C4B"}`,
        cursor: "pointer",
        whiteSpace: "nowrap" as const,
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}

function VideoModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition text-lg"
          aria-label="Close video"
        >
          ✕
        </button>
        <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&rel=0`}
            title="DeckMargin: How It Works"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <div style={{ marginTop: "2px", display: "flex", width: "20px", height: "20px", flexShrink: 0, alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "rgba(16,185,129,0.12)" }}>
      <svg viewBox="0 0 12 12" style={{ width: "12px", height: "12px", stroke: "#10B981" }} fill="none" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="2,6 5,9 10,3" />
      </svg>
    </div>
  );
}

// ── PAGE ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [videoOpen, setVideoOpen] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isFinePrimary = window.matchMedia("(pointer: fine)").matches;

    // ── Nav scroll ──────────────────────────────────────────────────────────
    const nav = document.getElementById("site-nav");
    const onScroll = () => {
      if (nav) nav.classList.toggle("nav-scrolled", window.scrollY > 40);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // ── Custom cursor ────────────────────────────────────────────────────────
    let cursorRaf = 0;
    if (isFinePrimary) {
      const dot = document.getElementById("cursor-dot");
      const ring = document.getElementById("cursor-ring");
      if (dot && ring) {
        dot.style.opacity = "1";
        ring.style.opacity = "1";
        document.body.style.cursor = "none";

        let mx = window.innerWidth / 2;
        let my = window.innerHeight / 2;
        let rx = mx;
        let ry = my;
        let isHover = false;

        const onMove = (e: MouseEvent) => {
          mx = e.clientX;
          my = e.clientY;
          dot.style.transform = `translate(${mx - 5}px,${my - 5}px)`;
        };
        window.addEventListener("mousemove", onMove);

        const ringSize = () => isHover ? 48 : 32;
        const animate = () => {
          rx += (mx - rx) * 0.12;
          ry += (my - ry) * 0.12;
          const half = ringSize() / 2;
          ring.style.transform = `translate(${rx - half}px,${ry - half}px)`;
          if (isHover) {
            ring.style.width = "48px";
            ring.style.height = "48px";
            ring.style.borderColor = "rgba(251,185,68,0.55)";
          } else {
            ring.style.width = "32px";
            ring.style.height = "32px";
            ring.style.borderColor = "rgba(29,44,75,0.35)";
          }
          cursorRaf = requestAnimationFrame(animate);
        };
        cursorRaf = requestAnimationFrame(animate);

        const addHover = () => { isHover = true; };
        const removeHover = () => { isHover = false; };
        const hoverEls = document.querySelectorAll("a, button, [data-hover]");
        hoverEls.forEach(el => {
          el.addEventListener("mouseenter", addHover);
          el.addEventListener("mouseleave", removeHover);
        });
      }
    }

    // ── IntersectionObserver for section fade-ups ─────────────────────────
    if (!prefersReducedMotion) {
      const fadeEls = document.querySelectorAll(".fade-up");
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry, idx) => {
            if (entry.isIntersecting) {
              const delay = parseFloat((entry.target as HTMLElement).dataset.delay || "0");
              setTimeout(() => entry.target.classList.add("visible"), delay * 1000);
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 }
      );
      fadeEls.forEach((el) => io.observe(el));
    } else {
      document.querySelectorAll(".fade-up").forEach((el) => el.classList.add("visible"));
    }

    // ── GSAP + Lenis (CDN) ───────────────────────────────────────────────────
    if (!prefersReducedMotion) {
      (async () => {
        try {
          await loadScript("https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js");
          await loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js");
          await loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js");

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const w = window as any;
          const Lenis = w.Lenis;
          const gsap = w.gsap;
          const ScrollTrigger = w.ScrollTrigger;

          if (!Lenis || !gsap || !ScrollTrigger) return;

          gsap.registerPlugin(ScrollTrigger);

          // Lenis smooth scroll
          const lenis = new Lenis({ duration: 1.2 });
          lenis.on("scroll", ScrollTrigger.update);
          gsap.ticker.add((time: number) => lenis.raf(time * 1000));
          gsap.ticker.lagSmoothing(0);

          // Pinned estimate line items
          const items = document.querySelectorAll("[data-pin-item]");
          items.forEach((item) => {
            gsap.fromTo(
              item,
              { opacity: 0, y: 28 },
              {
                opacity: 1,
                y: 0,
                duration: 0.55,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: item,
                  start: "top 82%",
                  toggleActions: "play none none reverse",
                },
              }
            );
          });
        } catch (_) {
          // CDN load failed — animations are skipped gracefully
          document.querySelectorAll("[data-pin-item]").forEach((el) =>
            ((el as HTMLElement).style.opacity = "1")
          );
        }
      })();
    } else {
      document.querySelectorAll("[data-pin-item]").forEach((el) =>
        ((el as HTMLElement).style.opacity = "1")
      );
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(cursorRaf);
      document.body.style.cursor = "";
    };
  }, []);

  return (
    <>
      {/* ── GLOBAL STYLES ── */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif !important; }

        /* Cursor */
        #cursor-dot {
          position: fixed; top: 0; left: 0; z-index: 9999;
          width: 10px; height: 10px;
          background: #1D2C4B; border-radius: 50%;
          pointer-events: none; opacity: 0;
          will-change: transform;
        }
        #cursor-ring {
          position: fixed; top: 0; left: 0; z-index: 9998;
          width: 32px; height: 32px;
          border: 1.5px solid rgba(29,44,75,0.35); border-radius: 50%;
          pointer-events: none; opacity: 0;
          transition: width 0.18s ease, height 0.18s ease, border-color 0.18s ease;
          will-change: transform;
        }

        /* Nav */
        #site-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          transition: background 0.3s, backdrop-filter 0.3s, border-color 0.3s, box-shadow 0.3s;
          border-bottom: 1px solid transparent;
        }
        #site-nav.nav-scrolled {
          background: rgba(250,250,248,0.92);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom-color: #E7E5E0;
          box-shadow: 0 1px 8px rgba(29,44,75,0.06);
        }

        /* Fade-up */
        .fade-up {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.65s ease, transform 0.65s ease;
        }
        .fade-up.visible { opacity: 1; transform: none; }

        /* Pin items start hidden */
        [data-pin-item] { opacity: 0; }

        /* Primary button hover */
        .dm-primary-btn:hover { opacity: 0.88; }
        .dm-primary-btn:active { transform: scale(0.97); }

        /* Ghost button hover */
        .dm-ghost-btn:hover { background: #1D2C4B !important; color: #fff !important; }
        .dm-ghost-btn[data-dark="true"]:hover { background: rgba(255,255,255,0.12) !important; color: #fff !important; }

        /* Card hover */
        .dm-card:hover { box-shadow: 0 8px 32px rgba(29,44,75,0.1); transform: translateY(-2px); }
        .dm-card { transition: box-shadow 0.25s ease, transform 0.25s ease; }

        @media (prefers-reduced-motion: reduce) {
          .fade-up { opacity: 1; transform: none; transition: none; }
          [data-pin-item] { opacity: 1; }
          #cursor-dot, #cursor-ring { display: none; }
          .dm-card { transition: none; }
        }

        @media (max-width: 1023px) {
          #pin-left { position: static !important; }
        }
      `}</style>

      {/* ── CUSTOM CURSOR ── */}
      <div id="cursor-dot" />
      <div id="cursor-ring" />

      {/* ── VIDEO MODAL ── */}
      {videoOpen && <VideoModal onClose={() => setVideoOpen(false)} />}

      <main style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", background: "#FAFAF8", color: "#2A2E36", minHeight: "100vh" }}>

        {/* ── NAV ── */}
        <header id="site-nav">
          <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 32px", height: "68px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link href="/" style={{ fontSize: "20px", fontWeight: 700, color: "#1D2C4B", textDecoration: "none", letterSpacing: "-0.02em" }}>
              DeckMargin
            </Link>
            <div className="hidden md:flex items-center gap-7">
              <Link href="#how-it-works" style={{ fontSize: "14px", color: "#2A2E36", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => (e.currentTarget.style.color = "#1D2C4B")} onMouseLeave={e => (e.currentTarget.style.color = "#2A2E36")}>How It Works</Link>
              <Link href="#features" style={{ fontSize: "14px", color: "#2A2E36", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => (e.currentTarget.style.color = "#1D2C4B")} onMouseLeave={e => (e.currentTarget.style.color = "#2A2E36")}>Features</Link>
              <Link href="#pricing" style={{ fontSize: "14px", color: "#2A2E36", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => (e.currentTarget.style.color = "#1D2C4B")} onMouseLeave={e => (e.currentTarget.style.color = "#2A2E36")}>Pricing</Link>
              <Link href="/resources" style={{ fontSize: "14px", color: "#2A2E36", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => (e.currentTarget.style.color = "#1D2C4B")} onMouseLeave={e => (e.currentTarget.style.color = "#2A2E36")}>Resources</Link>
              <Link href="/login" style={{ fontSize: "14px", color: "#6B7280", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => (e.currentTarget.style.color = "#1D2C4B")} onMouseLeave={e => (e.currentTarget.style.color = "#6B7280")}>Login</Link>
              <PrimaryButton href="/signup">Start Free 14-Day Trial</PrimaryButton>
            </div>
            <div className="flex items-center gap-3 md:hidden">
              <Link href="/login" style={{ fontSize: "14px", color: "#6B7280", textDecoration: "none" }}>Login</Link>
              <PrimaryButton href="/signup">Start Trial</PrimaryButton>
            </div>
          </div>
        </header>

        {/* spacer for fixed nav */}
        <div style={{ height: "68px" }} />

        {/* ── HERO ── */}
        <section style={{ background: "#FAFAF8", borderBottom: "1px solid #E7E5E0", overflow: "hidden" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "80px 32px 96px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "64px", alignItems: "center" }}>

            {/* Left */}
            <div className="fade-up">
              <div style={{ marginBottom: "20px", display: "inline-flex", borderRadius: "999px", border: "1px solid rgba(251,185,68,0.4)", background: "rgba(251,185,68,0.1)", padding: "5px 14px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "#B8860B" }}>
                Built exclusively for deck contractors
              </div>

              <h1 style={{ fontSize: "clamp(2.6rem, 5vw, 4.2rem)", fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.03em", color: "#1D2C4B", maxWidth: "600px", margin: "0 0 20px" }}>
                Stop Leaving<br />
                Money on the<br />
                <span style={{ color: "#FBB944" }}>Table.</span>
              </h1>

              <p style={{ fontSize: "18px", lineHeight: 1.75, color: "#2A2E36", maxWidth: "520px", margin: "0 0 32px" }}>
                The average deck builder underprices jobs by{" "}
                <strong style={{ color: "#1D2C4B" }}>20-30%</strong> - not because
                they&apos;re bad at their craft, but because pricing a deck accurately
                is genuinely hard without the right tool.{" "}
                <strong style={{ color: "#1D2C4B" }}>DeckMargin is that tool.</strong>
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "40px" }}>
                <PrimaryButton href="/signup">Start Free 14-Day Trial →</PrimaryButton>
                <GhostButton onClick={() => setVideoOpen(true)}>
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "20px", height: "20px", borderRadius: "50%", background: "rgba(29,44,75,0.1)", fontSize: "10px" }}>▶</span>
                  Watch how it works
                </GhostButton>
              </div>

              {/* Proof strip */}
              <div style={{ display: "flex", alignItems: "center", gap: "32px", borderTop: "1px solid #E7E5E0", paddingTop: "28px" }}>
                {[
                  { number: "14", label: "Day Free Trial" },
                  { number: "$99", label: "Per Month" },
                  { number: "20min", label: "To Set Up" },
                ].map((item, i) => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "32px" }}>
                    <div>
                      <div style={{ fontSize: "22px", fontWeight: 700, color: "#1D2C4B" }}>{item.number}</div>
                      <div style={{ fontSize: "11px", textTransform: "uppercase" as const, letterSpacing: "0.12em", color: "#6B7280", marginTop: "2px" }}>{item.label}</div>
                    </div>
                    {i < 2 && <div style={{ width: "1px", height: "28px", background: "#E7E5E0" }} />}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Estimate Card */}
            <div className="fade-up" data-delay="0.15">
              <div style={{ borderRadius: "24px", background: "#141F38", padding: "4px", boxShadow: "0 24px 80px rgba(29,44,75,0.22)" }}>
                <div style={{ borderRadius: "20px", background: "#1a2845", padding: "20px" }}>

                  <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>DeckMargin Live Estimate</div>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "4px" }}>Smith Residence · 320 sq ft · Trex Composite</div>
                    </div>
                    <div style={{ borderRadius: "999px", border: "1px solid rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.12)", padding: "4px 12px", fontSize: "12px", fontWeight: 600, color: "#6EE7B7" }}>
                      ✓ Margin Protected
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: "12px" }}>
                    {/* Inputs */}
                    <div style={{ borderRadius: "14px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", padding: "14px" }}>
                      <div style={{ fontSize: "10px", textTransform: "uppercase" as const, letterSpacing: "0.14em", color: "rgba(255,255,255,0.35)", marginBottom: "10px" }}>Job Inputs</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {[
                          ["Deck Size", "16 ft × 20 ft"],
                          ["Material", "Trex Composite"],
                          ["Railing", "Aluminum"],
                          ["Stairs", "2 sections"],
                          ["Height Tier", "Raised"],
                        ].map(([label, value]) => (
                          <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(0,0,0,0.2)", padding: "7px 10px", fontSize: "12px" }}>
                            <span style={{ color: "rgba(255,255,255,0.45)" }}>{label}</span>
                            <span style={{ fontWeight: 600, color: "#fff" }}>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right column */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {/* Cost breakdown */}
                      <div style={{ borderRadius: "14px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", padding: "14px" }}>
                        <div style={{ fontSize: "10px", textTransform: "uppercase" as const, letterSpacing: "0.14em", color: "rgba(255,255,255,0.35)", marginBottom: "10px" }}>Cost Breakdown</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                          {[
                            ["Materials", "$12,480"],
                            ["Labor", "$7,900"],
                            ["Overhead", "$1,450"],
                            ["Total Job Cost", "$21,830"],
                          ].map(([label, value]) => (
                            <div key={label} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "7px", fontSize: "12px" }} className="last:border-0 last:pb-0">
                              <span style={{ color: "rgba(255,255,255,0.45)" }}>{label}</span>
                              <span style={{ fontWeight: 600, color: "#fff" }}>{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Margin */}
                      <div style={{ borderRadius: "14px", border: "1px solid rgba(251,185,68,0.25)", background: "rgba(251,185,68,0.08)", padding: "14px" }}>
                        <div style={{ fontSize: "10px", textTransform: "uppercase" as const, letterSpacing: "0.14em", color: "rgba(251,185,68,0.6)", marginBottom: "8px" }}>Margin View</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "12px" }}>
                          {[
                            ["Target Margin", "30%"],
                            ["Expected Profit", "$9,355"],
                          ].map(([label, value]) => (
                            <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
                              <span style={{ color: "rgba(255,255,255,0.5)" }}>{label}</span>
                              <span style={{ fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{value}</span>
                            </div>
                          ))}
                        </div>
                        <div style={{ marginTop: "10px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(251,185,68,0.2)", paddingTop: "10px" }}>
                          <span style={{ fontSize: "12px", fontWeight: 600, color: "#fff" }}>Send This Price</span>
                          <span style={{ fontSize: "20px", fontWeight: 700, color: "#6EE7B7" }}>$31,185</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: "10px", display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(0,0,0,0.2)", padding: "8px 14px" }}>
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>Estimate built in</span>
                    <span style={{ fontSize: "11px", fontWeight: 600, color: "#FBB944" }}>⚡ 6 minutes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── LIVE ESTIMATE (PINNED) ── */}
        <section style={{ background: "#fff", borderBottom: "1px solid #E7E5E0", padding: "100px 0" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 32px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "80px", alignItems: "start" }}>

              {/* Left: pinned text */}
              <div id="pin-left" style={{ position: "sticky", top: "88px" }} className="fade-up">
                <SectionLabel>Live Estimate</SectionLabel>
                <h2 style={{ fontSize: "clamp(1.9rem, 3vw, 2.8rem)", fontWeight: 700, color: "#1D2C4B", lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: "20px" }}>
                  Watch the Numbers Build in Real Time
                </h2>
                <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#6B7280", marginBottom: "20px" }}>
                  DeckMargin calculates every line automatically as you enter job details. Materials, labor, overhead, and your full margin picture are built from the rates you set once.
                </p>
                <p style={{ fontSize: "16px", lineHeight: 1.8, color: "#6B7280" }}>
                  By the time you leave the backyard, your number is ready. No spreadsheet, no going home to figure it up, no second-guessing.
                </p>
                <div style={{ marginTop: "32px" }}>
                  <PrimaryButton href="/signup">Try It Free for 14 Days →</PrimaryButton>
                </div>
              </div>

              {/* Right: estimate line items */}
              <div id="pin-items" style={{ display: "flex", flexDirection: "column", gap: "14px", paddingTop: "8px" }}>
                {estimateLines.map((item) => (
                  <div
                    key={item.label}
                    data-pin-item
                    style={{
                      borderRadius: "16px",
                      background: item.isFinal ? "#141F38" : item.isMargin ? "rgba(251,185,68,0.07)" : "#FAFAF8",
                      border: `1px solid ${item.isFinal ? "rgba(251,185,68,0.3)" : item.isMargin ? "rgba(251,185,68,0.2)" : "#E7E5E0"}`,
                      padding: "18px 22px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: item.isFinal ? "#fff" : item.isMargin ? "#B8860B" : "#1D2C4B" }}>
                        {item.label}
                      </div>
                      {item.sub && (
                        <div style={{ fontSize: "12px", color: item.isFinal ? "rgba(255,255,255,0.5)" : "#6B7280", marginTop: "3px" }}>
                          {item.sub}
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: item.isFinal ? "24px" : "18px", fontWeight: 700, color: item.isFinal ? "#6EE7B7" : item.isMargin ? "#B8860B" : "#1D2C4B" }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── PAIN ── */}
        <section style={{ background: "#141F38", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "96px 32px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "64px", alignItems: "start" }}>

              {/* Left */}
              <div className="fade-up">
                <SectionLabel>The Cost of Guessing</SectionLabel>
                <h2 style={{ fontSize: "clamp(2rem, 3vw, 3rem)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.02em", color: "#fff", marginBottom: "20px" }}>
                  Deck Builders Are Losing Money on Jobs They{" "}
                  <span style={{ color: "#FBB944" }}>Worked Hard</span> to Complete.
                </h2>
                <p style={{ fontSize: "16px", lineHeight: 1.8, color: "rgba(255,255,255,0.6)", marginBottom: "16px" }}>
                  It&apos;s not a skills problem. Most deck builders are excellent at their craft.
                  It&apos;s a pricing problem, and it shows up at the end of a job when the
                  margin isn&apos;t where you thought it would be.
                </p>
                <p style={{ fontSize: "16px", lineHeight: 1.8, color: "rgba(255,255,255,0.6)", marginBottom: "32px" }}>
                  One missed line item. One rushed quote. One job priced from gut feel instead
                  of real numbers. That&apos;s the difference between a profitable month and a brutal one.
                </p>

                {/* Real quote */}
                <div style={{ borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", padding: "24px", borderLeft: "4px solid #FBB944" }}>
                  <p style={{ fontSize: "15px", fontStyle: "italic", lineHeight: 1.75, color: "rgba(255,255,255,0.8)" }}>
                    &ldquo;My accountant taught me this as I was about to call it quits because
                    I lost so much money on so many jobs. Changed my business and still
                    can&apos;t keep up with all the work.&rdquo;
                  </p>
                  <div style={{ marginTop: "14px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.14em", color: "#FBB944" }}>
                    Jay A., Deck Contractor
                  </div>
                </div>
              </div>

              {/* Right — Pain cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {painCards.map((card, i) => (
                  <div
                    key={card.title}
                    className="fade-up"
                    data-delay={String(i * 0.1)}
                    style={{ display: "flex", gap: "16px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", padding: "20px", transition: "border-color 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(251,185,68,0.3)")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                  >
                    <div style={{ flexShrink: 0, width: "40px", height: "40px", borderRadius: "12px", background: "rgba(251,185,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
                      {card.icon}
                    </div>
                    <div>
                      <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#fff", marginBottom: "6px" }}>{card.title}</h3>
                      <p style={{ fontSize: "13px", lineHeight: 1.7, color: "rgba(255,255,255,0.55)" }}>{card.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── WHO THIS IS FOR ── */}
        <section style={{ background: "#FAFAF8", borderBottom: "1px solid #E7E5E0" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "96px 32px" }}>
            <SectionLabel>Who DeckMargin Is Built For</SectionLabel>
            <h2 className="fade-up" style={{ fontSize: "clamp(2rem, 3vw, 3rem)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.02em", color: "#1D2C4B", marginBottom: "16px", maxWidth: "640px" }}>
              Built for the Deck Builder Who&apos;s{" "}
              <span style={{ color: "#FBB944" }}>Done Guessing.</span>
            </h2>
            <p className="fade-up" data-delay="0.05" style={{ fontSize: "16px", lineHeight: 1.8, color: "#6B7280", maxWidth: "580px", marginBottom: "48px" }}>
              DeckMargin is for you if any of these sound familiar, because they&apos;re
              the exact things real deck contractors told us before we built this.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
              {whoItems.map((item, i) => (
                <div
                  key={item.title}
                  className="dm-card fade-up"
                  data-delay={String(i * 0.07)}
                  style={{ background: "#fff", border: "1px solid #E7E5E0", borderRadius: "16px", padding: "24px" }}
                >
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#FBB944", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px", fontSize: "12px", fontWeight: 700, color: "#1D2C4B" }}>
                    ✓
                  </div>
                  <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#1D2C4B", marginBottom: "8px" }}>{item.title}</h3>
                  <p style={{ fontSize: "13px", lineHeight: 1.7, color: "#6B7280" }}>{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" style={{ background: "#fff", borderBottom: "1px solid #E7E5E0" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "96px 32px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "48px", marginBottom: "56px", alignItems: "end" }}>
              <div className="fade-up">
                <SectionLabel>The Workflow</SectionLabel>
                <h2 style={{ fontSize: "clamp(2rem, 3vw, 3rem)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.02em", color: "#1D2C4B" }}>
                  Three Steps.<br />One Workflow.<br />Done.
                </h2>
              </div>
              <p className="fade-up" data-delay="0.05" style={{ fontSize: "16px", lineHeight: 1.8, color: "#6B7280" }}>
                Set your pricing rules once. Build estimates in minutes. Send proposals
                that make you look like a $5M company, even if it&apos;s just you and a
                crew. No training required. Most contractors are up and running in under
                20 minutes.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
              {steps.map((item, i) => (
                <div
                  key={item.step}
                  className="dm-card fade-up"
                  data-delay={String(i * 0.1)}
                  style={{ position: "relative", overflow: "hidden", borderRadius: "20px", border: "1px solid #E7E5E0", background: "#fff", padding: "28px" }}
                >
                  <div style={{ position: "absolute", right: "16px", top: "12px", fontSize: "72px", fontWeight: 700, color: "rgba(29,44,75,0.04)", userSelect: "none" }}>
                    {item.step}
                  </div>
                  <div style={{ width: "36px", height: "36px", borderRadius: "12px", background: "#1D2C4B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "18px" }}>
                    {parseInt(item.step)}
                  </div>
                  <h3 style={{ fontSize: "17px", fontWeight: 600, color: "#1D2C4B", marginBottom: "10px" }}>{item.title}</h3>
                  <p style={{ fontSize: "14px", lineHeight: 1.75, color: "#6B7280", marginBottom: "18px" }}>{item.body}</p>
                  <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.14em", color: "#FBB944" }}>
                    ⚡ {item.time}
                  </div>
                </div>
              ))}
            </div>

            {/* Watch tutorial CTA */}
            <div style={{ marginTop: "48px", display: "flex", justifyContent: "center" }}>
              <button
                onClick={() => setVideoOpen(true)}
                style={{ display: "inline-flex", alignItems: "center", gap: "12px", borderRadius: "999px", border: "1.5px solid #E7E5E0", background: "#FAFAF8", padding: "14px 28px", fontSize: "14px", fontWeight: 600, color: "#1D2C4B", cursor: "pointer", fontFamily: "inherit", transition: "border-color 0.2s, background 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#1D2C4B"; e.currentTarget.style.background = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#E7E5E0"; e.currentTarget.style.background = "#FAFAF8"; }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "50%", background: "#1D2C4B", fontSize: "10px", color: "#fff" }}>▶</span>
                Watch the full 3-minute tutorial
              </button>
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" style={{ background: "#FAFAF8", borderBottom: "1px solid #E7E5E0" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "96px 32px" }}>
            <SectionLabel>What DeckMargin Covers</SectionLabel>
            <h2 className="fade-up" style={{ fontSize: "clamp(2rem, 3vw, 3rem)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.02em", color: "#1D2C4B", maxWidth: "560px", marginBottom: "48px" }}>
              Every Input That Actually Shapes a Deck Job&apos;s{" "}
              <span style={{ color: "#FBB944" }}>Profitability.</span>
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "18px" }}>
              {features.map((feature, i) => (
                <div
                  key={feature.title}
                  className="dm-card fade-up"
                  data-delay={String(i * 0.07)}
                  style={{ borderRadius: "16px", border: "1px solid #E7E5E0", background: "#fff", padding: "28px" }}
                >
                  <div style={{ width: "44px", height: "44px", borderRadius: "14px", border: "1px solid #E7E5E0", background: "#FAFAF8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", marginBottom: "16px" }}>
                    {feature.icon}
                  </div>
                  <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#1D2C4B", marginBottom: "10px" }}>{feature.title}</h3>
                  <p style={{ fontSize: "13px", lineHeight: 1.75, color: "#6B7280" }}>{feature.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COMPARISON ── */}
        <section style={{ background: "#fff", borderBottom: "1px solid #E7E5E0" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "96px 32px" }}>
            <SectionLabel>How DeckMargin Stacks Up</SectionLabel>
            <h2 className="fade-up" style={{ fontSize: "clamp(2rem, 3vw, 3rem)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.02em", color: "#1D2C4B", maxWidth: "480px", marginBottom: "16px" }}>
              Not Another{" "}
              <span style={{ color: "#FBB944" }}>All-In-One</span>{" "}
              Platform.
            </h2>
            <p className="fade-up" data-delay="0.05" style={{ fontSize: "16px", lineHeight: 1.8, color: "#6B7280", maxWidth: "580px", marginBottom: "40px" }}>
              We&apos;re not trying to replace your CRM, your scheduling software, or your
              QuickBooks. We do three things: estimate, protect margin, send proposal
              and we do them better than any all-in-one tool built for every trade under
              the sun.
            </p>

            <div className="fade-up" style={{ overflow: "hidden", borderRadius: "16px", border: "1px solid #E7E5E0" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", fontSize: "14px", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #E7E5E0" }}>
                      <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#6B7280" }}>Feature</th>
                      <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#6B7280" }}>Spreadsheets</th>
                      <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#6B7280" }}>All-In-One Software</th>
                      <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#FBB944", background: "rgba(251,185,68,0.06)" }}>DeckMargin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compareRows.map((row, i) => (
                      <tr key={row.feature} style={{ borderBottom: "1px solid #E7E5E0", background: i % 2 === 0 ? "#FAFAF8" : "#fff" }}>
                        <td style={{ padding: "14px 20px", color: "#2A2E36" }}>{row.feature}</td>
                        <td style={{ padding: "14px 20px" }}>
                          {typeof row.spreadsheet === "boolean" ? (
                            <span style={{ fontWeight: 600, color: row.spreadsheet ? "#10B981" : "#D1D5DB" }}>{row.spreadsheet ? "✓" : "✕"}</span>
                          ) : (
                            <span style={{ color: "#6B7280" }}>{row.spreadsheet}</span>
                          )}
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          {typeof row.allInOne === "boolean" ? (
                            <span style={{ fontWeight: 600, color: row.allInOne ? "#10B981" : "#D1D5DB" }}>{row.allInOne ? "✓" : "✕"}</span>
                          ) : (
                            <span style={{ color: "#6B7280" }}>{row.allInOne}</span>
                          )}
                        </td>
                        <td style={{ padding: "14px 20px", background: "rgba(251,185,68,0.06)" }}>
                          {typeof row.deckmargin === "boolean" ? (
                            <span style={{ fontWeight: 700, color: "#10B981" }}>✓</span>
                          ) : (
                            <span style={{ fontWeight: 700, color: "#1D2C4B" }}>{row.deckmargin}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="fade-up" style={{ marginTop: "20px", borderRadius: "14px", border: "1px solid rgba(251,185,68,0.3)", background: "rgba(251,185,68,0.06)", padding: "18px 22px", fontSize: "14px", lineHeight: 1.75, color: "#2A2E36" }}>
              <strong style={{ color: "#1D2C4B" }}>The honest truth: </strong>
              Most all-in-one contractor software costs $200–$400/month and makes you pay for
              crew scheduling, punch lists, time tracking, and daily logs you&apos;ll never use as a
              deck contractor. DeckMargin does three things and charges $99/month. If you want
              47 features, there are other tools for that. If you want to stop underpricing
              deck jobs, you&apos;re in the right place.
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section style={{ background: "#FAFAF8", borderBottom: "1px solid #E7E5E0" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "96px 32px" }}>
            <SectionLabel>Real Builders Using DeckMargin</SectionLabel>
            <h2 className="fade-up" style={{ fontSize: "clamp(2rem, 3vw, 3rem)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.02em", color: "#1D2C4B", marginBottom: "48px" }}>
              What Contractors Are Saying.
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
              {testimonials.map((item, i) => (
                <div
                  key={item.name}
                  className="dm-card fade-up"
                  data-delay={String(i * 0.1)}
                  style={{ display: "flex", flexDirection: "column", gap: "18px", borderRadius: "20px", border: "1px solid #E7E5E0", background: "#fff", padding: "28px" }}
                >
                  <div style={{ display: "flex", gap: "2px", color: "#FBB944", fontSize: "14px" }}>
                    {"★★★★★".split("").map((s, si) => <span key={si}>{s}</span>)}
                  </div>
                  <p style={{ flex: 1, fontSize: "14px", fontStyle: "italic", lineHeight: 1.75, color: "#2A2E36" }}>
                    &ldquo;{item.quote}&rdquo;
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", borderTop: "1px solid #E7E5E0", paddingTop: "18px" }}>
                    <div style={{ width: "44px", height: "44px", flexShrink: 0, borderRadius: "50%", background: "#FAFAF8", border: "1px solid #E7E5E0", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#1D2C4B", fontSize: "18px" }}>
                      {item.initial}
                    </div>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#1D2C4B" }}>{item.name}</div>
                      <div style={{ fontSize: "12px", color: "#6B7280" }}>{item.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="pricing" style={{ background: "#141F38", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "96px 32px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "48px", marginBottom: "56px", alignItems: "end" }}>
              <div className="fade-up">
                <SectionLabel>Simple Pricing</SectionLabel>
                <h2 style={{ fontSize: "clamp(2rem, 3vw, 3rem)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.02em", color: "#fff" }}>
                  One Price.<br />No <span style={{ color: "#FBB944" }}>Surprises.</span>
                </h2>
              </div>
              <p className="fade-up" data-delay="0.05" style={{ fontSize: "16px", lineHeight: 1.8, color: "rgba(255,255,255,0.6)" }}>
                Most contractor software runs{" "}
                <strong style={{ color: "#fff" }}>$200–$400/month</strong> and isn&apos;t
                built specifically for deck builders. DeckMargin is{" "}
                <strong style={{ color: "#fff" }}>$99/month</strong> and built for nothing
                else. One plan. Everything included. Cancel anytime.
              </p>
            </div>

            <div className="fade-up" style={{ overflow: "hidden", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
              {/* Left — price */}
              <div style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", padding: "40px" }}>
                <div style={{ marginBottom: "20px", display: "inline-flex", borderRadius: "999px", border: "1px solid rgba(251,185,68,0.35)", background: "rgba(251,185,68,0.1)", padding: "5px 14px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.14em", color: "#FBB944" }}>
                  Built for Deck Contractors Only
                </div>
                <div style={{ display: "flex", alignItems: "start", gap: "4px" }}>
                  <span style={{ marginTop: "12px", fontSize: "22px", fontWeight: 700, color: "#fff" }}>$</span>
                  <span style={{ fontSize: "72px", fontWeight: 700, lineHeight: 1, color: "#fff" }}>99</span>
                  <span style={{ alignSelf: "flex-end", marginBottom: "8px", fontSize: "15px", color: "rgba(255,255,255,0.5)" }}>/month</span>
                </div>
                <p style={{ marginTop: "10px", fontSize: "14px", lineHeight: 1.7, color: "rgba(255,255,255,0.55)" }}>
                  vs.{" "}
                  <strong style={{ color: "#FBB944" }}>$199–$400/month</strong>{" "}
                  for all-in-one tools built for every trade, including features you&apos;ll never use.
                </p>
                <div style={{ marginTop: "28px" }}>
                  <PrimaryButton href="/signup">Start Free 14-Day Trial →</PrimaryButton>
                </div>
                <p style={{ marginTop: "14px", fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>Free for 14 days. Cancel anytime.</p>
                <p style={{ marginTop: "20px", fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>
                  Need help getting set up?{" "}
                  <a href="mailto:Carlos.lourenco@deckmargin.com" style={{ color: "#fff", textDecoration: "underline", transition: "color 0.2s" }} onMouseEnter={e => (e.currentTarget.style.color = "#FBB944")} onMouseLeave={e => (e.currentTarget.style.color = "#fff")}>
                    Contact us
                  </a>
                </p>
              </div>

              {/* Right — features */}
              <div style={{ padding: "40px" }}>
                <div style={{ marginBottom: "24px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)" }}>
                  Everything Included
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {pricingFeatures.map((item) => (
                    <div key={item.title} style={{ display: "flex", gap: "12px" }}>
                      <CheckIcon />
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>{item.title}</div>
                        <div style={{ marginTop: "3px", fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>{item.body}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOUNDER STORY ── */}
        <section style={{ background: "#FAFAF8", borderBottom: "1px solid #E7E5E0" }}>
          <div style={{ maxWidth: "720px", margin: "0 auto", padding: "96px 32px", textAlign: "center" }}>
            <div className="fade-up" style={{ marginBottom: "28px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.2em", color: "#6B7280" }}>
              Why DeckMargin Exists
            </div>
            <p className="fade-up" data-delay="0.05" style={{ fontSize: "18px", lineHeight: 1.8, color: "#2A2E36", marginBottom: "20px" }}>
              DeckMargin was built after talking to dozens of deck contractors who were{" "}
              <strong style={{ color: "#1D2C4B" }}>losing money on jobs they worked hard to complete.</strong>
            </p>
            <p className="fade-up" data-delay="0.1" style={{ fontSize: "18px", lineHeight: 1.8, color: "#2A2E36", marginBottom: "20px" }}>
              Not because they weren&apos;t skilled. Because pricing a deck job accurately
              accounting for real labor costs, real material costs, overhead, and a margin
              that actually protects the business, is{" "}
              <strong style={{ color: "#1D2C4B" }}>
                genuinely hard without the right tool.
              </strong>
            </p>
            <p className="fade-up" data-delay="0.15" style={{ fontSize: "18px", lineHeight: 1.8, color: "#2A2E36", marginBottom: "20px" }}>
              We talked to contractors who almost quit. Contractors pricing from gut feel for
              20 years. Contractors building 8-page Excel spreadsheets from scratch because
              nothing existed that actually fit how a deck business works.
            </p>
            <p className="fade-up" data-delay="0.2" style={{ fontSize: "18px", lineHeight: 1.8, color: "#1D2C4B", fontWeight: 600, marginBottom: "36px" }}>
              We built the tool they should have had all along. Specifically for deck
              contractors. Nobody else.
            </p>
            <div className="fade-up" data-delay="0.25" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#1D2C4B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: 700, color: "#FBB944" }}>
                C
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#1D2C4B" }}>Carlos Lourenco</div>
                <div style={{ fontSize: "13px", color: "#6B7280" }}>
                  Founder, DeckMargin ·{" "}
                  <a href="mailto:Carlos.lourenco@deckmargin.com" style={{ color: "#6B7280", transition: "color 0.2s" }} onMouseEnter={e => (e.currentTarget.style.color = "#1D2C4B")} onMouseLeave={e => (e.currentTarget.style.color = "#6B7280")}>
                    Carlos.lourenco@deckmargin.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section style={{ background: "#FBB944" }}>
          <div style={{ maxWidth: "800px", margin: "0 auto", padding: "96px 32px", textAlign: "center" }}>
            <h2 className="fade-up" style={{ fontSize: "clamp(2.4rem, 5vw, 3.6rem)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.03em", color: "#1D2C4B", marginBottom: "20px" }}>
              Know Your Number.
            </h2>
            <p className="fade-up" data-delay="0.05" style={{ fontSize: "18px", lineHeight: 1.75, color: "rgba(29,44,75,0.75)", maxWidth: "540px", margin: "0 auto 36px" }}>
              Stop pricing jobs from spreadsheets, gut feel, and old quotes. Start every
              estimate knowing exactly what you&apos;re making before you send the price.
            </p>
            <div className="fade-up" data-delay="0.1" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "14px" }}>
              <Link
                href="/signup"
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "999px", background: "#1D2C4B", color: "#fff", padding: "16px 36px", fontSize: "16px", fontWeight: 700, textDecoration: "none", fontFamily: "inherit", transition: "opacity 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                Start Free 14-Day Trial →
              </Link>
              <GhostButton dark onClick={() => setVideoOpen(true)}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "20px", height: "20px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", fontSize: "10px" }}>▶</span>
                Watch how it works
              </GhostButton>
            </div>
            <p className="fade-up" data-delay="0.15" style={{ marginTop: "20px", fontSize: "13px", color: "rgba(29,44,75,0.55)" }}>
              Free for 14 days · Cancel anytime · Set up in 20 minutes
            </p>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ background: "#141F38", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "56px 32px 40px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "40px", marginBottom: "48px" }}>
              {/* Brand */}
              <div>
                <div style={{ fontSize: "20px", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", marginBottom: "14px" }}>DeckMargin</div>
                <p style={{ fontSize: "13px", lineHeight: 1.75, color: "rgba(255,255,255,0.45)", maxWidth: "240px" }}>
                  The only estimating software built specifically for deck contractors.
                </p>
                {/* Social links */}
                <div style={{ marginTop: "20px", display: "flex", gap: "14px" }}>
                  <a href="https://www.facebook.com/people/DeckMargin/61589107767219/" target="_blank" rel="noopener noreferrer" aria-label="DeckMargin on Facebook" style={{ color: "rgba(255,255,255,0.4)", transition: "color 0.2s" }} onMouseEnter={e => (e.currentTarget.style.color = "#fff")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
                  </a>
                  <a href="https://www.instagram.com/deckmargin/" target="_blank" rel="noopener noreferrer" aria-label="DeckMargin on Instagram" style={{ color: "rgba(255,255,255,0.4)", transition: "color 0.2s" }} onMouseEnter={e => (e.currentTarget.style.color = "#fff")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  </a>
                  <a href="https://www.linkedin.com/company/deckmargin" target="_blank" rel="noopener noreferrer" aria-label="DeckMargin on LinkedIn" style={{ color: "rgba(255,255,255,0.4)", transition: "color 0.2s" }} onMouseEnter={e => (e.currentTarget.style.color = "#fff")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                </div>
              </div>

              {/* Nav links */}
              <div>
                <div style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", marginBottom: "16px" }}>Product</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[
                    { label: "How It Works", href: "#how-it-works" },
                    { label: "Features", href: "#features" },
                    { label: "Pricing", href: "#pricing" },
                    { label: "Resources", href: "/resources" },
                    { label: "Login", href: "/login" },
                  ].map((link) => (
                    <Link key={link.label} href={link.href} style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => (e.currentTarget.style.color = "#fff")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div>
                <div style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", marginBottom: "16px" }}>Contact</div>
                <a href="mailto:Carlos.lourenco@deckmargin.com" style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => (e.currentTarget.style.color = "#fff")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}>
                  Carlos.lourenco@deckmargin.com
                </a>
                <div style={{ marginTop: "20px" }}>
                  <PrimaryButton href="/signup">Start Free Trial</PrimaryButton>
                </div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "28px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>© 2026 DeckMargin. All rights reserved.</p>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>Built for deck contractors. Nobody else.</p>
            </div>
          </div>
        </footer>

      </main>
    </>
  );
}
