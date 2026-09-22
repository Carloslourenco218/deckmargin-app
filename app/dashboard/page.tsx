"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

type ProjectRow = {
  id: string;
  name: string | null;
  status: string | null;
  final_price: number | null;
  expected_profit: number | null;
  target_margin: number | null;
  created_at: string;
};

function money(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return "-";
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });
}

const STATUS_LABELS: Record<string, string> = {
  draft:          "Draft",
  ready_to_send:  "Ready to Send",
  open:           "Ready to Send", // backward compat
  sent:           "Sent",
  viewed:         "Viewed",
  "follow-up":    "Follow-Up",
  accepted:       "Accepted",
  approved:       "Accepted",
  declined:       "Declined",
  lost:           "Lost",
  won:            "Won",
  "on-hold":      "On Hold",
  expired:        "Expired",
};

function statusBadge(status: string | null) {
  const s = (status ?? "draft").toLowerCase();
  const map: Record<string, string> = {
    draft:          "bg-gray-800 text-gray-400",
    ready_to_send:  "bg-blue-500/20 text-blue-300",
    open:           "bg-blue-500/20 text-blue-300",
    sent:           "bg-violet-500/20 text-violet-300",
    viewed:         "bg-cyan-500/20 text-cyan-300",
    "follow-up":    "bg-amber-500/20 text-amber-300",
    approved:       "bg-emerald-500/20 text-emerald-300",
    accepted:       "bg-emerald-500/20 text-emerald-300",
    won:            "bg-green-500/20 text-green-300",
    declined:       "bg-red-500/20 text-red-300",
    lost:           "bg-red-500/20 text-red-300",
    "on-hold":      "bg-gray-700 text-gray-300",
    expired:        "bg-gray-700 text-gray-300",
  };
  const cls = map[s] ?? "bg-gray-700 text-gray-200";
  const label = STATUS_LABELS[s] ?? s;
  return (
    <span className={`rounded-full px-3 py-1 text-xs ${cls}`}>{label}</span>
  );
}

function pct(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return "-";
  return `${Math.round(n * 100)}%`;
}

export default function DashboardPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [rows, setRows] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setErr("You must be logged in.");
      setRows([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("projects")
      .select(
        "id,name,status,final_price,expected_profit,target_margin,created_at"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setErr(error.message);
      setRows([]);
    } else {
      setRows((data ?? []) as ProjectRow[]);
    }

    setLoading(false);
  }

  async function handleDelete(id: string) {
    const ok = window.confirm("Delete this quote?");
    if (!ok) return;

    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    load();
  }

  async function handleDuplicate(id: string) {
    setDuplicating(id);
    try {
      const res = await fetch(`/api/projects/${id}/duplicate`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) { alert(json.error ?? "Could not duplicate quote"); return; }
      router.push(`/projects/${json.id}/edit`);
    } finally {
      setDuplicating(null);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  useEffect(() => {
    load();
  }, []);

  // ── KPI computations ─────────────────────────────────────────────────────
  const wonRows  = rows.filter((r) => ["won", "accepted"].includes((r.status ?? "").toLowerCase()));
  const lostRows = rows.filter((r) => ["lost", "declined"].includes((r.status ?? "").toLowerCase()));
  const sentRows = rows.filter((r) => ["sent", "viewed", "follow-up", "won", "accepted", "lost", "declined"].includes((r.status ?? "").toLowerCase()));
  const activeRows = rows.filter((r) => ["ready_to_send", "open", "sent", "viewed", "follow-up"].includes((r.status ?? "").toLowerCase()));

  const totalRevenue = wonRows.reduce((sum, r) => sum + (r.final_price ?? 0), 0);
  const totalProfit  = wonRows.reduce((sum, r) => sum + (r.expected_profit ?? 0), 0);
  const avgMargin    = wonRows.length > 0
    ? wonRows.reduce((sum, r) => sum + (r.target_margin ?? 0), 0) / wonRows.length
    : null;
  const wonCount   = wonRows.length;
  const lostCount  = lostRows.length;

  // Conversion rate = won / (won + lost)
  const closedCount = wonCount + lostCount;
  const conversionRate = closedCount > 0 ? wonCount / closedCount : null;

  // Open pipeline = sum of active quote values
  const openPipeline = activeRows.reduce((sum, r) => sum + (r.final_price ?? 0), 0);

  // Avg sold price
  const avgSoldPrice = wonCount > 0
    ? wonRows.reduce((sum, r) => sum + (r.final_price ?? 0), 0) / wonCount
    : null;

  // Quotes sent (exited draft)
  const quotesSent = sentRows.length;

  // Recent 10 for the table
  const recentRows = rows.slice(0, 10);

  return (
    <main className="min-h-screen bg-[#0e0e10] p-10 text-white">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-gray-400">
            Quick view of your quotes, profit, and sales pipeline.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/billing"
            className="rounded-lg border border-gray-600 px-4 py-2 text-gray-200 hover:bg-gray-800"
          >
            Billing
          </Link>

          <Link
            href="/settings"
            className="rounded-lg border border-gray-600 px-4 py-2 text-gray-200 hover:bg-gray-800"
          >
            Settings
          </Link>

          <Link
            href="/projects"
            className="rounded-lg border border-gray-600 px-4 py-2 text-gray-200 hover:bg-gray-800"
          >
            View All Quotes
          </Link>

          <Link
            href="/projects/new"
            className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            + Create Quote
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-red-500/40 px-4 py-2 text-red-300 hover:bg-red-500/10"
          >
            Logout
          </button>
        </div>
      </div>

      {/* ── KPI cards (row 1) ── */}
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-gray-700 bg-[#151518] p-5">
          <div className="text-xs uppercase tracking-wide text-gray-400">Won Revenue</div>
          <div className="mt-2 text-2xl font-semibold">{money(totalRevenue)}</div>
          <div className="mt-1 text-xs text-gray-500">{wonCount} job{wonCount !== 1 ? "s" : ""} won</div>
        </div>

        <div className="rounded-xl border border-gray-700 bg-[#151518] p-5">
          <div className="text-xs uppercase tracking-wide text-gray-400">Open Pipeline</div>
          <div className="mt-2 text-2xl font-semibold">{money(openPipeline)}</div>
          <div className="mt-1 text-xs text-gray-500">{activeRows.length} active quote{activeRows.length !== 1 ? "s" : ""}</div>
        </div>

        <div className="rounded-xl border border-gray-700 bg-[#151518] p-5">
          <div className="text-xs uppercase tracking-wide text-gray-400">Conversion Rate</div>
          <div className="mt-2 text-2xl font-semibold">
            {conversionRate !== null ? `${Math.round(conversionRate * 100)}%` : "-"}
          </div>
          <div className="mt-1 text-xs text-gray-500">{wonCount}W / {lostCount}L from {closedCount} closed</div>
        </div>

        <div className="rounded-xl border border-gray-700 bg-[#151518] p-5">
          <div className="text-xs uppercase tracking-wide text-gray-400">Avg Sold Price</div>
          <div className="mt-2 text-2xl font-semibold">{money(avgSoldPrice)}</div>
          <div className="mt-1 text-xs text-gray-500">Avg margin {pct(avgMargin)}</div>
        </div>
      </div>

      {/* ── KPI cards (row 2) ── */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-gray-700 bg-[#151518] p-5">
          <div className="text-xs uppercase tracking-wide text-gray-400">Profit (Won)</div>
          <div className="mt-2 text-2xl font-semibold">{money(totalProfit)}</div>
        </div>

        <div className="rounded-xl border border-gray-700 bg-[#151518] p-5">
          <div className="text-xs uppercase tracking-wide text-gray-400">Quotes Sent</div>
          <div className="mt-2 text-2xl font-semibold">{quotesSent}</div>
          <div className="mt-1 text-xs text-gray-500">total across all time</div>
        </div>

        <div className="rounded-xl border border-gray-700 bg-[#151518] p-5">
          <div className="text-xs uppercase tracking-wide text-gray-400">Won</div>
          <div className="mt-2 text-2xl font-semibold text-emerald-400">{wonCount}</div>
        </div>

        <div className="rounded-xl border border-gray-700 bg-[#151518] p-5">
          <div className="text-xs uppercase tracking-wide text-gray-400">Lost / Declined</div>
          <div className="mt-2 text-2xl font-semibold text-red-400">{lostCount}</div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-700">
        <div className="flex items-center justify-between border-b border-gray-700 px-6 py-4">
          <div className="text-sm text-gray-300">Recent Quotes</div>
          <div className="text-xs text-gray-500">
            {loading ? "Loading…" : `Showing ${recentRows.length} of ${rows.length} quote${rows.length !== 1 ? "s" : ""}`}
          </div>
        </div>

        {err && (
          <div className="border-b border-gray-700 bg-red-950/30 p-6 text-sm text-red-300">
            Error: {err}
          </div>
        )}

        <table className="w-full text-sm">
          <thead className="bg-[#151518] text-gray-400">
            <tr>
              <th className="px-6 py-3 text-left">Project</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Price</th>
              <th className="px-6 py-3 text-left">Profit</th>
              <th className="px-6 py-3 text-left">Margin</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="px-6 py-6 text-gray-400" colSpan={6}>
                  Loading recent quotes…
                </td>
              </tr>
            ) : recentRows.length === 0 ? (
              <tr>
                <td className="px-6 py-6 text-gray-400" colSpan={6}>
                  No quotes yet. Create your first quote.
                </td>
              </tr>
            ) : (
              recentRows.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-gray-800 hover:bg-[#151518]"
                >
                  <td className="px-6 py-4">{p.name ?? "Untitled Quote"}</td>

                  <td className="px-6 py-4">
                    {statusBadge(p.status)}
                  </td>

                  <td className="px-6 py-4">{money(p.final_price)}</td>
                  <td className="px-6 py-4">{money(p.expected_profit)}</td>
                  <td className="px-6 py-4">{pct(p.target_margin)}</td>

                  <td className="flex gap-2 px-6 py-4">
                    <Link
                      href={`/projects/${p.id}`}
                      className="rounded-md border border-gray-600 px-3 py-1 text-xs hover:bg-gray-700"
                    >
                      Open
                    </Link>

                    <Link
                      href={`/projects/${p.id}/edit`}
                      className="rounded-md border border-gray-600 px-3 py-1 text-xs hover:bg-gray-700"
                    >
                      Edit
                    </Link>

                    <Link
                      href={`/projects/${p.id}/preview`}
                      className="rounded-md border border-gray-600 px-3 py-1 text-xs hover:bg-gray-700"
                    >
                      Preview
                    </Link>

                    <a
                      href={`/api/proposal/${p.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md border border-gray-600 px-3 py-1 text-xs hover:bg-gray-700"
                    >
                      PDF
                    </a>

                    <button
                      type="button"
                      onClick={() => handleDuplicate(p.id)}
                      disabled={duplicating === p.id}
                      className="rounded-md border border-white/20 px-3 py-1 text-xs hover:bg-gray-700 disabled:opacity-50"
                    >
                      {duplicating === p.id ? "…" : "Duplicate"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      className="rounded-md border border-red-500/40 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

