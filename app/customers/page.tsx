"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

type CustomerRow = {
  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
  quote_count: number;
  total_revenue: number;
  last_quote_date: string | null;
  project_ids: string[];
};

function money(n: number) {
  if (!n) return "—";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function dt(s: string | null) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function CustomersPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("projects")
        .select("id, client_name, client_email, client_phone, final_price, created_at")
        .order("created_at", { ascending: false });

      if (!data) { setLoading(false); return; }

      // Group by client_name + client_email
      const map = new Map<string, CustomerRow>();
      for (const p of data) {
        const key = `${(p.client_name ?? "").toLowerCase()}|${(p.client_email ?? "").toLowerCase()}`;
        if (!map.has(key)) {
          map.set(key, {
            client_name: p.client_name,
            client_email: p.client_email,
            client_phone: p.client_phone,
            quote_count: 0,
            total_revenue: 0,
            last_quote_date: p.created_at,
            project_ids: [],
          });
        }
        const row = map.get(key)!;
        row.quote_count += 1;
        row.total_revenue += p.final_price ?? 0;
        row.project_ids.push(p.id);
        if (!row.last_quote_date || p.created_at > row.last_quote_date) {
          row.last_quote_date = p.created_at;
        }
      }

      setCustomers(Array.from(map.values()).sort((a, b) => (b.last_quote_date ?? "") > (a.last_quote_date ?? "") ? 1 : -1));
      setLoading(false);
    }
    load();
  }, [supabase]);

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      (c.client_name ?? "").toLowerCase().includes(q) ||
      (c.client_email ?? "").toLowerCase().includes(q) ||
      (c.client_phone ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <main className="min-h-screen bg-[#0b0f19] px-6 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Customers</h1>
            <p className="mt-1 text-sm text-white/70">All clients across your quotes</p>
          </div>
          <Link href="/dashboard" className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10">
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or phone..."
            className="w-full max-w-sm rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm placeholder-white/30 focus:outline-none focus:border-white/30"
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          {loading ? (
            <div className="py-8 text-center text-sm text-white/50">Loading customers...</div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-white/50">No customers found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-white/50">
                  <tr className="border-b border-white/10">
                    <th className="py-3 pr-6 font-medium">Customer</th>
                    <th className="py-3 pr-6 font-medium">Contact</th>
                    <th className="py-3 pr-6 font-medium">Quotes</th>
                    <th className="py-3 pr-6 font-medium">Total Revenue</th>
                    <th className="py-3 pr-6 font-medium">Last Quote</th>
                    <th className="py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-white/90">
                  {filtered.map((c, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/3">
                      <td className="py-4 pr-6 font-medium">{c.client_name || <span className="text-white/30">Unnamed</span>}</td>
                      <td className="py-4 pr-6">
                        <div className="text-white/70">{c.client_email || "—"}</div>
                        <div className="text-white/40 text-xs">{c.client_phone || ""}</div>
                      </td>
                      <td className="py-4 pr-6">
                        <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs">{c.quote_count}</span>
                      </td>
                      <td className="py-4 pr-6">{money(c.total_revenue)}</td>
                      <td className="py-4 pr-6 text-white/60">{dt(c.last_quote_date)}</td>
                      <td className="py-4">
                        <Link
                          href={`/projects?customer=${encodeURIComponent(c.client_name ?? "")}`}
                          className="rounded border border-white/20 px-3 py-1 text-xs hover:bg-white/10"
                        >
                          View Quotes
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
