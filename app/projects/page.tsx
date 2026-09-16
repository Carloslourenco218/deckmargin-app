"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

type ProjectRow = {
  id: string;
  name: string | null;
  status: string | null;
  final_price: number | null;
  expected_profit: number | null;
  target_margin: number | null;
  created_at: string | null;
};

function statusBadge(status: string | null) {
  const s = (status ?? "open").toLowerCase();
  const map: Record<string, string> = {
    draft:       "border-white/20 bg-white/5 text-white/50",
    open:        "border-blue-500/30 bg-blue-500/10 text-blue-300",
    sent:        "border-violet-500/30 bg-violet-500/10 text-violet-300",
    viewed:      "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
    "follow-up": "border-amber-500/30 bg-amber-500/10 text-amber-300",
    approved:    "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    accepted:    "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    won:         "border-green-500/30 bg-green-500/10 text-green-300",
    declined:    "border-red-500/30 bg-red-500/10 text-red-300",
    lost:        "border-red-500/30 bg-red-500/10 text-red-300",
    "on-hold":   "border-gray-500/30 bg-gray-500/10 text-gray-300",
    expired:     "border-gray-500/30 bg-gray-500/10 text-gray-300",
  };
  const cls = map[s] ?? "border-white/20 bg-white/5 text-white/70";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${cls}`}>
      {s}
    </span>
  );
}

function money(value: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function percent(value: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  if (value <= 1) return `${Math.round(value * 100)}%`;
  return `${Math.round(value)}%`;
}

export default function ProjectsPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [duplicating, setDuplicating] = useState<string | null>(null);

  async function loadProjects() {
    setLoading(true);
    setErr("");

    const { data, error } = await supabase
      .from("projects")
      .select(
        "id, name, status, final_price, expected_profit, target_margin, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      setErr(error.message);
      setProjects([]);
    } else {
      setProjects((data ?? []) as ProjectRow[]);
    }

    setLoading(false);
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

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <main className="min-h-screen bg-[#0b0f19] px-6 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Projects</h1>
            <p className="mt-1 text-sm text-white/70">
              Manage and review your deck quotes
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-4 text-sm font-medium text-white/80">
            Recent Quotes
          </div>

          {loading ? (
            <div className="py-6 text-sm text-white/60">Loading…</div>
          ) : err ? (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {err}
            </div>
          ) : projects.length === 0 ? (
            <div className="py-6 text-sm text-white/60">No quotes found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-white/60">
                  <tr className="border-b border-white/10">
                    <th className="py-3 pr-4 font-medium">Project</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                    <th className="py-3 pr-4 font-medium">Price</th>
                    <th className="py-3 pr-4 font-medium">Profit</th>
                    <th className="py-3 pr-4 font-medium">Margin</th>
                    <th className="py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody className="text-white/90">
                  {projects.map((project) => (
                    <tr key={project.id} className="border-b border-white/5">
                      <td className="py-4 pr-4">
                        {project.name ?? "Untitled Quote"}
                      </td>

                      <td className="py-4 pr-4">
                        {statusBadge(project.status)}
                      </td>

                      <td className="py-4 