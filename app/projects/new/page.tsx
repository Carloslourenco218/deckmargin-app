"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

// ── Step definitions ──────────────────────────────────────────────────────────

const ALL_STEPS = [
  { id: 1, label: "Customer" },
  { id: 2, label: "Project" },
  { id: 3, label: "Deck" },
  { id: 4, label: "Materials" },
  { id: 5, label: "Railing" },
  { id: 6, label: "Stairs" },
  { id: 7, label: "Site" },
  { id: 8, label: "Extras" },
  { id: 9, label: "Notes" },
];

function getVisibleStepIds(jobType: string): number[] {
  if (jobType === "railing_only") return [1, 2, 5, 7, 8, 9];
  if (jobType === "repair")       return [1, 2, 8, 9];
  return [1, 2, 3, 4, 5, 6, 7, 8, 9];
}

function mapHeightTier(cat: string): string {
  if (cat === "4-8ft") return "raised";
  if (cat === "8plus") return "high";
  return "standard";
}

// ── Form state ────────────────────────────────────────────────────────────────

type WizardForm = {
  quoteName: string; clientName: string; clientEmail: string;
  clientPhone: string; siteAddress: string;
  jobType: string;
  deckShape: string; deckLength: string; deckWidth: string; deckSqftOverride: string;
  heightCategory: string; deckAttachment: string; ledgerCondition: string;
  materialType: string; deckingPattern: string;
  railingCoverage: string; railingLf: string; railingType: string; stairRailing: string;
  hasStairs: boolean; stairConfig: string; stairWidth: string; stairCount: string;
  hasLanding: boolean; landingSize: string;
  siteDifficulty: string; siteObstacles: string[];
  lightingEnabled: boolean; lightingCost: string;
  stainingEnabled: boolean; stainingCost: string;
  builtInsEnabled: boolean; builtInsCost: string; builtInsDescription: string;
  dumpsterEnabled: boolean; dumpsterCost: string;
  demolitionEnabled: boolean; demolitionCost: string;
  notes: string;
};

const INITIAL: WizardForm = {
  quoteName: "", clientName: "", clientEmail: "", clientPhone: "", siteAddress: "",
  jobType: "new_build",
  deckShape: "rectangle", deckLength: "", deckWidth: "", deckSqftOverride: "",
  heightCategory: "under30", deckAttachment: "attached", ledgerCondition: "new",
  materialType: "pressure-treated", deckingPattern: "standard",
  railingCoverage: "full-perimeter", railingLf: "", railingType: "wood", stairRailing: "none",
  hasStairs: false, stairConfig: "straight", stairWidth: "4ft", stairCount: "8",
  hasLanding: false, landingSize: "none",
  siteDifficulty: "easy", siteObstacles: [],
  lightingEnabled: false, lightingCost: "",
  stainingEnabled: false, stainingCost: "",
  builtInsEnabled: false, builtInsCost: "", builtInsDescription: "",
  dumpsterEnabled: false, dumpsterCost: "",
  demolitionEnabled: false, demolitionCost: "",
  notes: "",
};

// ── Shared UI helpers ─────────────────────────────────────────────────────────

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${
        active
          ? "border-blue-500 bg-blue-500/15 text-blue-300"
          : "border-white/10 bg-[#111827] text-white/80 hover:border-white/25"
      }`}>
      {label}
    </button>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <div
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-blue-500" : "bg-white/15"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </div>
      <span className="text-sm text-white/80">{label}</span>
    </label>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs text-white/55">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-white/10 bg-[#111827] px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-blue-500/50" />
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────

function ProgressBar({ steps, currentId }: { steps: typeof ALL_STEPS; currentId: number }) {
  const currentIdx = steps.findIndex((s) => s.id === currentId);
  return (
    <div className="mb-8">
      <div className="flex items-center gap-0">
        {steps.map((s, i) => {
          const isDone = i < currentIdx;
          const isActive = s.id === currentId;
          return (
            <div key={s.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  isDone ? "bg-blue-500 text-white" :
                  isActive ? "bg-blue-500 text-white" :
                  "border border-white/20 bg-white/5 text-white/40"}`}>
                  {isDone ? "✓" : s.id}
                </div>
                <span className={`text-[10px] font-medium ${isActive ? "text-blue-400" : "text-white/35"}`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-px flex-1 mx-1 mb-4 ${isDone ? "bg-blue-500" : "bg-white/10"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Step renderers ────────────────────────────────────────────────────────────

function StepCustomer({ form, set }: { form: WizardForm; set: (k: keyof WizardForm, v: any) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold">Customer</h2>
        <p className="mt-1 text-sm text-white/50">Who is this quote for?</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <FieldRow label="Quote Name (internal)">
            <Input value={form.quoteName} onChange={(v) => set("quoteName", v)} placeholder="Smith Residence Deck" />
          </FieldRow>
        </div>
        <FieldRow label="Client Name">
          <Input value={form.clientName} onChange={(v) => set("clientName", v)} placeholder="Jane Smith" />
        </FieldRow>
        <FieldRow label="Client Phone">
          <Input value={form.clientPhone} onChange={(v) => set("clientPhone", v)} placeholder="(555) 000-0000" />
        </FieldRow>
        <FieldRow label="Client Email">
          <Input value={form.clientEmail} onChange={(v) => set("clientEmail", v)} placeholder="jane@example.com" type="email" />
        </FieldRow>
        <FieldRow label="Site Address">
          <Input value={form.siteAddress} onChange={(v) => set("siteAddress", v)} placeholder="123 Oak Street, Portland OR" />
        </FieldRow>
      </div>
    </div>
  );
}

const JOB_TYPES = [
  { value: "new_build",    label: "New Deck",     desc: "Full construction — framing, footings, decking, railing" },
  { value: "resurface",    label: "Resurface",     desc: "New surface boards on existing frame" },
  { value: "rebuild",      label: "Rebuild",       desc: "Remove existing deck and replace entirely" },
  { value: "repair",       label: "Repair",        desc: "Partial repairs — manual line items only" },
  { value: "addition",     label: "Addition",      desc: "Extending an existing deck structure" },
  { value: "railing_only", label: "Railing Only",  desc: "Railing installation on existing structure" },
];

function StepProject({ form, set }: { form: WizardForm; set: (k: keyof WizardForm, v: any) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold">Project Type</h2>
        <p className="mt-1 text-sm text-white/50">What kind of work is this?</p>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {JOB_TYPES.map((jt) => (
          <button key={jt.value} type="button"
            onClick={() => set("jobType", jt.value)}
            className={`rounded-xl border p-4 text-left transition-all ${
              form.jobType === jt.value
                ? "border-blue-500 bg-blue-500/10"
                : "border-white/10 bg-[#111827] hover:border-white/20"}`}>
            <div className={`font-medium ${form.jobType === jt.value ? "text-blue-400" : "text-white"}`}>
              {jt.label}
            </div>
            <div className="mt-1 text-xs text-white/45 leading-snug">{jt.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

const HEIGHT_OPTIONS = [
  { value: "ground",  label: "Ground Level",  sub: "Deck is at or very near grade" },
  { value: "under30", label: "Under 30\"",    sub: "Low deck, no railing required by code in most areas" },
  { value: "30-48",   label: "30\" – 48\"",   sub: "Moderate height, railing typically required" },
  { value: "4-8ft",   label: "4 – 8 ft",     sub: "Raised deck, ledger framing & longer posts" },
  { value: "8plus",   label: "8 ft +",        sub: "High elevation, may require engineering" },
];

function StepDeck({ form, set }: { form: WizardForm; set: (k: keyof WizardForm, v: any) => void }) {
  const calcSqft = form.deckLength && form.deckWidth
    ? Math.round(Number(form.deckLength) * Number(form.deckWidth))
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Deck</h2>
        <p className="mt-1 text-sm text-white/50">Shape, size, and height of the deck.</p>
      </div>

      {/* Shape */}
      <div>
        <div className="mb-2 text-xs font-medium text-white/55">Shape</div>
        <div className="grid grid-cols-4 gap-2">
          {(["rectangle","l-shape","u-shape","other"] as const).map((s) => (
            <Chip key={s} label={s === "rectangle" ? "Rectangle" : s === "l-shape" ? "L-Shape" : s === "u-shape" ? "U-Shape" : "Other"} active={form.deckShape === s} onClick={() => set("deckShape", s)} />
          ))}
        </div>
      </div>

      {/* Dimensions */}
      {form.deckShape === "rectangle" && (
        <div>
          <div className="mb-2 text-xs font-medium text-white/55">Dimensions</div>
          <div className="grid grid-cols-3 gap-3">
            <FieldRow label="Length (ft)">
              <Input value={form.deckLength} onChange={(v) => set("deckLength", v)} placeholder="24" type="number" />
            </FieldRow>
            <FieldRow label="Width (ft)">
              <Input value={form.deckWidth} onChange={(v) => set("deckWidth", v)} placeholder="16" type="number" />
            </FieldRow>
            <FieldRow label="Calculated Area">
              <div className="rounded-lg border border-white/10 bg-[#0f172a] px-3 py-2.5 text-sm text-white/70">
                {calcSqft != null ? `${calcSqft} sq ft` : "—"}
              </div>
            </FieldRow>
          </div>
        </div>
      )}

      {/* Area override */}
      <div>
        <div className="mb-2 text-xs font-medium text-white/55">
          {form.deckShape !== "rectangle" ? "Approximate Area (sq ft)" : "Override Area (optional — for irregular shapes)"}
        </div>
        <div className="flex items-center gap-3">
          <Input value={form.deckSqftOverride} onChange={(v) => set("deckSqftOverride", v)}
            placeholder={form.deckShape !== "rectangle" ? "Enter approximate sq ft" : "Leave blank to use calculated"} type="number" />
        </div>
        {form.deckSqftOverride && (
          <p className="mt-1 text-xs text-amber-400">Using manual area override: {form.deckSqftOverride} sq ft</p>
        )}
      </div>

      {/* Height */}
      <div>
        <div className="mb-2 text-xs font-medium text-white/55">Deck Height</div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-5">
          {HEIGHT_OPTIONS.map((h) => (
            <button key={h.value} type="button"
              onClick={() => set("heightCategory", h.value)}
              className={`rounded-xl border p-3 text-left transition-all ${
                form.heightCategory === h.value ? "border-blue-500 bg-blue-500/10" : "border-white/10 bg-[#111827] hover:border-white/20"}`}>
              <div className={`text-xs font-medium ${form.heightCategory === h.value ? "text-blue-400" : "text-white"}`}>{h.label}</div>
              <div className="mt-0.5 text-[10px] text-white/40 leading-snug">{h.sub}</div>
            </button>
          ))}
        </div>
        {form.heightCategory === "8plus" && (
          <p className="mt-2 text-xs text-amber-400">⚠ Decks 8 ft+ may require structural engineering. This will be flagged for review.</p>
        )}
      </div>

      {/* Attachment */}
      <div>
        <div className="mb-2 text-xs font-medium text-white/55">Structure</div>
        <div className="grid grid-cols-3 gap-2">
          {(["attached","freestanding","combination"] as const).map((a) => (
            <Chip key={a} label={a.charAt(0).toUpperCase() + a.slice(1)} active={form.deckAttachment === a} onClick={() => set("deckAttachment", a)} />
          ))}
        </div>
      </div>

      {/* Ledger condition when attached */}
      {(form.deckAttachment === "attached" || form.deckAttachment === "combination") && (
        <div>
          <div className="mb-2 text-xs font-medium text-white/55">Ledger Condition</div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {[
              { value: "new", label: "New Ledger" },
              { value: "sound", label: "Existing — Appears Sound" },
              { value: "unknown", label: "Existing — Unknown" },
              { value: "needs-repair", label: "Needs Repair / Replacement" },
            ].map((l) => (
              <Chip key={l.value} label={l.label} active={form.ledgerCondition === l.value} onClick={() => set("ledgerCondition", l.value)} />
            ))}
          </div>
          {form.ledgerCondition === "unknown" && (
            <p className="mt-2 text-xs text-amber-400">⚠ Unknown ledger condition — an allowance or site visit note will be added.</p>
          )}
          {form.ledgerCondition === "needs-repair" && (
            <p className="mt-2 text-xs text-amber-400">⚠ Ledger repair/replacement will be flagged for review and pricing.</p>
          )}
        </div>
      )}
    </div>
  );
}

function StepMaterials({ form, set }: { form: WizardForm; set: (k: keyof WizardForm, v: any) => void }) {
  const isResurface = form.jobType === "resurface";
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Materials</h2>
        <p className="mt-1 text-sm text-white/50">
          {isResurface ? "Surface decking only — framing is existing." : "What are we building the deck surface with?"}
        </p>
      </div>

      {/* Decking material */}
      <div>
        <div className="mb-2 text-xs font-medium text-white/55">Decking Material</div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { value: "pressure-treated", label: "Pressure Treated", sub: "PT lumber — economical, paintable" },
            { value: "trex",             label: "Trex",             sub: "Composite, Trex brand pricing" },
            { value: "timbertech",       label: "TimberTech",       sub: "Premium composite" },
            { value: "pvc",              label: "PVC",              sub: "Cellular PVC, no splinters" },
          ].map((m) => (
            <button key={m.value} type="button"
              onClick={() => set("materialType", m.value)}
              className={`rounded-xl border p-4 text-left transition-all ${
                form.materialType === m.value ? "border-blue-500 bg-blue-500/10" : "border-white/10 bg-[#111827] hover:border-white/20"}`}>
              <div className={`text-sm font-medium ${form.materialType === m.value ? "text-blue-400" : "text-white"}`}>{m.label}</div>
              <div className="mt-1 text-[11px] text-white/45 leading-snug">{m.sub}</div>
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-white/40">Pricing uses your company settings. You can adjust on the estimate review.</p>
      </div>

      {/* Decking pattern */}
      <div>
        <div className="mb-2 text-xs font-medium text-white/55">Decking Pattern</div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {[
            { value: "standard",      label: "Standard",       sub: "Straight boards, parallel to house" },
            { value: "picture-frame", label: "Picture Frame",  sub: "+5–8% material, more labor" },
            { value: "diagonal",      label: "Diagonal",       sub: "+10–15% material, more labor" },
            { value: "custom",        label: "Custom",         sub: "Herringbone, chevron, other" },
          ].map((p) => (
            <button key={p.value} type="button"
              onClick={() => set("deckingPattern", p.value)}
              className={`rounded-xl border p-3 text-left transition-all ${
                form.deckingPattern === p.value ? "border-blue-500 bg-blue-500/10" : "border-white/10 bg-[#111827] hover:border-white/20"}`}>
              <div className={`text-xs font-medium ${form.deckingPattern === p.value ? "text-blue-400" : "text-white"}`}>{p.label}</div>
              <div className="mt-0.5 text-[10px] text-white/40">{p.sub}</div>
            </button>
          ))}
        </div>
        {(form.deckingPattern === "picture-frame" || form.deckingPattern === "diagonal" || form.deckingPattern === "custom") && (
          <p className="mt-2 text-xs text-amber-400">⚠ Pattern adjustment applied automatically in materials and labor calculation.</p>
        )}
      </div>
    </div>
  );
}

function StepRailing({ form, set }: { form: WizardForm; set: (k: keyof WizardForm, v: any) => void }) {
  const showLf = form.railingCoverage === "partial" || form.railingCoverage === "custom";
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Railing</h2>
        <p className="mt-1 text-sm text-white/50">How much railing does this deck need?</p>
      </div>

      {/* Coverage */}
      <div>
        <div className="mb-2 text-xs font-medium text-white/55">Railing Amount</div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { value: "none",            label: "None",             sub: "No railing on this project" },
            { value: "full-perimeter",  label: "Full Perimeter",   sub: "All open sides — calculated from deck size" },
            { value: "partial",         label: "Partial",          sub: "Some sides only" },
            { value: "custom",          label: "Custom LF",        sub: "Enter exact linear footage" },
          ].map((c) => (
            <button key={c.value} type="button"
              onClick={() => set("railingCoverage", c.value)}
              className={`rounded-xl border p-3 text-left transition-all ${
                form.railingCoverage === c.value ? "border-blue-500 bg-blue-500/10" : "border-white/10 bg-[#111827] hover:border-white/20"}`}>
              <div className={`text-xs font-medium ${form.railingCoverage === c.value ? "text-blue-400" : "text-white"}`}>{c.label}</div>
              <div className="mt-0.5 text-[10px] text-white/40">{c.sub}</div>
            </button>
          ))}
        </div>
        {showLf && (
          <div className="mt-3">
            <FieldRow label="Estimated Linear Feet">
              <Input value={form.railingLf} onChange={(v) => set("railingLf", v)} placeholder="e.g. 56" type="number" />
            </FieldRow>
          </div>
        )}
      </div>

      {/* Railing type — only if not "none" */}
      {form.railingCoverage !== "none" && (
        <div>
          <div className="mb-2 text-xs font-medium text-white/55">Railing Type</div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
            {[
              { value: "wood",      label: "Wood" },
              { value: "composite", label: "Composite" },
              { value: "aluminum",  label: "Aluminum / Metal" },
              { value: "cable",     label: "Cable" },
              { value: "glass",     label: "Glass" },
            ].map((t) => (
              <Chip key={t.value} label={t.label} active={form.railingType === t.value} onClick={() => set("railingType", t.value)} />
            ))}
          </div>
        </div>
      )}

      {/* Stair railing */}
      {form.railingCoverage !== "none" && (
        <div>
          <div className="mb-2 text-xs font-medium text-white/55">Stair Railing</div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "none",       label: "None" },
              { value: "included",   label: "Included" },
              { value: "custom-lf",  label: "Custom LF" },
            ].map((s) => (
              <Chip key={s.value} label={s.label} active={form.stairRailing === s.value} onClick={() => set("stairRailing", s.value)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StepStairs({ form, set }: { form: WizardForm; set: (k: keyof WizardForm, v: any) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Stairs</h2>
        <p className="mt-1 text-sm text-white/50">Does this deck need stairs?</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button type="button"
          onClick={() => set("hasStairs", false)}
          className={`rounded-xl border p-4 text-left transition-all ${!form.hasStairs ? "border-blue-500 bg-blue-500/10" : "border-white/10 bg-[#111827] hover:border-white/20"}`}>
          <div className={`font-medium ${!form.hasStairs ? "text-blue-400" : "text-white"}`}>No Stairs</div>
          <div className="mt-1 text-xs text-white/40">Deck does not require stairs</div>
        </button>
        <button type="button"
          onClick={() => set("hasStairs", true)}
          className={`rounded-xl border p-4 text-left transition-all ${form.hasStairs ? "border-blue-500 bg-blue-500/10" : "border-white/10 bg-[#111827] hover:border-white/20"}`}>
          <div className={`font-medium ${form.hasStairs ? "text-blue-400" : "text-white"}`}>Yes — Include Stairs</div>
          <div className="mt-1 text-xs text-white/40">Configure stair details below</div>
        </button>
      </div>

      {form.hasStairs && (
        <div className="space-y-5 rounded-xl border border-white/10 bg-[#111827] p-5">
          {/* Configuration */}
          <div>
            <div className="mb-2 text-xs font-medium text-white/55">Configuration</div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {[
                { value: "straight",   label: "Straight" },
                { value: "l-shaped",   label: "L-Shaped" },
                { value: "switchback", label: "Switchback" },
                { value: "custom",     label: "Custom" },
              ].map((c) => (
                <Chip key={c.value} label={c.label} active={form.stairConfig === c.value} onClick={() => set("stairConfig", c.value)} />
              ))}
            </div>
          </div>

          {/* Width */}
          <div>
            <div className="mb-2 text-xs font-medium text-white/55">Stair Width</div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: "3ft", label: "3 ft" },
                { value: "4ft", label: "4 ft" },
                { value: "5ft", label: "5 ft" },
                { value: "custom", label: "Custom" },
              ].map((w) => (
                <Chip key={w.value} label={w.label} active={form.stairWidth === w.value} onClick={() => set("stairWidth", w.value)} />
              ))}
            </div>
          </div>

          {/* Estimated steps */}
          <FieldRow label="Estimated Number of Steps">
            <div className="flex items-center gap-3">
              <Input value={form.stairCount} onChange={(v) => set("stairCount", v)} placeholder="8" type="number" />
              <span className="text-xs text-white/40">Estimated from deck height — adjust as needed</span>
            </div>
          </FieldRow>

          {/* Landing */}
          <div>
            <div className="mb-2 text-xs font-medium text-white/55">Landing</div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "none",   label: "No Landing" },
                { value: "small",  label: "Small Landing" },
                { value: "custom", label: "Custom Size" },
              ].map((l) => (
                <Chip key={l.value} label={l.label} active={form.landingSize === l.value} onClick={() => set("landingSize", l.value)} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const OBSTACLE_OPTIONS = [
  "Limited access","Roots","Rock","Existing concrete","Slope",
  "Landscaping","Pool","Fence","Retaining wall","Existing deck","Other",
];

function StepSite({ form, set }: { form: WizardForm; set: (k: keyof WizardForm, v: any) => void }) {
  const toggleObstacle = (obs: string) => {
    const cur = form.siteObstacles;
    set("siteObstacles", cur.includes(obs) ? cur.filter((o) => o !== obs) : [...cur, obs]);
  };
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Site</h2>
        <p className="mt-1 text-sm text-white/50">How difficult is the site to work on?</p>
      </div>

      <div>
        <div className="mb-2 text-xs font-medium text-white/55">Site Difficulty</div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "easy",     label: "Easy",     sub: "Normal access, flat grade, no obstacles" },
            { value: "moderate", label: "Moderate", sub: "Some complexity — slopes, limited access" },
            { value: "difficult",label: "Difficult",sub: "Significant access challenges or obstacles" },
          ].map((d) => (
            <button key={d.value} type="button"
              onClick={() => set("siteDifficulty", d.value)}
              className={`rounded-xl border p-4 text-left transition-all ${
                form.siteDifficulty === d.value ? "border-blue-500 bg-blue-500/10" : "border-white/10 bg-[#111827] hover:border-white/20"}`}>
              <div className={`font-medium ${form.siteDifficulty === d.value ? "text-blue-400" : "text-white"}`}>{d.label}</div>
              <div className="mt-1 text-xs text-white/40">{d.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {(form.siteDifficulty === "moderate" || form.siteDifficulty === "difficult") && (
        <div>
          <div className="mb-2 text-xs font-medium text-white/55">What&apos;s making it challenging? <span className="text-white/30">(select all that apply)</span></div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {OBSTACLE_OPTIONS.map((obs) => (
              <label key={obs} className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm transition-all ${
                form.siteObstacles.includes(obs) ? "border-blue-500/40 bg-blue-500/8 text-blue-300" : "border-white/10 bg-[#111827] text-white/70 hover:border-white/20"}`}>
                <input type="checkbox" checked={form.siteObstacles.includes(obs)} onChange={() => toggleObstacle(obs)} className="accent-blue-500" />
                {obs}
              </label>
            ))}
          </div>
          {form.siteObstacles.length > 0 && (
            <p className="mt-2 text-xs text-amber-400">
              ⚠ Site challenges will be noted. Review the labor adjustment in the full estimate.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

type ExtraToggleProps = {
  enabled: boolean; onToggle: (v: boolean) => void;
  label: string; sub: string;
  cost: string; onCost: (v: string) => void;
  costLabel?: string;
  children?: React.ReactNode;
};

function ExtraToggle({ enabled, onToggle, label, sub, cost, onCost, costLabel = "Cost Allowance ($)", children }: ExtraToggleProps) {
  return (
    <div className={`rounded-xl border p-4 transition-all ${enabled ? "border-blue-500/40 bg-blue-500/5" : "border-white/10 bg-[#111827]"}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="font-medium text-white text-sm">{label}</div>
          <div className="mt-0.5 text-xs text-white/40">{sub}</div>
        </div>
        <Toggle checked={enabled} onChange={onToggle} label="" />
      </div>
      {enabled && (
        <div className="mt-4 space-y-3">
          {children}
          <FieldRow label={costLabel}>
            <Input value={cost} onChange={onCost} placeholder="0.00" type="number" />
          </FieldRow>
        </div>
      )}
    </div>
  );
}

function StepExtras({ form, set }: { form: WizardForm; set: (k: keyof WizardForm, v: any) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold">Extras</h2>
        <p className="mt-1 text-sm text-white/50">Toggle any add-ons that apply to this job.</p>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <ExtraToggle
          enabled={form.lightingEnabled} onToggle={(v) => set("lightingEnabled", v)}
          label="Lighting" sub="Post lights, stair lights, low-voltage package"
          cost={form.lightingCost} onCost={(v) => set("lightingCost", v)} />
        <ExtraToggle
          enabled={form.stainingEnabled} onToggle={(v) => set("stainingEnabled", v)}
          label="Staining / Sealing" sub="Professional stain or sealant application"
          cost={form.stainingCost} onCost={(v) => set("stainingCost", v)} />
        <ExtraToggle
          enabled={form.builtInsEnabled} onToggle={(v) => set("builtInsEnabled", v)}
          label="Built-ins" sub="Bench seating, planters, pergola, privacy wall"
          cost={form.builtInsCost} onCost={(v) => set("builtInsCost", v)}>
          <FieldRow label="Describe Built-ins">
            <Input value={form.builtInsDescription} onChange={(v) => set("builtInsDescription", v)} placeholder="Bench seating, planters..." />
          </FieldRow>
        </ExtraToggle>
        <ExtraToggle
          enabled={form.dumpsterEnabled} onToggle={(v) => set("dumpsterEnabled", v)}
          label="Dumpster" sub="Roll-off dumpster rental for debris disposal"
          cost={form.dumpsterCost} onCost={(v) => set("dumpsterCost", v)} />
        <ExtraToggle
          enabled={form.demolitionEnabled} onToggle={(v) => set("demolitionEnabled", v)}
          label="Demolition / Removal" sub="Remove existing deck, stairs, or railing"
          cost={form.demolitionCost} onCost={(v) => set("demolitionCost", v)} costLabel="Demo Cost Allowance ($)" />
      </div>
    </div>
  );
}

function StepNotes({ form, set }: { form: WizardForm; set: (k: keyof WizardForm, v: any) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold">Notes & Photos</h2>
        <p className="mt-1 text-sm text-white/50">Add any site notes, scope reminders, or special conditions.</p>
      </div>
      <div>
        <FieldRow label="Internal Notes">
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={6}
            placeholder="Tree roots near northeast footing. Check ledger attachment detail. Client wants composite decking but considering budget..."
            className="w-full rounded-lg border border-white/10 bg-[#111827] px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-blue-500/50 resize-none" />
        </FieldRow>
      </div>
      <div className="rounded-xl border border-white/10 bg-[#111827] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-xl">📷</div>
          <div>
            <div className="text-sm font-medium text-white">Photos</div>
            <div className="text-xs text-white/40">Photo upload coming soon — note site conditions above for now.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Scope summary for last step ───────────────────────────────────────────────

function ScopeSummary({ form }: { form: WizardForm }) {
  const sqft = form.deckSqftOverride
    ? Number(form.deckSqftOverride)
    : form.deckLength && form.deckWidth
    ? Math.round(Number(form.deckLength) * Number(form.deckWidth))
    : null;

  const height = HEIGHT_OPTIONS.find((h) => h.value === form.heightCategory)?.label ?? "—";
  const jobLabel = JOB_TYPES.find((j) => j.value === form.jobType)?.label ?? "—";
  const matLabel = { "pressure-treated": "Pressure Treated", trex: "Trex", timbertech: "TimberTech", pvc: "PVC" }[form.materialType] ?? form.materialType;

  const items = [
    sqft ? `${sqft} sq ft deck` : null,
    form.deckShape !== "rectangle" ? form.deckShape.toUpperCase() : null,
    `Height: ${height}`,
    form.deckAttachment === "attached" ? "Attached to house" : "Freestanding",
    matLabel,
    form.deckingPattern !== "standard" ? `${form.deckingPattern} pattern` : null,
    form.railingCoverage !== "none" ? `${form.railingType} railing (${form.railingCoverage})` : "No railing",
    form.hasStairs ? `${form.stairCount} step stairs (${form.stairWidth} wide)` : "No stairs",
    form.siteDifficulty !== "easy" ? `${form.siteDifficulty} site` : null,
    form.lightingEnabled ? "Lighting" : null,
    form.stainingEnabled ? "Staining / Sealing" : null,
    form.builtInsEnabled ? "Built-ins" : null,
    form.dumpsterEnabled ? "Dumpster" : null,
    form.demolitionEnabled ? "Demolition / Removal" : null,
  ].filter(Boolean) as string[];

  return (
    <div className="rounded-xl border border-white/10 bg-[#0b1220] p-5">
      <div className="mb-3 text-xs font-medium text-white/55">Scope Summary</div>
      <div className="mb-2 font-semibold text-white">{jobLabel} — {form.clientName || "Client TBD"}</div>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-white/70">
            <span className="text-blue-500">•</span> {item}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-white/40">
        You&apos;ll set pricing, margin, and review the full cost breakdown on the next screen.
      </p>
    </div>
  );
}

// ── Main wizard component ─────────────────────────────────────────────────────

export default function NewQuoteWizard() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [form, setForm] = useState<WizardForm>(INITIAL);

  function set<K extends keyof WizardForm>(key: K, value: WizardForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const visibleStepIds = getVisibleStepIds(form.jobType);
  const visibleSteps = ALL_STEPS.filter((s) => visibleStepIds.includes(s.id));
  const currentIdx = visibleStepIds.indexOf(step);
  const isFirst = currentIdx === 0;
  const isLast = currentIdx === visibleStepIds.length - 1;

  // Recalculate sqft when dimensions change
  const calcSqft = useMemo(() => {
    if (form.deckSqftOverride) return Number(form.deckSqftOverride);
    if (form.deckLength && form.deckWidth) return Math.round(Number(form.deckLength) * Number(form.deckWidth));
    return 0;
  }, [form.deckLength, form.deckWidth, form.deckSqftOverride]);

  async function handleContinue() {
    setSaving(true);
    setErr("");

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) { setErr("You must be logged in."); return; }

      if (step === 1) {
        // Fetch org_id
        const { data: profile } = await supabase.from("profiles").select("org_id").eq("id", user.id).single();

        const { data, error } = await supabase.from("projects").insert({
          user_id: user.id,
          org_id: profile?.org_id ?? null,
          name: form.quoteName.trim() || "Untitled Quote",
          client_name: form.clientName || null,
          client_email: form.clientEmail || null,
          client_phone: form.clientPhone || null,
          site_address: form.siteAddress || null,
          status: "draft",
          job_type: "new_build",
          deck_sqft: 0,
          height_tier: "standard",
          material_type: "pressure-treated",
          railing_type: "none",
          updated_at: new Date().toISOString(),
        }).select("id").single();

        if (error || !data?.id) { setErr(error?.message ?? "Could not create quote"); return; }
        setProjectId(data.id);

      } else if (projectId) {
        // Build update payload for current step
        const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };

        if (step === 2) {
          payload.job_type = form.jobType;

        } else if (step === 3) {
          payload.deck_shape = form.deckShape;
          payload.deck_length = form.deckLength ? Number(form.deckLength) : null;
          payload.deck_width  = form.deckWidth  ? Number(form.deckWidth)  : null;
          payload.deck_sqft   = calcSqft;
          payload.deck_sqft_override = form.deckSqftOverride ? Number(form.deckSqftOverride) : null;
          payload.deck_height_category = form.heightCategory;
          payload.height_tier = mapHeightTier(form.heightCategory);
          payload.deck_attachment = form.deckAttachment;
          payload.ledger_condition = form.ledgerCondition || null;

        } else if (step === 4) {
          payload.material_type   = form.materialType;
          payload.decking_pattern = form.deckingPattern;

        } else if (step === 5) {
          payload.railing_coverage = form.railingCoverage;
          payload.railing_lf       = form.railingLf ? Number(form.railingLf) : null;
          payload.railing_type     = form.railingCoverage !== "none" ? form.railingType : "none";
          payload.stair_railing    = form.stairRailing;

        } else if (step === 6) {
          payload.stair_count  = form.hasStairs ? Number(form.stairCount || 0) : 0;
          payload.stair_config = form.hasStairs ? form.stairConfig : null;
          payload.stair_width  = form.hasStairs ? form.stairWidth  : null;
          payload.has_landing  = form.hasStairs ? form.hasLanding  : false;
          payload.landing_size = form.hasStairs && form.hasLanding ? form.landingSize : null;

        } else if (step === 7) {
          payload.site_difficulty = form.siteDifficulty;
          payload.site_obstacles  = form.siteObstacles;

        } else if (step === 8) {
          payload.lighting_enabled  = form.lightingEnabled;
          payload.lighting_cost     = form.lightingEnabled ? Number(form.lightingCost || 0)  : 0;
          payload.staining_enabled  = form.stainingEnabled;
          payload.staining_cost     = form.stainingEnabled ? Number(form.stainingCost || 0) : 0;
          payload.built_ins_enabled     = form.builtInsEnabled;
          payload.built_ins_cost        = form.builtInsEnabled ? Number(form.builtInsCost || 0) : 0;
          payload.built_ins_description = form.builtInsEnabled ? form.builtInsDescription || null : null;
          payload.dumpster_enabled  = form.dumpsterEnabled;
          payload.dumpster_cost     = form.dumpsterEnabled ? Number(form.dumpsterCost || 0) : 0;
          payload.demolition_enabled = form.demolitionEnabled;
          payload.demolition_cost    = form.demolitionEnabled ? Number(form.demolitionCost || 0) : 0;

        } else if (step === 9) {
          payload.notes = form.notes || null;
        }

        const { error } = await supabase.from("projects").update(payload).eq("id", projectId);
        if (error) { setErr(error.message); return; }

        // If this is the last step, redirect to edit page for full cost review
        if (isLast) {
          router.push(`/projects/${projectId}/edit`);
          return;
        }
      }

      // Advance to next visible step
      if (!isLast) {
        setStep(visibleStepIds[currentIdx + 1]);
      }

    } finally {
      setSaving(false);
    }
  }

  function handleBack() {
    if (!isFirst) {
      setStep(visibleStepIds[currentIdx - 1]);
    }
  }

  function renderStep() {
    switch (step) {
      case 1: return <StepCustomer  form={form} set={set} />;
      case 2: return <StepProject   form={form} set={set} />;
      case 3: return <StepDeck      form={form} set={set} />;
      case 4: return <StepMaterials form={form} set={set} />;
      case 5: return <StepRailing   form={form} set={set} />;
      case 6: return <StepStairs    form={form} set={set} />;
      case 7: return <StepSite      form={form} set={set} />;
      case 8: return <StepExtras    form={form} set={set} />;
      case 9: return (
        <div className="space-y-6">
          <ScopeSummary form={form} />
          <StepNotes form={form} set={set} />
        </div>
      );
      default: return null;
    }
  }

  return (
    <main className="min-h-screen bg-[#0b0f19] px-4 py-8 text-white">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">New Quote</h1>
            <p className="text-sm text-white/40">Fill in what you know — DeckMargin does the rest.</p>
          </div>
          <button type="button" onClick={() => router.push("/dashboard")}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/60 hover:bg-white/5">
            Cancel
          </button>
        </div>

        {/* Progress */}
        <ProgressBar steps={visibleSteps} currentId={step} />

        {/* Error */}
        {err && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{err}</div>
        )}

        {/* Step content */}
        <div className="rounded-2xl border border-white/10 bg-white/3 p-6 backdrop-blur-sm">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <button type="button" onClick={handleBack} disabled={isFirst}
            className="rounded-lg border border-white/15 px-5 py-2.5 text-sm text-white/60 hover:bg-white/5 disabled:opacity-30">
            ← Back
          </button>

          <div className="flex items-center gap-3">
            {saving && <span className="text-xs text-white/40">Saving…</span>}
            <button type="button" onClick={handleContinue} disabled={saving}
              className="rounded-lg bg-blue-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-60">
              {isLast ? "Save & Review Estimate →" : "Continue →"}
            </button>
          </div>
        </div>

        {/* Step hint */}
        <p className="mt-4 text-center text-xs text-white/25">
          Step {currentIdx + 1} of {visibleSteps.length} — you can edit anything later
        </p>

      </div>
    </main>
  );
}
