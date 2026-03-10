import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";
import StatusActions from "./StatusActions";

type ProjectRow = {
  id: string;
  name: string | null;
  status: string | null;

  deck_length: number | null;
  deck_width: number | null;
  deck_sqft: number | null;

  height_tier: string | null;
  material_type: string | null;
  railing_type: string | null;
  stair_count: number | null;

  material_cost: number | null;
  labor_cost: number | null;
  permit_cost: number | null;
  equipment_cost: number | null;
  overhead_cost: number | null;
  total_job_cost: number | null;

  final_price: number | null;
  expected_profit: number | null;
  target_margin: number | null;

  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
  site_address: string | null;
  notes: string | null;

  created_at: string | null;
  updated_at: string | null;
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

function dateText(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

function wholeNumber(value: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return Math.round(value).toString();
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;

  const supabase = await createClient();

  const { data: project, error } = await supabase
    .from("projects")
    .select(`
      id,
      name,
      status,
      deck_length,
      deck_width,
      deck_sqft,
      height_tier,
      material_type,
      railing_type,
      stair_count,
      material_cost,
      labor_cost,
      permit_cost,
      equipment_cost,
      overhead_cost,
      total_job_cost,
      final_price,
      expected_profit,
      target_margin,
      client_name,
      client_email,
      client_phone,
      site_address,
      notes,
      created_at,
      updated_at
    `)
    .eq("id", id)
    .single<ProjectRow>();

  if (error || !project) {
    return (
      <main className="min-h-screen bg-[#0b0f19] px-6 py-8 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            Error loading project: {error?.message ?? "Project not found"}
          </div>

          <Link
            href="/projects"
            className="mt-4 inline-flex rounded border border-white/20 px-3 py-2 text-sm hover:bg-white/10"
          >
            Back
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0f19] px-6 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold">
                {project.name ?? "Untitled Quote"}
              </h1>
              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-white/80">
                {project.status ?? "open"}
              </span>
            </div>

            <p className="mt-1 text-sm text-white/60">
              Internal Quote Summary • Created {dateText(project.created_at)} • Updated{" "}
              {dateText(project.updated_at)}
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/projects"
              className="rounded border border-white/20 px-3 py-2 text-sm hover:bg-white/10"
            >
              ← Back
            </Link>

            <Link
              href={`/projects/${project.id}/edit`}
              className="rounded border border-white/20 px-3 py-2 text-sm hover:bg-white/10"
            >
              Edit Quote
            </Link>

            <Link
              href={`/projects/${project.id}/preview`}
              className="rounded border border-white/20 px-3 py-2 text-sm hover:bg-white/10"
            >
              Preview Proposal
            </Link>

            <a
              href={`/api/proposal/${project.id}`}
              target="_blank"
              rel="noreferrer"
              className="rounded border border-white/20 px-3 py-2 text-sm hover:bg-white/10"
            >
              Download PDF
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60">Final Price</div>
            <div className="mt-1 text-xl font-semibold">
              {money(project.final_price)}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60">Total Job Cost</div>
            <div className="mt-1 text-xl font-semibold">
              {money(project.total_job_cost)}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60">Expected Profit</div>
            <div className="mt-1 text-xl font-semibold">
              {money(project.expected_profit)}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60">Target Margin</div>
            <div className="mt-1 text-xl font-semibold">
              {percent(project.target_margin)}
            </div>
          </div>
        </div>

        <StatusActions
          id={project.id}
          currentStatus={project.status ?? "open"}
        />

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-medium">Client</div>
              <div className="text-xs text-white/40">Customer details</div>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <div className="text-xs text-white/50">Client Name</div>
                <div className="mt-1">{project.client_name || "—"}</div>
              </div>

              <div>
                <div className="text-xs text-white/50">Email</div>
                <div className="mt-1">{project.client_email || "—"}</div>
              </div>

              <div>
                <div className="text-xs text-white/50">Phone</div>
                <div className="mt-1">{project.client_phone || "—"}</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-medium">Job Site</div>
              <div className="text-xs text-white/40">Location & deck size</div>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <div className="text-xs text-white/50">Site Address</div>
                <div className="mt-1">{project.site_address || "—"}</div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-white/50">Length</div>
                  <div className="mt-1">{wholeNumber(project.deck_length)} ft</div>
                </div>

                <div>
                  <div className="text-xs text-white/50">Width</div>
                  <div className="mt-1">{wholeNumber(project.deck_width)} ft</div>
                </div>

                <div>
                  <div className="text-xs text-white/50">Sq Ft</div>
                  <div className="mt-1">{wholeNumber(project.deck_sqft)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-white/50">Height Tier</div>
                  <div className="mt-1">{project.height_tier || "—"}</div>
                </div>

                <div>
                  <div className="text-xs text-white/50">Material Type</div>
                  <div className="mt-1">{project.material_type || "—"}</div>
                </div>

                <div>
                  <div className="text-xs text-white/50">Railing Type</div>
                  <div className="mt-1">{project.railing_type || "—"}</div>
                </div>

                <div>
                  <div className="text-xs text-white/50">Stair Count</div>
                  <div className="mt-1">
                    {project.stair_count === null || project.stair_count === undefined
                      ? "—"
                      : project.stair_count}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="mb-3 text-sm font-medium">Cost Breakdown</div>

          <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <span className="text-white/70">Materials</span>
              <span>{money(project.material_cost)}</span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <span className="text-white/70">Labor</span>
              <span>{money(project.labor_cost)}</span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <span className="text-white/70">Permits</span>
              <span>{money(project.permit_cost)}</span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <span className="text-white/70">Equipment</span>
              <span>{money(project.equipment_cost)}</span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 md:col-span-2">
              <span className="text-white/70">Overhead</span>
              <span>{money(project.overhead_cost)}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="mb-2 text-sm font-medium">Internal Notes</div>
          <div className="whitespace-pre-wrap text-sm text-white/70">
            {project.notes || "—"}
          </div>
        </div>
      </div>
    </main>
  );
}

