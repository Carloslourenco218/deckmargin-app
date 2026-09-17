// app/p/[token]/page.tsx
// Public shareable proposal page — no auth required
// Fetches project via proposal_token using service role client

import { supabaseAdmin } from "@/lib/supabase/admin";
import PublicProposalClient from "./PublicProposalClient";
import type { Metadata } from "next";
import { headers } from "next/headers";

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const { data } = await supabaseAdmin
    .from("projects")
    .select("name, client_name")
    .eq("proposal_token", token)
    .eq("proposal_token_active", true)
    .maybeSingle();
  return {
    title: data?.name ? `Proposal: ${data.name}` : "Deck Proposal",
  };
}

export default async function PublicProposalPage({ params }: Props) {
  const { token } = await params;

  const { data: project } = await supabaseAdmin
    .from("projects")
    .select(`
      id, name, status, job_type,
      client_name, client_email, client_phone, site_address, notes,
      deck_sqft, deck_length, deck_width, height_tier, material_type,
      railing_type, stair_count, final_price,
      lighting_enabled, lighting_cost,
      staining_enabled, staining_cost,
      built_ins_enabled, built_ins_cost, built_ins_description,
      dumpster_enabled, dumpster_cost,
      tax_rate, tax_applies_to, tax_amount,
      permit_building_enabled, permit_building_cost,
      permit_septic_enabled, permit_septic_cost,
      permit_electrical_enabled, permit_electrical_cost,
      permit_engineering_enabled, permit_engineering_cost,
      permit_hoa_enabled, permit_hoa_cost,
      proposal_token, proposal_token_active, proposal_expires_at,
      accepted_at, accepted_by_name,
      assumptions, exclusions,
      user_id, created_at
    `)
    .eq("proposal_token", token)
    .eq("proposal_token_active", true)
    .maybeSingle();

  if (!project) {
    return (
      <main className="min-h-screen bg-[#f6f7fb] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">🔗</div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">Proposal Not Found</h1>
          <p className="text-gray-500 text-sm">This link may have expired or been revoked. Please contact your contractor for an updated link.</p>
        </div>
      </main>
    );
  }

  // Check expiration
  if (project.proposal_expires_at && new Date(project.proposal_expires_at) < new Date()) {
    return (
      <main className="min-h-screen bg-[#f6f7fb] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div classNam