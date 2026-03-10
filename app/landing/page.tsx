"use client";

import { useState } from "react";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function joinWaitlist(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    setMsg("");

    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      setErr(data.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    setMsg("🎉 You're on the waitlist. We'll notify you when DeckMargin launches.");
    setEmail("");
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#0b0f19] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-20 flex items-center justify-between">
          <div className="text-2xl font-bold">DeckMargin</div>

          <div className="flex gap-3">
            <a
              href="#waitlist"
              className="rounded border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
            >
              Get Early Access
            </a>

            <a
              href="/login"
              className="rounded border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
            >
              Contractor Login
            </a>
          </div>
        </header>

        <section className="mb-20 max-w-5xl">
          <h1 className="text-5xl font-semibold leading-tight md:text-6xl">
            Stop guessing deck prices.
            <br />
            Quote jobs faster and protect your profit.
          </h1>

          <p className="mt-6 max-w-3xl text-lg text-white/70">
            DeckMargin helps deck contractors estimate jobs, protect margins,
            and generate professional proposals in minutes.
          </p>

          <div className="mt-8 flex gap-3">
            <a
              href="#waitlist"
              className="rounded bg-blue-500 px-5 py-3 text-white hover:bg-blue-600"
            >
              Get Early Access
            </a>

            <a
              href="/login"
              className="rounded border border-white/20 px-5 py-3 hover:bg-white/10"
            >
              Contractor Login
            </a>
          </div>
        </section>

        <section className="mb-20 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="mb-4 text-sm uppercase tracking-wide text-white/50">
            Product Snapshot
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-[#111827] p-5">
              <div className="text-sm font-medium text-white/70">Dashboard</div>
              <div className="mt-3 text-2xl font-semibold">$7,352.86</div>
              <div className="mt-1 text-sm text-white/50">Revenue tracked across quotes</div>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#111827] p-5">
              <div className="text-sm font-medium text-white/70">Estimator</div>
              <div className="mt-3 text-2xl font-semibold">320 sqft</div>
              <div className="mt-1 text-sm text-white/50">Auto-calculated deck build inputs</div>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#111827] p-5">
              <div className="text-sm font-medium text-white/70">Proposal</div>
              <div className="mt-3 text-2xl font-semibold">PDF Ready</div>
              <div className="mt-1 text-sm text-white/50">Professional client-facing quote output</div>
            </div>
          </div>
        </section>

        <section className="mb-20">
          <h2 className="mb-6 text-2xl font-semibold">The problem DeckMargin solves</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              Manual deck estimating is slow and inconsistent.
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              Spreadsheets hide your real cost and profit.
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              Material, labor, stairs, and overhead get missed.
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              Proposals often look rushed and unprofessional.
            </div>
          </div>
        </section>

        <section className="mb-20 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold">Estimate smarter</h2>
            <p className="mt-2 text-white/70">
              Use deck size, material type, height tier, and stairs to calculate job costs automatically.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold">Protect your profit</h2>
            <p className="mt-2 text-white/70">
              See total job cost, expected profit, and target margin before you send a quote.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold">Send better proposals</h2>
            <p className="mt-2 text-white/70">
              Generate clean professional PDF proposals homeowners can actually understand.
            </p>
          </div>
        </section>

        <section className="mb-20">
          <h2 className="mb-6 text-2xl font-semibold">Why contractors will use it</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              Built specifically for deck contractors
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              Save your rates once and reuse them across every job
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              Estimate jobs in minutes instead of wrestling with spreadsheets
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              Move from rough pricing to professional proposal in one system
            </div>
          </div>
        </section>

        <section
          id="waitlist"
          className="rounded-2xl border border-white/10 bg-white/5 p-8"
        >
          <h2 className="text-2xl font-semibold">Get early access to DeckMargin</h2>
          <p className="mt-2 text-white/70">
            We’re opening DeckMargin to a small group of deck contractors first.
            Join the list to get early access.
          </p>

          {err ? (
            <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {err}
            </div>
          ) : null}

          {msg ? (
            <div className="mt-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {msg}
            </div>
          ) : null}

          <form onSubmit={joinWaitlist} className="mt-6 flex max-w-xl gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-lg border border-white/15 bg-[#111827] px-4 py-3 text-white"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-blue-500 px-5 py-3 text-white hover:bg-blue-600 disabled:opacity-60"
            >
              {loading ? "Joining..." : "Join"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

