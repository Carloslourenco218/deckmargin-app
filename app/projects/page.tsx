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

const STATUS_DISPLAY: Record<string, string> = {
  draft:         "Draft",
  ready_to_send: "Ready to Send",
  open:          "Ready to Send",
  sent:          "Sent",
  viewed:        "Viewed",
  "follow-up":   "Follow-Up",
  accepted:      "Accepted",
  approved:      "Accepted",
  declined:      "Declined",
  won:           "Won",
  lost:          "Lost",
  "on-hold":     "On Hold",
  expired:       "Expired",
};

function statusBadge(status: string | null) {
  const s = (status ?? "draft").toLowerCase();
  const map: Record<string, string> = {
    draft:          "border-gray-200 bg-gray-100 text-gray-600",
    ready_to_send:  "border-blue-200 bg-blue-100 text-blue-700",
    open:           "border-blue-200 bg-blue-100 text-blue-700",
    sent:           "border-purple-200 bg-purple-100 text-purple-700",
    viewed:         "border-cyan-200 bg-cyan-100 text-cyan-700",
    "follow-up":    "border-amber-200 bg-amber-100 text-amber-700",
    approved:       "border-green-200 bg-green-100 text-green-700",
    accepted:       "border-green-200 bg-green-100 text-green-700",
    won:            "border-green-200 bg-green-100 text-green-700",
    declined:       "border-red-200 bg-red-100 text-red-700",
    lost:           "border-red-200 bg-red-100 text-red-700",
    "on-hold":      "border-gray-200 bg-gray-100 text-gray-600",
    expired:        "border-gray-200 bg-gray-100 text-gray-600",
  };
  const cls = map[s] ?? "border-gray-200 bg-gray-100 text-gray-600";
  const label = STATUS_DISPLAY[s] ?? s;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

function money(value: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function percent(value: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
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
    <main className="min-h-screen bg-[#FAFAF8] px-6 py-8 text-[#1D2C4B]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-[#1D2C4B]">Projects</h1>
            <p className="mt-1 text-sm text-[#6B7280]">
              Manage and review your deck quotes
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-lg border border-[#E7E5E0] px-4 py-2 text-sm text-[#2A2E36] hover:bg-[#F3F2EF]"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="rounded-2xl border border-[#E7E5E0] bg-white p-4">
          <div className="mb-4 text-sm font-medium text-[#1D2C4B]">
            Recent Quotes
          </div>

          {loading ? (
            <div className="py-6 text-sm text-[#6B7280]">Loading...</div>
          ) : err ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {err}
            </div>
          ) : projects.length === 0 ? (
            <div className="py-6 text-sm text-[#6B7280]">No quotes found.</div>
          ) : (
            <>
              {/* Mobile card list */}
              <div className="md:hidden space-y-3">
                {projects.map((project) => (
                  <div key={project.id} className="rounded-xl border border-[#E7E5E0] bg-[#F9F8F6] p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0">
                        <div className="font-medium text-[#1D2C4B] text-sm truncate">
                          {project.name ?? "Untitled Quote"}
                        </div>
                        <div className="mt-1 text-xs text-[#6B7280]">
                          {money(project.final_price)} &middot; {money(project.expected_profit)} profit &middot; {percent(project.target_margin)} margin
                        </div>
                      </div>
                      <div className="shrink-0">{statusBadge(project.status)}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/projects/${project.id}`}
                        className="rounded border border-[#E7E5E0] px-3 py-1.5 text-xs text-[#2A2E36] hover:bg-white"
                      >
                        Open
                      </Link>
                      <Link
                        href={`/projects/${project.id}/edit`}
                        className="rounded border border-[#E7E5E0] px-3 py-1.5 text-xs text-[#2A2E36] hover:bg-white"
                      >
                        Edit
                      </Link>
                      <a
                        href={`/api/proposal/${project.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded border border-[#E7E5E0] px-3 py-1.5 text-xs text-[#2A2E36] hover:bg-white"
                      >
                        PDF
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDuplicate(project.id)}
                        disabled={duplicating === project.id}
                        className="rounded border border-[#E7E5E0] px-3 py-1.5 text-xs text-[#2A2E36] hover:bg-white disabled:opacity-50"
                      >
                        {duplicating === project.id ? "..." : "Duplicate"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-[#6B7280]">
                    <tr className="border-b border-[#E7E5E0]">
                      <th className="py-3 pr-4 font-medium">Project</th>
                      <th className="py-3 pr-4 font-medium">Status</th>
                      <th className="py-3 pr-4 font-medium">Price</th>
                      <th className="py-3 pr-4 font-medium">Profit</th>
                      <th className="py-3 pr-4 font-medium">Margin</th>
                      <th className="py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="text-[#2A2E36]">
                    {projects.map((project) => (
                      <tr key={project.id} className="border-b border-[#E7E5E0] hover:bg-[#F3F2EF]">
                        <td className="py-4 pr-4">
                          {project.name ?? "Untitled Quote"}
                        </td>

                        <td className="py-4 pr-4">
                          {statusBadge(project.status)}
                        </td>

                        <td className="py-4 pr-4">{money(project.final_price)}</td>
                        <td className="py-4 pr-4">{money(project.expected_profit)}</td>
                        <td className="py-4 pr-4">{percent(project.target_margin)}</td>

                        <td className="py-4">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/projects/${project.id}`}
                              className="rounded border border-[#E7E5E0] px-3 py-1 text-xs text-[#2A2E36] hover:bg-[#F3F2EF]"
                            >
                              Open
                            </Link>

                            <Link
                              href={`/projects/${project.id}/edit`}
                              className="rounded border border-[#E7E5E0] px-3 py-1 text-xs text-[#2A2E36] hover:bg-[#F3F2EF]"
                            >
                              Edit
                            </Link>

                            <a
                              href={`/api/proposal/${project.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded border border-[#E7E5E0] px-3 py-1 text-xs text-[#2A2E36] hover:bg-[#F3F2EF]"
                            >
                              PDF
                            </a>

                            <button
                              type="button"
                              onClick={() => handleDuplicate(project.id)}
                              disabled={duplicating === project.id}
                              className="rounded border border-[#E7E5E0] px-3 py-1 text-xs text-[#2A2E36] hover:bg-[#F3F2EF] disabled:opacity-50"
                            >
                              {duplicating === project.id ? "..." : "Duplicate"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
