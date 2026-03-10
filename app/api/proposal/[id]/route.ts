import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";
import { proposalHtml } from "@/lib/proposalPdfTemplate";
import puppeteer from "puppeteer";

type ProjectRow = {
  id: string;
  name: string | null;
  status: string | null;

  deck_length: number | null;
  deck_width: number | null;
  deck_sqft: number | null;

  height_tier: string | null;
  material_type: string | null;
  railing_type: string | null;
  stair_count: number | null;

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

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const id = resolvedParams.id;

    if (!id) {
      return NextResponse.json({ error: "Missing quote id" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: project, error } = await supabase
      .from("projects")
      .select(`
        id,
        name,
        status,
        deck_length,
        deck_width,
        deck_sqft,
        height_tier,
        material_type,
        railing_type,
        stair_count,
        material_cost,
        labor_cost,
        permit_cost,
        equipment_cost,
        overhead_cost,
        total_job_cost,
        final_price,
        expected_profit,
        target_margin,
        client_name,
        client_email,
        client_phone,
        site_address,
        notes,
        created_at,
        updated_at
      `)
      .eq("id", id)
      .single<ProjectRow>();

    if (error || !project) {
      return NextResponse.json(
        { error: error?.message ?? "Quote not found" },
        { status: 404 }
      );
    }

    const html = proposalHtml(project);

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0" });

      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "20px",
          right: "20px",
          bottom: "20px",
          left: "20px",
        },
      });

      const safeName = (project.name ?? "deck-quote")
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase();

      return new NextResponse(Buffer.from(pdf), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${safeName || "deck-quote"}.pdf"`,
          "Cache-Control": "no-store",
        },
      });
    } finally {
      await browser.close();
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

