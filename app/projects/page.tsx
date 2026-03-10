"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

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
                        <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-white/80">
                          {project.status ?? "open"}
                        </span>
                      </td>

                      <td className="py-4 pr-4">{money(project.final_price)}</td>
                      <td className="py-4 pr-4">{money(project.expected_profit)}</td>
                      <td className="py-4 pr-4">{percent(project.target_margin)}</td>

                      <td className="py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/projects/${project.id}`}
                            className="rounded border border-white/20 px-3 py-1 text-xs hover:bg-white/10"
                          >
                            Open
                          </Link>

                          <Link
                            href={`/projects/${project.id}/edit`}
                            className="rounded border border-white/20 px-3 py-1 text-xs hover:bg-white/10"
                          >
                            Edit
                          </Link>

                          <a
                            href={`/api/proposal/${project.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded border border-white/20 px-3 py-1 text-xs hover:bg-white/10"
                          >
                            PDF
                          </a>
                        </div>
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

