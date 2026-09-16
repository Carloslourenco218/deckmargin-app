import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";
import MaterialTakeoff from "./MaterialTakeoff";
import ApprovalBanner from "@/components/approval/ApprovalBanner";
import type { OrgRole, ApprovalStatus } from "@/lib/org/types";

type ProjectRow = {
  id: string;
  user_id: string | null;
  name: string | null;
  status: string | null;
  final_price: number | null;
  expected_profit: number | null;
  target_margin: number | null;
  selling_price: number | null;
  discount_amount: number | null;
  adjusted_price: number | null;
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
  job_type: string | null;
  deck_shape: string | null;
  site_difficulty: string | null;
  obstacles: string | null;
  lighting_enabled: boolean | null;
  lighting_cost: number | null;
  staining_enabled: boolean | null;
  staining_cost: number | null;
  built_ins_enabled: boolean | null;
  built_ins_cost: number | null;
  built_ins_description: string | null;
  material_cost: number | null;
  labor_cost: number | null;
  permit_cost: number | null;
  equipment_cost: number | null;
  overhead_cost: number | null;
  dumpster_cost: number | null;
  tax_amount: number | null;
  total_job_cost: number | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  approval_status: ApprovalStatus | null;
  approval_notes: string | null;
};

function money(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function pct(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return "—";
  return `${Math.round(Number(n))}%`;
}

function dt(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US");
}

function capitalize(s: string | null | undefined) {
  if (!s) return "—";
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

type QcFlag = { severity: "error" | "warn" | "info"; message: string };

function computeQcFlags(p: ProjectRow): QcFlag[] {
  const flags: QcFlag[] = [];

  // Pricing flags
  const margin = p.target_margin != null ? Number(p.target_margin) : null;
  if (margin != null && margin < 20) {
    flags.push({ severity: "error", message: `Margin is ${Math.round(margin)}% — below the 20% minimum. Review pricing before sending.` });
  } else if (margin != null && margin < 28) {
    flags.push({ severity: "warn", message: `Margin is ${Math.round(margin)}% — below 28% target. Consider raising price.` });
  }

  if (!p.final_price || p.final_price <= 0) {
    flags.push({ severity: "error", message: "Final price is $0 or missing — quote cannot be sent." });
  }

  // Client info flags
  if (!p.client_name) flags.push({ severity: "warn", message: "Client name is missing." });
  if (!p.client_email && !p.client_phone) {
    flags.push({ severity: "warn", message: "No client contact info (email or phone). Hard to follow up." });
  }
  if (!p.site_address) flags.push({ severity: "info", message: "Job site address not entered." });

  // Scope flags
  if (!p.deck_sqft || p.deck_sqft <= 0) {
    flags.push({ severity: "warn", message: "Deck square footage is 0 — materials and labor may be miscalculated." });
  }
  if (!p.material_type) flags.push({ severity: "warn", message: "Material type not selected — pricing may be using defaults." });
  if (!p.height_tier) flags.push({ severity: "info", message: "Height tier not set — elevation costs may be off." });

  // Cost flags
  if (p.permit_cost == null || p.permit_cost === 0) {
    flags.push({ severity: "info", message: "No permit cost — confirm permits are not required for this job." });
  }

  // Area-based sanity check
  if (p.deck_sqft && p.final_price) {
    const perSqft = p.final_price / p.deck_sqft;
    if (perSqft < 20) {
      flags.push({ severity: "error", message: `Price per sqft is $${perSqft.toFixed(0)} — unusually low. Confirm no data entry error.` });
    } else if (perSqft > 200) {
      flags.push({ severity: "warn", message: `Price per sqft is $${perSqft.toFixed(0)} — unusually high. Confirm customer expectations.` });
    }
  }

  if (flags.length === 0) {
    flags.push({ severity: "info", message: "No issues found. Quote looks good to send." });
  }

  return flags;
}

const SEV_STYLE: Record<string, string> = {
  error: "border-red-500/40 bg-red-500/10 text-red-200",
  warn:  "border-amber-500/40 bg-amber-500/10 text-amber-200",
  info:  "border-blue-500/40 bg-blue-500/10 text-blue-200",
};
const SEV_ICON: Record<string, string> = { error: "🚨", warn: "⚠️", info: "ℹ️" };

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return (
      <main className="min-h-screen bg-[#0e0e10] p-10 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            You must be logged in to view this project.
          </div>
          <Link href="/login" className="inline-block rounded-lg border border-gray-600 px-4 py-2 text-gray-200 hover:bg-gray-800">Go to Login</Link>
        </div>
      </main>
    );
  }

  const { data: profile } = await supabase.from("profiles").select("org_role").eq("id", user.id).single();
  const orgRole = (profile?.org_role ?? null) as OrgRole | null;

  const { data: project, error } = await supabase
    .from("projects")
    .select(`
      id, user_id, name, status, job_type,
      final_price, expected_profit, target_margin,
      selling_price, discount_amount, adjusted_price,
      client_name, client_email, client_phone, site_address,
      deck_length, deck_width, deck_sqft,
      height_tier, material_type, railing_type, stair_count,
      deck_shape, site_difficulty, obstacles,
      lighting_enabled, lighting_cost,
      staining_enabled, staining_cost,
      built_ins_enabled, built_ins_cost, built_ins_description,
      material_cost, labor_cost, permit_cost, equipment_cost,
      overhead_cost, dumpster_cost, tax_amount, total_job_cost,
      notes, created_at, updated_at,
      approval_status, approval_notes
    `)
    .eq("id", resolvedParams.id)
    .limit(1)
    .maybeSingle<ProjectRow>();

  if (error || !project) {
    return (
      <main className="min-h-screen bg-[#0e0e10] p-10 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            Error loading project: {error?.message ?? "Project not found"}
          </div>
          <Link href="/projects" className="inline-block rounded-lg border border-gray-600 px-4 py-2 text-gray-200 hover:bg-gray-800">Back</Link>
        </div>
      </main>
    );
  }

  const qcFlags = computeQcFlags(project);
  const hasErrors = qcFlags.some((f) => f.severity === "error");
  const hasWarns  = qcFlags.some((f) => f.severity === "warn");
  const qcBannerClass = hasErrors
    ? "border-red-500/40 bg-red-500/10"
    : hasWarns
    ? "border-amber-500/40 bg-amber-500/10"
    : "border-emerald-500/40 bg-emerald-500/10";
  const qcHeading = hasErrors
    ? "🚨 Issues found — review before sending"
    : hasWarns
    ? "⚠️ Warnings — review recommended"
    : "✅ Quote looks good";

  const perSqft = project.deck_sqft && project.final_price
    ? (project.final_price / project.deck_sqft).toFixed(0)
    : null;

  return (
    <main className="min-h-screen bg-[#0e0e10] p-10 text-white">
      <div className="mx-auto max-w-6xl">

        <ApprovalBanner
          projectId={project.id}
          approvalStatus={project.approval_status}
          approvalNotes={project.approval_notes}
          orgRole={orgRole}
        />

        {/* ── QC Panel ── */}
        <div className={`mb-6 rounded-xl border p-5 ${qcBannerClass}`}>
          <div className="mb-3 font-semibold">{qcHeading}</div>
          <div className="space-y-2">
            {qcFlags.map((flag, i) => (
              <div key={i} className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${SEV_STYLE[flag.severity]}`}>
                <span>{SEV_ICON[flag.severity]}</span>
                <span>{flag.message}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Header ── */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-4xl font-semibold">{project.name ?? "Untitled Quote"}</h1>
              <span className="rounded-full bg-gray-700 px-3 py-1 text-xs text-gray-200">
                {(project.status ?? "open").toLowerCase()}
              </span>
            </div>
            <p className="text-gray-400">
              Quote summary • Created {dt(project.created_at)} • Updated {dt(project.updated_at)}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/projects" className="rounded-lg border border-gray-600 px-4 py-2 text-gray-200 hover:bg-gray-800">← Back</Link>
            <Link href={`/projects/${project.id}/edit`} className="rounded-lg border border-gray-600 px-4 py-2 text-gray-200 hover:bg-gray-800">Edit Quote</Link>
            <Link href={`/projects/${project.id}/design`} className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-emerald-300 hover:bg-emerald-500/20">🎨 Design Canvas</Link>
            <a href={`/api/proposal/${project.id}`} target="_blank" rel="noreferrer" className="rounded-lg border border-gray-600 px-4 py-2 text-gray-200 hover:bg-gray-800">Download PDF</a>
            <a href={`/projects/${project.id}/materials`} target="_blank" rel="noreferrer" className="rounded-lg border border-blue-500/40 bg-blue-500/10 px-4 py-2 text-blue-300 hover:bg-blue-500/20">Print Material List</a>
          </div>
        </div>

        {/* ── Pricing summary ── */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-white/60">Final Price</div>
            <div className="mt-2 text-3xl font-semibold">{money(project.final_price)}</div>
            {perSqft && <div className="mt-1 text-xs text-white/40">${perSqft}/sqft</div>}
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-white/60">Total Job Cost</div>
            <div className="mt-2 text-3xl font-semibold">{money(project.total_job_cost)}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm text-white/60">Expected Profit</div>
            <div className="mt-2 text-3xl font-semibold">{money(project.expected_profit)}</div>
          </div>
          <div className={`rounded-xl border p-5 ${Number(project.target_margin) < 20 ? "border-red-500/40 bg-red-500/10" : Number(project.target_margin) < 28 ? "border-amber-500/40 bg-amber-500/10" : "border-emerald-500/40 bg-emerald-500/5"}`}>
            <div className="text-sm text-white/60">Margin</div>
            <div className="mt-2 text-3xl font-semibold">{pct(project.target_margin)}</div>
          </div>
        </div>

        {/* ── Client + Job Site ── */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <h2 className="mb-4 text-lg font-semibold">Client</h2>
            <div className="space-y-3 text-sm">
              <div><div className="text-white/50">Name</div><div className="font-medium">{project.client_name || "—"}</div></div>
              <div><div className="text-white/50">Email</div><div className="font-medium">{project.client_email || "—"}</div></div>
              <div><div className="text-white/50">Phone</div><div className="font-medium">{project.client_phone || "—"}</div></div>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <h2 className="mb-4 text-lg font-semibold">Job Site</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="col-span-2"><div className="text-white/50">Address</div><div className="font-medium">{project.site_address || "—"}</div></div>
              <div><div className="text-white/50">Created</div><div className="font-medium">{dt(project.created_at)}</div></div>
              <div><div className="text-white/50">Updated</div><div className="font-medium">{dt(project.updated_at)}</div></div>
            </div>
          </div>
        </div>

        {/* ── Scope Summary ── */}
        <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-5">
          <h2 className="mb-4 text-lg font-semibold">Scope</h2>
          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div><div className="text-white/50">Length</div><div className="font-medium">{project.deck_length ?? "—"} ft</div></div>
            <div><div className="text-white/50">Width</div><div className="font-medium">{project.deck_width ?? "—"} ft</div></div>
            <div><div className="text-white/50">Sq Ft</div><div className="font-medium">{project.deck_sqft ?? "—"}</div></div>
            <div><div className="text-white/50">Shape</div><div className="font-medium">{capitalize(project.deck_shape)}</div></div>
            <div><div className="text-white/50">Height Tier</div><div className="font-medium">{capitalize(project.height_tier)}</div></div>
            <div><div className="text-white/50">Material</div><div className="font-medium">{capitalize(project.material_type)}</div></div>
            <div><div className="text-white/50">Railing</div><div className="font-medium">{capitalize(project.railing_type)}</div></div>
            <div><div className="text-white/50">Stair Sections</div><div className="font-medium">{project.stair_count ?? 0}</div></div>
            <div><div className="text-white/50">Job Type</div><div className="font-medium">{capitalize(project.job_type)}</div></div>
            <div><div className="text-white/50">Site Difficulty</div><div className="font-medium">{capitalize(project.site_difficulty)}</div></div>
            {project.obstacles && (
              <div className="col-span-2"><div className="text-white/50">Obstacles / Notes</div><div className="font-medium">{project.obstacles}</div></div>
            )}
          </div>

          {/* Add-ons inline */}
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className={`rounded-lg border px-4 py-3 text-sm ${project.lighting_enabled ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/10 bg-white/5"}`}>
              <div className="text-white/50">Lighting</div>
              <div className="font-medium">{project.lighting_enabled ? money(project.lighting_cost) : "Not included"}</div>
            </div>
            <div className={`rounded-lg border px-4 py-3 text-sm ${project.staining_enabled ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/10 bg-white/5"}`}>
              <div className="text-white/50">Staining / Sealing</div>
              <div className="font-medium">{project.staining_enabled ? money(project.staining_cost) : "Not included"}</div>
            </div>
            <div className={`rounded-lg border px-4 py-3 text-sm ${project.built_ins_enabled ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/10 bg-white/5"}`}>
              <div className="text-white/50">Built-ins</div>
              <div className="font-medium">
                {project.built_ins_enabled
                  ? `${money(project.built_ins_cost)}${project.built_ins_description ? ` · ${project.built_ins_description}` : ""}`
                  : "Not included"}
              </div>
            </div>
          </div>
        </div>

        {/* ── Cost Breakdown ── */}
        <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-5">
          <h2 className="mb-4 text-lg font-semibold">Cost Breakdown</h2>
          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div><div className="text-white/50">Materials</div><div className="font-medium">{money(project.material_cost)}</div></div>
            <div><div className="text-white/50">Labor</div><div className="font-medium">{money(project.labor_cost)}</div></div>
            <div><div className="text-white/50">Permits</div><div className="font-medium">{money(project.permit_cost)}</div></div>
            <div><div className="text-white/50">Equipment</div><div className="font-medium">{money(project.equipment_cost)}</div></div>
            <div><div className="text-white/50">Overhead</div><div className="font-medium">{money(project.overhead_cost)}</div></div>
            {(project.dumpster_cost ?? 0) > 0 && (
              <div><div className="text-white/50">Dumpster</div><div className="font-medium">{money(project.dumpster_cost)}</div></div>
            )}
            {(project.tax_amount ?? 0) > 0 && (
              <div><div className="text-white/50">Tax</div><div className="font-medium">{money(project.tax_amount)}</div></div>
            )}
            <div className="col-span-2 border-t border-white/10 pt-3">
              <div className="text-white/50">Total Job Cost</div>
              <div className="text-lg font-semibold">{money(project.total_job_cost)}</div>
            </div>
          </div>
        </div>

        {/* ── Material Takeoff ── */}
        <MaterialTakeoff
          deckLength={project.deck_length}
          deckWidth={project.deck_width}
          deckSqft={project.deck_sqft}
          heightTier={project.height_tier}
          materialType={project.material_type}
          railingType={project.railing_type}
          stairCount={project.stair_count}
          jobType={project.job_type}
        />

        {/* ── Internal Notes ── */}
        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5">
          <h2 className="mb-3 text-lg font-semibold">Internal Notes</h2>
          <div className="text-sm text-white/80">{project.notes?.trim() ? project.notes : <span className="italic text-white/30">No notes added.</span>}</div>
        </div>

      </div>
    </main>
  );
}
