// lib/org/guardrails.ts
// Guardrail check utility — import this in any API route or client component that saves a project.
// Owners always pass. Field users are checked against org.min_margin_pct / max_discount_pct.
//
// NOTE: target_margin is stored as a decimal (0.30 = 30%). min_margin_pct is a percentage (25 = 25%).
// The comparison multiplies target_margin by 100 before comparing.

import type { SupabaseClient } from '@supabase/supabase-js';
import type { GuardrailResult, ProjectGuardrailInput } from './types';

export async function checkGuardrails(
  supabase: SupabaseClient,
  userId: string,
  project: ProjectGuardrailInput
): Promise<GuardrailResult> {
  // Fetch the user's role and org
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('org_role, org_id')
    .eq('id', userId)
    .single();

  if (profileErr || !profile) return { violated: false };

  // Owners are exempt from guardrails — they set them
  if (profile.org_role === 'owner') return { violated: false };

  // No org yet — shouldn't happen post-migration, but safe fallback
  if (!profile.org_id) return { violated: false };

  // Fetch org guardrail settings
  const { data: org } = await supabase
    .from('organizations')
    .select('min_margin_pct, max_discount_pct')
    .eq('id', profile.org_id)
    .single();

  if (!org) return { violated: false };

  // ── Minimum margin check ─────────────────────────────────────────
  // target_margin is decimal (0.30), min_margin_pct is percentage (25)
  if (
    org.min_margin_pct !== null &&
    project.target_margin !== undefined &&
    project.target_margin * 100 < org.min_margin_pct
  ) {
    const actualPct = project.target_margin * 100;
    return {
      violated: true,
      field: 'margin',
      actual: actualPct,
      limit: org.min_margin_pct,
      reason: `This quote's margin (${actualPct.toFixed(1)}%) is below the minimum required margin of ${org.min_margin_pct}%. It has been flagged for owner approval before it can be sent to the customer.`,
    };
  }

  return { violated: false };
}

/**
 * Build the approval_status value for a project upsert.
 * Returns 'pending_approval' if guardrail violated, null if clear.
 */
export function approvalStatusFromGuardrail(
  result: GuardrailResult
): 'pending_approval' | null {
  return result.violated ? 'pending_approval' : null;
}
