"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabaseClient";

type SettingsRow = {
  company_name: string;
  company_phone: string;
  company_email: string;
  company_website: string;
  company_address: string;
  region: string;
  labor_rate_per_sqft: number;
  stair_cost: number;
  permit_default: number;
  equipment_default: number;
  overhead_default: number;
  pt_material_rate: number;
  trex_material_rate: number;
  timbertech_material_rate: number;
  pvc_material_rate: number;
  // ── NEW ──
  tax_rate: number;
  tax_applies_to: string;
  dumpster_default: number;
  permit_building_default: number;
  permit_septic_default: number;
  permit_electrical_default: number;
  permit_engineering_default: number;
  permit_hoa_default: number;
};

const REGIONS = [
  { value: "national",   label: "National Average",  materialMult: 1.00, laborMult: 1.00, note: "Baseline — used when region is unknown" },
  { value: "pnw",        label: "Pacific Northwest",  materialMult: 1.32, laborMult: 1.35, note: "Seattle/Portland — moisture-rated lumber required, highest labor market" },
  { value: "northeast",  label: "Northeast",          materialMult: 1.28, laborMult: 1.30, note: "NY/MA/CT — strict codes, shorter build season, high labor" },
  { value: "california", label: "California",         materialMult: 1.35, laborMult: 1.38, note: "Highest in nation — seismic codes, CEQA, $75/hr skilled trades" },
  { value: "southeast",  label: "Southeast",          materialMult: 0.88, laborMult: 0.85, note: "FL/GA/SC — lower labor costs, longer build season" },
  { value: "midwest",    label: "Midwest",            materialMult: 0.90, laborMult: 0.88, note: "OH/IL/MI — near national average, lower regulatory burden" },
  { value: "southwest",  label: "Southwest",          materialMult: 0.95, laborMult: 0.93, note: "TX/AZ/NV — growing markets, moderate costs" },
];

export default function SettingsPage() {
  const supabase = useMemo(() => createClient(), []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [msg, setMsg]               = useState("");
  const [err, setErr]               = useState("");
  const [logoUrl, setLogoUrl]       = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoErr, setLogoErr]       = useState("");
  const [userId, setUserId]         = useState<string | null>(null);

  const [form, setForm] = useState<SettingsRow>({
    company_name: "",
    company_phone: "",
    company_email: "",
    company_website: "",
    company_address: "",
    region: "national",
    labor_rate_per_sqft: 8,
    stair_cost: 250,
    permit_default: 0,
    equipment_default: 0,
    overhead_default: 0,
    pt_material_rate: 10,
    trex_material_rate: 18,
    timbertech_material_rate: 20,
    pvc_material_rate: 25,
    tax_rate: 0,
    tax_applies_to: "materials_and_labor",
    dumpster_default: 0,
    permit_building_default: 0,
    permit_septic_default: 0,
    permit_electrical_default: 0,
    permit_engineering_default: 0,
    permit_hoa_default: 0,
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErr("");
      setMsg("");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setErr("You must be logged in."); setLoading(false); return; }
      setUserId(user.id);

      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) { setErr(error.message); setLoading(false); return; }

      if (data) {
        setForm({
          company_name:             data.company_name             ?? "",
          company_phone:            data.company_phone            ?? "",
          company_email:            data.company_email            ?? "",
          company_website:          data.company_website          ?? "",
          company_address:          data.company_address          ?? "",
          region:                   data.region                   ?? "national",
          labor_rate_per_sqft:      Number(data.labor_rate_per_sqft      ?? 8),
          stair_cost:               Number(data.stair_cost               ?? 250),
          permit_default:           Number(data.permit_default           ?? 0),
          equipment_default:        Number(data.equipment_default        ?? 0),
          overhead_default:         Number(data.overhead_default         ?? 0),
          pt_material_rate:         Number(data.pt_material_rate         ?? 10),
          trex_material_rate:       Number(data.trex_material_rate       ?? 18),
          timbertech_material_rate: Number(data.timbertech_material_rate ?? 20),
          pvc_material_rate:        Number(data.pvc_material_rate        ?? 25),
          tax_rate:                 Number(data.tax_rate                 ?? 0),
          tax_applies_to:           data.tax_applies_to                  ?? "materials_and_labor",
          dumpster_default:         Number(data.dumpster_default         ?? 0),
          permit_building_default:  Number(data.permit_building_default  ?? 0),
          permit_septic_default:    Number(data.permit_septic_default    ?? 0),
          permit_electrical_default:Number(data.permit_electrical_default ?? 0),
          permit_engineering_default:Number(data.permit_engineering_default ?? 0),
          permit_hoa_default:       Number(data.permit_hoa_default       ?? 0),
        });
        setLogoUrl(data.logo_url ?? null);
      }

      setLoading(false);
    }
    load();
  }, [supabase]);

  function setNum<K extends keyof SettingsRow>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: Number(value || 0) }));
  }
  function setTxt<K extends keyof SettingsRow>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const selectedRegion = REGIONS.find((r) => r.value === form.region) ?? REGIONS[0];

  // ── Logo upload ──────────────────────────────────────────────────────────
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
    const { error: saveError } = await supabase.from("user_settings").upsert({ user_id: userId, logo_url: urlData.publicUrl, updated_at: new Date().toISOString() });
    if (saveError) { setLogoErr(saveError.message); setLogoUploading(false); return; }
    setLogoUrl(publicUrl);
    setLogoUploading(false);
  }

  async function handleLogoRemove() {
    if (!userId) return;
    setLogoErr("");
    setLogoUploading(true);
    await supabase.storage.from("logos").remove([`${userId}/logo.png`, `${userId}/logo.jpg`, `${userId}/logo.jpeg`, `${userId}/logo.svg`]);
    await supabase.from("user_settings").upsert({ user_id: userId, logo_url: null, updated_at: new Date().toISOString() });
    setLogoUrl(null);
    setLogoUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ── Save ─────────────────────────────────────────────────────────────────
  async function save() {
    setSaving(true);
    setErr("");
    setMsg("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setErr("You must be logged in."); setSaving(false); return; }

    const payload = {
      user_id:                   user.id,
      company_name:              form.company_name             || null,
      company_phone:             form.company_phone            || null,
      company_email:             form.company_email            || null,
      company_website:           form.company_website          || null,
      company_address:           form.company_address          || null,
      region:                    form.region,
      labor_rate_per_sqft:       form.labor_rate_per_sqft,
      stair_cost:                form.stair_cost,
      permit_default:            form.permit_default,
      equipment_default:         form.equipment_default,
      overhead_default:          form.overhead_default,
      pt_material_rate:          form.pt_material_rate,
      trex_material_rate:        form.trex_material_rate,
      timbertech_material_rate:  form.timbertech_material_rate,
      pvc_material_rate:         form.pvc_material_rate,
      tax_rate:                  form.tax_rate,
      tax_applies_to:            form.tax_applies_to,
      dumpster_default:          form.dumpster_default,
      permit_building_default:   form.permit_building_default,
      permit_septic_default:     form.permit_septic_default,
      permit_electrical_default: form.permit_electrical_default,
      permit_engineering_default:form.permit_engineering_default,
      permit_hoa_default:        form.permit_hoa_default,
      updated_at:                new Date().toISOString(),
    };

    const { error } = await supabase.from("user_settings").upsert(payload);
    if (error) { setErr(error.message); setSaving(false); return; }
    setMsg("Settings saved.");
    setSaving(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0e0e10] p-10 text-white">
        <div className="mx-auto max-w-4xl">Loading settings…</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0e0e10] p-10 text-white">
      <div className="mx-auto max-w-4xl">

        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Estimator Settings</h1>
            <p className="text-gray-400">Set your pricing rules and business info once. DeckMargin will use them in every quote.</p>
          </div>
          <Link href="/dashboard" className="rounded-lg border border-gray-600 px-4 py-2 text-gray-200 hover:bg-gray-800">Back to Dashboard</Link>
        </div>

        {/* ── Settings navigation ── */}
        <div className="mb-6 flex gap-2">
          <Link href="/settings" className="rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-sm text-white">Estimator</Link>
          <Link href="/settings/team" className="rounded-lg border border-white/15 px-4 py-2 text-sm text-gray-300 hover:bg-white/5">Team</Link>
          <Link href="/settings/guardrails" className="rounded-lg border border-white/15 px-4 py-2 text-sm text-gray-300 hover:bg-white/5">Guardrails</Link>
        </div>

        {err ? <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{err}</div> : null}
        {msg ? <div className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{msg}</div> : null}

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">

          {/* ── Company Branding ── */}
          <div className="mb-6 text-sm font-medium text-white/80">Company Branding</div>
          <p className="mb-5 text-xs text-white/40">Your logo and contact info appear on every PDF proposal sent to clients.</p>

          <div className="mb-6 rounded-xl border border-white/10 bg-[#111827] p-5">
            <label className="mb-3 block text-xs text-white/60">Company Logo</label>
            {logoUrl ? (
              <div className="flex items-start gap-5">
                <div className="flex h-24 w-40 items-center justify-center rounded-lg border border-white/10 bg-white p-2">
                  <img src={logoUrl} alt="Company logo" className="max-h-full max-w-full object-contain" />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-emerald-400">✓ Logo uploaded — appears on all proposals</p>
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={logoUploading} className="rounded-lg border border-white/20 px-3 py-1.5 text-xs text-white hover:bg-white/10 disabled:opacity-50">
                    {logoUploading ? "Uploading…" : "Replace Logo"}
                  </button>
                  <button type="button" onClick={handleLogoRemove} disabled={logoUploading} className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 disabled:opacity-50">
                    Remove Logo
                  </button>
                </div>
              </div>
            ) : (
              <div onClick={() => fileInputRef.current?.click()} className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/15 bg-white/5 px-6 py-8 transition hover:border-white/25">
                <div className="mb-2 text-3xl">🖼️</div>
                <p className="text-sm font-medium text-white/80">{logoUploading ? "Uploading…" : "Click to upload your logo"}</p>
                <p className="mt-1 text-xs text-white/40">PNG, JPG, or SVG · Max 5MB</p>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml" className="hidden" onChange={handleLogoUpload} />
            {logoErr ? <p className="mt-2 text-xs text-red-400">{logoErr}</p> : null}
          </div>

          {/* ── Business Contact Info ── */}
          <div className="mb-6 text-sm font-medium text-white/80">Business Contact Info</div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs text-white/60">Business Name</label>
              <input value={form.company_name} onChange={(e) => setTxt("company_name", e.target.value)} className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2" placeholder="Smith Deck Builders" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/60">Business Phone</label>
              <input value={form.company_phone} onChange={(e) => setTxt("company_phone", e.target.value)} className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2" placeholder="(555) 555-5555" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/60">Business Email</label>
              <input value={form.company_email} onChange={(e) => setTxt("company_email", e.target.value)} className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2" placeholder="quotes@yourbusiness.com" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/60">Website <span className="text-white/30">(optional)</span></label>
              <input value={form.company_website} onChange={(e) => setTxt("company_website", e.target.value)} className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2" placeholder="www.smithdeckbuilders.com" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/60">Business Address <span className="text-white/30">(optional)</span></label>
              <input value={form.company_address} onChange={(e) => setTxt("company_address", e.target.value)} className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2" placeholder="123 Main St, Portland, OR 97201" />
            </div>
          </div>

          {/* ── Regional Pricing ── */}
          <div className="mt-8 mb-6 text-sm font-medium text-white/80">Regional Pricing</div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs text-white/60">My Region</label>
              <select value={form.region} onChange={(e) => setTxt("region", e.target.value)} className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2">
                {REGIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              <p className="mt-2 text-xs text-white/40">{selectedRegion.note}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#111827] p-4">
              <div className="mb-2 text-xs font-medium text-white/60">Material cost multiplier</div>
              <div className="text-2xl font-semibold text-white">{selectedRegion.materialMult.toFixed(2)}x</div>
              <div className="mt-1 text-xs text-white/40">Applied to all material rates automatically</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#111827] p-4">
              <div className="mb-2 text-xs font-medium text-white/60">Labor cost multiplier</div>
              <div className="text-2xl font-semibold text-white">{selectedRegion.laborMult.toFixed(2)}x</div>
              <div className="mt-1 text-xs text-white/40">Applied to labor rate per sq ft automatically</div>
            </div>
            <div className="md:col-span-2 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
              <div className="mb-2 text-xs font-medium text-blue-300">Effective rates with {selectedRegion.label} multiplier</div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                <div><div className="text-xs text-white/50">Pressure-treated</div><div className="text-sm font-medium text-white">${(form.pt_material_rate * selectedRegion.materialMult).toFixed(2)}/sqft</div></div>
                <div><div className="text-xs text-white/50">Trex</div><div className="text-sm font-medium text-white">${(form.trex_material_rate * selectedRegion.materialMult).toFixed(2)}/sqft</div></div>
                <div><div className="text-xs text-white/50">TimberTech</div><div className="text-sm font-medium text-white">${(form.timbertech_material_rate * selectedRegion.materialMult).toFixed(2)}/sqft</div></div>
                <div><div className="text-xs text-white/50">Labor</div><div className="text-sm font-medium text-white">${(form.labor_rate_per_sqft * selectedRegion.laborMult).toFixed(2)}/sqft</div></div>
              </div>
            </div>
          </div>

          {/* ── Material Rates ── */}
          <div className="mt-8 mb-6 text-sm font-medium text-white/80">
            Base Material Rates ($ / sqft)
            <span className="ml-2 text-xs font-normal text-white/40">Regional multiplier applied on top</span>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div><label className="mb-1 block text-xs text-white/60">Pressure Treated</label><input value={form.pt_material_rate} onChange={(e) => setNum("pt_material_rate", e.target.value)} className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2" /></div>
            <div><label className="mb-1 block text-xs text-white/60">Trex</label><input value={form.trex_material_rate} onChange={(e) => setNum("trex_material_rate", e.target.value)} className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2" /></div>
            <div><label className="mb-1 block text-xs text-white/60">TimberTech</label><input value={form.timbertech_material_rate} onChange={(e) => setNum("timbertech_material_rate", e.target.value)} className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2" /></div>
            <div><label className="mb-1 block text-xs text-white/60">PVC</label><input value={form.pvc_material_rate} onChange={(e) => setNum("pvc_material_rate", e.target.value)} className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2" /></div>
          </div>

          {/* ── Labor & Defaults ── */}
          <div className="mt-8 mb-6 text-sm font-medium text-white/80">
            Labor & Defaults
            <span className="ml-2 text-xs font-normal text-white/40">Regional multiplier applied to labor rate</span>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div><label className="mb-1 block text-xs text-white/60">Base Labor Rate Per Sq Ft</label><input value={form.labor_rate_per_sqft} onChange={(e) => setNum("labor_rate_per_sqft", e.target.value)} className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2" /></div>
            <div><label className="mb-1 block text-xs text-white/60">Stair Cost (per section)</label><input value={form.stair_cost} onChange={(e) => setNum("stair_cost", e.target.value)} className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2" /></div>
            <div><label className="mb-1 block text-xs text-white/60">Default Equipment Cost</label><input value={form.equipment_default} onChange={(e) => setNum("equipment_default", e.target.value)} className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2" /></div>
            <div><label className="mb-1 block text-xs text-white/60">Default Overhead Cost</label><input value={form.overhead_default} onChange={(e) => setNum("overhead_default", e.target.value)} className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2" /></div>
          </div>

          {/* ── Sales Tax ── */}
          <div className="mt-8 mb-6 text-sm font-medium text-white/80">Sales Tax</div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-white/60">Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                max="30"
                step="0.01"
                value={form.tax_rate}
                onChange={(e) => setNum("tax_rate", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
                placeholder="0"
              />
              <p className="mt-1 text-xs text-white/40">Enter as a percentage, e.g. 8.5 for 8.5%</p>
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/60">Apply Tax To</label>
              <select
                value={form.tax_applies_to}
                onChange={(e) => setTxt("tax_applies_to", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              >
                <option value="materials_only">Materials only</option>
                <option value="labor_only">Labor only</option>
                <option value="materials_and_labor">Materials and labor</option>
              </select>
            </div>
          </div>

          {/* ── Dumpster Default ── */}
          <div className="mt-8 mb-6 text-sm font-medium text-white/80">Dumpster</div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-white/60">Default Dumpster Cost ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.dumpster_default}
                onChange={(e) => setNum("dumpster_default", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
                placeholder="0.00"
              />
              <p className="mt-1 text-xs text-white/40">Pre-fills the dumpster cost field when toggled on in a quote</p>
            </div>
          </div>

          {/* ── Permit Defaults ── */}
          <div className="mt-8 mb-6 text-sm font-medium text-white/80">Permit Default Costs</div>
          <p className="mb-4 text-xs text-white/40">These pre-fill each permit cost field when toggled on in a quote. Set to 0 if you prefer to enter costs manually per job.</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-white/60">Building Permit</label>
              <input type="number" min="0" step="0.01" value={form.permit_building_default} onChange={(e) => setNum("permit_building_default", e.target.value)} className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2" placeholder="0.00" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/60">Septic Permit</label>
              <input type="number" min="0" step="0.01" value={form.permit_septic_default} onChange={(e) => setNum("permit_septic_default", e.target.value)} className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2" placeholder="0.00" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/60">Electrical Permit</label>
              <input type="number" min="0" step="0.01" value={form.permit_electrical_default} onChange={(e) => setNum("permit_electrical_default", e.target.value)} className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2" placeholder="0.00" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/60">Engineering / Structural Drawings</label>
              <input type="number" min="0" step="0.01" value={form.permit_engineering_default} onChange={(e) => setNum("permit_engineering_default", e.target.value)} className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2" placeholder="0.00" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/60">HOA Approval Fee</label>
              <input type="number" min="0" step="0.01" value={form.permit_hoa_default} onChange={(e) => setNum("permit_hoa_default", e.target.value)} className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2" placeholder="0.00" />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button type="button" onClick={save} disabled={saving} className="rounded bg-white px-4 py-2 text-black hover:bg-white/90 disabled:opacity-60">
              {saving ? "Saving…" : "Save Settings"}
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}