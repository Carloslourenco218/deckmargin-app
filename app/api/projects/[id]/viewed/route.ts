// app/api/projects/[id]/viewed/route.ts
// POST — record that the public proposal was viewed (no auth required)
// Called from /p/[token]/page.tsx server component after successful token lookup

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  // Fetch current project status so we only advance in one direction
  const { data: project, error: fetchErr } = await supabaseAdmin
    .from("projects")
    .select("status, viewed_at, view_count")
    .eq("id", id)
    .single();

  if (fetchErr || !project) {
    return NextResponse.json({ ok: true }); // silent — don't break public page
  }

  const updates: Record<string, unknown> = {
    view_count: (project.view_count ?? 0) + 1,
  };

  // Set viewed_at on first view only
  if (!project.viewed_at) {
    updates.viewed_at = new Date().toISOString();
  }

  // Advance status to "viewed" only if currently sent/ready_to_send
  const advanceFrom = ["sent", "ready_to_send", "open"];
  if (advanceFrom.includes(project.status ?? "")) {
    updates.status = "viewed";
  }

  await supabaseAdmin
    .from("projects")
    .update(updates)
    .eq("id", id);

  return NextResponse.json({ ok: true });
}
