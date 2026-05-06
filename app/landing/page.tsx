"use client";

import Link from "next/link";
import { useState } from "react";

// ── DATA ────────────────────────────────────────────────────────────────────

const whoItems = [
  {
    title: "You're still pricing from spreadsheets or old quotes",
    body: "You copy last month's estimate, change a few numbers, and hope the material costs haven't changed too much.",
  },
  {
    title: "You've finished a job and the margin wasn't there",
    body: "You worked hard, the customer was happy, but when you looked at the numbers — something was off. You're not sure what.",
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
    body: "Forget demolition. Forget permit allowance. Forget that the site is elevated. There goes your margin — and sometimes more.",
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
    body: "Sq ft, linear ft of rail, height tier, stairs, material type — put it all in and get a number you can stand behind while you're still in the backyard. No more going home to figure it up and losing the job to someone who quoted on the spot.",
  },
  {
    icon: "🎯",
    title: "Know Your Margin Before the Homeowner Sees a Price",
    body: "View total cost, expected profit, target margin, and final price before you send anything. You'll never wonder if you left money on the table again — because you'll see the number in black and white first.",
  },
  {
    icon: "📄",
    title: "Send Proposals That Win Jobs",
    body: "Generate clean, client-facing proposals that explain the scope clearly and make you look like a professional operation. Signature lines included. Homeowners trust what they can read and understand.",
  },
  {
    icon: "⚙️",
    title: "Set Your Rates Once, Use Them Forever",
    body: "Your labor rate, your overhead, your markup — saved. Every estimate you build uses your numbers automatically. Standardized pricing across every job, every time, without starting from scratch.",
  },
  {
    icon: "🏗️",
    title: "Built for Real Deck Jobs — Not Generic Construction",
    body: "Framing, decking, railing, stairs, footings, fascia, demolition, permit allowance, height tiers, composite vs pressure treated — it's all in there because we built this specifically for deck contractors, not roofers or siders.",
  },
  {
    icon: "➕",
    title: "Custom Line Items for Jobs That Need Them",
    body: "Every job has something unique. Add custom line items to any estimate so nothing gets missed. That's the missed line item that wipes out your margin — accounted for before the quote goes out.",
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
    body: "Deck size, materials, stairs, railing, height tiers, custom line items — all of it.",
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

const VIDEO_ID = "IQzZsUOJpMc";

// ── COMPONENTS ───────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
      {children}
    </div>
  );
}

function PrimaryButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-xl bg-blue-500 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-600 active:scale-95"
    >
      {children}
    </Link>
  );
}

function WatchButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
        ▶
      </span>
      Watch how it works
    </button>
  );
}

function WatchButtonAlt({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/20"
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
        ▶
      </span>
      Watch how it works
    </button>
  );
}

function VideoModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition text-lg"
          aria-label="Close video"
        >
          ✕
        </button>
        {/* 16:9 responsive embed */}
        <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&rel=0`}
            title="DeckMargin — How It Works"
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
    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
      <svg
        viewBox="0 0 12 12"
        className="h-3 w-3 stroke-emerald-400"
        fill="none"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="2,6 5,9 10,3" />
      </svg>
    </div>
  );
}

// ── PAGE ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#0b0d12] text-white">

      {/* ── VIDEO MODAL ── */}
      {videoOpen && <VideoModal onClose={() => setVideoOpen(false)} />}

      {/* ── NAV ── */}
      <header className="sticky top-0 z-50 border-b border-white/8 bg-[#0b0d12]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="text-xl font-semibold tracking-tight text-white">
            DeckMargin
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <Link href="#how-it-works" className="text-sm text-gray-300 transition hover:text-white">
              How It Works
            </Link>
            <Link href="#features" className="text-sm text-gray-300 transition hover:text-white">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-gray-300 transition hover:text-white">
              Pricing
            </Link>
            <Link href="/login" className="text-sm text-gray-400 transition hover:text-white">
              Login
            </Link>
            <PrimaryButton href="/signup">Start Free 14-Day Trial</PrimaryButton>
          </div>
          <div className="flex items-center gap-3 md:hidden">
            <Link href="/login" className="text-sm text-gray-400">Login</Link>
            <PrimaryButton href="/signup">Start Trial</PrimaryButton>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden border-b border-white/8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_28%),radial-gradient(circle_at_85%_20%,rgba(59,130,246,0.14),transparent_24%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-6 py-20 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:px-8 lg:py-28">

          {/* Left */}
          <div>
            <div className="mb-6 inline-flex rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">
              Built exclusively for deck contractors
            </div>

            <h1 className="max-w-2xl text-5xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Stop Leaving<br />
              Money on the<br />
              <span className="text-blue-400">Table.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-gray-300">
              The average deck builder underprices jobs by{" "}
              <strong className="text-white">20–30%</strong> — not because
              they're bad at their craft, but because pricing a deck accurately
              is genuinely hard without the right tool.{" "}
              <strong className="text-white">DeckMargin is that tool.</strong>
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <PrimaryButton href="/signup">Start Free 14-Day Trial →</PrimaryButton>
              <WatchButton onClick={() => setVideoOpen(true)} />
            </div>

            {/* Proof strip */}
            <div className="mt-10 flex items-center gap-8 border-t border-white/8 pt-8">
              {[
                { number: "14", label: "Day Free Trial" },
                { number: "$99", label: "Per Month" },
                { number: "20min", label: "To Set Up" },
              ].map((item, i) => (
                <div key={item.label} className="flex items-center gap-8">
                  <div>
                    <div className="text-2xl font-semibold text-blue-400">{item.number}</div>
                    <div className="mt-0.5 text-xs uppercase tracking-wider text-gray-500">{item.label}</div>
                  </div>
                  {i < 2 && <div className="h-8 w-px bg-white/10" />}
                </div>
              ))}
            </div>
          </div>

          {/* Right — Estimate Card */}
          <div className="relative">
            <div className="rounded-3xl border border-white/10 bg-[#11141b] p-4 shadow-[0_20px_80px_rgba(0,0,0,0.55)]">
              <div className="rounded-2xl border border-white/10 bg-[#0f131a] p-5">

                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">DeckMargin — Live Estimate</div>
                    <div className="mt-1 text-xs text-gray-400">Smith Residence · 320 sq ft · Trex Composite</div>
                  </div>
                  <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                    ✓ Margin Protected
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.05fr_.95fr]">
                  {/* Inputs */}
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="mb-3 text-xs uppercase tracking-[0.14em] text-gray-500">Job Inputs</div>
                    <div className="space-y-2 text-sm">
                      {[
                        ["Deck Size", "16 ft × 20 ft"],
                        ["Material", "Trex Composite"],
                        ["Railing", "Aluminum"],
                        ["Stairs", "2 sections"],
                        ["Height Tier", "Raised"],
                      ].map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between rounded-xl border border-white/8 bg-black/20 px-3 py-2">
                          <span className="text-gray-400">{label}</span>
                          <span className="font-medium text-white">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right column */}
                  <div className="space-y-3">
                    {/* Cost breakdown */}
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="mb-3 text-xs uppercase tracking-[0.14em] text-gray-500">Cost Breakdown</div>
                      <div className="space-y-2 text-sm">
                        {[
                          ["Materials", "$12,480"],
                          ["Labor", "$7,900"],
                          ["Overhead", "$1,450"],
                          ["Total Job Cost", "$21,830"],
                        ].map(([label, value]) => (
                          <div key={label} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
                            <span className="text-gray-400">{label}</span>
                            <span className="font-semibold text-white">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Margin */}
                    <div className="rounded-2xl border border-blue-400/20 bg-blue-400/10 p-4">
                      <div className="mb-3 text-xs uppercase tracking-[0.14em] text-blue-200/70">Margin View</div>
                      <div className="space-y-1 text-sm">
                        {[
                          ["Target Margin", "30%"],
                          ["Expected Profit", "$9,355"],
                        ].map(([label, value]) => (
                          <div key={label} className="flex justify-between">
                            <span className="text-blue-100/60">{label}</span>
                            <span className="font-medium text-blue-100/90">{value}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-blue-400/20 pt-3">
                        <span className="text-sm font-semibold text-white">Send This Price</span>
                        <span className="text-2xl font-semibold text-emerald-400">$31,185</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-xl border border-white/8 bg-black/20 px-4 py-2">
                  <span className="text-xs text-gray-500">Estimate built in</span>
                  <span className="text-xs font-semibold text-blue-400">⚡ 6 minutes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PAIN ── */}
      <section className="border-b border-white/8 bg-[#0e1117]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-start">

            {/* Left */}
            <div>
              <SectionLabel>The Cost of Guessing</SectionLabel>
              <h2 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
                Deck Builders Are Losing Money on Jobs They{" "}
                <span className="text-blue-400">Worked Hard</span> to Complete.
              </h2>
              <p className="mt-6 text-base leading-8 text-gray-400">
                It&apos;s not a skills problem. Most deck builders are excellent at their craft.
                It&apos;s a pricing problem — and it shows up at the end of a job when the
                margin isn&apos;t where you thought it would be.
              </p>
              <p className="mt-4 text-base leading-8 text-gray-400">
                One missed line item. One rushed quote. One job priced from gut feel instead
                of real numbers. That&apos;s the difference between a profitable month and a brutal one.
              </p>

              {/* Real quote */}
              <div className="mt-8 rounded-2xl border border-white/10 bg-[#11141b] p-6 border-l-4 border-l-blue-500">
                <p className="text-base italic leading-8 text-gray-300">
                  &ldquo;My accountant taught me this as I was about to call it quits because
                  I lost so much money on so many jobs. Changed my business — and still
                  can&apos;t keep up with all the work.&rdquo;
                </p>
                <div className="mt-4 text-xs font-semibold uppercase tracking-wider text-blue-400">
                  — Jay A., Deck Contractor
                </div>
              </div>
            </div>

            {/* Right — Pain cards */}
            <div className="space-y-4">
              {painCards.map((card) => (
                <div
                  key={card.title}
                  className="flex gap-4 rounded-2xl border border-white/10 bg-[#11141b] p-5 transition hover:border-blue-400/30"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-400/10 text-lg">
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{card.title}</h3>
                    <p className="mt-1.5 text-sm leading-7 text-gray-400">{card.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHO THIS IS FOR ── */}
      <section className="border-b border-white/8 bg-[#0b0d12]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <SectionLabel>Who DeckMargin Is Built For</SectionLabel>
          <h2 className="mb-4 max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
            Built for the Deck Builder Who&apos;s{" "}
            <span className="text-blue-400">Done Guessing.</span>
          </h2>
          <p className="mb-12 max-w-2xl text-base leading-8 text-gray-400">
            DeckMargin is for you if any of these sound familiar — because they&apos;re
            the exact things real deck contractors told us before we built this.
          </p>

          <div className="grid gap-px bg-white/8 sm:grid-cols-2 lg:grid-cols-3 rounded-2xl overflow-hidden">
            {whoItems.map((item) => (
              <div
                key={item.title}
                className="bg-[#0e1117] p-6 transition hover:bg-[#11141b]"
              >
                <div className="mb-3 flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                  ✓
                </div>
                <h3 className="mb-2 text-sm font-semibold text-white">{item.title}</h3>
                <p className="text-sm leading-7 text-gray-400">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="border-b border-white/8 bg-[#0e1117]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="mb-14 grid gap-10 lg:grid-cols-2 lg:items-end">
            <div>
              <SectionLabel>The Workflow</SectionLabel>
              <h2 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
                Three Steps.<br />One Workflow.<br />Done.
              </h2>
            </div>
            <p className="text-base leading-8 text-gray-400 lg:pt-4">
              Set your pricing rules once. Build estimates in minutes. Send proposals
              that make you look like a $5M company — even if it&apos;s just you and a
              crew. No training required. Most contractors are up and running in under
              20 minutes.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {steps.map((item) => (
              <div
                key={item.step}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#11141b] p-7"
              >
                <div className="absolute right-5 top-4 font-semibold text-7xl text-white/[0.03] select-none">
                  {item.step}
                </div>
                <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500 font-semibold text-white text-lg">
                  {parseInt(item.step)}
                </div>
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-gray-400">{item.body}</p>
                <div className="mt-5 text-xs font-semibold uppercase tracking-wider text-blue-400">
                  ⚡ {item.time}
                </div>
              </div>
            ))}
          </div>

          {/* Watch the tutorial CTA */}
          <div className="mt-12 flex justify-center">
            <button
              onClick={() => setVideoOpen(true)}
              className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-semibold text-white transition hover:bg-white/10 hover:border-white/20"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-xs">
                ▶
              </span>
              Watch the full 3-minute tutorial
            </button>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="border-b border-white/8 bg-[#0b0d12]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <SectionLabel>What DeckMargin Covers</SectionLabel>
          <h2 className="mb-14 max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
            Every Input That Actually Shapes a Deck Job&apos;s{" "}
            <span className="text-blue-400">Profitability.</span>
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 transition hover:border-blue-400/25 hover:bg-white/[0.05]"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl">
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-gray-400">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARISON ── */}
      <section className="border-b border-white/8 bg-[#0e1117]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <SectionLabel>How DeckMargin Stacks Up</SectionLabel>
          <h2 className="mb-4 max-w-xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
            Not Another{" "}
            <span className="text-blue-400">All-In-One</span>{" "}
            Platform.
          </h2>
          <p className="mb-12 max-w-2xl text-base leading-8 text-gray-400">
            We&apos;re not trying to replace your CRM, your scheduling software, or your
            QuickBooks. We do three things — estimate, protect margin, send proposal —
            and we do them better than any all-in-one tool built for every trade under
            the sun.
          </p>

          <div className="overflow-hidden rounded-3xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="p-5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Feature</th>
                  <th className="p-5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Spreadsheets</th>
                  <th className="p-5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">All-In-One Software</th>
                  <th className="bg-blue-400/5 p-5 text-left text-xs font-semibold uppercase tracking-wider text-blue-400">DeckMargin</th>
                </tr>
              </thead>
              <tbody>
                {compareRows.map((row, i) => (
                  <tr key={row.feature} className={`border-b border-white/8 ${i % 2 === 0 ? "bg-white/[0.015]" : ""}`}>
                    <td className="p-5 text-gray-400">{row.feature}</td>
                    <td className="p-5">
                      {typeof row.spreadsheet === "boolean" ? (
                        <span className={row.spreadsheet ? "text-emerald-400 font-semibold" : "text-white/20"}>
                          {row.spreadsheet ? "✓" : "✕"}
                        </span>
                      ) : (
                        <span className="text-gray-400">{row.spreadsheet}</span>
                      )}
                    </td>
                    <td className="p-5">
                      {typeof row.allInOne === "boolean" ? (
                        <span className={row.allInOne ? "text-emerald-400 font-semibold" : "text-white/20"}>
                          {row.allInOne ? "✓" : "✕"}
                        </span>
                      ) : (
                        <span className="text-gray-400">{row.allInOne}</span>
                      )}
                    </td>
                    <td className="bg-blue-400/5 p-5">
                      {typeof row.deckmargin === "boolean" ? (
                        <span className="text-emerald-400 font-semibold">✓</span>
                      ) : (
                        <span className="font-semibold text-blue-300">{row.deckmargin}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 rounded-2xl border border-blue-400/20 bg-blue-400/5 p-5 text-sm leading-7 text-gray-400">
            <strong className="text-blue-300">The honest truth: </strong>
            Most all-in-one contractor software costs $200–$400/month and makes you pay for
            crew scheduling, punch lists, time tracking, and daily logs you&apos;ll never use as a
            deck contractor. DeckMargin does three things and charges $99/month. If you want
            47 features, there are other tools for that. If you want to stop underpricing
            deck jobs, you&apos;re in the right place.
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="border-b border-white/8 bg-[#0b0d12]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <SectionLabel>Real Builders Using DeckMargin</SectionLabel>
          <h2 className="mb-12 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
            What Contractors Are Saying.
          </h2>

          <div className="grid gap-6 lg:grid-cols-3">
            {testimonials.map((item) => (
              <div
                key={item.name}
                className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-white/[0.03] p-7 transition hover:-translate-y-1"
              >
                <div className="flex gap-0.5 text-yellow-400 text-sm">
                  {"★★★★★".split("").map((s, i) => <span key={i}>{s}</span>)}
                </div>
                <p className="flex-1 text-sm italic leading-7 text-gray-300">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 border-t border-white/10 pt-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#11141b] font-semibold text-blue-400 text-lg">
                    {item.initial}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="border-b border-white/8 bg-[#0e1117]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="mb-14 grid gap-10 lg:grid-cols-2 lg:items-end">
            <div>
              <SectionLabel>Simple Pricing</SectionLabel>
              <h2 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
                One Price.<br />No <span className="text-blue-400">Surprises.</span>
              </h2>
            </div>
            <p className="text-base leading-8 text-gray-400 lg:pt-4">
              Most contractor software runs{" "}
              <strong className="text-white">$200–$400/month</strong> and isn&apos;t
              built specifically for deck builders. DeckMargin is{" "}
              <strong className="text-white">$99/month</strong> and built for nothing
              else. One plan. Everything included. Cancel anytime.
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#11141b] shadow-[0_32px_80px_rgba(0,0,0,0.3)] lg:grid lg:grid-cols-2">
            {/* Left — price */}
            <div className="border-b border-white/10 p-10 lg:border-b-0 lg:border-r">
              <div className="mb-5 inline-flex rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-300">
                Built for Deck Contractors Only
              </div>
              <div className="flex items-start gap-1">
                <span className="mt-3 text-2xl font-semibold text-white">$</span>
                <span className="text-8xl font-semibold leading-none text-white">99</span>
                <span className="mt-auto mb-2 text-base text-gray-400">/month</span>
              </div>
              <p className="mt-3 text-sm leading-7 text-gray-400">
                vs.{" "}
                <strong className="text-blue-300">$199–$400/month</strong>{" "}
                for all-in-one tools built for every trade — including features you&apos;ll never use.
              </p>
              <div className="mt-8">
                <PrimaryButton href="/signup">Start Free 14-Day Trial →</PrimaryButton>
              </div>
              <p className="mt-4 text-xs text-gray-500">Free for 14 days. Cancel anytime.</p>
              <p className="mt-6 text-sm text-gray-400">
                Need help getting set up?{" "}
                <a href="mailto:Carlos.lourenco@deckmargin.com" className="text-white underline hover:text-blue-300">
                  Contact us
                </a>
              </p>
            </div>

            {/* Right — features */}
            <div className="p-10">
              <div className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                Everything Included
              </div>
              <div className="space-y-5">
                {pricingFeatures.map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <CheckIcon />
                    <div>
                      <div className="text-sm font-semibold text-white">{item.title}</div>
                      <div className="mt-0.5 text-sm text-gray-400">{item.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOUNDER STORY ── */}
      <section className="border-b border-white/8 bg-[#0b0d12]">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center lg:px-8">
          <div className="mb-8 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
            Why DeckMargin Exists
          </div>
          <p className="text-lg leading-9 text-gray-300">
            DeckMargin was built after talking to dozens of deck contractors who were{" "}
            <strong className="text-white">losing money on jobs they worked hard to complete.</strong>
          </p>
          <p className="mt-5 text-lg leading-9 text-gray-300">
            Not because they weren&apos;t skilled. Because pricing a deck job accurately —
            accounting for real labor costs, real material costs, overhead, and a margin
            that actually protects the business — is{" "}
            <strong className="text-white">
              genuinely hard without the right tool.
            </strong>
          </p>
          <p className="mt-5 text-lg leading-9 text-gray-300">
            We talked to contractors who almost quit. Contractors pricing from gut feel for
            20 years. Contractors building 8-page Excel spreadsheets from scratch because
            nothing existed that actually fit how a deck business works.
          </p>
          <p className="mt-5 text-lg leading-9 text-white font-semibold">
            We built the tool they should have had all along. Specifically for deck
            contractors. Nobody else.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-xl font-semibold text-white">
              C
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-white">Carlos Lourenco</div>
              <div className="text-sm text-gray-500">
                Founder, DeckMargin ·{" "}
                <a href="mailto:Carlos.lourenco@deckmargin.com" className="hover:text-white transition">
                  Carlos.lourenco@deckmargin.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-blue-600">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center lg:px-8">
          <h2 className="text-5xl font-semibold leading-tight tracking-tight text-white sm:text-6xl">
            Know Your Number.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-blue-100">
            Stop pricing jobs from spreadsheets, gut feel, and old quotes. Start every
            estimate knowing exactly what you&apos;re making before you send the price.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 text-base font-semibold text-blue-600 transition hover:bg-blue-50 active:scale-95"
            >
              Start Free 14-Day Trial →
            </Link>
            <WatchButtonAlt onClick={() => setVideoOpen(true)} />
          </div>
          <p className="mt-6 text-sm text-blue-200">
            Free for 14 days · Cancel anytime · Set up in 20 minutes
          </p>
        </div>
      </section>

    </main>
  );
}