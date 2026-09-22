// app/api/email/send-proposal/route.ts
// POST — send the proposal to the client via Resend

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabase/admin";

function money(n: number | null | undefined) {
  if (n == null) return "-";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function buildEmailHtml(project: any, company: any, shareUrl: string | null): string {
  const companyName = company?.company_name ?? "Your Deck Contractor";
  const companyEmail = company?.company_email ?? "";
  const companyPhone = company?.company_phone ?? "";
  const clientName = project.client_name ?? "there";
  const projectName = project.name ?? "Deck Project";
  const finalPrice = money(project.final_price);
  const shareLink = shareUrl
    ? `<p style="text-align:center;margin:32px 0;">
        <a href="${shareUrl}" style="background:#2563eb;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;display:inline-block;">
          View Your Proposal Online →
        </a>
       </p>`
    : "";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f6f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">

    <!-- Header -->
    <div style="background:#1e293b;padding:32px 40px;">
      <div style="font-size:22px;font-weight:700;color:#fff;">${companyName}</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.6);margin-top:4px;">Deck Proposal</div>
    </div>

    <!-- Body -->
    <div style="padding:40px;">
      <p style="font-size:16px;color:#111827;margin:0 0 16px;">Hi ${clientName},</p>
      <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 24px;">
        Thank you for the opportunity. Please find your deck proposal below for <strong>${projectName}</strong>.
      </p>

      <!-- Price card -->
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:24px;text-align:center;margin:0 0 32px;">
        <div style="font-size:13px;color:#166534;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Total Quoted Price</div>
        <div style="font-size:40px;font-weight:700;color:#15803d;margin-top:8px;">${finalPrice}</div>
        ${project.deck_sqft ? `<div style="font-size:13px;color:#166534;margin-top:4px;">${project.deck_sqft} sq ft deck</div>` : ""}
      </div>

      <!-- Scope summary -->
      <table style="width:100%;border-collapse:collapse;margin:0 0 32px;">
        <tbody>
          ${project.site_address ? `<tr><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:14px;width:40%;">Site Address</td><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#111827;font-size:14px;font-weight:500;">${project.site_address}</td></tr>` : ""}
          ${project.material_type ? `<tr><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:14px;">Material</td><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#111827;font-size:14px;font-weight:500;">${project.material_type}</td></tr>` : ""}
          ${project.height_tier ? `<tr><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:14px;">Height Tier</td><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#111827;font-size:14px;font-weight:500;">${project.height_tier}</td></tr>` : ""}
          ${project.railing_type && project.railing_type !== "none" ? `<tr><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:14px;">Railing</td><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#111827;font-size:14px;font-weight:500;">${project.railing_type}</td></tr>` : ""}
          ${project.stair_count > 0 ? `<tr><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:14px;">Stairs</td><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#111827;font-size:14px;font-weight:500;">${project.stair_count} steps</td></tr>` : ""}
        </tbody>
      </table>

      ${shareLink}

      <!-- CTA if no share link -->
      ${!shareUrl ? `<p style="font-size:14px;color:#6b7280;text-align:center;margin:32px 0;">To download a PDF copy, please contact us directly.</p>` : ""}

      <!-- Footer -->
      <div style="border-top:1px solid #f3f4f6;padding-top:24px;margin-top:8px;">
        <p style="font-size:14px;color:#374151;margin:0 0 8px;">Questions? We're here to help.</p>
        ${companyPhone ? `<p style="font-size:14px;color:#6b7280;margin:4px 0;">📞 ${companyPhone}</p>` : ""}
        ${companyEmail ? `<p style="font-size:14px;color:#6b7280;margin:4px 0;">✉️ ${companyEmail}</p>` : ""}
        <p style="font-size:12px;color:#9ca3af;margin-top:24px;">This proposal was generated by ${companyName} via DeckMargin.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await req.json() as { projectId: string };
  if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 });

  // Fetch project (RLS ensures ownership)
  const { data: project, error: projErr } = await supabase
    .from("projects")
    .select(`
      id, name, status, job_type,
      client_name, client_email, site_address,
      deck_sqft, deck_length, deck_width, height_tier, material_type,
      railing_type, stair_count, final_price,
      proposal_token, proposal_token_active
    `)
    .eq("id", projectId)
    .single();

  if (projErr || !project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  if (!project.client_email) return NextResponse.json({ error: "Project has no client email" }, { status: 400 });

  // Fetch company settings
  const { data: company } = await supabase
    .from("user_settings")
    .select("company_name, company_email, company_phone, company_website")
    .eq("user_id", user.id)
    .maybeSingle();

  // Build shareable URL if token is active
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://deckmargin.com";
  const shareUrl = project.proposal_token_active && project.proposal_token
    ? `${baseUrl}/p/${project.proposal_token}`
    : null;

  const html = buildEmailHtml(project, company, shareUrl);
  const companyName = company?.company_name ?? "Your Deck Contractor";
  const subject = `Your Deck Proposal from ${companyName}`;

  // Send via Resend
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Email not configured (RESEND_API_KEY missing)" }, { status: 503 });

  const resendRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${companyName} <proposals@deckmargin.com>`,
      to: [project.client_email],
      subject,
      html,
    }),
  });

  if (!resendRes.ok) {
    const errBody = await resendRes.text();
    return NextResponse.json({ error: `Resend error: ${errBody}` }, { status: 500 });
  }

  // Update project status to "sent" if it was draft/open
  if (project.status === "draft" || project.status === "open") {
    await supabase
      .from("projects")
      .update({ status: "sent", updated_at: new Date().toISOString() })
      .eq("id", projectId);
  }

  return NextResponse.json({ ok: true, to: project.client_email });
}
