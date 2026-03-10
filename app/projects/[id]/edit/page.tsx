"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

type SettingsRow = {
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

type FormState = {
  name: string;
  status: string;

  deck_length: string;
  deck_width: string;
  deck_sqft: string;

  height_tier: string;
  material_type: string;
  railing_type: string;
  stair_count: string;

  material_cost: string;
  labor_cost: string;
  permit_cost: string;
  equipment_cost: string;
  overhead_cost: string;
  total_job_cost: string;

  final_price: string;
  expected_profit: string;
  target_margin: string;

  client_name: string;
  client_email: string;
  client_phone: string;
  site_address: string;
  notes: string;
};

function numOrNull(value: string) {
  if (!value.trim()) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function moneyString(value: any) {
  if (value === null || value === undefined || value === "") return "";
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(2) : "";
}

function integerString(value: any) {
  if (value === null || value === undefined || value === "") return "";
  const n = Number(value);
  return Number.isFinite(n) ? String(Math.round(n)) : "";
}

function marginString(value: any) {
  if (value === null || value === undefined || value === "") return "";
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(2) : "";
}

function parseMarginInput(value: string) {
  if (!value.trim()) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return n > 1 ? n / 100 : n;
}

function calcSqFt(length: string, width: string) {
  const l = Number(length);
  const w = Number(width);
  if (!Number.isFinite(l) || !Number.isFinite(w)) return "";
  return String(Math.round(l * w));
}

function calcTotalCost(
  material: number,
  labor: number,
  permit: number,
  equipment: number,
  overhead: number
) {
  return material + labor + permit + equipment + overhead;
}

function materialRate(type: string, settings: SettingsRow) {
  switch (type) {
    case "pressure-treated":
      return settings.pt_material_rate;
    case "trex":
      return settings.trex_material_rate;
    case "timbertech":
      return settings.timbertech_material_rate;
    case "pvc":
      return settings.pvc_material_rate;
    default:
      return settings.pt_material_rate;
  }
}

function laborMultiplier(heightTier: string) {
  if (heightTier === "raised") return 1.15;
  if (heightTier === "high") return 1.3;
  return 1;
}

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const id = String(params?.id ?? "");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  const [settings, setSettings] = useState<SettingsRow>({
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

  const [form, setForm] = useState<FormState>({
    name: "",
    status: "open",

    deck_length: "",
    deck_width: "",
    deck_sqft: "",

    height_tier: "standard",
    material_type: "pressure-treated",
    railing_type: "none",
    stair_count: "0",

    material_cost: "",
    labor_cost: "",
    permit_cost: "",
    equipment_cost: "",
    overhead_cost: "",
    total_job_cost: "",

    final_price: "",
    expected_profit: "",
    target_margin: "0.30",

    client_name: "",
    client_email: "",
    client_phone: "",
    site_address: "",
    notes: "",
  });

  useEffect(() => {
    async function loadEverything() {
      setLoading(true);
      setErr("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: settingsData } = await supabase
          .from("user_settings")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (settingsData) {
          setSettings({
            labor_rate_per_sqft: Number(settingsData.labor_rate_per_sqft ?? 8),
            stair_cost: Number(settingsData.stair_cost ?? 250),
            permit_default: Number(settingsData.permit_default ?? 0),
            equipment_default: Number(settingsData.equipment_default ?? 0),
            overhead_default: Number(settingsData.overhead_default ?? 0),
            pt_material_rate: Number(settingsData.pt_material_rate ?? 10),
            trex_material_rate: Number(settingsData.trex_material_rate ?? 18),
            timbertech_material_rate: Number(settingsData.timbertech_material_rate ?? 20),
            pvc_material_rate: Number(settingsData.pvc_material_rate ?? 25),
          });
        }
      }

      const { data, error } = await supabase
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
          notes
        `)
        .eq("id", id)
        .single();

      if (error || !data) {
        setErr(error?.message ?? "Could not load project");
        setLoading(false);
        return;
      }

      setForm({
        name: data.name ?? "",
        status: data.status ?? "open",

        deck_length: moneyString(data.deck_length),
        deck_width: moneyString(data.deck_width),
        deck_sqft: integerString(data.deck_sqft),

        height_tier: data.height_tier ?? "standard",
        material_type: data.material_type ?? "pressure-treated",
        railing_type: data.railing_type ?? "none",
        stair_count: integerString(data.stair_count ?? 0),

        material_cost: moneyString(data.material_cost),
        labor_cost: moneyString(data.labor_cost),
        permit_cost: moneyString(data.permit_cost),
        equipment_cost: moneyString(data.equipment_cost),
        overhead_cost: moneyString(data.overhead_cost),
        total_job_cost: moneyString(data.total_job_cost),

        final_price: moneyString(data.final_price),
        expected_profit: moneyString(data.expected_profit),
        target_margin: marginString(data.target_margin ?? 0.3),

        client_name: data.client_name ?? "",
        client_email: data.client_email ?? "",
        client_phone: data.client_phone ?? "",
        site_address: data.site_address ?? "",
        notes: data.notes ?? "",
      });

      setLoading(false);
    }

    if (id) loadEverything();
  }, [id, supabase]);

  useEffect(() => {
    setForm((prev) => {
      const sqft = Number(calcSqFt(prev.deck_length, prev.deck_width) || 0);

      const material = sqft * materialRate(prev.material_type, settings);

      const labor =
        sqft *
          settings.labor_rate_per_sqft *
          laborMultiplier(prev.height_tier) +
        (Number(prev.stair_count || 0) * settings.stair_cost);

      const permit =
        prev.permit_cost.trim() === ""
          ? settings.permit_default
          : Number(prev.permit_cost || 0);

      const equipment =
        prev.equipment_cost.trim() === ""
          ? settings.equipment_default
          : Number(prev.equipment_cost || 0);

      const overhead =
        prev.overhead_cost.trim() === ""
          ? settings.overhead_default
          : Number(prev.overhead_cost || 0);

      const total = calcTotalCost(material, labor, permit, equipment, overhead);

      const margin = parseMarginInput(prev.target_margin) ?? 0.3;
      const finalPrice = margin >= 1 ? total : total / (1 - margin);
      const profit = finalPrice - total;

      return {
        ...prev,
        deck_sqft: String(Math.round(sqft)),
        material_cost: material.toFixed(2),
        labor_cost: labor.toFixed(2),
        permit_cost: permit.toFixed(2),
        equipment_cost: equipment.toFixed(2),
        overhead_cost: overhead.toFixed(2),
        total_job_cost: total.toFixed(2),
        final_price: finalPrice.toFixed(2),
        expected_profit: profit.toFixed(2),
      };
    });
  }, [
    form.deck_length,
    form.deck_width,
    form.height_tier,
    form.material_type,
    form.stair_count,
    form.target_margin,
    settings,
  ]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setErr("");
    setSuccess("");

    const payload = {
      name: form.name || "Untitled Quote",
      status: form.status || "open",

      deck_length: numOrNull(form.deck_length),
      deck_width: numOrNull(form.deck_width),
      deck_sqft: Number(form.deck_sqft || 0),

      height_tier: form.height_tier,
      material_type: form.material_type,
      railing_type: form.railing_type,
      stair_count: Number(form.stair_count || 0),

      material_cost: Number(form.material_cost || 0),
      labor_cost: Number(form.labor_cost || 0),
      permit_cost: Number(form.permit_cost || 0),
      equipment_cost: Number(form.equipment_cost || 0),
      overhead_cost: Number(form.overhead_cost || 0),
      total_job_cost: Number(form.total_job_cost || 0),

      final_price: Number(form.final_price || 0),
      expected_profit: Number(form.expected_profit || 0),
      target_margin: parseMarginInput(form.target_margin) ?? 0.3,

      client_name: form.client_name || null,
      client_email: form.client_email || null,
      client_phone: form.client_phone || null,
      site_address: form.site_address || null,
      notes: form.notes || null,

      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("projects").update(payload).eq("id", id);

    if (error) {
      setErr(error.message);
      setSaving(false);
      return;
    }

    setSuccess("Saved successfully.");

    setTimeout(() => {
      router.push(`/projects/${id}`);
      router.refresh();
    }, 400);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0b0f19] px-6 py-8 text-white">
        <div className="mx-auto max-w-5xl text-sm text-white/70">Loading…</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0f19] px-6 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">
              Edit Quote: {form.name || "Untitled Quote"}
            </h1>
            <p className="mt-1 text-sm text-white/60">
              This estimator now uses your saved contractor settings automatically.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => router.push(`/projects/${id}`)}
              className="rounded border border-white/20 px-3 py-2 text-sm hover:bg-white/10"
            >
              ← Back to Quote
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>

        {err ? (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {err}
          </div>
        ) : null}

        {success ? (
          <div className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {success}
          </div>
        ) : null}

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="mb-6 text-sm font-medium text-white/80">Project & Client</div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-white/60">Quote Name</label>
              <input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-white/60">Status</label>
              <select
                value={form.status}
                onChange={(e) => updateField("status", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              >
                <option value="open">open</option>
                <option value="sent">sent</option>
                <option value="approved">approved</option>
                <option value="won">won</option>
                <option value="lost">lost</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-white/60">Client Name</label>
              <input
                value={form.client_name}
                onChange={(e) => updateField("client_name", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-white/60">Client Phone</label>
              <input
                value={form.client_phone}
                onChange={(e) => updateField("client_phone", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-white/60">Client Email</label>
              <input
                value={form.client_email}
                onChange={(e) => updateField("client_email", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-white/60">Site Address</label>
              <input
                value={form.site_address}
                onChange={(e) => updateField("site_address", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>
          </div>

          <div className="mt-8 mb-6 text-sm font-medium text-white/80">Deck Size</div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs text-white/60">Deck Length (ft)</label>
              <input
                value={form.deck_length}
                onChange={(e) => updateField("deck_length", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-white/60">Deck Width (ft)</label>
              <input
                value={form.deck_width}
                onChange={(e) => updateField("deck_width", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-white/60">Deck Square Feet</label>
              <input
                value={form.deck_sqft}
                readOnly
                className="w-full rounded-lg border border-white/15 bg-[#0f172a] px-3 py-2 text-white/80"
              />
            </div>
          </div>

          <div className="mt-8 mb-6 text-sm font-medium text-white/80">Deck Build Inputs</div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-white/60">Height Tier</label>
              <select
                value={form.height_tier}
                onChange={(e) => updateField("height_tier", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              >
                <option value="standard">standard</option>
                <option value="raised">raised</option>
                <option value="high">high</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-white/60">Material Type</label>
              <select
                value={form.material_type}
                onChange={(e) => updateField("material_type", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              >
                <option value="pressure-treated">pressure-treated</option>
                <option value="trex">trex</option>
                <option value="timbertech">timbertech</option>
                <option value="pvc">pvc</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-white/60">Railing Type</label>
              <select
                value={form.railing_type}
                onChange={(e) => updateField("railing_type", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              >
                <option value="none">none</option>
                <option value="wood">wood</option>
                <option value="composite">composite</option>
                <option value="metal">metal</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-white/60">Stair Count</label>
              <input
                value={form.stair_count}
                onChange={(e) => updateField("stair_count", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>
          </div>

          <div className="mt-8 mb-6 text-sm font-medium text-white/80">Cost Breakdown</div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-white/60">Material Cost</label>
              <input
                value={form.material_cost}
                readOnly
                className="w-full rounded-lg border border-white/15 bg-[#0f172a] px-3 py-2 text-white/80"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-white/60">Labor Cost</label>
              <input
                value={form.labor_cost}
                readOnly
                className="w-full rounded-lg border border-white/15 bg-[#0f172a] px-3 py-2 text-white/80"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-white/60">Permit Cost</label>
              <input
                value={form.permit_cost}
                onChange={(e) => updateField("permit_cost", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-white/60">Equipment Cost</label>
              <input
                value={form.equipment_cost}
                onChange={(e) => updateField("equipment_cost", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-white/60">Overhead Cost</label>
              <input
                value={form.overhead_cost}
                onChange={(e) => updateField("overhead_cost", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-white/60">Total Job Cost</label>
              <input
                value={form.total_job_cost}
                readOnly
                className="w-full rounded-lg border border-white/15 bg-[#0f172a] px-3 py-2 text-white/80"
              />
            </div>
          </div>

          <div className="mt-8 mb-6 text-sm font-medium text-white/80">Pricing</div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs text-white/60">Final Price</label>
              <input
                value={form.final_price}
                readOnly
                className="w-full rounded-lg border border-white/15 bg-[#0f172a] px-3 py-2 text-white/80"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-white/60">Expected Profit</label>
              <input
                value={form.expected_profit}
                readOnly
                className="w-full rounded-lg border border-white/15 bg-[#0f172a] px-3 py-2 text-white/80"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-white/60">Target Margin</label>
              <input
                value={form.target_margin}
                onChange={(e) => updateField("target_margin", e.target.value)}
                placeholder="0.30 or 30"
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>
          </div>

          <div className="mt-8">
            <label className="mb-1 block text-xs text-white/60">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              rows={5}
              className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
            />
          </div>
        </div>
      </div>
    </main>
  );
}

