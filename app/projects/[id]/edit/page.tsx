"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

// ── Regional multipliers (matches settings page) ──────────────────────────
const REGION_MULTIPLIERS: Record<string, { material: number; labor: number }> = {
  national:   { material: 1.00, labor: 1.00 },
  pnw:        { material: 1.32, labor: 1.35 },
  northeast:  { material: 1.28, labor: 1.30 },
  california: { material: 1.35, labor: 1.38 },
  southeast:  { material: 0.88, labor: 0.85 },
  midwest:    { material: 0.90, labor: 0.88 },
  southwest:  { material: 0.95, labor: 0.93 },
};

// ── Job type definitions ──────────────────────────────────────────────────
const JOB_TYPES = [
  {
    value: "new_build",
    label: "New Build",
    description: "Full deck construction — framing, footings, surface, railing, stairs",
  },
  {
    value: "resurface",
    label: "Resurface",
    description: "Surface boards only on existing frame — no framing, footings, or structural labor",
  },
  {
    value: "railing_only",
    label: "Railing Only",
    description: "Railing materials and installation labor only",
  },
  {
    value: "repair",
    label: "Repair",
    description: "Custom line items only — all auto-calculations zeroed out",
  },
  {
    value: "addition",
    label: "Addition",
    description: "Partial framing (60%) plus full surface — extending an existing deck",
  },
];

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
  region: string;
};

type HardwareItem = {
  key: string;
  label: string;
  enabled: boolean;
  cost: string;
};

const DEFAULT_HARDWARE: HardwareItem[] = [
  { key: "fasteners_screws", label: "Fasteners / screws",  enabled: false, cost: "" },
  { key: "joist_hangers",    label: "Joist hangers",       enabled: false, cost: "" },
  { key: "post_bases",       label: "Post bases",          enabled: false, cost: "" },
  { key: "concrete_bags",    label: "Concrete / bags",     enabled: false, cost: "" },
  { key: "hurricane_ties",   label: "Hurricane ties",      enabled: false, cost: "" },
  { key: "lag_bolts",        label: "Lag bolts",           enabled: false, cost: "" },
  { key: "flashing",         label: "Flashing",            enabled: false, cost: "" },
  { key: "misc_hardware",    label: "Misc hardware",       enabled: false, cost: "" },
];

type FormState = {
  name: string;
  status: string;
  job_type: string;

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

function materialRate(type: string, settings: SettingsRow, region: string) {
  const mult = REGION_MULTIPLIERS[region]?.material ?? 1.0;
  let base = settings.pt_material_rate;
  switch (type) {
    case "pressure-treated": base = settings.pt_material_rate; break;
    case "trex":             base = settings.trex_material_rate; break;
    case "timbertech":       base = settings.timbertech_material_rate; break;
    case "pvc":              base = settings.pvc_material_rate; break;
  }
  return base * mult;
}

function laborMultiplier(heightTier: string) {
  if (heightTier === "raised") return 1.15;
  if (heightTier === "high")   return 1.3;
  return 1;
}

function calcHardwareTotal(items: HardwareItem[]): number {
  return items.reduce((sum, item) => {
    if (!item.enabled) return sum;
    const n = Number(item.cost);
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);
}

function calcCosts(
  form: FormState,
  settings: SettingsRow,
  hardwareItems: HardwareItem[]
) {
  const sqft   = Number(form.deck_sqft || 0);
  const region = settings.region ?? "national";
  const regionMult = REGION_MULTIPLIERS[region] ?? { material: 1, labor: 1 };
  const matRate = materialRate(form.material_type, settings, region);
  const laborBase = settings.labor_rate_per_sqft * regionMult.labor;
  const jobType = form.job_type || "new_build";

  let material = 0;
  let labor    = 0;

  if (jobType === "new_build") {
    material = sqft * matRate;
    labor    = sqft * laborBase * laborMultiplier(form.height_tier)
              + Number(form.stair_count || 0) * settings.stair_cost;
  } else if (jobType === "resurface") {
    // Surface boards only — no framing, footings, structural labor
    material = sqft * matRate;
    labor    = sqft * laborBase * 0.45; // Surface-only labor ~45% of full build
  } else if (jobType === "railing_only") {
    // Railing only — zero deck surface
    material = 0;
    labor    = 0;
    // Railing costs come through permit/equipment/overhead fields manually
  } else if (jobType === "repair") {
    // All auto-calc zeroed — contractor enters everything manually
    material = 0;
    labor    = 0;
  } else if (jobType === "addition") {
    // 60% framing cost + full surface
    material = sqft * matRate;
    labor    = sqft * laborBase * laborMultiplier(form.height_tier) * 0.60
              + Number(form.stair_count || 0) * settings.stair_cost;
  }

  const permit   = form.permit_cost.trim()    === "" ? settings.permit_default    : Number(form.permit_cost    || 0);
  const equipment= form.equipment_cost.trim() === "" ? settings.equipment_default : Number(form.equipment_cost || 0);
  const overhead = form.overhead_cost.trim()  === "" ? settings.overhead_default  : Number(form.overhead_cost  || 0);
  const lighting = form.lighting_enabled ? numOrZero(form.lighting_cost) : 0;
  const staining = form.staining_enabled ? numOrZero(form.staining_cost) : 0;
  const builtIns = form.built_ins_enabled ? numOrZero(form.built_ins_cost) : 0;
  const hardware = calcHardwareTotal(hardwareItems);

  const total = material + labor + permit + equipment + overhead + lighting + staining + builtIns + hardware;
  const margin = parseMarginInput(form.target_margin) ?? 0.3;
  const finalPrice = margin >= 1 ? total : total / (1 - margin);
  const profit = finalPrice - total;

  return { material, labor, permit, equipment, overhead, total, finalPrice, profit };
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
  const [saving, setSaving]   = useState(false);
  const [err, setErr]         = useState("");
  const [success, setSuccess] = useState("");

  const [settings, setSettings] = useState<SettingsRow>({
    labor_rate_per_sqft:      8,
    stair_cost:               250,
    permit_default:           0,
    equipment_default:        0,
    overhead_default:         0,
    pt_material_rate:         10,
    trex_material_rate:       18,
    timbertech_material_rate: 20,
    pvc_material_rate:        25,
    region:                   "national",
  });

  const [hardwareItems, setHardwareItems] = useState<HardwareItem[]>(DEFAULT_HARDWARE);

  const [form, setForm] = useState<FormState>({
    name:         "",
    status:       "open",
    job_type:     "new_build",
    deck_length:  "",
    deck_width:   "",
    deck_sqft:    "",
    height_tier:  "standard",
    material_type:"pressure-treated",
    railing_type: "none",
    stair_count:  "0",
    lighting_enabled: false,
    lighting_cost:    "0",
    staining_enabled: false,
    staining_cost:    "0",
    built_ins_enabled:    false,
    built_ins_cost:       "0",
    built_ins_description:"",
    material_cost:  "",
    labor_cost:     "",
    permit_cost:    "",
    equipment_cost: "",
    overhead_cost:  "",
    total_job_cost: "",
    final_price:    "",
    expected_profit:"",
    target_margin:  "0.30",
    client_name:    "",
    client_email:   "",
    client_phone:   "",
    site_address:   "",
    notes:          "",
  });

  // ── Load project + settings ──────────────────────────────────────────
  useEffect(() => {
    async function loadEverything() {
      setLoading(true);
      setErr("");

      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: sd } = await supabase
          .from("user_settings")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (sd) {
          setSettings({
            labor_rate_per_sqft:      Number(sd.labor_rate_per_sqft      ?? 8),
            stair_cost:               Number(sd.stair_cost               ?? 250),
            permit_default:           Number(sd.permit_default           ?? 0),
            equipment_default:        Number(sd.equipment_default        ?? 0),
            overhead_default:         Number(sd.overhead_default         ?? 0),
            pt_material_rate:         Number(sd.pt_material_rate         ?? 10),
            trex_material_rate:       Number(sd.trex_material_rate       ?? 18),
            timbertech_material_rate: Number(sd.timbertech_material_rate ?? 20),
            pvc_material_rate:        Number(sd.pvc_material_rate        ?? 25),
            region:                   sd.region ?? "national",
          });
        }
      }

      const { data, error } = await supabase
        .from("projects")
        .select(`
          id, name, status, job_type,
          deck_length, deck_width, deck_sqft,
          height_tier, material_type, railing_type, stair_count,
          lighting_enabled, lighting_cost,
          staining_enabled, staining_cost,
          built_ins_enabled, built_ins_cost, built_ins_description,
          hardware_items,
          material_cost, labor_cost, permit_cost, equipment_cost,
          overhead_cost, total_job_cost,
          final_price, expected_profit, target_margin,
          client_name, client_email, client_phone, site_address, notes
        `)
        .eq("id", id)
        .single();

      if (error || !data) {
        setErr(error?.message ?? "Could not load project");
        setLoading(false);
        return;
      }

      if (data.hardware_items && Array.isArray(data.hardware_items) && data.hardware_items.length > 0) {
        const saved = data.hardware_items as HardwareItem[];
        const merged = DEFAULT_HARDWARE.map((def) => {
          const found = saved.find((s) => s.key === def.key);
          return found ? { ...def, enabled: found.enabled, cost: found.cost ?? "" } : def;
        });
        setHardwareItems(merged);
      }

      setForm({
        name:          data.name    ?? "",
        status:        data.status  ?? "open",
        job_type:      data.job_type ?? "new_build",
        deck_length:   moneyString(data.deck_length),
        deck_width:    moneyString(data.deck_width),
        deck_sqft:     integerString(data.deck_sqft),
        height_tier:   data.height_tier   ?? "standard",
        material_type: data.material_type ?? "pressure-treated",
        railing_type:  data.railing_type  ?? "none",
        stair_count:   integerString(data.stair_count ?? 0),
        lighting_enabled: data.lighting_enabled ?? false,
        lighting_cost:    moneyString(data.lighting_cost ?? 0),
        staining_enabled: data.staining_enabled ?? false,
        staining_cost:    moneyString(data.staining_cost ?? 0),
        built_ins_enabled:    data.built_ins_enabled    ?? false,
        built_ins_cost:       moneyString(data.built_ins_cost ?? 0),
        built_ins_description:data.built_ins_description ?? "",
        material_cost:  moneyString(data.material_cost),
        labor_cost:     moneyString(data.labor_cost),
        permit_cost:    moneyString(data.permit_cost),
        equipment_cost: moneyString(data.equipment_cost),
        overhead_cost:  moneyString(data.overhead_cost),
        total_job_cost: moneyString(data.total_job_cost),
        final_price:    moneyString(data.final_price),
        expected_profit:moneyString(data.expected_profit),
        target_margin:  marginString(data.target_margin ?? 0.3),
        client_name:    data.client_name  ?? "",
        client_email:   data.client_email ?? "",
        client_phone:   data.client_phone ?? "",
        site_address:   data.site_address ?? "",
        notes:          data.notes        ?? "",
      });

      setLoading(false);
    }

    if (id) loadEverything();
  }, [id, supabase]);

  // ── Recalculate on any relevant change ───────────────────────────────
  useEffect(() => {
    const sqft = Number(form.deck_length || 0) * Number(form.deck_width || 0);

    setForm((prev) => {
      const updated = { ...prev, deck_sqft: String(Math.round(sqft)) };
      const costs = calcCosts(updated, settings, hardwareItems);
      return {
        ...updated,
        material_cost:  costs.material.toFixed(2),
        labor_cost:     costs.labor.toFixed(2),
        permit_cost:    costs.permit.toFixed(2),
        equipment_cost: costs.equipment.toFixed(2),
        overhead_cost:  costs.overhead.toFixed(2),
        total_job_cost: costs.total.toFixed(2),
        final_price:    costs.finalPrice.toFixed(2),
        expected_profit:costs.profit.toFixed(2),
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
    form.job_type,
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
  const selectedJobType = JOB_TYPES.find((j) => j.value === form.job_type) ?? JOB_TYPES[0];
  const regionKey = settings.region ?? "national";
  const regionMult = REGION_MULTIPLIERS[regionKey] ?? { material: 1, labor: 1 };

  // Which fields are editable vs auto-zeroed per job type
  const isRepair      = form.job_type === "repair";
  const isRailingOnly = form.job_type === "railing_only";
  const showStairs    = !isRepair && !isRailingOnly;
  const showDimensions= !isRepair && !isRailingOnly;

  async function handleSave() {
    setSaving(true);
    setErr("");
    setSuccess("");

    const payload = {
      name:   form.name   || "Untitled Quote",
      status: form.status || "open",
      job_type: form.job_type || "new_build",

      deck_length: numOrNull(form.deck_length),
      deck_width:  numOrNull(form.deck_width),
      deck_sqft:   Number(form.deck_sqft || 0),

      height_tier:   form.height_tier,
      material_type: form.material_type,
      railing_type:  form.railing_type,
      stair_count:   Number(form.stair_count || 0),

      lighting_enabled: form.lighting_enabled,
      lighting_cost:    form.lighting_enabled ? Number(form.lighting_cost || 0) : 0,
      staining_enabled: form.staining_enabled,
      staining_cost:    form.staining_enabled ? Number(form.staining_cost || 0) : 0,
      built_ins_enabled:    form.built_ins_enabled,
      built_ins_cost:       form.built_ins_enabled ? Number(form.built_ins_cost || 0) : 0,
      built_ins_description:form.built_ins_enabled ? form.built_ins_description || null : null,

      hardware_items: hardwareItems.map((item) => ({
        key:     item.key,
        label:   item.label,
        enabled: item.enabled,
        cost:    item.enabled ? item.cost : "",
      })),

      material_cost:  Number(form.material_cost  || 0),
      labor_cost:     Number(form.labor_cost      || 0),
      permit_cost:    Number(form.permit_cost     || 0),
      equipment_cost: Number(form.equipment_cost  || 0),
      overhead_cost:  Number(form.overhead_cost   || 0),
      total_job_cost: Number(form.total_job_cost  || 0),

      final_price:     Number(form.final_price     || 0),
      expected_profit: Number(form.expected_profit || 0),
      target_margin:   parseMarginInput(form.target_margin) ?? 0.3,

      client_name:  form.client_name  || null,
      client_email: form.client_email || null,
      client_phone: form.client_phone || null,
      site_address: form.site_address || null,
      notes:        form.notes        || null,

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

        {/* ── Header ── */}
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
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{err}</div>
        ) : null}
        {success ? (
          <div className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{success}</div>
        ) : null}

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">

          {/* ── Job Type ── */}
          <div className="mb-6 text-sm font-medium text-white/80">Job Type</div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {JOB_TYPES.map((jt) => (
              <button
                key={jt.value}
                type="button"
                onClick={() => updateField("job_type", jt.value)}
                className={`rounded-xl border p-3 text-left transition-all ${
                  form.job_type === jt.value
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-white/10 bg-[#111827] hover:border-white/20"
                }`}
              >
                <div className={`text-sm font-medium ${form.job_type === jt.value ? "text-blue-400" : "text-white"}`}>
                  {jt.label}
                </div>
                <div className="mt-1 text-xs text-white/40 leading-snug">{jt.description}</div>
              </button>
            ))}
          </div>

          {/* Job type info banner */}
          <div className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
            form.job_type === "new_build"     ? "border-blue-500/20 bg-blue-500/5 text-blue-300" :
            form.job_type === "resurface"     ? "border-amber-500/20 bg-amber-500/5 text-amber-300" :
            form.job_type === "railing_only"  ? "border-purple-500/20 bg-purple-500/5 text-purple-300" :
            form.job_type === "repair"        ? "border-red-500/20 bg-red-500/5 text-red-300" :
                                                "border-emerald-500/20 bg-emerald-500/5 text-emerald-300"
          }`}>
            <span className="font-medium">{selectedJobType.label}:</span>{" "}
            {form.job_type === "new_build"    && "Full calculation active — all fields apply."}
            {form.job_type === "resurface"    && "Framing, footings, and structural labor zeroed out. Surface materials and labor only. Add permit, equipment, and overhead manually if needed."}
            {form.job_type === "railing_only" && "Deck surface calculation zeroed. Use permit and equipment fields to enter railing material and labor costs."}
            {form.job_type === "repair"       && "All auto-calculations zeroed. Enter all costs manually in permit, equipment, and overhead fields."}
            {form.job_type === "addition"     && "60% framing credit applied — partial structural build on existing deck. Full surface calculation active."}
          </div>

          {/* Regional multiplier badge */}
          {regionKey !== "national" && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/60">
              <span>Regional pricing active:</span>
              <span className="font-medium text-white/80">
                {regionKey.charAt(0).toUpperCase() + regionKey.slice(1)}
              </span>
              <span>— materials ×{regionMult.material.toFixed(2)}, labor ×{regionMult.labor.toFixed(2)}</span>
            </div>
          )}

          {/* ── Project & Client ── */}
          <div className="mt-8 mb-6 text-sm font-medium text-white/80">Project & Client</div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <FieldLabel label="Quote Name" help="The internal name of the quote or project." />
              <input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>
            <div>
              <FieldLabel label="Status" help="Track where this quote is in your sales process." />
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
              <FieldLabel label="Client Name" help="The homeowner or customer name this proposal is for." />
              <input
                value={form.client_name}
                onChange={(e) => updateField("client_name", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>
            <div>
              <FieldLabel label="Client Phone" help="Client's best contact number." />
              <input
                value={form.client_phone}
                onChange={(e) => updateField("client_phone", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>
            <div>
              <FieldLabel label="Client Email" help="Client's email for proposal delivery." />
              <input
                value={form.client_email}
                onChange={(e) => updateField("client_email", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>
            <div>
              <FieldLabel label="Site Address" help="The job site where the deck will be built." />
              <input
                value={form.site_address}
                onChange={(e) => updateField("site_address", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>
          </div>

          {/* ── Deck Size ── */}
          {showDimensions && (
            <>
              <div className="mt-8 mb-6 text-sm font-medium text-white/80">Deck Size</div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <FieldLabel label="Deck Length (ft)" help="Full length of the deck in feet." />
                  <input
                    value={form.deck_length}
                    onChange={(e) => updateField("deck_length", e.target.value)}
                    className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
                  />
                </div>
                <div>
                  <FieldLabel label="Deck Width (ft)" help="Full width of the deck in feet." />
                  <input
                    value={form.deck_width}
                    onChange={(e) => updateField("deck_width", e.target.value)}
                    className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
                  />
                </div>
                <div>
                  <FieldLabel label="Deck Square Feet" help="Auto-calculated from length × width." />
                  <input
                    value={form.deck_sqft}
                    readOnly
                    className="w-full rounded-lg border border-white/15 bg-[#0f172a] px-3 py-2 text-white/80"
                  />
                </div>
              </div>
            </>
          )}

          {/* ── Deck Build Inputs ── */}
          {!isRepair && !isRailingOnly && (
            <>
              <div className="mt-8 mb-6 text-sm font-medium text-white/80">Deck Build Inputs</div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel label="Height Tier" help="Standard for low decks, raised for mid-height, high for elevated builds." />
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
                  <FieldLabel label="Material Type" help="Main decking material — changes the material rate used." />
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
                  <FieldLabel label="Railing Type" help="Railing style for the project." />
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
                {showStairs && (
                  <div>
                    <FieldLabel label="Stair Count" help="Number of stair sections in the build." />
                    <input
                      value={form.stair_count}
                      onChange={(e) => updateField("stair_count", e.target.value)}
                      className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {/* Railing only — railing type selector */}
          {isRailingOnly && (
            <>
              <div className="mt-8 mb-6 text-sm font-medium text-white/80">Railing Specs</div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel label="Railing Type" help="Select the railing style being installed." />
                  <select
                    value={form.railing_type}
                    onChange={(e) => updateField("railing_type", e.target.value)}
                    className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
                  >
                    <option value="wood">wood</option>
                    <option value="composite">composite</option>
                    <option value="metal">metal</option>
                  </select>
                </div>
              </div>
            </>
          )}

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
                <FieldHelp text="Post lights, stair lights, transformers, or any deck lighting package." />
              </label>
              {form.lighting_enabled && (
                <div className="mt-3">
                  <FieldLabel label="Lighting Cost" help="Total cost allowance for deck lighting." />
                  <input
                    value={form.lighting_cost}
                    onChange={(e) => updateField("lighting_cost", e.target.value)}
                    className="w-full rounded-lg border border-white/15 bg-[#0b1220] px-3 py-2"
                    placeholder="0.00"
                  />
                </div>
              )}
            </div>

            <div className="rounded-xl border border-white/10 bg-[#111827] p-4">
              <label className="flex items-center gap-3 text-sm font-medium text-white">
                <input
                  type="checkbox"
                  checked={form.staining_enabled}
                  onChange={(e) => updateField("staining_enabled", e.target.checked)}
                />
                <span>Staining / Sealing</span>
                <FieldHelp text="Professional staining or sealing, usually for natural wood decks." />
              </label>
              {form.staining_enabled && (
                <div className="mt-3">
                  <FieldLabel label="Staining Cost" help="Total staining or sealing cost." />
                  <input
                    value={form.staining_cost}
                    onChange={(e) => updateField("staining_cost", e.target.value)}
                    className="w-full rounded-lg border border-white/15 bg-[#0b1220] px-3 py-2"
                    placeholder="0.00"
                  />
                </div>
              )}
            </div>

            <div className="rounded-xl border border-white/10 bg-[#111827] p-4">
              <label className="flex items-center gap-3 text-sm font-medium text-white">
                <input
                  type="checkbox"
                  checked={form.built_ins_enabled}
                  onChange={(e) => updateField("built_ins_enabled", e.target.checked)}
                />
                <span>Built-ins</span>
                <FieldHelp text="Benches, planters, pergolas, privacy walls, or other custom integrated features." />
              </label>
              {form.built_ins_enabled && (
                <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <FieldLabel label="Built-ins Description" help="Describe the feature, like bench seating or pergola." />
                    <input
                      value={form.built_ins_description}
                      onChange={(e) => updateField("built_ins_description", e.target.value)}
                      className="w-full rounded-lg border border-white/15 bg-[#0b1220] px-3 py-2"
                      placeholder="Bench seating, pergola, planter boxes..."
                    />
                  </div>
                  <div>
                    <FieldLabel label="Built-ins Cost" help="Total cost allowance for all built-in features." />
                    <input
                      value={form.built_ins_cost}
                      onChange={(e) => updateField("built_ins_cost", e.target.value)}
                      className="w-full rounded-lg border border-white/15 bg-[#0b1220] px-3 py-2"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              )}
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
              Check each item that applies. Total is added to your job cost automatically.
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
                  {item.enabled && (
                    <div className="mt-2">
                      <FieldLabel label="Cost ($)" help={`Enter the cost for ${item.label} on this project.`} />
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
                  )}
                </div>
              ))}
            </div>
            {hardwareTotal > 0 && (
              <div className="mt-4 flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
                <span className="text-sm text-white/70">Hardware subtotal</span>
                <span className="text-sm font-semibold text-emerald-400">${hardwareTotal.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* ── Cost Breakdown ── */}
          <div className="mt-8 mb-6 text-sm font-medium text-white/80">Cost Breakdown</div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <FieldLabel
                label="Material Cost"
                help="Auto-calculated from deck size, material type, and your regional multiplier."
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
                help="Auto-calculated from deck size, height tier, stair count, and your regional labor multiplier."
              />
              <input
                value={form.labor_cost}
                readOnly
                className="w-full rounded-lg border border-white/15 bg-[#0f172a] px-3 py-2 text-white/80"
              />
            </div>
            <div>
              <FieldLabel label="Permit Cost" help="Permit fees for this job. Blank uses your default." />
              <input
                value={form.permit_cost}
                onChange={(e) => updateField("permit_cost", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>
            <div>
              <FieldLabel label="Equipment Cost" help="Rentals, specialty tools, delivery equipment." />
              <input
                value={form.equipment_cost}
                onChange={(e) => updateField("equipment_cost", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>
            <div>
              <FieldLabel label="Overhead Cost" help="Admin time, travel, insurance, project management." />
              <input
                value={form.overhead_cost}
                onChange={(e) => updateField("overhead_cost", e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>
            <div>
              <FieldLabel label="Total Job Cost" help="Full internal cost — materials, labor, permits, equipment, overhead, add-ons, and hardware." />
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
              <FieldLabel label="Final Price" help="Client-facing total based on your costs and target margin." />
              <input
                value={form.final_price}
                readOnly
                className="w-full rounded-lg border border-white/15 bg-[#0f172a] px-3 py-2 text-white/80"
              />
            </div>
            <div>
              <FieldLabel label="Expected Profit" help="Projected profit after subtracting total job cost from final price." />
              <input
                value={form.expected_profit}
                readOnly
                className="w-full rounded-lg border border-white/15 bg-[#0f172a] px-3 py-2 text-white/80"
              />
            </div>
            <div>
              <FieldLabel label="Target Margin" help="Enter your desired margin as 0.30 or 30." />
              <input
                value={form.target_margin}
                onChange={(e) => updateField("target_margin", e.target.value)}
                placeholder="0.30 or 30"
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>
          </div>

          <div className="mt-8">
            <FieldLabel label="Notes" help="Internal reminders, scope clarifications, or special conditions." />
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