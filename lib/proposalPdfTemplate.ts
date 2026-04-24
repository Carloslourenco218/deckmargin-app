type HardwareItem = {
  key: string;
  label: string;
  enabled: boolean;
  cost: string;
};

type ProposalData = {
  id: string;
  name: string | null;
  status: string | null;
  job_type: string | null;

  deck_length: number | null;
  deck_width: number | null;
  deck_sqft: number | null;

  height_tier: string | null;
  material_type: string | null;
  railing_type: string | null;
  stair_count: number | null;

  lighting_enabled: boolean | null;
  lighting_cost: number | null;
  staining_enabled: boolean | null;
  staining_cost: number | null;
  built_ins_enabled: boolean | null;
  built_ins_cost: number | null;
  built_ins_description: string | null;

  hardware_items: HardwareItem[] | null;

  material_cost: number | null;
  labor_cost: number | null;
  permit_cost: number | null;
  equipment_cost: number | null;
  overhead_cost: number | null;
  total_job_cost: number | null;

  final_price: number | null;
  expected_profit: number | null;
  target_margin: number | null;

  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
  site_address: string | null;
  notes: string | null;

  created_at: string | null;
  updated_at: string | null;
};

type CompanyInfo = {
  company_name: string | null;
  company_phone: string | null;
  company_email: string | null;
};

const JOB_TYPE_LABELS: Record<string, string> = {
  new_build:    "New Build",
  resurface:    "Resurface",
  railing_only: "Railing Only",
  repair:       "Repair",
  addition:     "Addition",
};

function money(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function dateText(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US");
}

function text(value: string | null | undefined) {
  if (!value || value.trim() === "") return "—";
  return value;
}

function num(value: number | null | undefined, suffix = "") {
  if (value == null || Number.isNaN(value)) return "—";
  return `${Math.round(value)}${suffix}`;
}

function titleCase(value: string | null | undefined) {
  if (!value || value.trim() === "") return "—";
  return value
    .split(/[\s-_]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function jobTypeLabel(value: string | null | undefined) {
  if (!value) return "New Build";
  return JOB_TYPE_LABELS[value] ?? titleCase(value);
}

function buildScope(project: ProposalData) {
  const jobType = project.job_type ?? "new_build";
  const items: string[] = [];

  if (jobType === "resurface") {
    items.push("Remove and dispose of existing deck boards");
    items.push(`Install new ${project.material_type ? titleCase(project.material_type).toLowerCase() : "decking"} surface boards on existing frame`);
    if (project.staining_enabled) items.push("Professional staining and sealing of new deck surface");
    if (project.lighting_enabled) items.push("Installation of deck lighting package");
  } else if (jobType === "railing_only") {
    items.push("Remove existing railing if applicable");
    items.push(`Supply and install new ${project.railing_type && project.railing_type !== "none" ? titleCase(project.railing_type).toLowerCase() : ""} railing system`);
    items.push("Final inspection and cleanup");
  } else if (jobType === "repair") {
    items.push("Site assessment and scope confirmation");
    items.push("Repair work as outlined in project scope");
    items.push("Final inspection and cleanup walkthrough");
  } else if (jobType === "addition") {
    items.push("Site preparation and layout for deck addition");
    items.push("Partial framing and structural extension");
    items.push(`Installation of ${project.material_type ? titleCase(project.material_type).toLowerCase() : "decking"} surface`);
    if (project.railing_type && project.railing_type !== "none") {
      items.push(`Installation of ${titleCase(project.railing_type).toLowerCase()} railing on new addition`);
    }
    if ((project.stair_count ?? 0) > 0) {
      items.push(`Construction of ${project.stair_count} stair ${project.stair_count === 1 ? "section" : "sections"}`);
    }
    items.push("Final cleanup and completion walkthrough");
  } else {
    // new_build
    items.push("Site preparation and project layout");
    items.push("Deck framing and structural build");
    items.push(`Installation of ${project.material_type ? titleCase(project.material_type).toLowerCase() : "decking material"}`);
    if (project.railing_type && project.railing_type !== "none") {
      items.push(`Installation of ${titleCase(project.railing_type).toLowerCase()} railing system`);
    }
    if ((project.stair_count ?? 0) > 0) {
      items.push(`Construction of ${project.stair_count} stair ${project.stair_count === 1 ? "section" : "sections"}`);
    }
    if (project.lighting_enabled) items.push("Installation of deck lighting package");
    if (project.staining_enabled) items.push("Professional staining and sealing of deck surfaces");
    if (project.built_ins_enabled) {
      items.push(
        project.built_ins_description && project.built_ins_description.trim()
          ? `Built-in feature work: ${project.built_ins_description}`
          : "Built-in custom feature installation"
      );
    }
    const activeHardware = project.hardware_items?.filter((h) => h.enabled) ?? [];
    if (activeHardware.length > 0) items.push("Supply and installation of hardware and fasteners");
    items.push("Final cleanup and completion walkthrough");
  }

  return items;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function calcHardwareTotal(items: HardwareItem[]): number {
  return items.filter((i) => i.enabled).reduce((sum, i) => sum + (Number(i.cost) || 0), 0);
}

export function proposalHtml(project: ProposalData, company: CompanyInfo) {
  const scopeItems = buildScope(project);
  const activeHardware = project.hardware_items?.filter((h) => h.enabled) ?? [];
  const hwTotal = calcHardwareTotal(activeHardware);
  const jobType = project.job_type ?? "new_build";

  const hasAddons =
    project.lighting_enabled ||
    project.staining_enabled ||
    project.built_ins_enabled ||
    activeHardware.length > 0;

  const showProjectDetails = jobType !== "railing_only" && jobType !== "repair";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${escapeHtml(project.name ?? "Deck Proposal")}</title>
<style>
* { box-sizing: border-box; }
body { margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; color: #111827; background: #ffffff; }
.page { width: 100%; padding: 40px 44px 48px; }
.header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e5e7eb; padding-bottom: 18px; margin-bottom: 28px; }
.brand { font-size: 30px; font-weight: 800; letter-spacing: -0.03em; color: #111827; }
.brand-sub { margin-top: 6px; font-size: 13px; color: #6b7280; line-height: 1.5; }
.title-wrap { text-align: right; }
.title { margin: 0 0 6px; font-size: 26px; font-weight: 700; color: #111827; }
.subtle { font-size: 12px; color: #6b7280; line-height: 1.5; }
.job-type-badge { display: inline-block; margin-top: 6px; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; background: #f3f4f6; color: #374151; }
.hero { margin-bottom: 24px; padding: 22px 24px; border: 1px solid #e5e7eb; border-radius: 16px; background: #fafafa; }
.hero-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 700; color: #6b7280; margin-bottom: 10px; }
.hero-price { font-size: 40px; font-weight: 800; color: #111827; margin-bottom: 8px; }
.hero-note { font-size: 13px; color: #6b7280; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 24px; }
.panel { border: 1px solid #e5e7eb; border-radius: 14px; padding: 18px; background: #fff; }
.panel h2 { margin: 0 0 14px; font-size: 16px; color: #111827; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 18px; }
.info-item.full { grid-column: 1 / -1; }
.label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; margin-bottom: 5px; }
.value { font-size: 14px; color: #111827; word-break: break-word; line-height: 1.5; }
.section { margin-top: 24px; }
.section h2 { margin: 0 0 12px; font-size: 16px; color: #111827; }
.scope-box, .notes-box, .terms-box, .addons-box, .hardware-box, .acceptance-box { border: 1px solid #e5e7eb; border-radius: 14px; background: #fff; padding: 18px; }
.scope-list { margin: 0; padding-left: 20px; }
.scope-list li { margin: 0 0 10px; font-size: 14px; line-height: 1.6; color: #111827; }
.notes-box, .terms-box, .addons-box, .acceptance-box { font-size: 14px; line-height: 1.7; color: #111827; white-space: pre-wrap; }
.hardware-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.hardware-table th { text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; border-bottom: 1px solid #e5e7eb; padding: 6px 8px 8px; }
.hardware-table th:last-child { text-align: right; }
.hardware-table td { padding: 8px; border-bottom: 1px solid #f3f4f6; color: #111827; vertical-align: middle; }
.hardware-table td:last-child { text-align: right; font-weight: 600; }
.hardware-table tr:last-child td { border-bottom: none; }
.hardware-total-row td { border-top: 2px solid #e5e7eb !important; border-bottom: none !important; font-weight: 700; padding-top: 10px !important; }
.signature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px 28px; margin-top: 18px; }
.signature-item { padding-top: 16px; }
.signature-line { border-bottom: 1px solid #111827; height: 28px; margin-bottom: 8px; }
.signature-label { font-size: 12px; color: #6b7280; }
.footer { margin-top: 30px; padding-top: 12px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; gap: 16px; font-size: 11px; color: #6b7280; }
</style>
</head>
<body>
<div class="page">

  <div class="header">
    <div>
      <div class="brand">${escapeHtml(text(company.company_name))}</div>
      <div class="brand-sub">
        Deck Project Proposal<br />
        Phone: ${escapeHtml(text(company.company_phone))}<br />
        Email: ${escapeHtml(text(company.company_email))}
      </div>
    </div>
    <div class="title-wrap">
      <h1 class="title">${escapeHtml(project.name ?? "Untitled Proposal")}</h1>
      <div class="subtle">Prepared: ${escapeHtml(dateText(project.updated_at || project.created_at))}</div>
      <div class="subtle">Proposal ID: ${escapeHtml(project.id)}</div>
      <div class="job-type-badge">${escapeHtml(jobTypeLabel(project.job_type))}</div>
    </div>
  </div>

  <div class="hero">
    <div class="hero-label">Total Investment</div>
    <div class="hero-price">${escapeHtml(money(project.final_price))}</div>
    <div class="hero-note">Thank you for the opportunity to provide a proposal for your deck project.</div>
  </div>

  <div class="grid-2">
    <div class="panel">
      <h2>Prepared For</h2>
      <div class="info-grid">
        <div class="info-item"><div class="label">Client Name</div><div class="value">${escapeHtml(text(project.client_name))}</div></div>
        <div class="info-item"><div class="label">Phone</div><div class="value">${escapeHtml(text(project.client_phone))}</div></div>
        <div class="info-item full"><div class="label">Email</div><div class="value">${escapeHtml(text(project.client_email))}</div></div>
        <div class="info-item full"><div class="label">Project Address</div><div class="value">${escapeHtml(text(project.site_address))}</div></div>
      </div>
    </div>

    <div class="panel">
      <h2>Project Overview</h2>
      <div class="info-grid">
        <div class="info-item"><div class="label">Job Type</div><div class="value">${escapeHtml(jobTypeLabel(project.job_type))}</div></div>
        ${showProjectDetails ? `
        <div class="info-item"><div class="label">Deck Size</div><div class="value">${escapeHtml(num(project.deck_sqft, " sq ft"))}</div></div>
        <div class="info-item"><div class="label">Deck Length</div><div class="value">${escapeHtml(num(project.deck_length, " ft"))}</div></div>
        <div class="info-item"><div class="label">Deck Width</div><div class="value">${escapeHtml(num(project.deck_width, " ft"))}</div></div>
        <div class="info-item"><div class="label">Height Tier</div><div class="value">${escapeHtml(titleCase(project.height_tier))}</div></div>
        <div class="info-item"><div class="label">Material</div><div class="value">${escapeHtml(titleCase(project.material_type))}</div></div>
        <div class="info-item"><div class="label">Railing</div><div class="value">${escapeHtml(titleCase(project.railing_type))}</div></div>
        ${(project.stair_count ?? 0) > 0 ? `<div class="info-item"><div class="label">Stair Count</div><div class="value">${escapeHtml(num(project.stair_count))}</div></div>` : ""}
        ` : `
        <div class="info-item"><div class="label">Railing Type</div><div class="value">${escapeHtml(titleCase(project.railing_type))}</div></div>
        `}
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Scope of Work</h2>
    <div class="scope-box">
      <ul class="scope-list">
        ${scopeItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </div>
  </div>

  ${hasAddons ? `
  <div class="section">
    <h2>Optional Add-ons Included</h2>
    <div class="addons-box">
      ${project.lighting_enabled ? `Lighting: ${escapeHtml(money(project.lighting_cost))}<br />` : ""}
      ${project.staining_enabled ? `Staining / Sealing: ${escapeHtml(money(project.staining_cost))}<br />` : ""}
      ${project.built_ins_enabled ? `Built-ins${project.built_ins_description ? ` (${escapeHtml(project.built_ins_description)})` : ""}: ${escapeHtml(money(project.built_ins_cost))}<br />` : ""}
    </div>
  </div>
  ` : ""}

  ${activeHardware.length > 0 ? `
  <div class="section">
    <h2>Hardware &amp; Fasteners</h2>
    <div class="hardware-box">
      <table class="hardware-table">
        <thead><tr><th>Item</th><th style="text-align:right;">Cost</th></tr></thead>
        <tbody>
          ${activeHardware.map((item) => `<tr><td>${escapeHtml(item.label)}</td><td>${escapeHtml(money(Number(item.cost) || 0))}</td></tr>`).join("")}
          <tr class="hardware-total-row"><td>Hardware total</td><td>${escapeHtml(money(hwTotal))}</td></tr>
        </tbody>
      </table>
    </div>
  </div>
  ` : ""}

  <div class="section">
    <h2>Project Notes</h2>
    <div class="notes-box">${escapeHtml(
      project.notes && project.notes.trim()
        ? project.notes
        : "Project details and final site-specific adjustments will be reviewed prior to work beginning."
    )}</div>
  </div>

  <div class="section">
    <h2>Proposal Terms</h2>
    <div class="terms-box">This quote is valid for 30 days from the date of issuance. After 30 days, pricing is subject to review and adjustment based on current material market rates and labor availability.

We are currently seeing high demand for deck builds this season. To ensure we can hit your target completion date and secure our current lumber pricing, we recommend finalizing this agreement within the next 14 days.</div>
  </div>

  <div class="section">
    <h2>Acceptance</h2>
    <div class="acceptance-box">By signing below, the client acknowledges acceptance of this proposal and the pricing outlined above.
      <div class="signature-grid">
        <div class="signature-item"><div class="signature-line"></div><div class="signature-label">Client Signature</div></div>
        <div class="signature-item"><div class="signature-line"></div><div class="signature-label">Date</div></div>
        <div class="signature-item"><div class="signature-line"></div><div class="signature-label">Client Printed Name</div></div>
        <div class="signature-item"><div class="signature-line"></div><div class="signature-label">Contractor Signature</div></div>
        <div class="signature-item"><div class="signature-line"></div><div class="signature-label">Contractor Printed Name</div></div>
        <div class="signature-item"><div class="signature-line"></div><div class="signature-label">Date</div></div>
      </div>
    </div>
  </div>

  <div class="footer">
    <div>${escapeHtml(text(company.company_name))}</div>
    <div>${escapeHtml(text(company.company_phone))} • ${escapeHtml(text(company.company_email))}</div>
  </div>

</div>
</body>
</html>`;
}