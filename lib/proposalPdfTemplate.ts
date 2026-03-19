type ProposalData = {
  id: string;
  name: string | null;
  status: string | null;

  deck_length: number | null;
  deck_width: number | null;
  deck_sqft: number | null;

  height_tier: string | null;
  material_type: string | null;
  railing_type: string | null;
  stair_count: number | null;

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

function money(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
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

function buildScope(project: ProposalData) {
  const items: string[] = [
    "Site preparation and layout",
    "Deck framing and structural build",
    `Installation of ${project.material_type ? titleCase(project.material_type).toLowerCase() : "decking material"}`,
  ];

  if (project.railing_type && project.railing_type !== "none") {
    items.push(`Installation of ${titleCase(project.railing_type).toLowerCase()} railing system`);
  }

  if ((project.stair_count ?? 0) > 0) {
    items.push(`Construction of ${project.stair_count} stair ${project.stair_count === 1 ? "section" : "sections"}`);
  }

  items.push("Final cleanup and completion walkthrough");

  return items;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function proposalHtml(project: ProposalData) {
  const scopeItems = buildScope(project);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(project.name ?? "Deck Proposal")}</title>
  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 0;
      font-family: Arial, Helvetica, sans-serif;
      color: #111827;
      background: #ffffff;
    }

    .page {
      width: 100%;
      padding: 40px 44px 48px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 18px;
      margin-bottom: 28px;
    }

    .brand {
      font-size: 30px;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: #111827;
    }

    .brand-sub {
      margin-top: 6px;
      font-size: 13px;
      color: #6b7280;
    }

    .title-wrap {
      text-align: right;
    }

    .title {
      margin: 0 0 6px;
      font-size: 26px;
      font-weight: 700;
      color: #111827;
    }

    .subtle {
      font-size: 12px;
      color: #6b7280;
      line-height: 1.5;
    }

    .hero {
      margin-bottom: 24px;
      padding: 22px 24px;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      background: #fafafa;
    }

    .hero-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-weight: 700;
      color: #6b7280;
      margin-bottom: 10px;
    }

    .hero-price {
      font-size: 40px;
      font-weight: 800;
      color: #111827;
      margin-bottom: 8px;
    }

    .hero-note {
      font-size: 13px;
      color: #6b7280;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
      margin-bottom: 24px;
    }

    .panel {
      border: 1px solid #e5e7eb;
      border-radius: 14px;
      padding: 18px;
      background: #fff;
    }

    .panel h2 {
      margin: 0 0 14px;
      font-size: 16px;
      color: #111827;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px 18px;
    }

    .info-item.full {
      grid-column: 1 / -1;
    }

    .label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #6b7280;
      margin-bottom: 5px;
    }

    .value {
      font-size: 14px;
      color: #111827;
      word-break: break-word;
      line-height: 1.5;
    }

    .section {
      margin-top: 24px;
    }

    .section h2 {
      margin: 0 0 12px;
      font-size: 16px;
      color: #111827;
    }

    .scope-box,
    .notes-box,
    .terms-box {
      border: 1px solid #e5e7eb;
      border-radius: 14px;
      background: #fff;
      padding: 18px;
    }

    .scope-list {
      margin: 0;
      padding-left: 20px;
    }

    .scope-list li {
      margin: 0 0 10px;
      font-size: 14px;
      line-height: 1.6;
      color: #111827;
    }

    .notes-box,
    .terms-box {
      font-size: 14px;
      line-height: 1.7;
      color: #111827;
      white-space: pre-wrap;
    }

    .footer {
      margin-top: 30px;
      padding-top: 12px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      gap: 16px;
      font-size: 11px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div>
        <div class="brand">DeckMargin</div>
        <div class="brand-sub">Deck Project Proposal</div>
      </div>

      <div class="title-wrap">
        <h1 class="title">${escapeHtml(project.name ?? "Untitled Proposal")}</h1>
        <div class="subtle">Prepared: ${escapeHtml(dateText(project.updated_at || project.created_at))}</div>
        <div class="subtle">Proposal ID: ${escapeHtml(project.id)}</div>
      </div>
    </div>

    <div class="hero">
      <div class="hero-label">Total Investment</div>
      <div class="hero-price">${escapeHtml(money(project.final_price))}</div>
      <div class="hero-note">
        Thank you for the opportunity to provide a proposal for your deck project.
      </div>
    </div>

    <div class="grid-2">
      <div class="panel">
        <h2>Prepared For</h2>
        <div class="info-grid">
          <div class="info-item">
            <div class="label">Client Name</div>
            <div class="value">${escapeHtml(text(project.client_name))}</div>
          </div>

          <div class="info-item">
            <div class="label">Phone</div>
            <div class="value">${escapeHtml(text(project.client_phone))}</div>
          </div>

          <div class="info-item full">
            <div class="label">Email</div>
            <div class="value">${escapeHtml(text(project.client_email))}</div>
          </div>

          <div class="info-item full">
            <div class="label">Project Address</div>
            <div class="value">${escapeHtml(text(project.site_address))}</div>
          </div>
        </div>
      </div>

      <div class="panel">
        <h2>Project Overview</h2>
        <div class="info-grid">
          <div class="info-item">
            <div class="label">Deck Length</div>
            <div class="value">${escapeHtml(num(project.deck_length, " ft"))}</div>
          </div>

          <div class="info-item">
            <div class="label">Deck Width</div>
            <div class="value">${escapeHtml(num(project.deck_width, " ft"))}</div>
          </div>

          <div class="info-item">
            <div class="label">Deck Size</div>
            <div class="value">${escapeHtml(num(project.deck_sqft, " sq ft"))}</div>
          </div>

          <div class="info-item">
            <div class="label">Height Tier</div>
            <div class="value">${escapeHtml(titleCase(project.height_tier))}</div>
          </div>

          <div class="info-item">
            <div class="label">Material</div>
            <div class="value">${escapeHtml(titleCase(project.material_type))}</div>
          </div>

          <div class="info-item">
            <div class="label">Railing</div>
            <div class="value">${escapeHtml(titleCase(project.railing_type))}</div>
          </div>

          <div class="info-item">
            <div class="label">Stair Count</div>
            <div class="value">${escapeHtml(num(project.stair_count))}</div>
          </div>
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
      <div class="terms-box">This proposal reflects the scope of work outlined above and the total investment required to complete the project. Final scheduling, start date, and any site-specific clarifications can be confirmed upon approval.</div>
    </div>

    <div class="footer">
      <div>Prepared by DeckMargin</div>
      <div>${escapeHtml(dateText(new Date().toISOString()))}</div>
    </div>
  </div>
</body>
</html>
`;
}

