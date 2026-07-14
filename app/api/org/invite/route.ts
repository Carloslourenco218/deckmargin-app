// app/api/org/invite/route.ts
// POST — Owner invites a teammate by email. Creates an org_members record
// and sends a Supabase invite email so the user can set their password.
//
// Request body: { email: string; role: 'owner' | 'field_user' }
// Response:     { member: OrgMember }   or error

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { OrgRole } from '@/lib/org/types';

// Admin client — uses service role key, server-side only
const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  // ── Auth check ──────────────────────────────────────────────────
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── Role check — only owners can invite ─────────────────────────
  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id, org_role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.org_role !== 'owner') {
    return NextResponse.json({ error: 'Forbidden: only owners can invite teammates' }, { status: 403 });
  }

  // ── Parse body ──────────────────────────────────────────────────
  const body = await req.json().catch(() => ({}));
  const { email, role } = body as { email?: string; role?: OrgRole };

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
  }
  if (!role || !['owner', 'field_user'].includes(role)) {
    return NextResponse.json({ error: 'role must be owner or field_user' }, { status: 400 });
  }

  // ── Check for duplicate invite within this org ──────────────────
  const { data: existing } = await supabase
    .from('org_members')
    .select('id, status')
    .eq('org_id', profile.org_id)
    .eq('email', email.toLowerCase())
    .maybeSingle();

  if (existing) {
    if (existing.status === 'active') {
      return NextResponse.json({ error: 'This email is already an active member' }, { status: 409 });
    }
    if (existing.status === 'pending') {
      return NextResponse.json({ error: 'An invite is already pending for this email' }, { status: 409 });
    }
    // Deactivated — allow re-invite by updating instead of inserting
    const { data: updated, error: updateErr } = await supabase
      .from('org_members')
      .update({ role, status: 'pending', invited_by: user.id, invited_at: new Date().toISOString(), activated_at: null })
      .eq('id', existing.id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    await supabaseAdmin.auth.admin.inviteUserByEmail(email.toLowerCase(), {
      data: { org_id: profile.org_id, org_role: role },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/dashboard`,
    });

    return NextResponse.json({ member: updated });
  }

  // ── Create pending org_members record ───────────────────────────
  const { data: member, error: memberErr } = await supabase
    .from('org_members')
    .insert({
      org_id:     profile.org_id,
      email:      email.toLowerCase(),
      role,
      status:     'pending',
      invited_by: user.id,
    })
    .select()
    .single();

  if (memberErr) {
    return NextResponse.json({ error: memberErr.message }, { status: 500 });
  }

  // ── Send invite email via Supabase admin client ─────────────────
  const { error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(
    email.toLowerCase(),
    {
      data: { org_id: profile.org_id, org_role: role },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/dashboard`,
    }
  );

  if (inviteErr) {
    await supabase.from('org_members').delete().eq('id', member.id);
    return NextResponse.json({ error: `Invite email failed: ${inviteErr.message}` }, { status: 500 });
  }

  return NextResponse.json({ member }, { status: 201 });
}
