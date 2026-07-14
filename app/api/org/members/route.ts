// app/api/org/members/route.ts
// GET — Owner lists all org members with status + role info.
// Field users get back only their own record (RLS enforced).

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function GET() {
  const supabase = await createClient();

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id, org_role')
    .eq('id', user.id)
    .single();

  if (!profile?.org_id) {
    return NextResponse.json({ members: [] });
  }

  const { data: members, error } = await supabase
    .from('org_members')
    .select('*')
    .eq('org_id', profile.org_id)
    .order('activated_at', { ascending: true, nullsFirst: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ members: members ?? [] });
}
