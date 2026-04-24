"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabaseClient";

type SettingsRow = {
  company_name: string;
  company_phone: string;
  company_email: string;
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
};

const REGIONS = [
  { value: "national",  label: "National Average",    materialMult: 1.00, laborMult: 1.00, note: "Baseline — used when region is unknown" },
  { value: "pnw",       label: "Pacific Northwest",   materialMult: 1.32, laborMult: 1.35, note: "Seattle/Portland — moisture-rated lumber required, highest labor market" },
  { value: "northeast", label: "Northeast",           materialMult: 1.28, laborMult: 1.30, note: "NY/MA/CT — strict codes, shorter build season, high labor" },
  { value: "california",label: "California",          materialMult: 1.35, laborMult: 1.38, note: "Highest in nation — seismic codes, CEQA, $75/hr skilled trades" },
  { value: "southeast", label: "Southeast",           materialMult: 0.88, laborMult: 0.85, note: "FL/GA/SC — lower labor costs, longer build season" },
  { value: "midwest",   label: "Midwest",             materialMult: 0.90, laborMult: 0.88, note: "OH/IL/MI — near national average, lower regulatory burden" },
  { value: "southwest", label: "Southwest",           materialMult: 0.95, laborMult: 0.93, note: "TX/AZ/NV — growing markets, moderate costs" },
];

export default function SettingsPage() {
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const [form, setForm] = useState<SettingsRow>({
    company_name: "",
    company_phone: "",
    company_email: "",
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
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErr("");
      setMsg("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setErr("You must be logged in.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        setErr(error.message);
        setLoading(false);
        return;
      }

      if (data) {
        setForm({
          company_name: data.company_name ?? "",
          company_phone: data.company_phone ?? "",
          company_email: data.company_email ?? "",
          region: data.region ?? "national",
          labor_rate_per_sqft: Number(data.labor_rate_per_sqft ?? 8),
          stair_cost: Number(data.stair_cost ?? 250),
          permit_default: Number(data.permit_default ?? 0),
          equipment_default: Number(data.equipment_default ?? 0),
          overhead_default: Number(data.overhead_default ?? 0),
          pt_material_rate: Number(data.pt_material_rate ?? 10),
          trex_material_rate: Number(data.trex_material_rate ?? 18),
          timbertech_material_rate: Number(data.timbertech_material_rate ?? 20),
          pvc_material_rate: Number(data.pvc_material_rate ?? 25),
        });
      }

      setLoading(false);
    }

    load();
  }, [supabase]);

  function updateNumberField<K extends keyof SettingsRow>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: Number(value || 0) }));
  }

  function updateTextField<K extends keyof SettingsRow>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const selectedRegion = REGIONS.find((r) => r.value === form.region) ?? REGIONS[0];

  async function save() {
    setSaving(true);
    setErr("");
    setMsg("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErr("You must be logged in.");
      setSaving(false);
      return;
    }

    const payload = {
      user_id: user.id,
      company_name: form.company_name || null,
      company_phone: form.company_phone || null,
      company_email: form.company_email || null,
      region: form.region,
      labor_rate_per_sqft: form.labor_rate_per_sqft,
      stair_cost: form.stair_cost,
      permit_default: form.permit_default,
      equipment_default: form.equipment_default,
      overhead_default: form.overhead_default,
      pt_material_rate: form.pt_material_rate,
      trex_material_rate: form.trex_material_rate,
      timbertech_material_rate: form.timbertech_material_rate,
      pvc_material_rate: form.pvc_material_rate,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("user_settings").upsert(payload);

    if (error) {
      setErr(error.message);
      setSaving(false);
      return;
    }

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
            <p className="text-gray-400">
              Set your pricing rules and business info once. DeckMargin will use them in every quote.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-lg border border-gray-600 px-4 py-2 text-gray-200 hover:bg-gray-800"
          >
            Back to Dashboard
          </Link>
        </div>

        {err ? (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {err}
          </div>
        ) : null}

        {msg ? (
          <div className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {msg}
          </div>
        ) : null}

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">

          {/* ── Business Contact Info ── */}
          <div className="mb-6 text-sm font-medium text-white/80">Business Contact Info</div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs text-white/60">Business Name</label>
              <input
                value={form.company_name}
                onChange={(e) => updateTextField("company_name", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
                placeholder="Smith Deck Builders"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-white/60">Business Phone</label>
              <input
                value={form.company_phone}
                onChange={(e) => updateTextField("company_phone", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
                placeholder="(555) 555-5555"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-white/60">Business Email</label>
              <input
                value={form.company_email}
                onChange={(e) => updateTextField("company_email", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
                placeholder="quotes@yourbusiness.com"
              />
            </div>
          </div>

          {/* ── Regional Pricing ── */}
          <div className="mt-8 mb-6 text-sm font-medium text-white/80">Regional Pricing</div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs text-white/60">My Region</label>
              <select
                value={form.region}
                onChange={(e) => updateTextField("region", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              >
                {REGIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-white/40">{selectedRegion.note}</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#111827] p-4">
              <div className="mb-2 text-xs font-medium text-white/60">Material cost multiplier</div>
              <div className="text-2xl font-semibold text-white">
                {selectedRegion.materialMult.toFixed(2)}x
              </div>
              <div className="mt-1 text-xs text-white/40">
                Applied to all material rates automatically
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#111827] p-4">
              <div className="mb-2 text-xs font-medium text-white/60">Labor cost multiplier</div>
              <div className="text-2xl font-semibold text-white">
                {selectedRegion.laborMult.toFixed(2)}x
              </div>
              <div className="mt-1 text-xs text-white/40">
                Applied to labor rate per sq ft automatically
              </div>
            </div>

            <div className="md:col-span-2 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
              <div className="mb-2 text-xs font-medium text-blue-300">Effective rates with {selectedRegion.label} multiplier</div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                <div>
                  <div className="text-xs text-white/50">Pressure-treated</div>
                  <div className="text-sm font-medium text-white">
                    ${(form.pt_material_rate * selectedRegion.materialMult).toFixed(2)}/sqft
                  </div>
                </div>
                <div>
                  <div className="text-xs text-white/50">Trex</div>
                  <div className="text-sm font-medium text-white">
                    ${(form.trex_material_rate * selectedRegion.materialMult).toFixed(2)}/sqft
                  </div>
                </div>
                <div>
                  <div className="text-xs text-white/50">TimberTech</div>
                  <div className="text-sm font-medium text-white">
                    ${(form.timbertech_material_rate * selectedRegion.materialMult).toFixed(2)}/sqft
                  </div>
                </div>
                <div>
                  <div className="text-xs text-white/50">Labor</div>
                  <div className="text-sm font-medium text-white">
                    ${(form.labor_rate_per_sqft * selectedRegion.laborMult).toFixed(2)}/sqft
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Material Rates ── */}
          <div className="mt-8 mb-6 text-sm font-medium text-white/80">
            Base Material Rates ($ / sqft)
            <span className="ml-2 text-xs font-normal text-white/40">Regional multiplier applied on top</span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-white/60">Pressure Treated</label>
              <input
                value={form.pt_material_rate}
                onChange={(e) => updateNumberField("pt_material_rate", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-white/60">Trex</label>
              <input
                value={form.trex_material_rate}
                onChange={(e) => updateNumberField("trex_material_rate", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-white/60">TimberTech</label>
              <input
                value={form.timbertech_material_rate}
                onChange={(e) => updateNumberField("timbertech_material_rate", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-white/60">PVC</label>
              <input
                value={form.pvc_material_rate}
                onChange={(e) => updateNumberField("pvc_material_rate", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>
          </div>

          {/* ── Labor & Defaults ── */}
          <div className="mt-8 mb-6 text-sm font-medium text-white/80">
            Labor & Defaults
            <span className="ml-2 text-xs font-normal text-white/40">Regional multiplier applied to labor rate</span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-white/60">Base Labor Rate Per Sq Ft</label>
              <input
                value={form.labor_rate_per_sqft}
                onChange={(e) => updateNumberField("labor_rate_per_sqft", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-white/60">Stair Cost (per section)</label>
              <input
                value={form.stair_cost}
                onChange={(e) => updateNumberField("stair_cost", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-white/60">Default Permit Cost</label>
              <input
                value={form.permit_default}
                onChange={(e) => updateNumberField("permit_default", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-white/60">Default Equipment Cost</label>
              <input
                value={form.equipment_default}
                onChange={(e) => updateNumberField("equipment_default", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-white/60">Default Overhead Cost</label>
              <input
                value={form.overhead_default}
                onChange={(e) => updateNumberField("overhead_default", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="rounded bg-white px-4 py-2 text-black hover:bg-white/90 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}