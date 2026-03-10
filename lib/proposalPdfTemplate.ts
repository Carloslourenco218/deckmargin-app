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

function percent(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "—";
  if (value <= 1) return `${Math.round(value * 100)}%`;
  return `${Math.round(value)}%`;
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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function proposalHtml(project: ProposalData) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(project.name ?? "Deck Quote")}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, Helvetica, sans-serif;
      color: #111827;
      background: #ffffff;
    }
    .page {
      width: 100%;
      padding: 36px 42px 44px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .brand {
      font-size: 30px;
      font-weight: 800;
      letter-spacing: -0.03em;
    }
    .brand-sub {
      font-size: 13px;
      color: #6b7280;
      margin-top: 6px;
    }
    .quote-title {
      text-align: right;
    }
    .quote-title h1 {
      margin: 0 0 6px;
      font-size: 24px;
    }
    .subtle {
      font-size: 12px;
      color: #6b7280;
      line-height: 1.5;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 22px;
    }
    .summary-card {
      border: 1px solid #e5e7eb;
      border-radius: 14px;
      padding: 14px;
      background: #fafafa;
    }
    .summary-label {
      font-size: 11px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .summary-value {
      font-size: 24px;
      font-weight: 700;
    }
    .section {
      margin-top: 24px;
    }
    .section h2 {
      font-size: 15px;
      margin: 0 0 12px;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 8px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .panel {
      border: 1px solid #e5e7eb;
      border-radius: 14px;
      padding: 16px;
      background: #fff;
    }
    .panel-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px 16px;
    }
    .item-label {
      font-size: 11px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-weight: 700;
      margin-bottom: 5px;
    }
    .item-value {
      font-size: 14px;
      color: #111827;
      word-break: break-word;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
    }
    thead { background: #f3f4f6; }
    th, td {
      padding: 12px 14px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 13px;
      text-align: left;
    }
    th:last-child, td:last-child {
      text-align: right;
    }
    .notes {
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      background: #fff;
      padding: 14px;
      min-height: 72px;
      white-space: pre-wrap;
      font-size: 13px;
      line-height: 1.6;
    }
    .footer {
      margin-top: 28px;
      padding-top: 12px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
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
        <div class="brand-sub">Professional deck quote proposal</div>
      </div>
      <div class="quote-title">
        <h1>${escapeHtml(project.name ?? "Untitled Quote")}</h1>
        <div class="subtle">Quote ID: ${escapeHtml(project.id)}</div>
        <div class="subtle">Created: ${escapeHtml(dateText(project.created_at))}</div>
        <div class="subtle">Updated: ${escapeHtml(dateText(project.updated_at))}</div>
        <div class="subtle">Status: ${escapeHtml(project.status ?? "open")}</div>
      </div>
    </div>

    <div class="summary">
      <div class="summary-card">
        <div class="summary-label">Final Price</div>
        <div class="summary-value">${escapeHtml(money(project.final_price))}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">Total Job Cost</div>
        <div class="summary-value">${escapeHtml(money(project.total_job_cost))}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">Expected Profit</div>
        <div class="summary-value">${escapeHtml(money(project.expected_profit))}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">Target Margin</div>
        <div class="summary-value">${escapeHtml(percent(project.target_margin))}</div>
      </div>
    </div>

    <div class="section">
      <h2>Client & Project Information</h2>
      <div class="grid-2">
        <div class="panel">
          <div class="panel-grid">
            <div>
              <div class="item-label">Client Name</div>
              <div class="item-value">${escapeHtml(text(project.client_name))}</div>
            </div>
            <div>
              <div class="item-label">Phone</div>
              <div class="item-value">${escapeHtml(text(project.client_phone))}</div>
            </div>
            <div>
              <div class="item-label">Email</div>
              <div class="item-value">${escapeHtml(text(project.client_email))}</div>
            </div>
            <div>
              <div class="item-label">Site Address</div>
              <div class="item-value">${escapeHtml(text(project.site_address))}</div>
            </div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-grid">
            <div>
              <div class="item-label">Deck Length</div>
              <div class="item-value">${escapeHtml(num(project.deck_length, " ft"))}</div>
            </div>
            <div>
              <div class="item-label">Deck Width</div>
              <div class="item-value">${escapeHtml(num(project.deck_width, " ft"))}</div>
            </div>
            <div>
              <div class="item-label">Deck Sq Ft</div>
              <div class="item-value">${escapeHtml(num(project.deck_sqft))}</div>
            </div>
            <div>
              <div class="item-label">Height Tier</div>
              <div class="item-value">${escapeHtml(text(project.height_tier))}</div>
            </div>
            <div>
              <div class="item-label">Material Type</div>
              <div class="item-value">${escapeHtml(text(project.material_type))}</div>
            </div>
            <div>
              <div class="item-label">Railing Type</div>
              <div class="item-value">${escapeHtml(text(project.railing_type))}</div>
            </div>
            <div>
              <div class="item-label">Stair Count</div>
              <div class="item-value">${escapeHtml(num(project.stair_count))}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Cost Breakdown</h2>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Materials</td><td>${escapeHtml(money(project.material_cost))}</td></tr>
          <tr><td>Labor</td><td>${escapeHtml(money(project.labor_cost))}</td></tr>
          <tr><td>Permits</td><td>${escapeHtml(money(project.permit_cost))}</td></tr>
          <tr><td>Equipment</td><td>${escapeHtml(money(project.equipment_cost))}</td></tr>
          <tr><td>Overhead</td><td>${escapeHtml(money(project.overhead_cost))}</td></tr>
          <tr><td><strong>Total Job Cost</strong></td><td><strong>${escapeHtml(money(project.total_job_cost))}</strong></td></tr>
          <tr><td><strong>Final Price</strong></td><td><strong>${escapeHtml(money(project.final_price))}</strong></td></tr>
          <tr><td><strong>Expected Profit</strong></td><td><strong>${escapeHtml(money(project.expected_profit))}</strong></td></tr>
          <tr><td><strong>Target Margin</strong></td><td><strong>${escapeHtml(percent(project.target_margin))}</strong></td></tr>
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>Notes</h2>
      <div class="notes">${escapeHtml(text(project.notes))}</div>
    </div>

    <div class="footer">
      <div>Generated by DeckMargin</div>
      <div>${escapeHtml(dateText(new Date().toISOString()))}</div>
    </div>
  </div>
</body>
</html>
`;
}

