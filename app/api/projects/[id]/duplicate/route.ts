// app/api/projects/[id]/duplicate/route.ts
// POST — Duplicate an existing project, returning the new project id.
// All cost fields are preserved; status is reset to "draft" and name gets "Copy of " prefix.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch the source project — RLS ensures the user can only read their own
  const { data: src, error: fetchErr } = await supabase
    .from('projects')
    .select(`
      user_id, org_id, name, status, job_type,
      client_name, client_email, client_phone, site_address, notes,
      deck_length, deck_width, deck_sqft, height_tier,
      material_type, railing_type, stair_count,
      lighting_enabled, lighting_cost,
      staining_enabled, staining_cost,
      built_ins_enabled, built_ins_cost, built_ins_description,
      dumpster_enabled, dumpster_cost,
      hardware_items,
      material_cost, labor_cost, permit_cost, equipment_cost,
      overhead_cost, total_job_cost,
      tax_rate, tax_applies_to, tax_amount,
      final_price, expected_profit, target_margin,
      permit_building_enabled, permit_building_cost,
      permit_septic_enabled, permit_septic_cost,
      permit_electrical_enabled, permit_electrical_cost,
      permit_engineering_enabled, permit_engineering_cost,
      permit_hoa_enabled, permit_hoa_cost,
      deck_shape, deck_attachment, ledger_condition, deck_height_category,
      decking_pattern, railing_coverage, railing_lf, stair_railing,
      stair_config, stair_width, has_landing, landing_size,
      site_difficulty, site_obstacles, deck_sqft_override,
      demolition_enabled, demolition_cost
    `)
    .eq('id', id)
    .single();

  if (fetchErr || !src) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  // Build the duplicate payload — strip identity fields, reset status, rename
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    user_id: _uid,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    org_id: _oid,
    name,
    ...rest
  } = src;

  const { data: created, error: insertErr } = await supabase
    .from('projects')
    .insert({
      ...rest,
      user_id: user.id,
      org_id: src.org_id ?? null,
      name: `Copy of ${name ?? 'Untitled Quote'}`,
      status: 'draft',
      updated_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (insertErr || !created?.id) {
    return NextResponse.json({ error: insertErr?.message ?? 'Insert failed' }, { status: 500 });
  }

  return NextResponse.json({ id: created.id });
}
