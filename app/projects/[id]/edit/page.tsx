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

type HardwareItem = {
  key: string;
  label: string;
  enabled: boolean;
  cost: string;
};

const DEFAULT_HARDWARE: HardwareItem[] = [
  { key: "fasteners_screws", label: "Fasteners / screws", enabled: false, cost: "" },
  { key: "joist_hangers", label: "Joist hangers", enabled: false, cost: "" },
  { key: "post_bases", label: "Post bases", enabled: false, cost: "" },
  { key: "concrete_bags", label: "Concrete / bags", enabled: false, cost: "" },
  { key: "hurricane_ties", label: "Hurricane ties", enabled: false, cost: "" },
  { key: "lag_bolts", label: "Lag bolts", enabled: false, cost: "" },
  { key: "flashing", label: "Flashing", enabled: false, cost: "" },
  { key: "misc_hardware", label: "Misc hardware", enabled: false, cost: "" },
];

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

  lighting_enabled: boolean;
  lighting_cost: string;

  staining_enabled: boolean;
  staining_cost: string;

  built_ins_enabled: boolean;
  built_ins_cost: string;
  built_ins_description: string;

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

function numOrZero(value: string) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
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

function calcTotalCost(values: {
  material: number;
  labor: number;
  permit: number;
  equipment: number;
  overhead: number;
  lighting: number;
  staining: number;
  builtIns: number;
  hardware: number;
}) {
  return (
    values.material +
    values.labor +
    values.permit +
    values.equipment +
    values.overhead +
    values.lighting +
    values.staining +
    values.builtIns +
    values.hardware
  );
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

function calcHardwareTotal(items: HardwareItem[]): number {
  return items.reduce((sum, item) => {
    if (!item.enabled) return sum;
    const n = Number(item.cost);
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);
}

function FieldHelp({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        tabIndex={0}
        className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/20 text-[11px] font-semibold text-white/70 hover:bg-white/10 hover:text-white"
        aria-label="Field help"
      >
        ?
      </button>
      <span className="pointer-events-none absolute left-7 top-1/2 z-20 hidden w-64 -translate-y-1/2 rounded-lg border border-white/15 bg-[#0b1220] px-3 py-2 text-xs font-normal leading-5 text-white/85 shadow-xl group-hover:block group-focus-within:block">
        {text}
      </span>
    </span>
  );
}

function FieldLabel({ label, help }: { label: string; help: string }) {
  return (
    <label className="mb-1 flex items-center text-xs text-white/60">
      <span>{label}</span>
      <FieldHelp text={help} />
    </label>
  );
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

  const [hardwareItems, setHardwareItems] = useState<HardwareItem[]>(DEFAULT_HARDWARE);

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
    lighting_enabled: false,
    lighting_cost: "0",
    staining_enabled: false,
    staining_cost: "0",
    built_ins_enabled: false,
    built_ins_cost: "0",
    built_ins_description: "",
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
          lighting_enabled,
          lighting_cost,
          staining_enabled,
          staining_cost,
          built_ins_enabled,
          built_ins_cost,
          built_ins_description,
          hardware_items,
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

      // Merge saved hardware_items with defaults so new items always appear
      if (data.hardware_items && Array.isArray(data.hardware_items) && data.hardware_items.length > 0) {
        const saved = data.hardware_items as HardwareItem[];
        const merged = DEFAULT_HARDWARE.map((def) => {
          const found = saved.find((s) => s.key === def.key);
          return found ? { ...def, enabled: found.enabled, cost: found.cost ?? "" } : def;
        });
        setHardwareItems(merged);
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
        lighting_enabled: data.lighting_enabled ?? false,
        lighting_cost: moneyString(data.lighting_cost ?? 0),
        staining_enabled: data.staining_enabled ?? false,
        staining_cost: moneyString(data.staining_cost ?? 0),
        built_ins_enabled: data.built_ins_enabled ?? false,
        built_ins_cost: moneyString(data.built_ins_cost ?? 0),
        built_ins_description: data.built_ins_description ?? "",
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

  // Recalculate whenever inputs or hardware changes
  useEffect(() => {
    setForm((prev) => {
      const sqft = Number(calcSqFt(prev.deck_length, prev.deck_width) || 0);

      const material = sqft * materialRate(prev.material_type, settings);

      const labor =
        sqft *
          settings.labor_rate_per_sqft *
          laborMultiplier(prev.height_tier) +
        Number(prev.stair_count || 0) * settings.stair_cost;

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

      const lighting = prev.lighting_enabled ? numOrZero(prev.lighting_cost) : 0;
      const staining = prev.staining_enabled ? numOrZero(prev.staining_cost) : 0;
      const builtIns = prev.built_ins_enabled ? numOrZero(prev.built_ins_cost) : 0;
      const hardware = calcHardwareTotal(hardwareItems);

      const total = calcTotalCost({
        material,
        labor,
        permit,
        equipment,
        overhead,
        lighting,
        staining,
        builtIns,
        hardware,
      });

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
    form.permit_cost,
    form.equipment_cost,
    form.overhead_cost,
    form.lighting_enabled,
    form.lighting_cost,
    form.staining_enabled,
    form.staining_cost,
    form.built_ins_enabled,
    form.built_ins_cost,
    hardwareItems,
    settings,
  ]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateHardwareEnabled(key: string, enabled: boolean) {
    setHardwareItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, enabled } : item))
    );
  }

  function updateHardwareCost(key: string, cost: string) {
    setHardwareItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, cost } : item))
    );
  }

  const hardwareTotal = calcHardwareTotal(hardwareItems);

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

      lighting_enabled: form.lighting_enabled,
      lighting_cost: form.lighting_enabled ? Number(form.lighting_cost || 0) : 0,

      staining_enabled: form.staining_enabled,
      staining_cost: form.staining_enabled ? Number(form.staining_cost || 0) : 0,

      built_ins_enabled: form.built_ins_enabled,
      built_ins_cost: form.built_ins_enabled ? Number(form.built_ins_cost || 0) : 0,
      built_ins_description: form.built_ins_enabled ? form.built_ins_description || null : null,

      hardware_items: hardwareItems.map((item) => ({
        key: item.key,
        label: item.label,
        enabled: item.enabled,
        cost: item.enabled ? item.cost : "",
      })),

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
              Fill out the quote builder and DeckMargin will calculate pricing automatically.
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
          {/* ── Project & Client ── */}
          <div className="mb-6 text-sm font-medium text-white/80">Project & Client</div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <FieldLabel
                label="Quote Name"
                help="This is the internal name of the quote or project, like Smith Residence Deck."
              />
              <input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>

            <div>
              <FieldLabel
                label="Status"
                help="Use status to track where the quote is in your sales process, like open, sent, won, or lost."
              />
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
              <FieldLabel
                label="Client Name"
                help="Enter the homeowner or customer name this proposal is for."
              />
              <input
                value={form.client_name}
                onChange={(e) => updateField("client_name", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>

            <div>
              <FieldLabel
                label="Client Phone"
                help="Use the client's best contact number for project communication."
              />
              <input
                value={form.client_phone}
                onChange={(e) => updateField("client_phone", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>

            <div>
              <FieldLabel
                label="Client Email"
                help="Use the client's email address for proposal delivery and follow-up."
              />
              <input
                value={form.client_email}
                onChange={(e) => updateField("client_email", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>

            <div>
              <FieldLabel
                label="Site Address"
                help="Enter the actual job site where the deck will be built."
              />
              <input
                value={form.site_address}
                onChange={(e) => updateField("site_address", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>
          </div>

          {/* ── Deck Size ── */}
          <div className="mt-8 mb-6 text-sm font-medium text-white/80">Deck Size</div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <FieldLabel
                label="Deck Length (ft)"
                help="Enter the full length of the deck in feet."
              />
              <input
                value={form.deck_length}
                onChange={(e) => updateField("deck_length", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>

            <div>
              <FieldLabel
                label="Deck Width (ft)"
                help="Enter the full width of the deck in feet."
              />
              <input
                value={form.deck_width}
                onChange={(e) => updateField("deck_width", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>

            <div>
              <FieldLabel
                label="Deck Square Feet"
                help="This is automatically calculated from deck length × deck width."
              />
              <input
                value={form.deck_sqft}
                readOnly
                className="w-full rounded-lg border border-white/15 bg-[#0f172a] px-3 py-2 text-white/80"
              />
            </div>
          </div>

          {/* ── Deck Build Inputs ── */}
          <div className="mt-8 mb-6 text-sm font-medium text-white/80">Deck Build Inputs</div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <FieldLabel
                label="Height Tier"
                help="Use standard for lower decks, raised for mid-height builds, and high for taller or more complex elevated decks."
              />
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
              <FieldLabel
                label="Material Type"
                help="Select the main decking material. This changes the material rate used in your quote."
              />
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
              <FieldLabel
                label="Railing Type"
                help="Select the railing style included in the project. Use none if the deck does not require railing."
              />
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
              <FieldLabel
                label="Stair Count"
                help="Enter how many stair sections are included in the build. Leave 0 if there are no stairs."
              />
              <input
                value={form.stair_count}
                onChange={(e) => updateField("stair_count", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>
          </div>

          {/* ── Add-ons ── */}
          <div className="mt-8 mb-6 text-sm font-medium text-white/80">Add-ons</div>

          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-[#111827] p-4">
              <label className="flex items-center gap-3 text-sm font-medium text-white">
                <input
                  type="checkbox"
                  checked={form.lighting_enabled}
                  onChange={(e) => updateField("lighting_enabled", e.target.checked)}
                />
                <span>Lighting</span>
                <FieldHelp text="Add this if the project includes post lights, stair lights, transformers, or any deck lighting package." />
              </label>

              {form.lighting_enabled ? (
                <div className="mt-3">
                  <FieldLabel
                    label="Lighting Cost"
                    help="Enter the total cost allowance for deck lighting on this project."
                  />
                  <input
                    value={form.lighting_cost}
                    onChange={(e) => updateField("lighting_cost", e.target.value)}
                    className="w-full rounded-lg border border-white/15 bg-[#0b1220] px-3 py-2"
                    placeholder="0.00"
                  />
                </div>
              ) : null}
            </div>

            <div className="rounded-xl border border-white/10 bg-[#111827] p-4">
              <label className="flex items-center gap-3 text-sm font-medium text-white">
                <input
                  type="checkbox"
                  checked={form.staining_enabled}
                  onChange={(e) => updateField("staining_enabled", e.target.checked)}
                />
                <span>Staining / Sealing</span>
                <FieldHelp text="Add this if the project includes professional staining or sealing, usually for natural wood decks." />
              </label>

              {form.staining_enabled ? (
                <div className="mt-3">
                  <FieldLabel
                    label="Staining Cost"
                    help="Enter the total staining or sealing cost for this project."
                  />
                  <input
                    value={form.staining_cost}
                    onChange={(e) => updateField("staining_cost", e.target.value)}
                    className="w-full rounded-lg border border-white/15 bg-[#0b1220] px-3 py-2"
                    placeholder="0.00"
                  />
                </div>
              ) : null}
            </div>

            <div className="rounded-xl border border-white/10 bg-[#111827] p-4">
              <label className="flex items-center gap-3 text-sm font-medium text-white">
                <input
                  type="checkbox"
                  checked={form.built_ins_enabled}
                  onChange={(e) => updateField("built_ins_enabled", e.target.checked)}
                />
                <span>Built-ins</span>
                <FieldHelp text="Add this if the project includes benches, planters, pergolas, privacy walls, or other integrated custom features." />
              </label>

              {form.built_ins_enabled ? (
                <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <FieldLabel
                      label="Built-ins Description"
                      help="Describe the built-in feature, like bench seating, pergola, or planter boxes."
                    />
                    <input
                      value={form.built_ins_description}
                      onChange={(e) => updateField("built_ins_description", e.target.value)}
                      className="w-full rounded-lg border border-white/15 bg-[#0b1220] px-3 py-2"
                      placeholder="Bench seating, pergola, planter boxes..."
                    />
                  </div>

                  <div>
                    <FieldLabel
                      label="Built-ins Cost"
                      help="Enter the total cost allowance for all built-in features on this project."
                    />
                    <input
                      value={form.built_ins_cost}
                      onChange={(e) => updateField("built_ins_cost", e.target.value)}
                      className="w-full rounded-lg border border-white/15 bg-[#0b1220] px-3 py-2"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* ── Hardware & Fasteners ── */}
          <div className="mt-8 mb-6 flex items-center justify-between">
            <div className="text-sm font-medium text-white/80">Hardware &amp; Fasteners</div>
            {hardwareTotal > 0 && (
              <div className="text-sm font-medium text-emerald-400">
                Total: ${hardwareTotal.toFixed(2)}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-white/10 bg-[#111827] p-4">
            <p className="mb-4 text-xs text-white/50">
              Check each item that applies to this job and enter the cost. The total is added to your material cost automatically.
            </p>

            <div className="space-y-3">
              {hardwareItems.map((item) => (
                <div key={item.key} className="rounded-lg border border-white/10 bg-[#0b1220] p-3">
                  <label className="flex items-center gap-3 text-sm font-medium text-white">
                    <input
                      type="checkbox"
                      checked={item.enabled}
                      onChange={(e) => updateHardwareEnabled(item.key, e.target.checked)}
                      className="h-4 w-4 rounded accent-blue-500"
                    />
                    <span>{item.label}</span>
                  </label>

                  {item.enabled ? (
                    <div className="mt-2">
                      <FieldLabel
                        label="Cost ($)"
                        help={`Enter the cost for ${item.label} on this project.`}
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.cost}
                        onChange={(e) => updateHardwareCost(item.key, e.target.value)}
                        className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2 text-sm"
                        placeholder="0.00"
                      />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            {hardwareTotal > 0 && (
              <div className="mt-4 flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
                <span className="text-sm text-white/70">Hardware subtotal</span>
                <span className="text-sm font-semibold text-emerald-400">
                  ${hardwareTotal.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* ── Cost Breakdown ── */}
          <div className="mt-8 mb-6 text-sm font-medium text-white/80">Cost Breakdown</div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <FieldLabel
                label="Material Cost"
                help="This is calculated automatically from deck size and selected material type using your saved pricing settings."
              />
              <input
                value={form.material_cost}
                readOnly
                className="w-full rounded-lg border border-white/15 bg-[#0f172a] px-3 py-2 text-white/80"
              />
            </div>

            <div>
              <FieldLabel
                label="Labor Cost"
                help="This is calculated automatically from deck size, height tier, and stair count using your saved labor settings."
              />
              <input
                value={form.labor_cost}
                readOnly
                className="w-full rounded-lg border border-white/15 bg-[#0f172a] px-3 py-2 text-white/80"
              />
            </div>

            <div>
              <FieldLabel
                label="Permit Cost"
                help="Add any permit fees required for this job. If left blank, your saved default permit cost is used."
              />
              <input
                value={form.permit_cost}
                onChange={(e) => updateField("permit_cost", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>

            <div>
              <FieldLabel
                label="Equipment Cost"
                help="Add equipment-related costs like rentals, specialty tools, delivery equipment, or machinery."
              />
              <input
                value={form.equipment_cost}
                onChange={(e) => updateField("equipment_cost", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>

            <div>
              <FieldLabel
                label="Overhead Cost"
                help="Add any extra business overhead tied to the project, like admin time, travel, insurance, or project management."
              />
              <input
                value={form.overhead_cost}
                onChange={(e) => updateField("overhead_cost", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>

            <div>
              <FieldLabel
                label="Total Job Cost"
                help="This is the full internal cost of the project based on materials, labor, permits, equipment, overhead, add-ons, and hardware."
              />
              <input
                value={form.total_job_cost}
                readOnly
                className="w-full rounded-lg border border-white/15 bg-[#0f172a] px-3 py-2 text-white/80"
              />
            </div>
          </div>

          {/* ── Pricing ── */}
          <div className="mt-8 mb-6 text-sm font-medium text-white/80">Pricing</div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <FieldLabel
                label="Final Price"
                help="This is the client-facing quote total calculated from your internal costs and target margin."
              />
              <input
                value={form.final_price}
                readOnly
                className="w-full rounded-lg border border-white/15 bg-[#0f172a] px-3 py-2 text-white/80"
              />
            </div>

            <div>
              <FieldLabel
                label="Expected Profit"
                help="This is your projected internal profit after subtracting total job cost from final price."
              />
              <input
                value={form.expected_profit}
                readOnly
                className="w-full rounded-lg border border-white/15 bg-[#0f172a] px-3 py-2 text-white/80"
              />
            </div>

            <div>
              <FieldLabel
                label="Target Margin"
                help="Enter your desired profit margin as a decimal like 0.30 or as a whole number like 30."
              />
              <input
                value={form.target_margin}
                onChange={(e) => updateField("target_margin", e.target.value)}
                placeholder="0.30 or 30"
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>
          </div>

          <div className="mt-8">
            <FieldLabel
              label="Notes"
              help="Use notes for internal reminders, scope clarifications, special conditions, or anything important about the project."
            />
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