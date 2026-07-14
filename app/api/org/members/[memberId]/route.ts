// app/api/org/members/[memberId]/route.ts
// PATCH — Owner changes a member's role or status (deactivate / reactivate).
//
// Request body: { role?: 'owner' | 'field_user'; status?: 'active' | 'deactivated' }

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import type { OrgRole, MemberStatus } from '@/lib/org/types';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const { memberId } = await params;
  const supabase = await createClient();

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only owners can manage members
  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id, org_role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.org_role !== 'owner') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { role, status } = body as { role?: OrgRole; status?: MemberStatus };

  if (role && !['owner', 'field_user'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }
  if (status && !['active', 'deactivated'].includes(status)) {
    return NextResponse.json({ error: 'status must be active or deactivated' }, { status: 400 });
  }
  if (!role && !status) {
    return NextResponse.json({ error: 'Provide role or status to update' }, { status: 400 });
  }

  // Confirm the target member belongs to this owner's org
  const { data: target, error: fetchErr } = await supabase
    .from('org_members')
    .select('id, org_id, user_id, role, status')
    .eq('id', memberId)
    .eq('org_id', profile.org_id)
    .single();

  if (fetchErr || !target) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 });
  }

  // Prevent the owner from deactivating themselves
  if (target.user_id === user.id && status === 'deactivated') {
    return NextResponse.json({ error: 'Cannot deactivate your own account' }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (role)   updates.role   = role;
  if (status) updates.status = status;

  const { data: updated, error: updateErr } = await supabase
    .from('org_members')
    .update(updates)
    .eq('id', memberId)
    .select()
    .single();

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  // If role changed, sync profiles.org_role for the affected user
  if (role && target.user_id) {
    await supabase
      .from('profiles')
      .update({ org_role: role })
      .eq('id', target.user_id);
  }

  return NextResponse.json({ member: updated });
}
