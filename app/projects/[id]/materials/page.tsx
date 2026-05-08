import { createClient } from "@/lib/supabaseServer";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────────────
type TakeoffItem = {
  category: string;
  item: string;
  quantity: number;
  unit: string;
  notes: string;
};

// ── Board coverage per material ────────────────────────────────────────────
const BOARD_COVERAGE: Record<string, { coverage: number; label: string; length: number }> = {
  "pressure-treated": { coverage: 8.0,  label: "2×6 PT Decking",         length: 16 },
  "trex":             { coverage: 7.5,  label: "Trex Composite Decking",  length: 16 },
  "timbertech":       { coverage: 7.5,  label: "TimberTech Decking",      length: 16 },
  "pvc":              { coverage: 7.5,  label: "PVC Composite Decking",   length: 16 },
};

function calcTakeoff(
  deckLength: number,
  deckWidth: number,
  sqft: number,
  heightTier: string,
  materialType: string,
  railingType: string,
  stairCount: number,
  jobType: string
): TakeoffItem[] {
  const items: TakeoffItem[] = [];
  const isResurface   = jobType === "resurface";
  const isRailingOnly = jobType === "railing_only";
  const isRepair      = jobType === "repair";

  const postHeights: Record<string, number> = { standard: 4, raised: 8, high: 12 };
  const postHeight = postHeights[heightTier] ?? 4;

  if (!isRailingOnly && !isRepair) {
    const matInfo = BOARD_COVERAGE[materialType] ?? BOARD_COVERAGE["pressure-treated"];
    const withWaste = sqft * 1.10;
    const boardCount = Math.ceil(withWaste / matInfo.coverage);
    const linearFt = boardCount * matInfo.length;
    items.push({ category: "Decking", item: matInfo.label, quantity: boardCount, unit: "Boards", notes: `${matInfo.length}ft lengths · ${linearFt} linear ft total · 10% waste included` });
  }

  if (!isResurface && !isRailingOnly && !isRepair) {
    const joistCount = Math.ceil((deckWidth / (16 / 12)) + 1);
    const joistLength = Math.ceil(deckLength / 2) * 2;
    items.push({ category: "Framing", item: "2×10 Deck Joists", quantity: joistCount, unit: "Pieces", notes: `${joistLength}ft lengths · 16" OC spacing` });
    items.push({ category: "Framing", item: "2×10 Rim Joists", quantity: 4, unit: "Pieces", notes: `${joistLength}ft lengths · perimeter framing` });

    const beamSpans: Record<string, string> = { standard: "3×10", raised: "3×12", high: "4×12" };
    const beamSize = beamSpans[heightTier] ?? "3×10";
    const beamCount = Math.max(2, Math.ceil(deckWidth / 8));
    const beamLength = Math.ceil(deckLength / 2) * 2;
    items.push({ category: "Framing", item: `${beamSize} Beams`, quantity: beamCount, unit: "Pieces", notes: `${beamLength}ft lengths · flush beam construction` });

    const ledgerLengthFt = Math.ceil(deckLength / 2) * 2;
    const ledgerPieces = Math.ceil(ledgerLengthFt / 16);
    items.push({ category: "Framing", item: "2×10 Ledger Board", quantity: ledgerPieces, unit: "Pieces", notes: `${ledgerLengthFt} linear ft needed · 16ft lengths` });

    const postsAlongLength = Math.ceil(deckLength / 8) + 1;
    const postsAlongWidth  = Math.ceil(deckWidth / 8) - 1;
    const totalPosts = Math.max(4, postsAlongLength * Math.max(1, postsAlongWidth));
    items.push({ category: "Structure", item: "6×6 Support Posts", quantity: totalPosts, unit: "Posts", notes: `${postHeight + 1}ft cut length · ${postHeight}ft above grade` });

    const bagsPerFooting = heightTier === "high" ? 3 : 2;
    items.push({ category: "Structure", item: "Footings", quantity: totalPosts, unit: "Footings", notes: `12" diameter sonotube · ${postHeight > 6 ? "36" : "24"}" depth` });
    items.push({ category: "Structure", item: "Concrete (80lb bags)", quantity: totalPosts * bagsPerFooting, unit: "Bags", notes: `${bagsPerFooting} bags per footing · ${totalPosts} footings` });
  }

  if (stairCount > 0 && !isRailingOnly && !isRepair) {
    const risersPerSection = Math.ceil(postHeight / (7.5 / 12));
    const totalStringers = stairCount * 3;
    const stringerLength = Math.ceil(Math.sqrt(postHeight * postHeight + (risersPerSection * 10 / 12) * (risersPerSection * 10 / 12)) + 1);
    items.push({ category: "Stairs", item: "Stair Stringers (2×12 PT)", quantity: totalStringers, unit: "Pieces", notes: `${stringerLength}ft lengths · 3 per section` });
    const treadsPerSection = risersPerSection - 1;
    items.push({ category: "Stairs", item: "Stair Treads (2×6)", quantity: stairCount * treadsPerSection * 2, unit: "Boards", notes: `2 boards per tread · 36" wide` });
    items.push({ category: "Stairs", item: "Stair Riser Boards (1×8)", quantity: stairCount * treadsPerSection, unit: "Boards", notes: "One per riser · cut to width" });
  }

  if (railingType && railingType !== "none") {
    const railingPerimeter = deckLength + deckWidth * 2;
    const railingPostCount = Math.ceil(railingPerimeter / 6) + 1;
    if (railingType === "wood") {
      items.push({ category: "Railing", item: "4×4 Railing Posts", quantity: railingPostCount, unit: "Posts", notes: `${railingPerimeter} linear ft · 6ft spacing` });
      items.push({ category: "Railing", item: "2×4 Top Rail", quantity: Math.ceil(railingPerimeter / 16), unit: "Pieces", notes: `${railingPerimeter} linear ft total` });
      items.push({ category: "Railing", item: "Balusters (2×2 spindles)", quantity: Math.ceil((railingPerimeter * 12) / 4), unit: "Each", notes: `4" spacing · 36" height` });
    } else if (railingType === "composite") {
      items.push({ category: "Railing", item: "Composite Railing Posts", quantity: railingPostCount, unit: "Posts", notes: `${railingPerimeter} linear ft` });
      items.push({ category: "Railing", item: "Composite Rail Kits (8ft)", quantity: Math.ceil(railingPerimeter / 8), unit: "Kits", notes: `${railingPerimeter} linear ft total` });
    } else if (railingType === "metal") {
      items.push({ category: "Railing", item: "Aluminum Railing Posts", quantity: railingPostCount, unit: "Posts", notes: `${railingPerimeter} linear ft` });
      items.push({ category: "Railing", item: "Aluminum Rail Sections (6ft)", quantity: Math.ceil(railingPerimeter / 6), unit: "Sections", notes: `${railingPerimeter} linear ft total` });
    }
  }

  if (!isRepair) {
    const joistCount = !isResurface ? Math.ceil((deckWidth / (16 / 12)) + 1) : 0;
    const postsAlongLength = !isResurface ? Math.ceil(deckLength / 8) + 1 : 0;
    const postsAlongWidth  = !isResurface ? Math.ceil(deckWidth / 8) - 1 : 0;
    const totalPosts = !isResurface ? Math.max(4, postsAlongLength * Math.max(1, postsAlongWidth)) : 0;
    const ledgerLengthFt = !isResurface ? Math.ceil(deckLength / 2) * 2 : 0;

    if (!isResurface && !isRailingOnly) {
      items.push({ category: "Hardware", item: "Joist Hangers (LUS210)", quantity: joistCount * 2, unit: "Each", notes: `2 per joist · ${joistCount} joists` });
      items.push({ category: "Hardware", item: "Post Bases (ABA66)", quantity: totalPosts, unit: "Each", notes: `One per post` });
      items.push({ category: "Hardware", item: "Lag Bolts (1/2\" × 4\")", quantity: Math.ceil(ledgerLengthFt / 1.5) * 2, unit: "Each", notes: `16" spacing alternating · ledger` });
      items.push({ category: "Hardware", item: "Hurricane Ties (H2.5A)", quantity: joistCount * 2, unit: "Each", notes: `2 per joist` });
    }
    items.push({ category: "Hardware", item: "Structural Screws (3\" #10)", quantity: Math.ceil(sqft / 50), unit: "Lbs", notes: "Framing connections" });
    if (!isRailingOnly) {
      if (materialType === "trex" || materialType === "timbertech" || materialType === "pvc") {
        items.push({ category: "Hardware", item: "Hidden Deck Fasteners", quantity: Math.ceil((sqft * 2.5) / 100), unit: "Bags (100ct)", notes: "Composite decking clips" });
      } else {
        items.push({ category: "Hardware", item: "Decking Screws (2.5\" #10)", quantity: Math.ceil(sqft / 40), unit: "Lbs", notes: "PT or cedar decking" });
      }
    }
    if (!isResurface && !isRailingOnly) {
      items.push({ category: "Hardware", item: "Flashing Tape (4\" wide)", quantity: Math.ceil(ledgerLengthFt / 50), unit: "Rolls", notes: "Ledger waterproofing" });
    }
  }

  return items;
}

export default async function MaterialsPrintPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div className="p-10">Not logged in.</div>;

  const { data: project } = await supabase
    .from("projects")
    .select("id, name, deck_length, deck_width, deck_sqft, height_tier, material_type, railing_type, stair_count, job_type, client_name, site_address")
    .eq("id", resolvedParams.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!project) return <div className="p-10">Project not found.</div>;

  const canCalculate = project.deck_length && project.deck_width && project.deck_sqft;
  const items = canCalculate
    ? calcTakeoff(
        project.deck_length!,
        project.deck_width!,
        project.deck_sqft!,
        project.height_tier ?? "standard",
        project.material_type ?? "pressure-treated",
        project.railing_type ?? "none",
        project.stair_count ?? 0,
        project.job_type ?? "new_build"
      )
    : [];

  const categories = Array.from(new Set(items.map((i) => i.category)));
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Print controls — hidden when printing */}
      <div className="print:hidden border-b bg-gray-50 px-8 py-3 flex items-center justify-between">
        <Link href={`/projects/${project.id}`} className="text-sm text-blue-600 hover:underline">
          ← Back to Quote
        </Link>
        {/* ✅ Fixed: anchor tag instead of button with onClick (server component safe) */}
        <a
          href="javascript:window.print()"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Print / Save as PDF
        </a>
      </div>

      <div className="mx-auto max-w-4xl px-8 py-10">

        {/* Header */}
        <div className="mb-8 border-b-2 border-gray-200 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Material Takeoff</h1>
              <p className="mt-1 text-lg font-medium text-gray-600">{project.name ?? "Untitled Quote"}</p>
              {project.client_name && <p className="text-sm text-gray-500">Client: {project.client_name}</p>}
              {project.site_address && <p className="text-sm text-gray-500">Site: {project.site_address}</p>}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Generated: {today}</p>
              <p className="text-sm text-gray-500">
                {project.deck_sqft} sq ft ·{" "}
                {project.material_type?.replace("-", " ")} ·{" "}
                {project.height_tier} deck
              </p>
            </div>
          </div>
        </div>

        {!canCalculate ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Deck dimensions are missing. Please edit the quote to add length and width.
          </div>
        ) : (
          <>
            {categories.map((cat) => {
              const catItems = items.filter((i) => i.category === cat);
              return (
                <div key={cat} className="mb-8">
                  <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-500">{cat}</h2>
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b-2 border-gray-300">
                        <th className="pb-2 text-left font-semibold text-gray-700">Item</th>
                        <th className="pb-2 text-right font-semibold text-gray-700">Qty</th>
                        <th className="pb-2 pl-4 text-left font-semibold text-gray-700">Unit</th>
                        <th className="pb-2 pl-4 text-left font-semibold text-gray-700">Notes</th>
                        <th className="pb-2 text-right font-semibold text-gray-700">✓</th>
                      </tr>
                    </thead>
                    <tbody>
                      {catItems.map((item, i) => (
                        <tr key={i} className="border-b border-gray-100">
                          <td className="py-2.5 font-medium text-gray-900">{item.item}</td>
                          <td className="py-2.5 text-right font-bold text-gray-900">{item.quantity}</td>
                          <td className="py-2.5 pl-4 text-gray-600">{item.unit}</td>
                          <td className="py-2.5 pl-4 text-gray-500">{item.notes}</td>
                          <td className="py-2.5 text-right">
                            <span className="inline-block h-4 w-4 rounded border border-gray-300"></span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}

            {/* Summary */}
            <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="text-sm font-semibold text-gray-700">Total Line Items: {items.length}</div>
            </div>

            {/* Disclaimer */}
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 mb-1">
                Estimating Disclaimer
              </p>
              <p className="text-xs leading-5 text-amber-800">
                This material list is an estimate based on standard building practices and the job inputs entered into DeckMargin.
                Actual quantities may vary based on site conditions, local building codes, cuts, waste, and contractor preference.
                Always verify quantities with your supplier and review with your build crew before ordering.
                DeckMargin is not responsible for material shortfalls or overages.
              </p>
            </div>
          </>
        )}
      </div>

      <style>{`
        @media print {
          @page { margin: 0.75in; }
          body { font-size: 12px; }
        }
      `}</style>
    </main>
  );
}