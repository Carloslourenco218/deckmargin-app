"use client";

import { useState } from "react";

function money(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

type Project = {
  id: string; name: string | null; status: string | null; job_type: string | null;
  client_name: string | null; client_email: string | null; client_phone: string | null;
  site_address: string | null; notes: string | null;
  deck_sqft: number | null; deck_length: number | null; deck_width: number | null;
  height_tier: string | null; material_type: string | null; railing_type: string | null;
  stair_count: number | null; final_price: number | null;
  lighting_enabled: boolean | null; lighting_cost: number | null;
  staining_enabled: boolean | null; staining_cost: number | null;
  built_ins_enabled: boolean | null; built_ins_cost: number | null; built_ins_description: string | null;
  dumpster_enabled: boolean | null; dumpster_cost: number | null;
  tax_rate: number | null; tax_applies_to: string | null; tax_amount: number | null;
  permit_building_enabled: boolean | null; permit_building_cost: number | null;
  permit_septic_enabled: boolean | null; permit_septic_cost: number | null;
  permit_electrical_enabled: boolean | null; permit_electrical_cost: number | null;
  permit_engineering_enabled: boolean | null; permit_engineering_cost: number | null;
  permit_hoa_enabled: boolean | null; permit_hoa_cost: number | null;
  accepted_at: string | null; accepted_by_name: string | null;
  proposal_expires_at: string | null;
  assumptions: string[] | null;
  exclusions: string[] | null;
  created_at: string | null;
};

type Company = {
  company_name: string | null; company_phone: string | null;
  company_email: string | null; company_website: string | null;
  company_address: string | null; logo_url: string | null;
  standard_assumptions: string[] | null;
  standard_exclusions: string[] | null;
} | null;

const MATERIAL_LABELS: Record<string, string> = {
  "pressure-treated": "Pressure Treated",
  trex: "Trex Composite",
  timbertech: "TimberTech Composite",
  pvc: "PVC Cellular",
};

const HEIGHT_LABELS: Record<string, string> = {
  standard: "Standard (ground / low)",
  raised: "Raised (4–8 ft)",
  high: "High (8 ft+)",
};

const JOB_LABELS: Record<string, string> = {
  new_build:    "New Deck Build",
  rebuild:      "Full Deck Rebuild",
  resurface:    "Deck Resurface",
  railing_only: "Railing Installation",
  repair:       "Deck Repair",
  addition:     "Deck Addition",
};

// Auto-generate standard assumptions from project scope
function buildAssumptions(project: Project): string[] {
  const items: string[] = [
    "Normal site access assumed (vehicle and equipment access to work area).",
    "All work performed per applicable local building codes and regulations.",
    "Price is valid as quoted — any scope changes will require a revised proposal.",
    "Homeowner responsible for marking any underground utilities prior to footing work.",
  ];
  if (project.height_tier === "standard") items.push("Deck height is at or near grade — no specialized lift equipment required.");
  if (project.height_tier === "raised" || project.height_tier === "high") items.push("Existing ground conditions suitable for standard footing installation.");
  if (project.material_type === "pressure-treated") items.push("All lumber is kiln-dried after treatment (KDAT) unless site conditions require otherwise.");
  if (project.deck_sqft && project.deck_sqft > 200) items.push("Continuous work schedule assumed — delays due to homeowner access may affect timeline.");
  return items;
}

// Auto-generate standard exclusions from project scope
function buildExclusions(project: Project): string[] {
  const items: string[] = [
    "Landscaping, grading, or site restoration beyond the immediate work area.",
    "Repair of any pre-existing structural deficiencies not part of this scope.",
    "Interior permits, HOA submissions, or coordination unless listed above.",
    "Furnishings, planters, decorative pots, or personal property.",
  ];
  if (project.job_type !== "rebuild") {
    items.push("Removal or disposal of existing deck structure (not included in this scope).");
  }
  if (!project.lighting_enabled) items.push("Electrical wiring, conduit, or deck lighting.");
  if (project.railing_type === "none") items.push("Railing or guardrail installation (not in scope — to be quoted separately if required).");
  items.push("Any work not explicitly described in this proposal.");
  return items;
}

function taxLabel(t: string | null) {
  if (t === "materials_only") return "materials only";
  if (t === "labor_only") return "labor only";
  return "materials & labor";
}

export default function PublicProposalClient({
  project,
  company,
  token,
}: {
  project: Project;
  company: Company;
  token: string;
}) {
  const alreadyAccepted = project.status === "accepted";
  const [acceptName, setAcceptName] = useState(project.client_name ?? "");
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(alreadyAccepted);
  const [acceptedBy, setAcceptedBy] = useState(project.accepted_by_name ?? "");
  const [acceptErr, setAcceptErr] = useState("");
  const [showAcceptForm, setShowAcceptForm] = useState(false);

  const companyName = company?.company_name ?? "Your Deck Contractor";

  // Build assumptions and exclusions (project-level overrides company defaults, then auto-gen)
  const assumptions: string[] = (project.assumptions?.length ? project.assumptions : null)
    ?? company?.standard_assumptions
    ?? buildAssumptions(project);

  const exclusions: string[] = (project.exclusions?.length ? project.exclusions : null)
    ?? company?.standard_exclusions
    ?? buildExclusions(project);

  // Expiration
  const expiresAt = project.proposal_expires_at ? new Date(project.proposal_expires_at) : null;
  const daysUntilExpiry = expiresAt
    ? Math.ceil((expiresAt.getTime() - Date.now()) / 86_400_000)
    : null;

  const permitLines: { label: string; cost: number }[] = [];
  if (project.permit_building_enabled && project.permit_building_cost)
    permitLines.push({ label: "Building Permit", cost: project.permit_building_cost });
  if (project.permit_septic_enabled && project.permit_septic_cost)
    permitLines.push({ label: "Septic Permit", cost: project.permit_septic_cost });
  if (project.permit_electrical_enabled && project.permit_electrical_cost)
    permitLines.push({ label: "Electrical Permit", cost: project.permit_electrical_cost });
  if (project.permit_engineering_enabled && project.permit_engineering_cost)
    permitLines.push({ label: "Engineering / Structural Drawings", cost: project.permit_engineering_cost });
  if (project.permit_hoa_enabled && project.permit_hoa_cost)
    permitLines.push({ label: "HOA Approval Fee", cost: project.permit_hoa_cost });

  const addons = [
    project.lighting_enabled && { label: "Lighting", cost: project.lighting_cost },
    project.staining_enabled && { label: "Staining / Sealing", cost: project.staining_cost },
    project.built_ins_enabled && {
      label: project.built_ins_description ? `Built-ins: ${project.built_ins_description}` : "Built-ins",
      cost: project.built_ins_cost,
    },
    project.dumpster_enabled && { label: "Dumpster Rental", cost: project.dumpster_cost },
  ].filter(Boolean) as { label: string; cost: number | null }[];

  async function handleAccept() {
    if (!acceptName.trim()) { setAcceptErr("Please enter your full name to accept."); return; }
    setAccepting(true);
    setAcceptErr("");

    const res = await fetch(`/api/projects/${project.id}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, acceptedByName: acceptName.trim() }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setAcceptErr(body.error ?? "Something went wrong. Please try again.");
      setAccepting(false);
      return;
    }

    setAccepted(true);
    setAcceptedBy(acceptName.trim());
    setAccepting(false);
    setShowAcceptForm(false);
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb] px-4 py-8 text-[#111827]">
      <div className="mx-auto max-w-3xl">

        {/* ── Header ── */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-lg font-bold text-[#111827]">{companyName}</div>
            {company?.company_phone && <div className="text-sm text-gray-500">{company.company_phone}</div>}
            {company?.company_email && <div className="text-sm text-gray-500">{company.company_email}</div>}
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400 uppercase tracking-wide">Proposal Date</div>
            <div className="text-sm font-medium">
              {project.created_at ? new Date(project.created_at).toLocaleDateString("en-US", { dateStyle: "long" }) : "—"}
            </div>
            {expiresAt && (
              <div className={`mt-1 text-xs font-medium ${daysUntilExpiry !== null && daysUntilExpiry <= 7 ? "text-red-500" : "text-gray-400"}`}>
                {daysUntilExpiry !== null && daysUntilExpiry > 0
                  ? `Expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? "" : "s"}`
                  : "Expires " + expiresAt.toLocaleDateString("en-US", { dateStyle: "medium" })}
              </div>
            )}
          </div>
        </div>

        {/* ── Expiry warning banner ── */}
        {expiresAt && daysUntilExpiry !== null && daysUntilExpiry <= 7 && !accepted && (
          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            ⚠️ <strong>This proposal expires in {daysUntilExpiry} day{daysUntilExpiry === 1 ? "" : "s"}</strong> — accept before {expiresAt.toLocaleDateString("en-US", { dateStyle: "long" })} to lock in this price.
          </div>
        )}

        {/* ── Accepted banner ── */}
        {accepted && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <div className="font-semibold text-emerald-800">Proposal Accepted</div>
                <div className="text-sm text-emerald-700">
                  Accepted by <strong>{acceptedBy}</strong>
                  {project.accepted_at ? ` on ${new Date(project.accepted_at).toLocaleDateString("en-US", { dateStyle: "long" })}` : ""}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Main card ── */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">

          {/* Title bar */}
          <div className="bg-[#1e293b] px-6 py-5">
            <div className="text-xs text-white/50 uppercase tracking-wide mb-1">
              {JOB_LABELS[project.job_type ?? ""] ?? "Deck Project"}
            </div>
            <h1 className="text-2xl font-semibold text-white">{project.name ?? "Deck Proposal"}</h1>
            <p className="text-sm text-white/60 mt-1">Prepared for {project.client_name || "Client"}</p>
          </div>

          <div className="p-6 space-y-8">

            {/* Price hero */}
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-6 text-center">
              <div className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">Total Quoted Price</div>
              <div className="text-5xl font-bold text-emerald-700 mt-2">{money(project.final_price)}</div>
              {project.deck_sqft && (
                <div className="text-sm text-emerald-600 mt-1">{project.deck_sqft} sq ft</div>
              )}
            </div>

            {/* Client + Site */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-200 p-4">
                <div className="text-xs uppercase tracking-wide text-gray-400 mb-2">Client</div>
                <div className="font-medium">{project.client_name || "—"}</div>
                {project.client_email && <div className="text-sm text-gray-500 mt-1">{project.client_email}</div>}
                {project.client_phone && <div className="text-sm text-gray-500">{project.client_phone}</div>}
              </div>
              <div className="rounded-xl border border-gray-200 p-4">
                <div className="text-xs uppercase tracking-wide text-gray-400 mb-2">Job Site</div>
                <div className="font-medium">{project.site_address || "—"}</div>
              </div>
            </div>

            {/* Deck specs */}
            <div>
              <h2 className="text-base font-semibold mb-3">Deck Specifications</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  ["Size", project.deck_sqft ? `${project.deck_sqft} sq ft` : `${project.deck_length ?? "—"} × ${project.deck_width ?? "—"} ft`],
                  ["Height", HEIGHT_LABELS[project.height_tier ?? ""] ?? project.height_tier ?? "—"],
                  ["Material", MATERIAL_LABELS[project.material_type ?? ""] ?? project.material_type ?? "—"],
                  project.railing_type && project.railing_type !== "none" ? ["Railing", `${project.railing_type.charAt(0).toUpperCase() + project.railing_type.slice(1)}`] : null,
                  project.stair_count ? ["Stairs", `${project.stair_count} steps`] : null,
                ].filter(Boolean).map(([label, val]) => (
                  <div key={String(label)} className="rounded-lg border border-gray-200 p-3">
                    <div className="text-xs text-gray-400 uppercase tracking-wide">{label}</div>
                    <div className="font-medium text-sm mt-1">{val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add-ons */}
            {addons.length > 0 && (
              <div>
                <h2 className="text-base font-semibold mb-3">Included Add-ons</h2>
                <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
                  {addons.map((a) => (
                    <div key={a.label} className="flex items-center justify-between px-4 py-3 text-sm">
                      <span className="text-gray-700">{a.label}</span>
                      <span className="font-medium">{money(a.cost)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Permits */}
            {permitLines.length > 0 && (
              <div>
                <h2 className="text-base font-semibold mb-3">Permits & Approvals</h2>
                <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
                  {permitLines.map((p) => (
                    <div key={p.label} className="flex items-center justify-between px-4 py-3 text-sm">
                      <span className="text-gray-700">{p.label}</span>
                      <span className="font-medium">{money(p.cost)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing summary */}
            <div>
              <h2 className="text-base font-semibold mb-3">Pricing Summary</h2>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                {(project.tax_amount ?? 0) > 0 && (
                  <div className="flex items-center justify-between px-4 py-3 text-sm border-b border-gray-100 bg-gray-50">
                    <span className="text-gray-600">
                      Sales Tax ({project.tax_rate}% on {taxLabel(pro