import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";
import MaterialTakeoff from "./MaterialTakeoff";
import ApprovalBanner from "@/components/approval/ApprovalBanner";
import QuoteActions from "./QuoteActions";
import type { OrgRole, ApprovalStatus } from "@/lib/org/types";

type ProjectRow = {
  id: string; user_id: string | null; name: string | null; status: string | null;
  final_price: number | null; expected_profit: number | null; target_margin: number | null;
  client_name: string | null; client_email: string | null;
  client_phone: string | null; site_address: string | null;
  deck_length: number | null; deck_width: number | null; deck_sqft: number | null;
  height_tier: string | null; material_type: string | null;
  railing_type: string | null; stair_count: number | null; job_type: string | null;
  deck_shape: string | null; site_difficulty: string | null; obstacles: string[] | null;
  lighting_enabled: boolean | null; lighting_cost: number | null;
  staining_enabled: boolean | null; staining_cost: number | null;
  built_ins_enabled: boolean | null; built_ins_cost: number | null; built_ins_description: string | null;
  dumpster_enabled: boolean | null; dumpster_cost: number | null;
  material_cost: number | null; labor_cost: number | null; permit_cost: number | null;
  equipment_cost: number | null; overhead_cost: number | null; total_job_cost: number | null;
  notes: string | null; created_at: string | null; updated_at: string | null;
  approval_status: ApprovalStatus | null; approval_notes: string | null;
  proposal_token_active: boolean | null;
  accepted_at: string | null; accepted_by_name: string | null;
};

function money(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return "-";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}
function pct(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return "-";
  return `${Math.round(n * 100)}%`;
}
function dt(value: string | null | undefined) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-US");
}

// ── QC Engine ────────────────────────────────────────────────────────────────
// Three tiers: "blocking" (must fix), "review" (should check), "note" (advisory)
// Tier displayed in the banner: Missing Information / Review Recommended / Ready to Send
type QcSeverity = "blocking" | "review" | "note";
type QcFlag = { severity: QcSeverity; message: string };

type QcTier = "missing_information" | "review_recommended" | "ready_to_send";

function computeQcFlags(p: ProjectRow): QcFlag[] {
  const flags: QcFlag[] = [];
  const margin = p.target_margin ?? 0;
  const pricePerSqft = p.deck_sqft && p.deck_sqft > 0 && p.final_price
    ? p.final_price / p.deck_sqft : null;

  // ── Blocking — must fix before sending ──
  if (!p.final_price) flags.push({ severity: "blocking", message: "No final price set. Quote is incomplete" });
  if (margin < 0.20 && p.final_price) flags.push({ severity: "blocking", message: `Margin ${pct(margin)} is critically low, below 20%` });
  if (pricePerSqft !== null && pricePerSqft < 20) flags.push({ severity: "blocking", message: `Price/sq ft $${pricePerSqft.toFixed(0)} is unusually low. Verify costs` });

  // ── Review — should resolve before sending ──
  if (!p.client_name) flags.push({ severity: "review", message: "No client name. Required before sending" });
  if (!p.client_email && !p.client_phone) flags.push({ severity: "review", message: "No client contact info. Add email or phone" });
  if (!p.deck_sqft || p.deck_sqft === 0) flags.push({ severity: "review", message: "Deck sq ft is 0. Check dimensions" });
  if (!p.material_type) flags.push({ severity: "review", message: "Material type not set" });
  if (margin >= 0.01 && margin < 0.28 && margin >= 0.20) flags.push({ severity: "review", message: `Margin ${pct(margin)} is below the recommended 28%` });
  if (pricePerSqft !== null && pricePerSqft > 200) flags.push({ severity: "review", message: `Price/sq ft $${pricePerSqft.toFixed(0)} is unusually high. Double-check pricing` });

  // ── Notes — advisory ──
  if (!p.site_address) flags.push({ severity: "note", message: "No site address on record" });
  if (!p.height_tier) flags.push({ severity: "note", message: "Height tier not set" });
  if (!p.permit_cost || p.permit_cost === 0) flags.push({ severity: "note", message: "No permit costs. Confirm permits are not required" });

  return flags;
}

function getQcTier(flags: QcFlag[]): QcTier {
  if (flags.some(f => f.severity === "blocking")) return "missing_information";
  if (flags.some(f => f.severity === "review")) return "review_recommended";
  return "ready_to_send";
}

const TIER_CONFIG: Record<QcTier, { label: string; icon: string; border: string; bg: string; text: string; badge: string }> = {
  missing_information: {
    label: "Missing Information",
    icon: "✕",
    border: "border-red-500/40",
    bg: "bg-red-500/8",
    text: "text-red-300",
    badge: "bg-red-500/20 text-red-300",
  },
  review_recommended: {
    label: "Review Recommended",
    icon: "⚠",
    border: "border-amber-500/40",
    bg: "bg-amber-500/8",
    text: "text-amber-300",
    badge: "bg-amber-500/20 text-amber-300",
  },
  ready_to_send: {
    label: "Ready to Send",
    icon: "✓",
    border: "border-emerald-500/40",
    bg: "bg-emerald-500/8",
    text: "text-emerald-300",
    badge: "bg-emerald-500/20 text-emerald-300",
  },
};

const FLAG_STYLES: Record<QcSeverity, string> = {
  blocking: "border-red-500/40 bg-red-500/10 text-red-300",
  review:   "border-amber-500/40 bg-amber-500/10 text-amber-300",
  note:     "border-blue-500/30 bg-blue-500/8 text-blue-300",
};
const FLAG_ICONS: Record<QcSeverity, string> = { blocking: "✕", review: "⚠", note: "ℹ" };

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
      <main className="min-h-screen bg-[#0e0e10] p-6 text-white">
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
      client_name, client_email, client_phone, site_address,
      deck_length, deck_width, deck_sqft,
      height_tier, material_type, railing_type, stair_count,
      deck_shape, site_difficulty, obstacles,
      lighting_enabled, lighting_cost,
      staining_enabled, staining_cost,
      built_ins_enabled, built_ins_cost, built_ins_description,
      dumpster_enabled, dumpster_cost,
      material_cost, labor_cost, permit_cost, equipment_cost,
      overhead_cost, total_job_cost,
      notes, created_at, updated_at,
      approval_status, approval_notes,
      proposal_token_active, accepted_at, accepted_by_name
    `)
    .eq("id", resolvedParams.id)
    .limit(1)
    .maybeSingle<ProjectRow>();

  if (error || !project) {
    return (
      <main className="min-h-screen bg-[#0e0e10] p-6 text-white">
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
  const qcTier  = getQcTier(qcFlags);
  const qcCfg   = TIER_CONFIG[qcTier];
  const margin = project.target_margin ?? 0;
  const marginColor = margin < 0.20 ? "text-red-400" : margin < 0.28 ? "text-amber-400" : "text-emerald-400";
  const marginBg    = margin < 0.20 ? "border-red-500/30 bg-red-500/10" : margin < 0.28 ? "border-amber-500/30 bg-amber-500/10" : "border-emerald-500/30 bg-emerald-500/10";

  return (
    <main className="min-h-screen bg-[#0e0e10] px-4 py-6 text-white md:px-10">
      <div className="mx-auto max-w-6xl">

        <ApprovalBanner
          projectId={project.id}
          approvalStatus={project.approval_status}
          approvalNotes={project.approval_notes}
          orgRole={orgRole}
        />

        {/* ── Header — mobile-stacked ── */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-2xl font-semibold md:text-4xl">{project.name ?? "Untitled Quote"}</h1>
              <span className="rounded-full bg-gray-700 px-3 py-1 text-xs text-gray-200">
                {(project.status ?? "open").toLowerCase()}
              </span>
              {project.accepted_at && (
                <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                  ✓ Accepted by {project.accepted_by_name}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400">Created {dt(project.created_at)} · Updated {dt(project.updated_at)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/projects" className="rounded-lg border border-gray-600 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800">← Back</Link>
            <Link href={`/projects/${project.id}/edit`} className="rounded-lg border border-gray-600 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800">Edit Quote</Link>
            <Link href={`/projects/${project.id}/preview`} className="rounded-lg border border-gray-600 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800">Preview</Link>
            <a href={`/api/proposal/${project.id}`} target="_blank" rel="noreferrer" className="rounded-lg border border-gray-600 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800">PDF</a>
          </div>
        </div>

        {/* ── QC Engine ── */}
        <div className={`mb-6 rounded-xl border p-4 ${qcCfg.border} ${qcCfg.bg}`}>
          {/* Tier banner */}
          <div className="mb-3 flex items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${qcCfg.badge}`}>
              {qcCfg.icon} {qcCfg.label}
            </span>
            {qcTier === "ready_to_send" && qcFlags.length === 0 && (
              <span className="text-xs text-emerald-400/70">All checks passed. This quote is ready to share with your client.</span>
            )}
            {qcTier === "ready_to_send" && qcFlags.length > 0 && (
              <span className="text-xs text-emerald-400/70">Core checks passed. Minor notes below.</span>
            )}
            {qcTier === "review_recommended" && (
              <span className="text-xs text-amber-400/70">Sendable, but review the items below first.</span>
            )}
            {qcTier === "missing_information" && (
              <span className="text-xs text-red-400/70">Resolve blocking issues before sending to your client.</span>
            )}
          </div>
          {/* Flag list */}
          {qcFlags.length > 0 && (
            <ul className="space-y-1.5">
              {qcFlags.map((f, i) => (
                <li key={i} className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${FLAG_STYLES[f.severity]}`}>
                  <span className="mt-px font-bold shrink-0">{FLAG_ICONS[f.severity]}</span>
                  <span>{f.message}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Two-column layout on desktop ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Left: main content */}
          <div className="space-y-6 lg:col-span-2">

            {/* Pricing summary */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="text-sm text-white/60">Final Price</div>
                <div className="mt-2 text-3xl font-semibold">{money(project.final_price)}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="text-sm text-white/60">Profit</div>
                <div className="mt-2 text-3xl font-semibold">{money(project.expected_profit)}</div>
              </div>
              <div className={`rounded-xl border p-5 ${marginBg}`}>
                <div className="text-sm text-white/60">Margin</div>
                <div className={`mt-2 text-3xl font-semibold ${marginColor}`}>{pct(project.target_margin)}</div>
              </div>
            </div>

            {/* Client + Site */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <h2 className="mb-3 text-base font-semibold">Client</h2>
                <div className="space-y-3 text-sm">
                  <div><div className="text-white/50">Name</div><div className="font-medium">{project.client_name || "-"}</div></div>
                  <div><div className="text-white/50">Email</div><div className="font-medium">{project.client_email || "-"}</div></div>
                  <div><div className="text-white/50">Phone</div><div className="font-medium">{project.client_phone || "-"}</div></div>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <h2 className="mb-3 text-base font-semibold">Job Site</h2>
                <div className="space-y-3 text-sm">
                  <div><div className="text-white/50">Address</div><div className="font-medium">{project.site_address || "-"}</div></div>
                  <div><div className="text-white/50">Difficulty</div><div className="font-medium capitalize">{project.site_difficulty || "-"}</div></div>
                  {project.obstacles && project.obstacles.length > 0 && (
                    <div><div className="text-white/50">Obstacles</div><div className="font-medium">{project.obstacles.join(", ")}</div></div>
                  )}
                </div>
              </div>
            </div>

            {/* Deck Details */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <h2 className="mb-4 text-base font-semibold">Deck Details</h2>
              <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                <div><div className="text-white/50">Length</div><div className="font-medium">{project.deck_length ?? "-"} ft</div></div>
                <div><div className="text-white/50">Width</div><div className="font-medium">{project.deck_width ?? "-"} ft</div></div>
                <div><div className="text-white/50">Sq Ft</div><div className="font-medium">{project.deck_sqft ?? "-"}</div></div>
                <div><div className="text-white/50">Shape</div><div className="font-medium capitalize">{project.deck_shape || "-"}</div></div>
                <div><div className="text-white/50">Height Tier</div><div className="font-medium">{project.height_tier || "-"}</div></div>
                <div><div className="text-white/50">Material</div><div className="font-medium">{project.material_type || "-"}</div></div>
                <div><div className="text-white/50">Railing</div><div className="font-medium">{project.railing_type || "-"}</div></div>
                <div><div className="text-white/50">Stairs</div><div className="font-medium">{project.stair_count ?? "-"}</div></div>
              </div>
            </div>

            {/* Add-ons */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <h2 className="mb-4 text-base font-semibold">Add-ons</h2>
              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                {[
                  ["Lighting", project.lighting_enabled, project.lighting_cost],
                  ["Staining", project.staining_enabled, project.staining_cost],
                  ["Built-ins", project.built_ins_enabled, project.built_ins_cost],
                  ["Dumpster", project.dumpster_enabled, project.dumpster_cost],
                ].map(([label, enabled, cost]) => (
                  <div key={String(label)} className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                    <div className="text-white/50">{label}</div>
                    <div className="font-medium">{enabled ? money(cost as number) : "Not included"}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <h2 className="mb-4 text-base font-semibold">Cost Breakdown</h2>
              <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
                {[
                  ["Material Cost", project.material_cost],
                  ["Labor Cost",    project.labor_cost],
                  ["Permit Cost",   project.permit_cost],
                  ["Equipment",     project.equipment_cost],
                  ["Overhead",      project.overhead_cost],
                  ["Total Job Cost",project.total_job_cost],
                ].map(([label, val]) => (
                  <div key={String(label)}>
                    <div className="text-white/50">{label}</div>
                    <div className="font-medium">{money(val as number)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Material Takeoff */}
            <MaterialTakeoff
              deckLength={project.deck_length}
   