// app/api/projects/[id]/accept/route.ts
// POST — public endpoint; validates proposal_token, records acceptance

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { token, acceptedByName } = await req.json() as {
    token: string;
    acceptedByName: string;
  };

  if (!token || !acceptedByName?.trim()) {
    return NextResponse.json({ error: "token and acceptedByName required" }, { status: 400 });
  }

  // Validate token against project — no auth needed (uses service role)
  const { data: project, error: fetchErr } = await supabaseAdmin
    .from("projects")
    .select("id, status, proposal_token, proposal_token_active, client_email, user_id, name")
    .eq("id", id)
    .eq("proposal_token", token)
    .eq("proposal_token_active", true)
    .maybeSingle();

  if (fetchErr || !project) {
    return NextResponse.json({ error: "Invalid or expired proposal link" }, { status: 403 });
  }

  if (project.status === "accepted") {
    return NextResponse.json({ ok: true, alreadyAccepted: true });
  }

  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? null;
  const acceptedAt = new Date().toISOString();

  const { error: updateErr } = await supabaseAdmin
    .from("projects")
    .update({
      status: "accepted",
      accepted_at: acceptedAt,
      accepted_by_name: acceptedByName.trim(),
      accepted_ip: ip,
      updated_at: acceptedAt,
    })
    .eq("id", id);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  // Send confirmation email to contractor (fire-and-forget)
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey && project.user_id) {
    const { data: company } = await supabaseAdmin
      .from("user_settings")
      .select("company_email, company_name")
      .eq("user_id", project.user_id)
      .maybeSingle();

    const contractorEmail = company?.company_email;
    if (contractorEmail) {
      const companyName = company?.company_name ?? "DeckMargin";
      const html = `<!DOCTYPE html>
<html><body style="font-family:-apple-system,sans-serif;padding:40px;background:#f6f7fb;">
<div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:40px;">
  <div style="font-size:32px;text-align:center;margin-bottom:16px;">🎉</div>
  <h2 style="margin:0 0 8px;color:#111827;">Proposal Accepted!</h2>
  <p style="color:#374151;margin:0 0 24px;">
    <strong>${acceptedByName}</strong> has accepted the proposal for
    <strong>${project.name ?? "your project"}</strong>.
  </p>
  <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;color:#166534;font-size:14px;">
    Accepted at: ${new Date(acceptedAt).toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}
  </div>
  <p style="color:#6b7280;font-size:13px;margin-top:24px;">Log in to DeckMargin to view the project and next steps.</p>
</div>
</body></html>`;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `DeckMargin <proposals@deckmargin.com>`,
          to: [contractorEmail],
          subject: `✅ Proposal Accepted — ${project.name ?? "Deck Project"}`,
          html,
        }),
      }).catch(() => {/* ignore email errors — don't block the response */});
    }
  }

  return NextResponse.json({ ok: true });
}
