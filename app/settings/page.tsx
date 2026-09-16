"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabaseClient";

type SettingsRow = {
  company_name: string; company_phone: string; company_email: string;
  company_website: string; company_address: string; region: string;
  labor_rate_per_sqft: number; stair_cost: number; permit_default: number;
  equipment_default: number; overhead_default: number;
  pt_material_rate: number; trex_material_rate: number;
  timbertech_material_rate: number; pvc_material_rate: number;
  tax_rate: number; tax_applies_to: string; dumpster_default: number;
  permit_building_default: number; permit_septic_default: number;
  permit_electrical_default: number; permit_engineering_default: number;
  permit_hoa_default: number;
  // Construction defaults
  default_joist_spacing: number; default_post_size: string;
  default_footing_diameter: number; default_footing_depth: number;
  // Guardrails
  minimum_margin: number; maximum_discount: number;
  // Proposal defaults
  proposal_terms: string; proposal_warranty: string;
  proposal_payment_schedule: string;
};

const TABS = ["Company", "Pricing", "Construction", "Permits", "Proposal", "Guardrails", "Team"] as const;
type Tab = typeof TABS[number];

const REGIONS = [
  { value: "national",   label: "National Average",  materialMult: 1.00, laborMult: 1.00, note: "Baseline — used when region is unknown" },
  { value: "pnw",        label: "Pacific Northwest",  materialMult: 1.32, laborMult: 1.35, note: "Seattle/Portland — moisture-rated lumber, highest labor market" },
  { value: "northeast",  label: "Northeast",          materialMult: 1.28, laborMult: 1.30, note: "NY/MA/CT — strict codes, shorter build season, high labor" },
  { value: "california", label: "California",         materialMult: 1.35, laborMult: 1.38, note: "Highest in nation — seismic codes, CEQA, $75/hr skilled trades" },
  { value: "southeast",  label: "Southeast",          materialMult: 0.88, laborMult: 0.85, note: "FL/GA/SC — lower labor costs, longer build season" },
  { value: "midwest",    label: "Midwest",            materialMult: 0.90, laborMult: 0.88, note: "OH/IL/MI — near national average, lower regulatory burden" },
  { value: "southwest",  label: "Southwest",          materialMult: 0.95, laborMult: 0.93, note: "TX/AZ/NV — growing markets, moderate costs" },
];

const DEFAULT: SettingsRow = {
  company_name: "", company_phone: "", company_email: "",
  company_website: "", company_address: "", region: "national",
  labor_rate_per_sqft: 8, stair_cost: 250, permit_default: 0,
  equipment_default: 0, overhead_default: 0,
  pt_material_rate: 10, trex_material_rate: 18,
  timbertech_material_rate: 20, pvc_material_rate: 25,
  tax_rate: 0, tax_applies_to: "materials_and_labor", dumpster_default: 0,
  permit_building_default: 0, permit_septic_default: 0,
  permit_electrical_default: 0, permit_engineering_default: 0, permit_hoa_default: 0,
  default_joist_spacing: 16, default_post_size: '6x6',
  default_footing_diameter: 12, default_footing_depth: 48,
  minimum_margin: 25, maximum_discount: 10,
  proposal_terms: "", proposal_warranty: "", proposal_payment_schedule: "",
};

function Field({ label, note, children }: { label: string; note?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-white/60">{label}</label>
      {children}
      {note && <p className="mt-1 text-xs text-white/30">{note}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const supabase = useMemo(() => createClient(), []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<Tab>("Company");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoErr, setLogoErr] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [form, setForm] = useState<SettingsRow>(DEFAULT);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setErr("You must be logged in."); setLoading(false); return; }
      setUserId(user.id);
      const { data, error } = await supabase.from("user_settings").select("*").eq("user_id", user.id).maybeSingle();
      if (error) { setErr(error.message); setLoading(false); return; }
      if (data) {
        setForm({
          company_name:              data.company_name             ?? "",
          company_phone:             data.company_phone            ?? "",
          company_email:             data.company_email            ?? "",
          company_website:           data.company_website          ?? "",
          company_address:           data.company_address          ?? "",
          region:                    data.region                   ?? "national",
          labor_rate_per_sqft:       Number(data.labor_rate_per_sqft      ?? 8),
          stair_cost:                Number(data.stair_cost               ?? 250),
          permit_default:            Number(data.permit_default           ?? 0),
          equipment_default:         Number(data.equipment_default        ?? 0),
          overhead_default:          Number(data.overhead_default         ?? 0),
          pt_material_rate:          Number(data.pt_material_rate         ?? 10),
          trex_material_rate:        Number(data.trex_material_rate       ?? 18),
          timbertech_material_rate:  Number(data.timbertech_material_rate ?? 20),
          pvc_material_rate:         Number(data.pvc_material_rate        ?? 25),
          tax_rate:                  Number(data.tax_rate                 ?? 0),
          tax_applies_to:            data.tax_applies_to                  ?? "materials_and_labor",
          dumpster_default:          Number(data.dumpster_default         ?? 0),
          permit_building_default:   Number(data.permit_building_default  ?? 0),
          permit_septic_default:     Number(data.permit_septic_default    ?? 0),
          permit_electrical_default: Number(data.permit_electrical_default ?? 0),
          permit_engineering_default:Number(data.permit_engineering_default ?? 0),
          permit_hoa_default:        Number(data.permit_hoa_default       ?? 0),
          default_joist_spacing:     Number(data.default_joist_spacing    ?? 16),
          default_post_size:         data.default_post_size               ?? "6x6",
          default_footing_diameter:  Number(data.default_footing_diameter ?? 12),
          default_footing_depth:     Number(data.default_footing_depth    ?? 48),
          minimum_margin:            Number(data.minimum_margin            ?? 25),
          maximum_discount:          Number(data.maximum_discount          ?? 10),
          proposal_terms:            data.proposal_terms                  ?? "",
          proposal_warranty:         data.proposal_warranty               ?? "",
          proposal_payment_schedule: data.proposal_payment_schedule       ?? "",
        });
        setLogoUrl(data.logo_url ?? null);
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  function setNum<K extends keyof SettingsRow>(key: K, value: string) {
    setForm((p) => ({ ...p, [key]: Number(value || 0) }));
  }
  function setTxt<K extends keyof SettingsRow>(key: K, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  const selectedRegion = REGIONS.find((r) => r.value === form.region) ?? REGIONS[0];

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setLogoErr("");
    const allowed = ["image/png", "image/jpeg", "image/svg+xml"];
    if (!allowed.includes(file.type)) { setLogoErr("Only PNG, JPG, and SVG files are allowed."); return; }
    if (file.size > 5 * 1024 * 1024) { setLogoErr("File must be under 5MB."); return; }
    setLogoUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${userId}/logo.${ext}`;
    const { error: uploadError } = await supabase.storage.from("logos").upload(path, file, { upsert: true, contentType: file.type });
    if (uploadError) { setLogoErr(uploadError.message); setLogoUploading(false); return; }
    const { data: urlData } = supabase.storage.from("logos").getPublicUrl(path);
    const publicUrl = urlData.publicUrl + `?t=${Date.now()}`;
    await supabase.from("user_settings").upsert({ user_id: userId, logo_url: urlData.publicUrl, updated_at: new Date().toISOString() });
    setLogoUrl(publicUrl);
    setLogoUploading(false);
  }

  async function handleLogoRemove() {
    if (!userId) return;
    setLogoUploading(true);
    await supabase.storage.from("logos").remove([`${userId}/logo.png`, `${userId}/logo.jpg`, `${userId}/logo.jpeg`, `${userId}/logo.svg`]);
    await supabase.from("user_settings").upsert({ user_id: userId, logo_url: null, updated_at: new Date().toISOString() });
    setLogoUrl(null);
    setLogoUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function save() {
    setSaving(true); setErr(""); setMsg("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setErr("You must be logged in."); setSaving(false); return; }
    const payload = {
      user_id: user.id,
      company_name: form.company_name || null, company_phone: form.company_phone || null,
      company_email: form.company_email || null, company_website: form.company_website || null,
      company_address: form.company_address || null, region: form.region,
      labor_rate_per_sqft: form.labor_rate_per_sqft, stair_cost: form.stair_cost,
      permit_default: form.permit_default, equipment_default: form.equipment_default,
      overhead_default: form.overhead_default,
      pt_material_rate: form.pt_material_rate, trex_material_rate: form.trex_material_rate,
      timbertech_material_rate: form.timbertech_material_rate, pvc_material_rate: form.pvc_material_rate,
      tax_rate: form.tax_rate, tax_applies_to: form.tax_applies_to,
      dumpster_default: form.dumpster_default,
      permit_building_default: form.permit_building_default, permit_septic_default: form.permit_septic_default,
      permit_electrical_default: form.permit_electrical_default,
      permit_engineering_default: form.permit_engineering_default, permit_hoa_default: form.permit_hoa_default,
      default_joist_spacing: form.default_joist_spacing, default_post_size: form.default_post_size,
      default_footing_diameter: form.default_footing_diameter, default_footing_depth: form.default_footing_depth,
      minimum_margin: form.minimum_margin, maximum_discount: form.maximum_discount,
      proposal_terms: form.proposal_terms || null, proposal_warranty: form.proposal_warranty || null,
      proposal_payment_schedule: form.proposal_payment_schedule || null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("user_settings").upsert(payload);
    if (error) { setErr(error.message); } else { setMsg("Settings saved."); }
    setSaving(false);
  }

  const inp = "w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2 text-sm";
  const textarea = "w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2 text-sm min-h-[80px]";

  if (loading) return (
    <main className="min-h-screen bg-[#0e0e10] p-10 text-white">
      <div className="mx-auto max-w-4xl">Loading settings...</div>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#0e0e10] p-10 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Settings</h1>
            <p className="text-gray-400">Configure your company, pricing, and estimating defaults.</p>
          </div>
          <Link href="/dashboard" className="rounded-lg border border-gray-600 px-4 py-2 text-gray-200 hover:bg-gray-800">Back to Dashboard</Link>
        </div>

        {/* ── Tab bar ── */}
        <div className="mb-6 flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)}
              className={`rounded-lg border px-4 py-2 text-sm transition ${activeTab === tab ? "border-white/30 bg-white/10 text-white" : "border-white/10 text-gray-400 hover:bg-white/5"}`}>
              {tab}
            </button>
          ))}
        </div>

        {err && <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{err}</div>}
        {msg && <div className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{msg}</div>}

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">

          {/* ── COMPANY ── */}
          {activeTab === "Company" && (
            <div className="space-y-6">
              <div>
                <div className="mb-4 text-sm font-medium text-white/80">Company Logo</div>
                <div className="rounded-xl border border-white/10 bg-[#111827] p-5">
                  {logoUrl ? (
                    <div className="flex items-start gap-5">
                      <div className="flex h-24 w-40 items-center justify-center rounded-lg border border-white/10 bg-white p-2">
                        <img src={logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <p className="text-xs text-emerald-400">Logo uploaded — appears on all proposals</p>
                        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={logoUploading}
                          className="rounded-lg border border-white/20 px-3 py-1.5 text-xs hover:bg-white/10 disabled:opacity-50">
                          {logoUploading ? "Uploading..." : "Replace Logo"}
                        </button>
                        <button type="button" onClick={handleLogoRemove} disabled={logoUploading}
                          className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 disabled:opacity-50">
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div onClick={() => fileInputRef.current?.click()}
                      className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/15 bg-white/5 px-6 py-8 hover:border-white/25">
                      <div className="mb-2 text-3xl">🖼</div>
                      <p className="text-sm font-medium text-white/80">{logoUploading ? "Uploading..." : "Click to upload your logo"}</p>
                      <p className="mt-1 text-xs text-white/40">PNG, JPG, or SVG · Max 5MB</p>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml" className="hidden" onChange={handleLogoUpload} />
                  {logoErr && <p className="mt-2 text-xs text-red-400">{logoErr}</p>}
                </div>
              </div>
              <div>
                <div className="mb-4 text-sm font-medium text-white/80">Business Information</div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Business Name"><input value={form.company_name} onChange={(e) => setTxt("company_name", e.target.value)} className={inp} placeholder="Smith Deck Builders" /></Field>
                  <Field label="Business Phone"><input value={form.company_phone} onChange={(e) => setTxt("company_phone", e.target.value)} className={inp} placeholder="(555) 555-5555" /></Field>
                  <Field label="Business Email"><input value={form.company_email} onChange={(e) => setTxt("company_email", e.target.value)} className={inp} placeholder="quotes@yourbusiness.com" /></Field>
                  <Field label="Website (optional)"><input value={form.company_website} onChange={(e) => setTxt("company_website", e.target.value)} className={inp} placeholder="www.smithdeckbuilders.com" /></Field>
                  <Field label="Business Address (optional)" ><input value={form.company_address} onChange={(e) => setTxt("company_address", e.target.value)} className={`${inp} md:col-span-2`} placeholder="123 Main St, Portland, OR 97201" /></Field>
                </div>
              </div>
            </div>
          )}

          {/* ── PRICING ── */}
          {activeTab === "Pricing" && (
            <div className="space-y-8">
              <div>
                <div className="mb-4 text-sm font-medium text-white/80">Regional Pricing</div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Field label="My Region" note={selectedRegion.note}>
                      <select value={form.region} onChange={(e) => setTxt("region", e.target.value)} className={inp}>
                        {REGIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                    </Field>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#111827] p-4">
                    <div className="text-xs text-white/50">Material multiplier</div>
                    <div className="mt-1 text-xl font-semibold">{selectedRegion.materialMult.toFixed(2)}x</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#111827] p-4">
                    <div className="text-xs text-white/50">Labor multiplier</div>
                    <div className="mt-1 text-xl font-semibold">{selectedRegion.laborMult.toFixed(2)}x</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="mb-4 text-sm font-medium text-white/80">Base Material Rates ($/sqft)</div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Pressure Treated"><input value={form.pt_material_rate} onChange={(e) => setNum("pt_material_rate", e.target.value)} className={inp} type="number" /></Field>
                  <Field label="Trex"><input value={form.trex_material_rate} onChange={(e) => setNum("trex_material_rate", e.target.value)} className={inp} type="number" /></Field>
                  <Field label="TimberTech"><input value={form.timbertech_material_rate} onChange={(e) => setNum("timbertech_material_rate", e.target.value)} className={inp} type="number" /></Field>
                  <Field label="PVC"><input value={form.pvc_material_rate} onChange={(e) => setNum("pvc_material_rate", e.target.value)} className={inp} type="number" /></Field>
                </div>
              </div>
              <div>
                <div className="mb-4 text-sm font-medium text-white/80">Labor & Job Defaults</div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Base Labor Rate ($/sqft)" note="Regional multiplier applied on top"><input value={form.labor_rate_per_sqft} onChange={(e) => setNum("labor_rate_per_sqft", e.target.value)} className={inp} type="number" /></Field>
                  <Field label="Stair Cost (per section)"><input value={form.stair_cost} onChange={(e) => setNum("stair_cost", e.target.value)} className={inp} type="number" /></Field>
                  <Field label="Default Equipment Cost ($)"><input value={form.equipment_default} onChange={(e) => setNum("equipment_default", e.target.value)} className={inp} type="number" /></Field>
                  <Field label="Default Overhead Cost ($)"><input value={form.overhead_default} onChange={(e) => setNum("overhead_default", e.target.value)} className={inp} type="number" /></Field>
                  <Field label="Default Dumpster Cost ($)"><input value={form.dumpster_default} onChange={(e) => setNum("dumpster_default", e.target.value)} className={inp} type="number" /></Field>
                </div>
              </div>
              <div>
                <div className="mb-4 text-sm font-medium text-white/80">Sales Tax</div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Tax Rate (%)" note="Enter as a percentage, e.g. 8.5"><input value={form.tax_rate} onChange={(e) => setNum("tax_rate", e.target.value)} className={inp} type="number" min="0" max="30" step="0.01" /></Field>
                  <Field label="Apply Tax To">
                    <select value={form.tax_applies_to} onChange={(e) => setTxt("tax_applies_to", e.target.value)} className={inp}>
                      <option value="materials_only">Materials only</option>
                      <option value="labor_only">Labor only</option>
                      <option value="materials_and_labor">Materials and labor</option>
                    </select>
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* ── CONSTRUCTION ── */}
          {activeTab === "Construction" && (
            <div className="space-y-6">
              <div>
                <div className="mb-2 text-sm font-medium text-white/80">Framing Defaults</div>
                <p className="mb-4 text-xs text-white/40">These defaults are applied when a contractor does not specify otherwise. They can be overridden per quote.</p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Joist Spacing (inches)" note="Standard is 16. Use 12 for composite decking.">
                    <select value={form.default_joist_spacing} onChange={(e) => setNum("default_joist_spacing", e.target.value)} className={inp}>
                      <option value={12}>12 inches OC</option>
                      <option value={16}>16 inches OC (standard)</option>
                      <option value={24}>24 inches OC</option>
                    </select>
                  </Field>
                  <Field label="Default Post Size">
                    <select value={form.default_post_size} onChange={(e) => setTxt("default_post_size", e.target.value)} className={inp}>
                      <option value="4x4">4x4</option>
                      <option value="6x6">6x6 (standard elevated)</option>
                      <option value="steel">Steel column</option>
                    </select>
                  </Field>
                </div>
              </div>
              <div>
                <div className="mb-2 text-sm font-medium text-white/80">Footing Defaults</div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Footing Diameter (inches)">
                    <select value={form.default_footing_diameter} onChange={(e) => setNum("default_footing_diameter", e.target.value)} className={inp}>
                      <option value={10}>10 inch</option>
                      <option value={12}>12 inch (standard)</option>
                      <option value={16}>16 inch</option>
                      <option value={18}>18 inch</option>
                    </select>
                  </Field>
                  <Field label="Footing Depth (inches)" note="Check local frost depth requirements.">
                    <input value={form.default_footing_depth} onChange={(e) => setNum("default_footing_depth", e.target.value)} className={inp} type="number" min="24" max="96" />
                  </Field>
                </div>
              </div>
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-sm text-blue-300">
                Advanced framing profiles (beam sizing, span tables, post spacing) are on the roadmap for Phase 3.
              </div>
            </div>
          )}

          {/* ── PERMITS ── */}
          {activeTab === "Permits" && (
            <div className="space-y-6">
              <div>
                <div className="mb-2 text-sm font-medium text-white/80">Permit Default Costs</div>
                <p className="mb-4 text-xs text-white/40">These pre-fill each permit cost field when toggled on in a quote. Set to 0 to enter costs manually per job.</p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Building Permit ($)"><input type="number" min="0" step="0.01" value={form.permit_building_default} onChange={(e) => setNum("permit_building_default", e.target.value)} className={inp} placeholder="0" /></Field>
                  <Field label="Septic Permit ($)"><input type="number" min="0" step="0.01" value={form.permit_septic_default} onChange={(e) => setNum("permit_septic_default", e.target.value)} className={inp} placeholder="0" /></Field>
                  <Field label="Electrical Permit ($)"><input type="number" min="0" step="0.01" value={form.permit_electrical_default} onChange={(e) => setNum("permit_electrical_default", e.target.value)} className={inp} placeholder="0" /></Field>
                  <Field label="Engineering / Structural Drawings ($)"><input type="number" min="0" step="0.01" value={form.permit_engineering_default} onChange={(e) => setNum("permit_engineering_default", e.target.value)} className={inp} placeholder="0" /></Field>
                  <Field label="HOA Approval Fee ($)"><input type="number" min="0" step="0.01" value={form.permit_hoa_default} onChange={(e) => setNum("permit_hoa_default", e.target.value)} className={inp} placeholder="0" /></Field>
                </div>
              </div>
            </div>
          )}

          {/* ── PROPOSAL ── */}
          {activeTab === "Proposal" && (
            <div className="space-y-6">
              <div>
                <div className="mb-2 text-sm font-medium text-white/80">Default Proposal Content</div>
                <p className="mb-4 text-xs text-white/40">These appear on every client-facing PDF proposal. You can edit them per quote.</p>
                <div className="space-y-4">
                  <Field label="Terms & Conditions">
                    <textarea value={form.proposal_terms} onChange={(e) => setTxt("proposal_terms", e.target.value)}
                      className={textarea} placeholder="e.g. Quote valid for 30 days. Materials subject to price change..." />
                  </Field>
                  <Field label="Warranty Language">
                    <textarea value={form.proposal_warranty} onChange={(e) => setTxt("proposal_warranty", e.target.value)}
                      className={textarea} placeholder="e.g. 1-year labor warranty on all structural work..." />
                  </Field>
                  <Field label="Payment Schedule">
                    <textarea value={form.proposal_payment_schedule} onChange={(e) => setTxt("proposal_payment_schedule", e.target.value)}
                      className={textarea} placeholder="e.g. 30% deposit at signing, 40% at framing, 30% at completion..." />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* ── GUARDRAILS ── */}
          {activeTab === "Guardrails" && (
            <div className="space-y-6">
              <div>
                <div className="mb-2 text-sm font-medium text-white/80">Margin & Discount Controls</div>
                <p className="mb-4 text-xs text-white/40">These protect your profitability. A warning is shown when quotes fall below minimums — jobs are not blocked by default.</p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Minimum Acceptable Margin (%)" note="Warning shown if selling price produces lower margin.">
                    <input type="number" min="0" max="100" value={form.minimum_margin} onChange={(e) => setNum("minimum_margin", e.target.value)} className={inp} />
                  </Field>
                  <Field label="Maximum Discount (%)" note="Warning shown if discount exceeds this threshold.">
                    <input type="number" min="0" max="100" value={form.maximum_discount} onChange={(e) => setNum("maximum_discount", e.target.value)} className={inp} />
                  </Field>
                </div>
                <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-300">
                  Guardrail enforcement (owner approval workflow) is on the roadmap for Phase 4.
                </div>
              </div>
            </div>
          )}

          {/* ── TEAM ── */}
          {activeTab === "Team" && (
            <div className="space-y-4">
              <div className="mb-2 text-sm font-medium text-white/80">Team Management</div>
              <p className="text-sm text-white/60">Manage team members, roles, and permissions.</p>
              <Link href="/settings/team" className="inline-block rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10">
                Open Team Settings
              </Link>
              <div className="mt-4">
                <Link href="/settings/guardrails" className="inline-block rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10">
                  Open Legacy Guardrails Page
                </Link>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button type="button" onClick={save} disabled={saving || activeTab === "Team"}
              className="rounded bg-white px-5 py-2 text-sm text-black hover:bg-white/90 disabled:opacity-50">
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
