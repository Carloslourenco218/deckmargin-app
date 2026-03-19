import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";

type ProjectRow = {
  id: string;
  user_id: string | null;
  name: string | null;
  status: string | null;

  final_price: number | null;
  expected_profit: number | null;
  target_margin: number | null;

  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
  site_address: string | null;

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

  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
};

function money(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function pct(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return "—";
  return `${Math.round(n * 100)}%`;
}

function dt(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US");
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return (
      <main className="min-h-screen bg-[#0e0e10] p-10 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            You must be logged in to view this project.
          </div>

          <Link
            href="/login"
            className="inline-block rounded-lg border border-gray-600 px-4 py-2 text-gray-200 hover:bg-gray-800"
          >
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

  const { data: project, error } = await supabase
    .from("projects")
    .select(`
      id,
      user_id,
      name,
      status,
      final_price,
      expected_profit,
      target_margin,
      client_name,
      client_email,
      client_phone,
      site_address,
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
      notes,
      created_at,
      updated_at
    `)
    .eq("id", resolvedParams.id)
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle<ProjectRow>();

  if (error || !project) {
    return (
      <main className="min-h-screen bg-[#0e0e10] p-10 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            Error loading project: {error?.message ?? "Project not found"}
          </div>

          <Link
            href="/projects"
            className="inline-block rounded-lg border border-gray-600 px-4 py-2 text-gray-200 hover:bg-gray-800"
          >
            Back
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0e0e10] p-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-4xl font-semibold">
                {project.name ?? "Untitled Quote"}
              </h1>

              <span className="rounded-full bg-gray-700 px-3 py-1 text-xs text-gray-200">
                {(project.status ?? "open").toLowerCase()}
              </span>
            </div>

            <p className="text-gray-400">
              Quote summary • Created {dt(project.created_at)} • Updated {dt(project.updated_at)}
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/projects"
              className="rounded-lg border border-gray-600 px-4 py-2 text-gray-200 hover:bg-gray-800"
            >
              ← Back
            </Link>

            <Link
              href={`/projects/${project.id}/edit`}
              className="rounded-lg border border-gray-600 px-4 py-2 text-gray-200 hover:bg-gray-800"
            >
              Edit Quote
            </Link>

            <a
              href={`/api/proposal/${project.id}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-gray-600 px-4 py-2 text-gray-200 hover:bg-gray-800"
            >
              Download PDF
            </a>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-white/60">Final Price</div>
            <div className="mt-2 text-4xl font-semibold">
              {money(project.final_price)}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-white/60">Expected Profit</div>
            <div className="mt-2 text-4xl font-semibold">
              {money(project.expected_profit)}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-white/60">Margin</div>
            <div className="mt-2 text-4xl font-semibold">
              {pct(project.target_margin)}
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Client</h2>
              <span className="text-sm text-white/40">Customer details</span>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <div className="text-white/50">Client Name</div>
                <div className="font-medium">{project.client_name || "—"}</div>
              </div>

              <div>
                <div className="text-white/50">Email</div>
                <div className="font-medium">{project.client_email || "—"}</div>
              </div>

              <div>
                <div className="text-white/50">Phone</div>
                <div className="font-medium">{project.client_phone || "—"}</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Job Site</h2>
              <span className="text-sm text-white/40">Where the deck is built</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="col-span-2">
                <div className="text-white/50">Site Address</div>
                <div className="font-medium">{project.site_address || "—"}</div>
              </div>

              <div>
                <div className="text-white/50">Created</div>
                <div className="font-medium">{dt(project.created_at)}</div>
              </div>

              <div>
                <div className="text-white/50">Last Updated</div>
                <div className="font-medium">{dt(project.updated_at)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-5">
          <h2 className="mb-4 text-xl font-semibold">Deck Details</h2>

          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div>
              <div className="text-white/50">Length</div>
              <div className="font-medium">{project.deck_length ?? "—"} ft</div>
            </div>

            <div>
              <div className="text-white/50">Width</div>
              <div className="font-medium">{project.deck_width ?? "—"} ft</div>
            </div>

            <div>
              <div className="text-white/50">Sq Ft</div>
              <div className="font-medium">{project.deck_sqft ?? "—"}</div>
            </div>

            <div>
              <div className="text-white/50">Height Tier</div>
              <div className="font-medium">{project.height_tier || "—"}</div>
            </div>

            <div>
              <div className="text-white/50">Material Type</div>
              <div className="font-medium">{project.material_type || "—"}</div>
            </div>

            <div>
              <div className="text-white/50">Railing Type</div>
              <div className="font-medium">{project.railing_type || "—"}</div>
            </div>

            <div>
              <div className="text-white/50">Stair Count</div>
              <div className="font-medium">{project.stair_count ?? "—"}</div>
            </div>

            <div>
              <div className="text-white/50">Status</div>
              <div className="font-medium">{project.status || "open"}</div>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-5">
          <h2 className="mb-4 text-xl font-semibold">Cost Breakdown</h2>

          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
            <div>
              <div className="text-white/50">Material Cost</div>
              <div className="font-medium">{money(project.material_cost)}</div>
            </div>

            <div>
              <div className="text-white/50">Labor Cost</div>
              <div className="font-medium">{money(project.labor_cost)}</div>
            </div>

            <div>
              <div className="text-white/50">Permit Cost</div>
              <div className="font-medium">{money(project.permit_cost)}</div>
            </div>

            <div>
              <div className="text-white/50">Equipment Cost</div>
              <div className="font-medium">{money(project.equipment_cost)}</div>
            </div>

            <div>
              <div className="text-white/50">Overhead Cost</div>
              <div className="font-medium">{money(project.overhead_cost)}</div>
            </div>

            <div>
              <div className="text-white/50">Total Job Cost</div>
              <div className="font-medium">{money(project.total_job_cost)}</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <h2 className="mb-4 text-xl font-semibold">Internal Notes</h2>
          <div className="text-sm text-white/80">
            {project.notes?.trim() ? project.notes : "—"}
          </div>
        </div>
      </div>
    </main>
  );
}

