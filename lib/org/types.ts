// lib/org/types.ts
// TypeScript types for the multi-user org & roles feature.

export type OrgRole = 'owner' | 'field_user';
export type MemberStatus = 'active' | 'pending' | 'deactivated';
export type ApprovalStatus = 'pending_approval' | 'approved' | 'rejected';

export interface Organization {
  id: string;
  name: string;
  owner_id: string;
  min_margin_pct: number | null;   // e.g. 25 means 25%
  max_discount_pct: number | null; // e.g. 10 means 10%
  created_at: string;
  updated_at: string;
}

export interface OrgMember {
  id: string;
  org_id: string;
  user_id: string | null;          // null until invite accepted
  email: string;
  role: OrgRole;
  status: MemberStatus;
  invited_by: string | null;
  invited_at: string;
  activated_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Shape returned by GET /api/org/members — enriched with profile display info */
export interface OrgMemberView extends OrgMember {
  display_name?: string;           // from profiles if available
}

export interface GuardrailViolation {
  violated: true;
  field: 'margin' | 'discount';
  actual: number;
  limit: number;
  reason: string;
}

export type GuardrailResult =
  | { violated: false }
  | GuardrailViolation;

/** Subset of project fields needed for guardrail evaluation */
export interface ProjectGuardrailInput {
  target_margin?: number;          // decimal, e.g. 0.285 = 28.5%
  final_price?: number;
  total_job_cost?: number;
}
