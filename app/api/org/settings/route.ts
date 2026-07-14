// app/api/org/settings/route.ts
// GET  — Any org member can read guardrail values (min_margin_pct, max_discount_pct).
// PATCH — Owner-only. Set min_margin_pct and/or max_discount_pct.

import { NextRequest, NextResponse } from 'next/server';
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
    return NextResponse.json({ error: 'No organization found' }, { status: 404 });
  }

  const { data: org, error } = await supabase
    .from('organizations')
    .select('id, name, min_margin_pct, max_discount_pct')
    .eq('id', profile.org_id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ org });
}

export async function PATCH(req: NextRequest) {
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

  if (!profile || profile.org_role !== 'owner') {
    return NextResponse.json({ error: 'Forbidden: only owners can change guardrails' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { min_margin_pct, max_discount_pct } = body as {
    min_margin_pct?: number | null;
    max_discount_pct?: number | null;
  };

  if (min_margin_pct !== undefined && min_margin_pct !== null) {
    if (min_margin_pct < 0 || min_margin_pct > 100) {
      return NextResponse.json({ error: 'min_margin_pct must be 0–100' }, { status: 400 });
    }
  }
  if (max_discount_pct !== undefined && max_discount_pct !== null) {
    if (max_discount_pct < 0 || max_discount_pct > 100) {
      return NextResponse.json({ error: 'max_discount_pct must be 0–100' }, { status: 400 });
    }
  }

  const updates: Record<string, unknown> = {};
  if (min_margin_pct  !== undefined) updates.min_margin_pct  = min_margin_pct;
  if (max_discount_pct !== undefined) updates.max_discount_pct = max_discount_pct;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const { data: org, error: updateErr } = await supabase
    .from('organizations')
    .update(updates)
    .eq('id', profile.org_id)
    .select('id, name, min_margin_pct, max_discount_pct')
    .single();

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ org });
}
