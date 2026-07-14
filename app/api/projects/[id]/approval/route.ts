// app/api/projects/[id]/approval/route.ts
// POST — Owner approves or rejects a quote flagged as pending_approval.
//
// Request body: { action: 'approve' | 'reject'; notes?: string }
// Response:     { project: { id, approval_status, approval_resolved_at, approval_notes } }

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only owners can approve / reject
  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id, org_role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.org_role !== 'owner') {
    return NextResponse.json({ error: 'Forbidden: only owners can approve quotes' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { action, notes } = body as { action?: string; notes?: string };

  if (!action || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'action must be approve or reject' }, { status: 400 });
  }

  // Confirm the project exists and belongs to this owner's org
  const { data: project, error: fetchErr } = await supabase
    .from('projects')
    .select('id, org_id, approval_status')
    .eq('id', id)
    .eq('org_id', profile.org_id)
    .single();

  if (fetchErr || !project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  if (project.approval_status !== 'pending_approval') {
    return NextResponse.json(
      { error: `Project is not pending approval (current status: ${project.approval_status ?? 'none'})` },
      { status: 409 }
    );
  }

  const newStatus = action === 'approve' ? 'approved' : 'rejected';

  const { data: updated, error: updateErr } = await supabase
    .from('projects')
    .update({
      approval_status:       newStatus,
      approval_resolved_at:  new Date().toISOString(),
      approval_resolved_by:  user.id,
      approval_notes:        notes ?? null,
    })
    .eq('id', id)
    .select('id, approval_status, approval_resolved_at, approval_notes')
    .single();

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ project: updated });
}
