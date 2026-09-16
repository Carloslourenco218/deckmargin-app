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
  if (n == null || Number.isNaN(n)) return "—";
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });
}

function statusBadge(status: string | null) {
  const s = (status ?? "open").toLowerCase();
  const map: Record<string, string> = {
    draft:       "bg-gray-800 text-gray-400",
    open:        "bg-blue-500/20 text-blue-300",
    sent:        "bg-violet-500/20 text-violet-300",
    viewed:      "bg-cyan-500/20 text-cyan-300",
    "follow-up": "bg-amber-500/20 text-amber-300",
    approved:    "bg-emerald-500/20 text-emerald-300",
    accepted:    "bg-emerald-500/20 text-emerald-300",
    won:         "bg-green-500/20 text-green-300",
    declined:    "bg-red-500/20 text-red-300",
    lost:        "bg-red-500/20 text-red-300",
    "on-hold":   "bg-gray-700 text-gray-300",
    expired:     "bg-gray-700 text-gray-300",
  };
  const cls = map[s] ?? "bg-gray-700 text-gray-200";
  return (
    <span className={`rounded-full px-3 py-1 text-xs ${cls}`}>{s}</span>
  );
}

function pct(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return "—";
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
      .order("created_at", { ascending: false })
      .limit(10);

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

  const totalRevenue = rows.reduce((sum, r) => sum + (r.final_price ?? 0), 0);
  const totalProfit = rows.reduce((sum, r) => sum + (r.expected_profit ?? 0), 0);
  const avgMargin =
    rows.length > 0
      ? rows.reduce((sum, r) => sum + (r.target_margin ?? 0), 0) / rows.length
      : null;

  const wonCount = rows.filter((r) => ["won", "accepted"].includes((r.status ?? "").toLowerCase())).length;
  const lostCount = rows.filter((r) => ["lost", "declined"].includes((r.status ?? "").toLowerCase())).length;

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

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-5">
        <div className="rounded-xl border border-gray-700 bg-[#151518] p-5">
          <div className="text-xs uppercase tracking-wide text-gray-400">Revenue</div>
          <div className="mt-2 text-2xl font-semibold">{money(totalRevenue)}</div>
        </div>

        <div className="rounded-xl border border-gray-700 bg-[#151518] p-5">
          <div className="text-xs uppercase tracking-wide text-gray-400">Profit</div>
          <div className="mt-2 text-2xl font-semibold">{money(totalProfit)}</div>
        </div>

        <div className="rounded-xl border border-gray-700 bg-[#151518] p-5">
          <div className="text-xs uppercase tracking-wide text-gray-400">Avg Margin</div>
          <div className="mt-2 text-2xl font-semibold">{pct(avgMargin)}</div>
        </div>

        <div className="rounded-xl border border-gray-700 bg-[#151518] p-5">
          <div className="text-xs uppercase tracking-wide text-gray-400">Won</div>
          <div className="mt-2 text-2xl font-semibold">{wonCount}</div>
        </div>

        <div className="rounded-xl border border-gray-700 bg-[#151518] p-5">
          <div className="text-xs uppercase tracking-wide text-gray-400">Lost</div>
          <div className="mt-2 text-2xl font-semibold">{lostCount}</div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-700">
        <div className="flex items-center justify-between border-b border-gray-700 px-6 py-4">
          <div className="text-sm text-gray-300">Recent Quotes</div>
          <div className="text-xs text-gray-500">
            {loading ? "Loading..." : `Showing ${rows.length} record(s)`}
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
                  Loading recent quotes...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-6 py-6 text-gray-400" colSpan={6}>
                  No quotes yet. Create your first quote.
                </td>
              </tr>
            ) : (
              rows.map((p) => (
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
                      {duplicating === p.id ? "..." : "Duplicate"}
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
