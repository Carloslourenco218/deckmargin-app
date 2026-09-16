// app/api/projects/[id]/share/route.ts
// POST — activate the proposal_token and return the shareable URL
// DELETE — deactivate the token (revoke link)

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch current token — gen_random_uuid() default handles first-time creation
  const { data: proj, error: fetchErr } = await supabase
    .from("projects")
    .select("proposal_token, proposal_token_active")
    .eq("id", id)
    .single();

  if (fetchErr || !proj) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Activate the token (generate new one if null)
  const { data: updated, error: updateErr } = await supabase
    .from("projects")
    .update({
      proposal_token_active: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("proposal_token")
    .single();

  if (updateErr || !updated?.proposal_token) {
    return NextResponse.json({ error: updateErr?.message ?? "Update failed" }, { status: 500 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://app.deckmargin.com";
  return NextResponse.json({ url: `${baseUrl}/p/${updated.proposal_token}` });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await supabase
    .from("projects")
    .update({ proposal_token_active: false, updated_at: new Date().toISOString() })
    .eq("id", id);

  return NextResponse.json({ ok: true });
}
