import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";

type ProjectRow = {
  id: string;
  user_id: string | null;
  name: string | null;
  status: string | null;
  deck_sqft: number | null;
  deck_length: number | null;
  deck_width: number | null;
  height_tier: string | null;
  material_type: string | null;
  railing_type: string | null;
  stair_count: number | null;
  final_price: number | null;
  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
  site_address: string | null;
  notes: string | null;
  lighting_enabled: boolean | null;
  lighting_cost: number | null;
  staining_enabled: boolean | null;
  staining_cost: number | null;
  built_ins_enabled: boolean | null;
  built_ins_cost: number | null;
  built_ins_description: string | null;
  // ── NEW ──
  dumpster_enabled: boolean | null;
  dumpster_cost: number | null;
  tax_rate: number | null;
  tax_applies_to: string | null;
  tax_amount: number | null;
  permit_building_enabled: boolean | null;
  permit_building_cost: number | null;
  permit_septic_enabled: boolean | null;
  permit_septic_cost: number | null;
  permit_electrical_enabled: boolean | null;
  permit_electrical_cost: number | null;
  permit_engineering_enabled: boolean | null;
  permit_engineering_cost: number | null;
  permit_hoa_enabled: boolean | null;
  permit_hoa_cost: number | null;
};

function money(n: number | null) {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function taxLabel(appliesTo: string | null) {
  if (appliesTo === "materials_only")      return "Materials only";
  if (appliesTo === "labor_only")          return "Labor only";
  return "Materials & labor";
}

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return (
      <main className="min-h-screen bg-[#0b0f19] px-6 py-8 text-white">
        <div className="mx-auto max-w-4xl rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-200">You must be logged in to view this preview.</div>
      </main>
    );
  }

  const { data: project, error } = await supabase
    .from("projects")
    .select(`
      id, user_id, name, status,
      deck_sqft, deck_length, deck_width, height_tier, material_type, railing_type, stair_count,
      final_price, client_name, client_email, client_phone, site_address, notes,
      lighting_enabled, lighting_cost,
      staining_enabled, staining_cost,
      built_ins_enabled, built_ins_cost, built_ins_description,
      dumpster_enabled, dumpster_cost,
      tax_rate, tax_applies_to, tax_amount,
      permit_building_enabled, permit_building_cost,
      permit_septic_enabled, permit_septic_cost,
      permit_electrical_enabled, permit_electrical_cost,
      permit_engineering_enabled, permit_engineering_cost,
      permit_hoa_enabled, permit_hoa_cost
    `)
    .eq("id", resolvedParams.id)
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle<ProjectRow>();

  if (error || !project) {
    return (
      <main className="min-h-screen bg-[#0b0f19] px-6 py-8 text-white">
        <div className="mx-auto max-w-4xl rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-200">Could not load preview.</div>
      </main>
    );
  }

  // ── Build permit line items ───────────────────────────────────────────────
  const permitLines: { label: string; cost: number }[] = [];
  if (project.permit_building_enabled    && project.permit_building_cost)    permitLines.push({ label: "Building Permit",                   cost: project.permit_building_cost });
  if (project.permit_septic_enabled      && project.permit_septic_cost)      permitLines.push({ label: "Septic Permit",                     cost: project.permit_septic_cost });
  if (project.permit_electrical_enabled  && project.permit_electrical_cost)  permitLines.push({ label: "Electrical Permit",                 cost: project.permit_electrical_cost });
  if (project.permit_engineering_enabled && project.permit_engineering_cost) permitLines.push({ label: "Engineering / Structural Drawings", cost: project.permit_engineering_cost });
  if (project.permit_hoa_enabled         && project.permit_hoa_cost)         permitLines.push({ label: "HOA Approval Fee",                  cost: project.permit_hoa_cost });

  const hasTax      = (project.tax_amount ?? 0) > 0;
  const hasDumpster = project.dumpster_enabled && (project.dumpster_cost ?? 0) > 0;
  const hasPermits  = permitLines.length > 0;
  const hasAddons   = project.lighting_enabled || project.staining_enabled || project.built_ins_enabled;

  return (
    <main className="min-h-screen bg-[#f6f7fb] px-6 py-8 text-[#111827]">
      <div className="mx-auto max-w-5xl rounded-2xl border border-gray-200 bg-white p-10 shadow-sm">

        {/* ── Header ── */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="text-3xl font-bold">DeckMargin</div>
            <div className="mt-1 text-sm text-gray-500">Client Proposal Preview</div>
          </div>
          <div className="flex gap-2">
            <Link href={`/projects/${project.id}`} className="rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100">Back</Link>
            <a href={`/api/proposal/${project.id}`} target="_blank" rel="noreferrer" className="rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100">Download PDF</a>
          </div>
        </div>

        {/* ── Title ── */}
        <div className="mb-8 border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-semibold">{project.name ?? "Untitled Quote"}</h1>
          <p className="mt-2 text-gray-500">Prepared for {project.client_name || "Client"}</p>
        </div>

        {/* ── Client / Site / Price ── */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 p-5">
            <div className="text-xs uppercase tracking-wide text-gray-500">Client</div>
            <div className="mt-2 font-medium">{project.client_name || "—"}</div>
            <div className="text-sm text-gray-500">{project.client_email || "—"}</div>
            <div className="text-sm text-gray-500">{project.client_phone || "—"}</div>
          </div>
          <div className="rounded-xl border border-gray-200 p-5">
            <div className="text-xs uppercase tracking-wide text-gray-500">Job Site</div>
            <div className="mt-2 font-medium">{project.site_address || "—"}</div>
          </div>
          <div className="rounded-xl border border-gray-200 p-5">
            <div className="text-xs uppercase tracking-wide text-gray-500">Quoted Price</div>
            <div className="mt-2 text-2xl font-bold">{money(project.final_price)}</div>
          </div>
        </div>

        {/* ── Deck Details ── */}
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">Deck Details</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              ["Length", `${project.deck_length ?? "—"} ft`],
              ["Width",  `${project.deck_width  ?? "—"} ft`],
              ["Sq Ft",  project.deck_sqft ?? "—"],
              ["Height Tier", project.height_tier || "—"],
              ["Material",    project.material_type || "—"],
              ["Railing",     project.railing_type  || "—"],
              ["Stairs",      project.stair_count   ?? "—"],
              ["Status",      project.status        || "open"],
            ].map(([label, val]) => (
              <div key={String(label)} className="rounded-xl border border-gray-200 p-4">
                <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
                <div className="mt-1 font-medium">{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Add-ons ── */}
        {hasAddons && (
          <div className="mb-8">
            <h2 className="mb-3 text-lg font-semibold">Optional Add-ons</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {project.lighting_enabled && (
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="text-xs uppercase tracking-wide text-gray-500">Lighting</div>
                  <div className="mt-1 font-medium">{money(project.lighting_cost)}</div>
                </div>
              )}
              {project.staining_enabled && (
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="text-xs uppercase tracking-wide text-gray-500">Staining / Sealing</div>
                  <div className="mt-1 font-medium">{money(project.staining_cost)}</div>
                </div>
              )}
              {project.built_ins_enabled && (
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="text-xs uppercase tracking-wide text-gray-500">Built-ins</div>
                  <div className="mt-1 font-medium">
                    {money(project.built_ins_cost)}
                    {project.built_ins_description ? <span className="block text-sm text-gray-500">{project.built_ins_description}</span> : null}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Permits ── */}
        {hasPermits && (
          <div className="mb-8">
            <h2 className="mb-3 text-lg font-semibold">Permits & Approvals</h2>
            <div className="rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Permit Type</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {permitLines.map((p) => (
                    <tr key={p.label}>
                      <td className="px-4 py-3 font-medium text-gray-800">{p.label}</td>
                      <td className="px-4 py-3 text-right font-medium">{money(p.cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Dumpster ── */}
        {hasDumpster && (
          <div className="mb-8">
            <h2 className="mb-3 text-lg font-semibold">Additional Costs</h2>
            <div className="rounded-xl border border-gray-200 p-4 flex items-center justify-between">
              <div className="font-medium text-gray-800">Dumpster Rental</div>
              <div className="font-semibold">{money(project.dumpster_cost)}</div>
            </div>
          </div>
        )}

        {/* ── Pricing Summary ── */}
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">Pricing Summary</h2>
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                {hasTax && (
                  <tr className="bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">
                      Sales Tax ({project.tax_rate}% — {taxLabel(project.tax_applies_to)})
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{money(project.tax_amount)}</td>
                  </tr>
                )}
                <tr className="bg-white">
                  <td className="px-4 py-4 text-base font-bold text-gray-900">Total Quoted Price</td>
                  <td className="px-4 py-4 text-right text-base font-bold text-gray-900">{money(project.final_price)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Notes ── */}
        <div>
          <h2 className="mb-3 text-lg font-semibold">Notes</h2>
          <div className="rounded-xl border border-gray-200 p-4 text-sm text-gray-700">
            {project.notes || "No notes added."}
          </div>
        </div>

      </div>
    </main>
  );
}