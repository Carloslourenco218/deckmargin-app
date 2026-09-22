"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { checkGuardrails, approvalStatusFromGuardrail } from "@/lib/org/guardrails";

const REGION_MULTIPLIERS: Record<string, { material: number; labor: number }> = {
  national:   { material: 1.00, labor: 1.00 },
  pnw:        { material: 1.32, labor: 1.35 },
  northeast:  { material: 1.28, labor: 1.30 },
  california: { material: 1.35, labor: 1.38 },
  southeast:  { material: 0.88, labor: 0.85 },
  midwest:    { material: 0.90, labor: 0.88 },
  southwest:  { material: 0.95, labor: 0.93 },
};

const REGION_LABELS: Record<string, string> = {
  national:   "National (no adjustment)",
  pnw:        "Pacific Northwest",
  northeast:  "Northeast",
  california: "California",
  southeast:  "Southeast",
  midwest:    "Midwest",
  southwest:  "Southwest",
};

const JOB_TYPES = [
  { value: "new_build",    label: "New Build",    description: "Full deck construction: framing, footings, surface, railing, stairs" },
  { value: "rebuild",      label: "Rebuild",      description: "Complete tear-down and replacement, includes demo, disposal, and full new build pricing" },
  { value: "resurface",    label: "Resurface",    description: "Surface boards only on existing frame, no framing, footings, or structural labor" },
  { value: "railing_only", label: "Railing Only", description: "Railing materials and installation labor only" },
  { value: "repair",       label: "Repair",       description: "Custom line items only, all auto-calculations zeroed out" },
  { value: "addition",     label: "Addition",     description: "Partial framing (60%) plus full surface, extending an existing deck" },
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
  tax_rate: number;
  tax_applies_to: string;
  dumpster_default: number;
  permit_building_default: number;
  permit_septic_default: number;
  permit_electrical_default: number;
  permit_engineering_default: number;
  permit_hoa_default: number;
  // Phase 4 additions
  waste_factor: number;
  auto_hardware: boolean;
  crew_size: number;
  crew_hourly_rate: number;
  concrete_bag_price: number;
  joist_hanger_price: number;
  post_base_price: number;
  hurricane_tie_price: number;
  lag_bolt_price: number;
  proposal_expiry_days: number;
};

type HardwareItem = { key: string; label: string; enabled: boolean; cost: string };

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

const PERMIT_TYPES = [
  { key: "building",    label: "Building Permit",                   defaultKey: "permit_building_default" },
  { key: "septic",      label: "Septic Permit",                     defaultKey: "permit_septic_default" },
  { key: "electrical",  label: "Electrical Permit",                defaultKey: "permit_electrical_default" },
  { key: "engineering", label: "Engineering / Structural Drawings", defaultKey: "permit_engineering_default" },
  { key: "hoa",         label: "HOA Approval Fee",                  defaultKey: "permit_hoa_default" },
] as const;

type PermitKey = typeof PERMIT_TYPES[number]["key"];
type PermitState = Record<PermitKey, { enabled: boolean; cost: string }>;

function defaultPermits(): PermitState {
  return {
    building:    { enabled: false, cost: "" },
    septic:      { enabled: false, cost: "" },
    electrical:  { enabled: false, cost: "" },
    engineering: { enabled: false, cost: "" },
    hoa:         { enabled: false, cost: "" },
  };
}

type FormState = {
  name: string; status: string; job_type: string;
  deck_length: string; deck_width: string; deck_sqft: string;
  height_tier: string; material_type: string; railing_type: string;
  // Legacy stair field (kept for backward compat display / migration notice)
  stair_count: string;
  // P0: assembly-based stair fields
  staircase_count: string;   // number of stair flights
  riser_count: string;       // risers per flight (drives geometry)
  stair_width_ft: string;    // numeric stair width in feet
  stair_has_landing: boolean;
  // P0: per-project region
  project_region: string;
  lighting_enabled: boolean; lighting_cost: string;
  staining_enabled: boolean; staining_cost: string;
  built_ins_enabled: boolean; built_ins_cost: string; built_ins_description: string;
  dumpster_enabled: boolean; dumpster_cost: string;
  material_cost: string; labor_cost: string; permit_cost: string;
  equipment_cost: string; overhead_cost: string; total_job_cost: string;
  tax_rate: string; tax_applies_to: string; tax_amount: string;
  final_price: string; expected_profit: string; target_margin: string;
  client_name: string; client_email: string; client_phone: string;
  site_address: string; notes: string;
  railing_lf: string;
  proposal_expires_at: string;
};

// ── Stair assembly result ──────────────────────────────────────────────────
type StairAssemblyResult = {
  stringerCount: number;
  stringerLengthFt: number;
  treadSqft: number;
  materialCost: number;
  laborCrewHours: number;
  laborCost: number;
  phases: Array<{ phase: string; hours: number }>;
};

// ── Cost breakdown type (returned by calcCosts) ───────────────────────────
type CostBreakdown = {
  material: number; labor: number; permitTotal: number; equipment: number;
  overhead: number; tax: number; total: number; finalPrice: number; profit: number;
  deckMaterial: number; deckLabor: number;
  stairAssembly: StairAssemblyResult;
  regionMult: { material: number; labor: number };
  laborBase: number;
};

// ── Pure helpers ──────────────────────────────────────────────────────────
function numOrNull(v: string) { if (!v.trim()) return null; const n = Number(v); return Number.isFinite(n) ? n : null; }
function numOrZero(v: string) { const n = Number(v); return Number.isFinite(n) ? n : 0; }
function moneyString(v: any) { if (v === null || v === undefined || v === "") return ""; const n = Number(v); return Number.isFinite(n) ? n.toFixed(2) : ""; }
function integerString(v: any) { if (v === null || v === undefined || v === "") return ""; const n = Number(v); return Number.isFinite(n) ? String(Math.round(n)) : ""; }
function marginString(v: any) { if (v === null || v === undefined || v === "") return ""; const n = Number(v); return Number.isFinite(n) ? n.toFixed(2) : ""; }
function parseMarginInput(v: string) { if (!v.trim()) return null; const n = Number(v); if (!Number.isFinite(n)) return null; return n > 1 ? n / 100 : n; }

/** Parse "4ft", "4", "4.5" → 4 (or 4.5). Returns 4 as fallback. */
function parseStairWidthFt(v: string): number {
  const n = parseFloat(String(v).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n >= 2 ? n : 4;
}

/** Material rate for the given deck type, with regional multiplier applied.
 *  overrideRegion lets the project-level region override settings.region. */
function materialRate(type: string, s: SettingsRow, overrideRegion?: string): number {
  const regionKey = overrideRegion || s.region || "national";
  const mult = REGION_MULTIPLIERS[regionKey]?.material ?? 1.0;
  let base = s.pt_material_rate;
  if (type === "trex")        base = s.trex_material_rate;
  else if (type === "timbertech") base = s.timbertech_material_rate;
  else if (type === "pvc")    base = s.pvc_material_rate;
  return base * mult;
}

function laborMultiplier(tier: string) {
  if (tier === "raised") return 1.15;
  if (tier === "high")   return 1.30;
  return 1.0;
}

function calcHardwareTotal(items: HardwareItem[]) {
  return items.reduce((sum, i) => {
    if (!i.enabled) return sum;
    const n = Number(i.cost);
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);
}

function calcPermitTotal(permits: PermitState) {
  return (Object.values(permits) as { enabled: boolean; cost: string }[])
    .reduce((sum, p) => {
      if (!p.enabled) return sum;
      const n = Number(p.cost);
      return sum + (Number.isFinite(n) ? n : 0);
    }, 0);
}

function calcTax(material: number, labor: number, taxRate: number, taxAppliesTo: string): number {
  if (!taxRate) return 0;
  const rate = taxRate / 100;
  if (taxAppliesTo === "materials_only") return material * rate;
  if (taxAppliesTo === "labor_only")     return labor * rate;
  return (material + labor) * rate;
}

// ── P0: Assembly-based stair calculator ───────────────────────────────────
// Replaces the broken stair_count × stair_cost model.
// Derives material quantities (stringers, treads, hardware, concrete) and
// labor hours from geometry, producing a real assembly cost.
//
// Calibrated against industry benchmarks:
//   PT 4-riser 4' wide flight: ~7-9 elapsed crew-hours
//   Trex same: ~11-13 elapsed crew-hours (composite factor 1.5×)
function calcStairAssembly(
  staircaseCount: number,
  riserCount: number,
  stairWidthFt: number,
  hasLanding: boolean,
  materialType: string,
  settings: SettingsRow,
  projectRegion: string
): StairAssemblyResult {
  const zero: StairAssemblyResult = {
    stringerCount: 0, stringerLengthFt: 0, treadSqft: 0,
    materialCost: 0, laborCrewHours: 0, laborCost: 0, phases: [],
  };
  if (staircaseCount < 1 || riserCount < 1 || stairWidthFt < 2) return zero;

  // ── Geometry (IRC standard dimensions) ───────────────────────────────────
  const RISER_HEIGHT_IN = 7.5;  // IRC max 7.75", 7.5" is typical
  const TREAD_DEPTH_IN  = 10;   // IRC min 10" tread depth (nosing not included)
  const totalRiseIn = riserCount * RISER_HEIGHT_IN;
  const totalRunIn  = riserCount * TREAD_DEPTH_IN;
  // Stringer length = hypotenuse of rise and run
  const hypotFt = Math.sqrt(Math.pow(totalRiseIn / 12, 2) + Math.pow(totalRunIn / 12, 2));

  // ── Structural: stringers ─────────────────────────────────────────────────
  // 1 stringer per 24" of width, minimum 3 (IRC §R311.7.10.1)
  const stringerCount    = Math.max(3, Math.ceil(stairWidthFt / 2) + 1);
  const stringerLengthFt = Math.ceil(hypotFt * 1.1 * 10) / 10; // +10% waste/cuts

  // ── Material cost per flight ─────────────────────────────────────────────
  const treadSqft         = riserCount * stairWidthFt * (TREAD_DEPTH_IN / 12);
  const matRate           = materialRate(materialType, settings, projectRegion);
  const wasteFactor       = settings.waste_factor ?? 1.10;
  const treadMaterialCost = treadSqft * matRate * wasteFactor;

  // PT 2×12 stringers — always structural PT regardless of decking material
  const STRINGER_LF_COST     = 3.75;
  const stringerMaterialCost = stringerCount * stringerLengthFt * STRINGER_LF_COST;

  // Hardware: joist hanger for header, stair brackets, bolts (per flight)
  const hardwareCost = 150;

  // Footing: 2 bags per flight (standard concrete tube form)
  const concreteCost = 2 * (settings.concrete_bag_price ?? 8.50);

  // Landing (if applicable): deck material surface + framing hardware
  const landingSqft         = hasLanding ? stairWidthFt * stairWidthFt : 0;
  const landingMaterialCost = hasLanding
    ? landingSqft * matRate * wasteFactor + 80 // 80 = landing frame hardware
    : 0;

  const matPerFlight  = treadMaterialCost + stringerMaterialCost + hardwareCost + concreteCost + landingMaterialCost;
  const totalMaterial = Math.round(matPerFlight * staircaseCount * 100) / 100;

  // ── Labor hours per flight ────────────────────────────────────────────────
  // Composite/exotic materials require more precise cuts → 1.5× factor
  const isComposite     = ["trex", "timbertech", "pvc"].includes(materialType);
  const compositeFactor = isComposite ? 1.5 : 1.0;
  // Wider stairs = more tread installs (proportion to width vs 4ft baseline)
  const widthFactor     = stairWidthFt <= 4 ? 1.0 : stairWidthFt <= 5 ? 1.15 : 1.35;

  // Base hours for PT, 4ft-wide flight
  const setupHrs    = 0.5;                    // layout, stage materials
  const stringerHrs = stringerCount * 1.0;   // layout, cut, notch, fit — 1h each
  const framingHrs  = 1.5;                   // header attachment, blocking
  const footingHrs  = hasLanding ? 3.0 : 1.0; // dig/form/pour/brace; landing = more
  const treadHrs    = riserCount * 0.30;     // cut, fit, fasten — 0.3h each
  const cleanupHrs  = 0.25;

  const basePerFlight = setupHrs + stringerHrs + framingHrs + footingHrs + treadHrs + cleanupHrs;
  const hrsPerFlight  = basePerFlight * compositeFactor * widthFactor;
  const totalCrewHrs  = Math.round(hrsPerFlight * staircaseCount * 10) / 10;

  // Labor cost = elapsed crew-hours × per-person rate × crew size
  const crewAllInRate = (settings.crew_hourly_rate ?? 65) * (settings.crew_size ?? 2);
  const laborCost     = Math.round(totalCrewHrs * crewAllInRate * 100) / 100;

  // Phase breakdown (for informational display)
  const cf = compositeFactor * widthFactor * staircaseCount;
  const phases: Array<{ phase: string; hours: number }> = [
    { phase: "Stair setup",      hours: Math.round(setupHrs    * cf * 10) / 10 },
    { phase: "Stringer fab",     hours: Math.round(stringerHrs * cf * 10) / 10 },
    { phase: "Framing / header", hours: Math.round(framingHrs  * cf * 10) / 10 },
    { phase: "Footing",          hours: Math.round(footingHrs  * cf * 10) / 10 },
    { phase: "Treads",           hours: Math.round(treadHrs    * cf * 10) / 10 },
    { phase: "Cleanup",          hours: Math.round(cleanupHrs  * cf * 10) / 10 },
  ];

  return {
    stringerCount,
    stringerLengthFt,
    treadSqft: Math.round(treadSqft * 10) / 10,
    materialCost:   totalMaterial,
    laborCrewHours: totalCrewHrs,
    laborCost,
    phases,
  };
}

// ── Auto-hardware calculation from geometry ────────────────────────────────
function autoCalcHardware(
  sqft: number, length: number, width: number,
  isAttached: boolean, settings: SettingsRow
): HardwareItem[] {
  if (!sqft || sqft < 1 || !length || !width) return DEFAULT_HARDWARE;
  const joist_spacing_in   = 16;
  const joist_count        = Math.ceil((width * 12) / joist_spacing_in) + 1;
  const posts_along_length = Math.ceil(length / 8) + 1;
  const beam_rows          = Math.ceil(width / 8) + 1;
  const post_count         = posts_along_length * beam_rows;
  const concrete_bags      = post_count * 2;
  const joist_hangers      = joist_count * 2;
  const hurricane_ties     = joist_count * 2;
  const post_bases         = post_count;
  const lag_bolts          = isAttached ? Math.ceil(length / 1.5) : 0;
  const fastener_cost      = Math.round(sqft * 0.35);
  const flashing_lf        = isAttached ? Math.round(length) : 0;
  return [
    { key: "fasteners_screws", label: "Fasteners / screws",                     enabled: true,       cost: String(fastener_cost) },
    { key: "joist_hangers",    label: `Joist hangers (${joist_hangers}× qty)`,  enabled: true,       cost: String(Math.round(joist_hangers  * (settings.joist_hanger_price  ?? 1.75))) },
    { key: "post_bases",       label: `Post bases (${post_bases}× qty)`,         enabled: true,       cost: String(Math.round(post_bases     * (settings.post_base_price     ?? 12))) },
    { key: "concrete_bags",    label: `Concrete bags (${concrete_bags}× 80lb)`,  enabled: true,       cost: String(Math.round(concrete_bags  * (settings.concrete_bag_price  ?? 8.50))) },
    { key: "hurricane_ties",   label: `Hurricane ties (${hurricane_ties}× qty)`, enabled: true,       cost: String(Math.round(hurricane_ties * (settings.hurricane_tie_price ?? 2.50))) },
    { key: "lag_bolts",        label: `Lag bolts (${isAttached ? lag_bolts : "N/A freestanding"})`, enabled: isAttached, cost: String(Math.round(lag_bolts * (settings.lag_bolt_price ?? 0.75))) },
    { key: "flashing",         label: `Flashing (${flashing_lf} LF)`,            enabled: isAttached, cost: String(Math.round(flashing_lf * 3.50)) },
    { key: "misc_hardware",    label: "Misc hardware",                           enabled: true,       cost: String(Math.round(sqft * 0.50)) },
  ];
}

// ── Deck labor phase breakdown (informational, does not drive cost) ────────
function deckLaborPhases(
  sqft: number, length: number, width: number,
  railingLf: number, jobType: string
): Array<{ phase: string; hours: number }> {
  if (!sqft || sqft < 1) return [];
  const postCount = (Math.ceil(length / 8) + 1) * (Math.ceil(width / 8) + 1);
  if (jobType === "resurface") {
    return [
      { phase: "Surface removal", hours: Math.round(sqft * 0.015 * 10) / 10 },
      { phase: "Decking",         hours: Math.round(sqft * 0.04  * 10) / 10 },
      { phase: "Cleanup",         hours: Math.round(sqft * 0.008 * 10) / 10 },
    ];
  }
  const isDemo = jobType === "rebuild";
  return [
    { phase: "Site prep",     hours: Math.round(sqft * 0.008 * 10) / 10 },
    ...(isDemo ? [{ phase: "Demo / removal", hours: Math.round(sqft * 0.025 * 10) / 10 }] : []),
    { phase: "Footings",      hours: Math.round(postCount * 1.5  * 10) / 10 },
    { phase: "Framing",       hours: Math.round(sqft * 0.05  * 10) / 10 },
    { phase: "Decking",       hours: Math.round(sqft * 0.04  * 10) / 10 },
    ...(railingLf > 0 ? [{ phase: "Railing", hours: Math.round(railingLf * 0.2 * 10) / 10 }] : []),
    { phase: "Cleanup",       hours: Math.round(sqft * 0.008 * 10) / 10 },
  ];
}

// ── Main cost calculator ───────────────────────────────────────────────────
function calcCosts(
  form: FormState,
  settings: SettingsRow,
  hardwareItems: HardwareItem[],
  permits: PermitState
): CostBreakdown {
  const sqft = Number(form.deck_sqft || 0);

  // Project-level region: form.project_region overrides settings.region
  const projectRegion = form.project_region || settings.region || "national";
  const regionMult    = REGION_MULTIPLIERS[projectRegion] ?? { material: 1, labor: 1 };

  const matRate     = materialRate(form.material_type, settings, projectRegion);
  const wasteFactor = settings.waste_factor ?? 1.10;
  const laborBase   = settings.labor_rate_per_sqft * regionMult.labor;
  const jobType     = form.job_type || "new_build";

  // ── P0: assembly-based stair cost ────────────────────────────────────────
  const stairWidthFt  = parseStairWidthFt(form.stair_width_ft || "4");
  const stairAssembly = calcStairAssembly(
    Number(form.staircase_count || 0),
    Number(form.riser_count     || 0),
    stairWidthFt,
    form.stair_has_landing || false,
    form.material_type,
    settings,
    projectRegion
  );

  // ── Deck material & labor ($/SF model) ───────────────────────────────────
  let deckMaterial = 0, deckLabor = 0;
  if (jobType === "new_build" || jobType === "rebuild") {
    deckMaterial = sqft * matRate * wasteFactor;
    const demoSurcharge = jobType === "rebuild" ? sqft * laborBase * 0.25 : 0;
    deckLabor = sqft * laborBase * laborMultiplier(form.height_tier) + demoSurcharge;
  } else if (jobType === "resurface") {
    deckMaterial = sqft * matRate * wasteFactor;
    deckLabor    = sqft * laborBase * 0.45;
  } else if (jobType === "addition") {
    deckMaterial = sqft * matRate * wasteFactor;
    deckLabor    = sqft * laborBase * laborMultiplier(form.height_tier) * 0.60;
  }

  const material = deckMaterial + stairAssembly.materialCost;
  const labor    = deckLabor    + stairAssembly.laborCost;

  const equipment   = form.equipment_cost.trim() === "" ? settings.equipment_default : Number(form.equipment_cost || 0);
  const overhead    = form.overhead_cost.trim()  === "" ? settings.overhead_default  : Number(form.overhead_cost  || 0);
  const lighting    = form.lighting_enabled  ? numOrZero(form.lighting_cost)  : 0;
  const staining    = form.staining_enabled  ? numOrZero(form.staining_cost)  : 0;
  const builtIns    = form.built_ins_enabled ? numOrZero(form.built_ins_cost) : 0;
  const dumpster    = form.dumpster_enabled  ? numOrZero(form.dumpster_cost)  : 0;
  const hardware    = calcHardwareTotal(hardwareItems);
  const permitTotal = calcPermitTotal(permits);

  const taxRate      = Number(form.tax_rate || 0);
  const taxAppliesTo = form.tax_applies_to || "materials_and_labor";
  const tax = calcTax(material, labor, taxRate, taxAppliesTo);

  const total      = material + labor + permitTotal + equipment + overhead + lighting + staining + builtIns + dumpster + hardware + tax;
  const margin     = parseMarginInput(form.target_margin) ?? 0.3;
  const finalPrice = margin >= 1 ? total : total / (1 - margin);
  const profit     = finalPrice - total;

  return {
    material, labor, permitTotal, equipment, overhead, tax, total, finalPrice, profit,
    deckMaterial, deckLabor, stairAssembly, regionMult, laborBase,
  };
}

// ── UI helpers ─────────────────────────────────────────────────────────────
function FieldHelp({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button" tabIndex={0}
        className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/20 text-[11px] font-semibold text-white/70 hover:bg-white/10 hover:text-white"
        aria-label="Field help"
      >?</button>
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

// ── Page component ─────────────────────────────────────────────────────────
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
    labor_rate_per_sqft: 8, stair_cost: 250, permit_default: 0,
    equipment_default: 0, overhead_default: 0,
    pt_material_rate: 10, trex_material_rate: 18, timbertech_material_rate: 20, pvc_material_rate: 25,
    region: "national", tax_rate: 0, tax_applies_to: "materials_and_labor",
    dumpster_default: 0, permit_building_default: 0, permit_septic_default: 0,
    permit_electrical_default: 0, permit_engineering_default: 0, permit_hoa_default: 0,
    waste_factor: 1.10, auto_hardware: false,
    crew_size: 2, crew_hourly_rate: 65,
    concrete_bag_price: 8.50, joist_hanger_price: 1.75, post_base_price: 12.00,
    hurricane_tie_price: 2.50, lag_bolt_price: 0.75,
    proposal_expiry_days: 30,
  });

  const [hardwareItems, setHardwareItems] = useState<HardwareItem[]>(DEFAULT_HARDWARE);
  const [permits, setPermits]             = useState<PermitState>(defaultPermits());
  const settingsRef = useRef<SettingsRow | null>(null);

  const [form, setForm] = useState<FormState>({
    name: "", status: "ready_to_send", job_type: "new_build",
    deck_length: "", deck_width: "", deck_sqft: "",
    height_tier: "standard", material_type: "pressure-treated", railing_type: "none",
    stair_count: "0",
    staircase_count: "0", riser_count: "0", stair_width_ft: "4", stair_has_landing: false,
    project_region: "",
    lighting_enabled: false, lighting_cost: "0",
    staining_enabled: false, staining_cost: "0",
    built_ins_enabled: false, built_ins_cost: "0", built_ins_description: "",
    dumpster_enabled: false, dumpster_cost: "0",
    material_cost: "", labor_cost: "", permit_cost: "",
    equipment_cost: "", overhead_cost: "", total_job_cost: "",
    tax_rate: "0", tax_applies_to: "materials_and_labor", tax_amount: "0",
    final_price: "", expected_profit: "", target_margin: "0.30",
    client_name: "", client_email: "", client_phone: "", site_address: "", notes: "",
    railing_lf: "",
    proposal_expires_at: "",
  });

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadEverything() {
      setLoading(true);
      setErr("");
      const { data: { user } } = await supabase.auth.getUser();

      let sd: any = null;
      if (user) {
        const { data: sdData } = await supabase
          .from("user_settings")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        sd = sdData;
        if (sd) {
          const s: SettingsRow = {
            labor_rate_per_sqft:        Number(sd.labor_rate_per_sqft       ?? 8),
            stair_cost:                 Number(sd.stair_cost                ?? 250),
            permit_default:             Number(sd.permit_default            ?? 0),
            equipment_default:          Number(sd.equipment_default         ?? 0),
            overhead_default:           Number(sd.overhead_default          ?? 0),
            pt_material_rate:           Number(sd.pt_material_rate          ?? 10),
            trex_material_rate:         Number(sd.trex_material_rate        ?? 18),
            timbertech_material_rate:   Number(sd.timbertech_material_rate  ?? 20),
            pvc_material_rate:          Number(sd.pvc_material_rate         ?? 25),
            region:                     sd.region                           ?? "national",
            tax_rate:                   Number(sd.tax_rate                  ?? 0),
            tax_applies_to:             sd.tax_applies_to                   ?? "materials_and_labor",
            dumpster_default:           Number(sd.dumpster_default          ?? 0),
            permit_building_default:    Number(sd.permit_building_default   ?? 0),
            permit_septic_default:      Number(sd.permit_septic_default     ?? 0),
            permit_electrical_default:  Number(sd.permit_electrical_default ?? 0),
            permit_engineering_default: Number(sd.permit_engineering_default?? 0),
            permit_hoa_default:         Number(sd.permit_hoa_default        ?? 0),
            waste_factor:         Number(sd.waste_factor         ?? 1.10),
            auto_hardware:        Boolean(sd.auto_hardware        ?? false),
            crew_size:            Number(sd.crew_size            ?? 2),
            crew_hourly_rate:     Number(sd.crew_hourly_rate     ?? 65),
            concrete_bag_price:   Number(sd.concrete_bag_price   ?? 8.50),
            joist_hanger_price:   Number(sd.joist_hanger_price   ?? 1.75),
            post_base_price:      Number(sd.post_base_price      ?? 12.00),
            hurricane_tie_price:  Number(sd.hurricane_tie_price  ?? 2.50),
            lag_bolt_price:       Number(sd.lag_bolt_price       ?? 0.75),
            proposal_expiry_days: Number(sd.proposal_expiry_days ?? 30),
          };
          setSettings(s);
          settingsRef.current = s;
        }
      }

      const { data, error } = await supabase
        .from("projects")
        .select(`
          id, name, status, job_type,
          deck_length, deck_width, deck_sqft,
          height_tier, material_type, railing_type,
          stair_count, staircase_count, riser_count,
          stair_width, has_landing,
          project_region,
          lighting_enabled, lighting_cost,
          staining_enabled, staining_cost,
          built_ins_enabled, built_ins_cost, built_ins_description,
          dumpster_enabled, dumpster_cost,
          hardware_items,
          material_cost, labor_cost, permit_cost, equipment_cost,
          overhead_cost, total_job_cost,
          tax_rate, tax_applies_to, tax_amount,
          final_price, expected_profit, target_margin,
          permit_building_enabled, permit_building_cost,
          permit_septic_enabled, permit_septic_cost,
          permit_electrical_enabled, permit_electrical_cost,
          permit_engineering_enabled, permit_engineering_cost,
          permit_hoa_enabled, permit_hoa_cost,
          client_name, client_email, client_phone, site_address, notes,
          railing_lf, proposal_expires_at
        `)
        .eq("id", id)
        .single();

      if (error || !data) {
        setErr(error?.message ?? "Could not load project");
        setLoading(false);
        return;
      }

      // Hardware
      if (data.hardware_items && Array.isArray(data.hardware_items) && data.hardware_items.length > 0) {
        const saved = data.hardware_items as HardwareItem[];
        setHardwareItems(DEFAULT_HARDWARE.map((def) => {
          const f = saved.find((s) => s.key === def.key);
          return f ? { ...def, enabled: f.enabled, cost: f.cost ?? "" } : def;
        }));
      }

      // Permits
      setPermits({
        building:    { enabled: data.permit_building_enabled    ?? false, cost: moneyString(data.permit_building_cost)    },
        septic:      { enabled: data.permit_septic_enabled      ?? false, cost: moneyString(data.permit_septic_cost)      },
        electrical:  { enabled: data.permit_electrical_enabled  ?? false, cost: moneyString(data.permit_electrical_cost)  },
        engineering: { enabled: data.permit_engineering_enabled ?? false, cost: moneyString(data.permit_engineering_cost) },
        hoa:         { enabled: data.permit_hoa_enabled         ?? false, cost: moneyString(data.permit_hoa_cost)         },
      });

      // Parse stair_width from "4ft" / "4.5ft" / "4" → numeric string
      const stairWidthFtStr = String(parseStairWidthFt(data.stair_width ?? "4"));

      setForm({
        name:          data.name    ?? "",
        status:        data.status === "open" ? "ready_to_send" : (data.status ?? "ready_to_send"),
        job_type:      data.job_type ?? "new_build",
        deck_length:   moneyString(data.deck_length),
        deck_width:    moneyString(data.deck_width),
        deck_sqft:     integerString(data.deck_sqft),
        height_tier:   data.height_tier   ?? "standard",
        material_type: data.material_type ?? "pressure-treated",
        railing_type:  data.railing_type  ?? "none",
        stair_count:   integerString(data.stair_count ?? 0),
        // P0: new assembly fields
        staircase_count:  integerString(data.staircase_count ?? 0),
        riser_count:      integerString(data.riser_count ?? 0),
        stair_width_ft:   stairWidthFtStr,
        stair_has_landing: Boolean(data.has_landing ?? false),
        project_region:   data.project_region ?? "",
        lighting_enabled: data.lighting_enabled ?? false,
        lighting_cost:    moneyString(data.lighting_cost ?? 0),
        staining_enabled: data.staining_enabled ?? false,
        staining_cost:    moneyString(data.staining_cost ?? 0),
        built_ins_enabled:     data.built_ins_enabled     ?? false,
        built_ins_cost:        moneyString(data.built_ins_cost ?? 0),
        built_ins_description: data.built_ins_description ?? "",
        dumpster_enabled: data.dumpster_enabled ?? false,
        dumpster_cost:    moneyString(data.dumpster_cost ?? 0),
        material_cost:  moneyString(data.material_cost),
        labor_cost:     moneyString(data.labor_cost),
        permit_cost:    moneyString(data.permit_cost),
        equipment_cost: moneyString(data.equipment_cost),
        overhead_cost:  moneyString(data.overhead_cost),
        total_job_cost: moneyString(data.total_job_cost),
        tax_rate:       String(data.tax_rate != null && data.tax_rate !== 0 ? data.tax_rate : (sd?.tax_rate ?? 0)),
        tax_applies_to: data.tax_applies_to ?? sd?.tax_applies_to ?? "materials_and_labor",
        tax_amount:     moneyString(data.tax_amount ?? 0),
        final_price:    moneyString(data.final_price),
        expected_profit:moneyString(data.expected_profit),
        target_margin:  marginString(data.target_margin ?? 0.3),
        client_name:    data.client_name  ?? "",
        client_email:   data.client_email ?? "",
        client_phone:   data.client_phone ?? "",
        site_address:   data.site_address ?? "",
        notes:          data.notes        ?? "",
        railing_lf:     integerString(data.railing_lf ?? ""),
        proposal_expires_at: data.proposal_expires_at
          ? new Date(data.proposal_expires_at).toISOString().slice(0, 10)
          : "",
      });

      setLoading(false);
    }
    if (id) loadEverything();
  }, [id, supabase]);

  // ── Auto-hardware ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!settings.auto_hardware) return;
    const sqft = Number(form.deck_length || 0) * Number(form.deck_width || 0);
    if (!sqft) return;
    const computed = autoCalcHardware(
      sqft, Number(form.deck_length || 0), Number(form.deck_width || 0),
      true, settings
    );
    setHardwareItems(computed);
  }, [form.deck_length, form.deck_width, settings]);

  // ── Recalculate costs whenever inputs change ───────────────────────────────
  useEffect(() => {
    const sqft = Number(form.deck_length || 0) * Number(form.deck_width || 0);
    setForm((prev) => {
      const updated = { ...prev, deck_sqft: String(Math.round(sqft)) };
      const costs   = calcCosts(updated, settings, hardwareItems, permits);
      return {
        ...updated,
        material_cost:   costs.material.toFixed(2),
        labor_cost:      costs.labor.toFixed(2),
        equipment_cost:  prev.equipment_cost.trim() === "" ? costs.equipment.toFixed(2) : prev.equipment_cost,
        overhead_cost:   prev.overhead_cost.trim()  === "" ? costs.overhead.toFixed(2)  : prev.overhead_cost,
        total_job_cost:  costs.total.toFixed(2),
        tax_amount:      costs.tax.toFixed(2),
        final_price:     costs.finalPrice.toFixed(2),
        expected_profit: costs.profit.toFixed(2),
      };
    });
  }, [
    form.deck_length, form.deck_width, form.height_tier, form.material_type,
    form.staircase_count, form.riser_count, form.stair_width_ft, form.stair_has_landing,
    form.project_region,
    form.target_margin, form.equipment_cost, form.overhead_cost,
    form.lighting_enabled, form.lighting_cost, form.staining_enabled, form.staining_cost,
    form.built_ins_enabled, form.built_ins_cost, form.dumpster_enabled, form.dumpster_cost,
    form.job_type, form.tax_rate, form.tax_applies_to,
    hardwareItems, permits, settings,
  ]);

  // ── Cost breakdown for display (derived, not stored in state) ─────────────
  const costBreakdown = useMemo((): CostBreakdown | null => {
    if (!Number(form.deck_sqft) && !Number(form.staircase_count)) return null;
    const sqft     = Number(form.deck_length || 0) * Number(form.deck_width || 0);
    const tempForm = { ...form, deck_sqft: String(Math.round(sqft)) };
    return calcCosts(tempForm, settings, hardwareItems, permits);
  }, [
    form.deck_length, form.deck_width, form.height_tier, form.material_type,
    form.staircase_count, form.riser_count, form.stair_width_ft, form.stair_has_landing,
    form.project_region, form.target_margin, form.equipment_cost, form.overhead_cost,
    form.lighting_enabled, form.lighting_cost, form.staining_enabled, form.staining_cost,
    form.built_ins_enabled, form.built_ins_cost, form.dumpster_enabled, form.dumpster_cost,
    form.job_type, form.tax_rate, form.tax_applies_to,
    hardwareItems, permits, settings,
  ]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }
  function updateHardwareEnabled(key: string, enabled: boolean) {
    setHardwareItems((prev) => prev.map((i) => i.key === key ? { ...i, enabled } : i));
  }
  function updateHardwareCost(key: string, cost: string) {
    setHardwareItems((prev) => prev.map((i) => i.key === key ? { ...i, cost } : i));
  }
  function togglePermit(key: PermitKey, enabled: boolean) {
    const defaults = settingsRef.current ?? settings;
    setPermits((prev) => {
      const existingCost = Number(prev[key].cost);
      const cost = enabled && (!prev[key].cost || existingCost === 0)
        ? moneyString((defaults as any)[`permit_${key}_default`] ?? 0)
        : prev[key].cost;
      return { ...prev, [key]: { ...prev[key], enabled, cost } };
    });
  }
  function updatePermitCost(key: PermitKey, cost: string) {
    setPermits((prev) => ({ ...prev, [key]: { ...prev[key], cost } }));
  }

  // ── Derived display values ─────────────────────────────────────────────────
  const hardwareTotal   = calcHardwareTotal(hardwareItems);
  const permitTotal     = calcPermitTotal(permits);
  const selectedJobType = JOB_TYPES.find((j) => j.value === form.job_type) ?? JOB_TYPES[0];
  const activeRegion    = form.project_region || settings.region || "national";
  const regionMult      = REGION_MULTIPLIERS[activeRegion] ?? { material: 1, labor: 1 };
  const isRepair        = form.job_type === "repair";
  const isRailingOnly   = form.job_type === "railing_only";
  const showStairs      = !isRepair && !isRailingOnly;
  const showDimensions  = !isRepair && !isRailingOnly;
  const hasStairData    = Number(form.staircase_count) > 0 && Number(form.riser_count) > 0;
  const stairDisplay    = costBreakdown?.stairAssembly ?? null;

  // Riser count suggestion from height tier (informational placeholder hint)
  const riserSuggestion =
    form.height_tier === "raised" ? "~8 risers for a raised deck (≈5 ft)" :
    form.height_tier === "high"   ? "~13 risers for a high deck (≈8 ft)"  :
                                    "~4 risers for a standard-height deck (≈30″)";

  // Informational phase hours for display
  const deckPhases   = deckLaborPhases(
    Number(form.deck_sqft || 0), Number(form.deck_length || 0), Number(form.deck_width || 0),
    Number(form.railing_lf || 0), form.job_type
  );
  const stairPhases  = stairDisplay?.phases ?? [];
  const allPhases    = [...deckPhases, ...stairPhases];
  const totalCrewHrs = allPhases.reduce((s, p) => s + p.hours, 0);

  // ── Save ──────────────────────────────────────────────────────────────────
  async function handleSave() {
    setSaving(true);
    setErr("");
    setSuccess("");

    const { data: { user } } = await supabase.auth.getUser();
    const targetMarginDecimal = parseMarginInput(form.target_margin) ?? 0.3;

    const payload: Record<string, unknown> = {
      name:        form.name   || "Untitled Quote",
      status:      form.status || "ready_to_send",
      job_type:    form.job_type || "new_build",
      deck_length: numOrNull(form.deck_length),
      deck_width:  numOrNull(form.deck_width),
      deck_sqft:   Number(form.deck_sqft || 0),
      height_tier:   form.height_tier,
      material_type: form.material_type,
      railing_type:  form.railing_type,
      // Legacy stair_count kept for backward compat (not used in pricing)
      stair_count:     Number(form.stair_count || 0),
      // P0: assembly-based stair fields
      staircase_count: Number(form.staircase_count || 0),
      riser_count:     Number(form.riser_count || 0),
      stair_width:     form.stair_width_ft ? `${form.stair_width_ft}ft` : null,
      has_landing:     form.stair_has_landing,
      // P0: per-project region
      project_region:  form.project_region || null,
      lighting_enabled: form.lighting_enabled,
      lighting_cost:    form.lighting_enabled ? Number(form.lighting_cost || 0) : 0,
      staining_enabled: form.staining_enabled,
      staining_cost:    form.staining_enabled ? Number(form.staining_cost || 0) : 0,
      built_ins_enabled:     form.built_ins_enabled,
      built_ins_cost:        form.built_ins_enabled ? Number(form.built_ins_cost || 0) : 0,
      built_ins_description: form.built_ins_enabled ? form.built_ins_description || null : null,
      dumpster_enabled: form.dumpster_enabled,
      dumpster_cost:    form.dumpster_enabled ? Number(form.dumpster_cost || 0) : 0,
      hardware_items:   hardwareItems.map((i) => ({ key: i.key, label: i.label, enabled: i.enabled, cost: i.enabled ? i.cost : "" })),
      permit_building_enabled:    permits.building.enabled,
      permit_building_cost:       permits.building.enabled    ? Number(permits.building.cost    || 0) : 0,
      permit_septic_enabled:      permits.septic.enabled,
      permit_septic_cost:         permits.septic.enabled      ? Number(permits.septic.cost      || 0) : 0,
      permit_electrical_enabled:  permits.electrical.enabled,
      permit_electrical_cost:     permits.electrical.enabled  ? Number(permits.electrical.cost  || 0) : 0,
      permit_engineering_enabled: permits.engineering.enabled,
      permit_engineering_cost:    permits.engineering.enabled ? Number(permits.engineering.cost || 0) : 0,
      permit_hoa_enabled:         permits.hoa.enabled,
      permit_hoa_cost:            permits.hoa.enabled         ? Number(permits.hoa.cost         || 0) : 0,
      tax_rate:       Number(form.tax_rate || 0),
      tax_applies_to: form.tax_applies_to,
      tax_amount:     Number(form.tax_amount || 0),
      material_cost:  Number(form.material_cost  || 0),
      labor_cost:     Number(form.labor_cost      || 0),
      permit_cost:    permitTotal,
      equipment_cost: Number(form.equipment_cost  || 0),
      overhead_cost:  Number(form.overhead_cost   || 0),
      total_job_cost: Number(form.total_job_cost  || 0),
      final_price:     Number(form.final_price     || 0),
      expected_profit: Number(form.expected_profit || 0),
      target_margin:   targetMarginDecimal,
      client_name:  form.client_name  || null,
      client_email: form.client_email || null,
      client_phone: form.client_phone || null,
      site_address: form.site_address || null,
      notes:        form.notes        || null,
      railing_lf:   numOrNull(form.railing_lf),
      proposal_expires_at: form.proposal_expires_at
        ? new Date(form.proposal_expires_at).toISOString()
        : null,
      updated_at:     new Date().toISOString(),
      last_edited_by: user?.id ?? null,
    };

    let approvalFlagged = false;
    if (user) {
      const guardrailResult = await checkGuardrails(supabase, user.id, { target_margin: targetMarginDecimal });
      payload.approval_status = approvalStatusFromGuardrail(guardrailResult);
      if (guardrailResult.violated) approvalFlagged = true;
    }

    const { error } = await supabase.from("projects").update(payload).eq("id", id);
    if (error) { setErr(error.message); setSaving(false); return; }

    if (approvalFlagged) {
      setSuccess("Saved. This quote has been flagged for owner approval. Margin is below the minimum guardrail.");
    } else {
      setSuccess("Saved successfully.");
    }
    setTimeout(() => { router.push(`/projects/${id}`); router.refresh(); }, 1200);
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
            <h1 className="text-3xl font-semibold">Edit Quote: {form.name || "Untitled Quote"}</h1>
            <p className="mt-1 text-sm text-white/60">Fill out the quote builder and DeckMargin will calculate pricing automatically.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => router.push(`/projects/${id}`)} className="rounded border border-white/20 px-3 py-2 text-sm hover:bg-white/10">← Back to Quote</button>
            <button type="button" onClick={handleSave} disabled={saving} className="rounded bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90 disabled:opacity-60">
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>

        {err     && <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{err}</div>}
        {success && <div className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{success}</div>}

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">

          {/* ── Job Type ── */}
          <div className="mb-6 text-sm font-medium text-white/80">Job Type</div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {JOB_TYPES.map((jt) => (
              <button key={jt.value} type="button" onClick={() => updateField("job_type", jt.value)}
                className={`rounded-xl border p-3 text-left transition-all ${form.job_type === jt.value ? "border-blue-500 bg-blue-500/10" : "border-white/10 bg-[#111827] hover:border-white/20"}`}>
                <div className={`text-sm font-medium ${form.job_type === jt.value ? "text-blue-400" : "text-white"}`}>{jt.label}</div>
                <div className="mt-1 text-xs text-white/40 leading-snug">{jt.description}</div>
              </button>
            ))}
          </div>

          <div className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
            form.job_type === "new_build"    ? "border-blue-500/20 bg-blue-500/5 text-blue-300" :
            form.job_type === "rebuild"      ? "border-orange-500/20 bg-orange-500/5 text-orange-300" :
            form.job_type === "resurface"    ? "border-amber-500/20 bg-amber-500/5 text-amber-300" :
            form.job_type === "railing_only" ? "border-purple-500/20 bg-purple-500/5 text-purple-300" :
            form.job_type === "repair"       ? "border-red-500/20 bg-red-500/5 text-red-300" :
                                               "border-emerald-500/20 bg-emerald-500/5 text-emerald-300"}`}>
            <span className="font-medium">{selectedJobType.label}:</span>{" "}
            {form.job_type === "new_build"    && "Full calculation active, all fields apply."}
            {form.job_type === "rebuild"      && "Full new-build pricing + 25% demo/disposal labor surcharge applied. Enable Dumpster below to add haul-away cost."}
            {form.job_type === "resurface"    && "Framing, footings, and structural labor zeroed out. Surface materials and labor only."}
            {form.job_type === "railing_only" && "Deck surface calculation zeroed. Use permit and equipment fields to enter railing material and labor costs."}
            {form.job_type === "repair"       && "All auto-calculations zeroed. Enter all costs manually."}
            {form.job_type === "addition"     && "60% framing credit applied, partial structural build on existing deck."}
          </div>

          {/* Regional pricing callout — now reflects project-level region */}
          {activeRegion !== "national" && (
            <di