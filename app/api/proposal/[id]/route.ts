import { NextResponse } from "next/server";
import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";
import { createClient } from "@/lib/supabaseServer";
import { proposalHtml } from "@/lib/proposalPdfTemplate";
import { calculateMaterials } from "@/lib/design/calculateMaterials";
import type { DesignComponent, DeckSection } from "@/lib/design/types";

export const runtime = "nodejs";
export const maxDuration = 60;

type HardwareItem = {
  key: string;
  label: string;
  enabled: boolean;
  cost: string;
};

type ProjectRow = {
  id: string;
  user_id: string | null;
  name: string | null;
  status: string | null;
  job_type: string | null;

  deck_length: number | null;
  deck_width: number | null;
  deck_sqft: number | null;

  height_tier: string | null;
  material_type: string | null;
  railing_type: string | null;
  stair_count: number | null;

  lighting_enabled: boolean | null;
  lighting_cost: number | null;
  staining_enabled: boolean | null;
  staining_cost: number | null;
  built_ins_enabled: boolean | null;
  built_ins_cost: number | null;
  built_ins_description: string | null;

  hardware_items: HardwareItem[] | null;

  dumpster_enabled: boolean | null;
  dumpster_cost: number | null;

  tax_rate: number | null;
  tax_applies_to: string | null;
  tax_amount: number | null;

  permit_building_enabled: boolean | null;
  permit_building_cost: number | null;
  permit_septic_enabled: boolean | null;
  permit_septic_cost: number | null;
  permit_electrical_enabled: boolean | null;
  permit_electrical_cost: number | null;
  permit_engineering_enabled: boolean | null;
  permit_engineering_cost: number | null;
  permit_hoa_enabled: boolean | null;
  permit_hoa_cost: number | null;

  material_cost: number | null;
  labor_cost: number | null;
  permit_cost: number | null;
  equipment_cost: number | null;
  overhead_cost: number | null;
  total_job_cost: number | null;

  final_price: number | null;
  expected_profit: number | null;
  target_margin: number | null;

  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
  site_address: string | null;
  notes: string | null;

  created_at: string | null;
  updated_at: string | null;
};

type UserSettingsRow = {
  company_name: string | null;
  company_phone: string | null;
  company_email: string | null;
  company_website: string | null;
  company_address: string | null;
  logo_url: string | null;
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "You must be logged in to generate this PDF." }, { status: 401 });
    }

    const { data: project, error } = await supabase
      .from("projects")
      .select(`
        id, user_id, name, status, job_type,
        deck_length, deck_width, deck_sqft,
        height_tier, material_type, railing_type, stair_count,
        lighting_enabled, lighting_cost,
        staining_enabled, staining_cost,
        built_ins_enabled, built_ins_cost, built_ins_description,
        hardware_items,
        dumpster_enabled, dumpster_cost,
        tax_rate, tax_applies_to, tax_amount,
        permit_building_enabled, permit_building_cost,
        permit_septic_enabled, permit_septic_cost,
        permit_electrical_enabled, permit_electrical_cost,
        permit_engineering_enabled, permit_engineering_cost,
        permit_hoa_enabled, permit_hoa_cost,
        material_cost, labor_cost, permit_cost,
        equipment_cost, overhead_cost, total_job_cost,
        final_price, expected_profit, target_margin,
        client_name, client_email, client_phone,
        site_address, notes, created_at, updated_at
      `)
      .eq("id", resolvedParams.id)
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle<ProjectRow>();

    if (error || !project) {
      return NextResponse.json({ error: error?.message ?? "Project not found" }, { status: 404 });
    }

    const { data: settings } = await supabase
      .from("user_settings")
      .select("company_name, company_phone, company_email, company_website, company_address, logo_url")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle<UserSettingsRow>();

    // ── Fetch canvas design summary if one exists ─────────────────────────────
    let designSummary = null;
    const { data: designData } = await supabase
      .from("deck_designs")
      .select("canvas_data")
      .eq("project_id", resolvedParams.id)
      .limit(1)
      .maybeSingle();

    if (designData?.canvas_data?.components?.length) {
      const takeoff = calculateMaterials(designData.canvas_data.components as DesignComponent[]);
      const deckSections = (designData.canvas_data.components as DesignComponent[]).filter(
        (c): c is DeckSection => c.type === "deck_section"
      );
      const primaryMaterial = deckSections.length > 0
        ? deckSections.reduce((a, b) =>
            a.width_ft * a.length_ft >= b.width_ft * b.length_ft ? a : b
          ).material
        : null;

      designSummary = {
        deck_sqft: takeoff.summary.total_deck_sqft,
        total_linear_ft_railing: takeoff.summary.total_linear_ft_railing,
        total_stair_count: takeoff.summary.total_stair_count,
        material_type: primaryMaterial,
      };
    }

    const html = proposalHtml(project, {
      company_name:    settings?.company_name    ?? null,
      company_phone:   settings?.company_phone   ?? null,
      company_email:   settings?.company_email   ?? null,
      company_website: settings?.company_website ?? null,
      company_address: settings?.company_address ?? null,
      logo_url:        settings?.logo_url        ?? null,
    }, designSummary);

    const executablePath = await chromium.executablePath(
      "https://github.com/Sparticuz/chromium/releases/download/v138.0.1/chromium-v138.0.1-pack.x64.tar"
    );

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath,
      headless: true,
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 2000, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
    });

    await browser.close();

    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${project.name ?? "proposal"}.pdf"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate PDF";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}