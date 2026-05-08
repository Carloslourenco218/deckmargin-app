"use client";

import { useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────
type TakeoffItem = {
  category: string;
  item: string;
  quantity: number;
  unit: string;
  notes: string;
};

type Props = {
  deckLength: number | null;
  deckWidth: number | null;
  deckSqft: number | null;
  heightTier: string | null;
  materialType: string | null;
  railingType: string | null;
  stairCount: number | null;
  jobType: string | null;
};

// ── Board coverage per material (sq ft per 16ft board) ────────────────────
const BOARD_COVERAGE: Record<string, { coverage: number; label: string; length: number }> = {
  "pressure-treated": { coverage: 8.0,  label: "2×6 PT Decking",         length: 16 },
  "trex":             { coverage: 7.5,  label: "Trex Composite Decking",  length: 16 },
  "timbertech":       { coverage: 7.5,  label: "TimberTech Decking",      length: 16 },
  "pvc":              { coverage: 7.5,  label: "PVC Composite Decking",   length: 16 },
};

// ── Main calculation function ─────────────────────────────────────────────
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

  // Heights per tier (ft)
  const postHeights: Record<string, number> = {
    standard: 4,
    raised:   8,
    high:     12,
  };
  const postHeight = postHeights[heightTier] ?? 4;

  // ── DECKING BOARDS ─────────────────────────────────────────────────────
  if (!isRailingOnly && !isRepair) {
    const matInfo = BOARD_COVERAGE[materialType] ?? BOARD_COVERAGE["pressure-treated"];
    const withWaste = sqft * 1.10; // 10% waste factor
    const boardCount = Math.ceil(withWaste / matInfo.coverage);
    const linearFt = boardCount * matInfo.length;

    items.push({
      category: "Decking",
      item: matInfo.label,
      quantity: boardCount,
      unit: "Boards",
      notes: `${matInfo.length}ft lengths · ${linearFt} linear ft total · 10% waste included`,
    });
  }

  // ── FRAMING — JOISTS ──────────────────────────────────────────────────
  if (!isResurface && !isRailingOnly && !isRepair) {
    // 16" OC spacing along deck length
    const joistCount = Math.ceil((deckWidth / (16 / 12)) + 1);
    const joistLength = Math.ceil(deckLength / 2) * 2; // round up to even lumber length

    items.push({
      category: "Framing",
      item: "2×10 Deck Joists",
      quantity: joistCount,
      unit: "Pieces",
      notes: `${joistLength}ft lengths · 16" OC spacing`,
    });

    // Double rim joists (perimeter)
    const rimJoistLength = Math.ceil(deckLength / 2) * 2;
    items.push({
      category: "Framing",
      item: "2×10 Rim Joists",
      quantity: 4,
      unit: "Pieces",
      notes: `${rimJoistLength}ft lengths · perimeter framing`,
    });
  }

  // ── FRAMING — BEAMS ───────────────────────────────────────────────────
  if (!isResurface && !isRailingOnly && !isRepair) {
    const beamSpans: Record<string, string> = {
      standard: "3×10",
      raised:   "3×12",
      high:     "4×12",
    };
    const beamSize = beamSpans[heightTier] ?? "3×10";
    // One beam per 8ft of deck width, minimum 2
    const beamCount = Math.max(2, Math.ceil(deckWidth / 8));
    const beamLength = Math.ceil(deckLength / 2) * 2;

    items.push({
      category: "Framing",
      item: `${beamSize} Beams`,
      quantity: beamCount,
      unit: "Pieces",
      notes: `${beamLength}ft lengths · flush beam construction`,
    });
  }

  // ── LEDGER BOARD ──────────────────────────────────────────────────────
  if (!isResurface && !isRailingOnly && !isRepair) {
    const ledgerLengthFt = Math.ceil(deckLength / 2) * 2;
    const ledgerPieces = Math.ceil(ledgerLengthFt / 16);

    items.push({
      category: "Framing",
      item: "2×10 Ledger Board",
      quantity: ledgerPieces,
      unit: "Pieces",
      notes: `${ledgerLengthFt} linear ft needed · 16ft lengths`,
    });
  }

  // ── POSTS ─────────────────────────────────────────────────────────────
  if (!isResurface && !isRailingOnly && !isRepair) {
    // Posts every 8ft along perimeter + interior
    const postsAlongLength = Math.ceil(deckLength / 8) + 1;
    const postsAlongWidth  = Math.ceil(deckWidth / 8) - 1; // interior rows only
    const totalPosts = Math.max(4, postsAlongLength * Math.max(1, postsAlongWidth));
    const cutPostHeight = postHeight + 1; // extra 1ft for footing burial

    items.push({
      category: "Structure",
      item: "6×6 Support Posts",
      quantity: totalPosts,
      unit: "Posts",
      notes: `${cutPostHeight}ft cut length · ${postHeight}ft above grade`,
    });
  }

  // ── FOOTINGS / CONCRETE ───────────────────────────────────────────────
  if (!isResurface && !isRailingOnly && !isRepair) {
    const postsAlongLength = Math.ceil(deckLength / 8) + 1;
    const postsAlongWidth  = Math.ceil(deckWidth / 8) - 1;
    const totalPosts = Math.max(4, postsAlongLength * Math.max(1, postsAlongWidth));

    // 2-3 bags per footing depending on height tier
    const bagsPerFooting = heightTier === "high" ? 3 : heightTier === "raised" ? 2 : 2;
    const totalBags = totalPosts * bagsPerFooting;

    items.push({
      category: "Structure",
      item: "Footings",
      quantity: totalPosts,
      unit: "Footings",
      notes: `12" diameter sonotube · ${postHeight > 6 ? "36" : "24"}" depth`,
    });

    items.push({
      category: "Structure",
      item: "Concrete (80lb bags)",
      quantity: totalBags,
      unit: "Bags",
      notes: `${bagsPerFooting} bags per footing · ${totalPosts} footings`,
    });
  }

  // ── STAIRS ────────────────────────────────────────────────────────────
  if (stairCount > 0 && !isRailingOnly && !isRepair) {
    const riseHeight = postHeight; // approximate stair height = deck height
    const risersPerSection = Math.ceil(riseHeight / (7.5 / 12)); // 7.5" rise
    const stringersPerSection = 3; // standard
    const totalStringers = stairCount * stringersPerSection;
    const stringerLength = Math.ceil(Math.sqrt(riseHeight * riseHeight + (risersPerSection * 10 / 12) * (risersPerSection * 10 / 12)) + 1);

    items.push({
      category: "Stairs",
      item: "Stair Stringers (2×12 PT)",
      quantity: totalStringers,
      unit: "Pieces",
      notes: `${stringerLength}ft lengths · ${stairCount} stair section${stairCount > 1 ? "s" : ""} · 3 stringers each`,
    });

    const treadsPerSection = risersPerSection - 1;
    const totalTreads = stairCount * treadsPerSection;

    items.push({
      category: "Stairs",
      item: "Stair Treads (2×6)",
      quantity: totalTreads * 2,
      unit: "Boards",
      notes: `2 boards per tread · ${totalTreads} treads total · 36" wide`,
    });

    items.push({
      category: "Stairs",
      item: "Stair Riser Boards (1×8)",
      quantity: totalTreads,
      unit: "Boards",
      notes: `One per riser · cut to width`,
    });
  }

  // ── RAILING ───────────────────────────────────────────────────────────
  if (railingType && railingType !== "none") {
    // 3 sides of perimeter (not ledger side)
    const railingPerimeter = deckLength + deckWidth * 2;
    const postSpacing = 6; // ft
    const railingPostCount = Math.ceil(railingPerimeter / postSpacing) + 1;

    if (railingType === "wood") {
      items.push({
        category: "Railing",
        item: "4×4 Railing Posts",
        quantity: railingPostCount,
        unit: "Posts",
        notes: `${railingPerimeter} linear ft · 6ft spacing`,
      });

      const topRailPieces = Math.ceil(railingPerimeter / 16);
      items.push({
        category: "Railing",
        item: "2×4 Top Rail",
        quantity: topRailPieces,
        unit: "Pieces",
        notes: `${railingPerimeter} linear ft total · 16ft lengths`,
      });

      const balusterSpacing = 4; // inches
      const balusterCount = Math.ceil((railingPerimeter * 12) / balusterSpacing);
      items.push({
        category: "Railing",
        item: "Balusters (2×2 or spindles)",
        quantity: balusterCount,
        unit: "Each",
        notes: `4" spacing · 36" height · ${railingPerimeter} linear ft`,
      });
    } else if (railingType === "composite") {
      items.push({
        category: "Railing",
        item: "Composite Railing Posts",
        quantity: railingPostCount,
        unit: "Posts",
        notes: `${railingPerimeter} linear ft · 6ft spacing`,
      });
      const kitCount = Math.ceil(railingPerimeter / 8); // 8ft kits
      items.push({
        category: "Railing",
        item: "Composite Rail Kits (8ft)",
        quantity: kitCount,
        unit: "Kits",
        notes: `${railingPerimeter} linear ft total`,
      });
    } else if (railingType === "metal") {
      items.push({
        category: "Railing",
        item: "Metal/Aluminum Railing Posts",
        quantity: railingPostCount,
        unit: "Posts",
        notes: `${railingPerimeter} linear ft · 6ft spacing`,
      });
      const sectionCount = Math.ceil(railingPerimeter / 6); // 6ft sections
      items.push({
        category: "Railing",
        item: "Aluminum Rail Sections (6ft)",
        quantity: sectionCount,
        unit: "Sections",
        notes: `${railingPerimeter} linear ft total`,
      });
    }
  }

  // ── HARDWARE & FASTENERS ──────────────────────────────────────────────
  if (!isRepair) {
    const joistCount = !isResurface ? Math.ceil((deckWidth / (16 / 12)) + 1) : 0;
    const postsAlongLength = !isResurface ? Math.ceil(deckLength / 8) + 1 : 0;
    const postsAlongWidth  = !isResurface ? Math.ceil(deckWidth / 8) - 1 : 0;
    const totalPosts = !isResurface ? Math.max(4, postsAlongLength * Math.max(1, postsAlongWidth)) : 0;
    const ledgerLengthFt = !isResurface ? Math.ceil(deckLength / 2) * 2 : 0;

    if (!isResurface && !isRailingOnly) {
      items.push({
        category: "Hardware",
        item: "Joist Hangers (LUS210)",
        quantity: joistCount * 2,
        unit: "Each",
        notes: `2 per joist · ${joistCount} joists`,
      });

      items.push({
        category: "Hardware",
        item: "Post Bases (ABA66)",
        quantity: totalPosts,
        unit: "Each",
        notes: `One per post · ${totalPosts} posts`,
      });

      const lagBoltCount = Math.ceil(ledgerLengthFt / 1.5) * 2; // every 16" alternating, 2 rows
      items.push({
        category: "Hardware",
        item: "Lag Bolts (1/2\" × 4\")",
        quantity: lagBoltCount,
        unit: "Each",
        notes: `16" spacing alternating · ledger attachment`,
      });

      items.push({
        category: "Hardware",
        item: "Hurricane Ties (H2.5A)",
        quantity: joistCount * 2,
        unit: "Each",
        notes: `2 per joist · code required in most areas`,
      });
    }

    // Structural screws (all job types except repair)
    const structuralScrewsLbs = Math.ceil(sqft / 50);
    items.push({
      category: "Hardware",
      item: "Structural Screws (3\" #10)",
      quantity: structuralScrewsLbs,
      unit: "Lbs",
      notes: `Framing and blocking connections`,
    });

    // Decking fasteners
    if (!isRailingOnly) {
      if (materialType === "trex" || materialType === "timbertech" || materialType === "pvc") {
        const hiddenFastenerCount = Math.ceil(sqft * 2.5); // ~2.5 per board per sq ft
        items.push({
          category: "Hardware",
          item: "Hidden Deck Fasteners",
          quantity: Math.ceil(hiddenFastenerCount / 100),
          unit: "Bags (100ct)",
          notes: `Composite decking clips · ${hiddenFastenerCount} total clips`,
        });
      } else {
        const deckingScrewsLbs = Math.ceil(sqft / 40);
        items.push({
          category: "Hardware",
          item: "Decking Screws (2.5\" #10)",
          quantity: deckingScrewsLbs,
          unit: "Lbs",
          notes: `PT or cedar decking boards`,
        });
      }
    }

    if (!isResurface && !isRailingOnly) {
      items.push({
        category: "Hardware",
        item: "Flashing Tape (4\" wide)",
        quantity: Math.ceil(ledgerLengthFt / 50),
        unit: "Rolls",
        notes: `Ledger waterproofing · ${ledgerLengthFt} linear ft`,
      });
    }
  }

  return items;
}

// ── Category color map ────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  Decking:  "text-blue-400 border-blue-500/30 bg-blue-500/10",
  Framing:  "text-amber-400 border-amber-500/30 bg-amber-500/10",
  Structure:"text-orange-400 border-orange-500/30 bg-orange-500/10",
  Stairs:   "text-purple-400 border-purple-500/30 bg-purple-500/10",
  Railing:  "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  Hardware: "text-gray-300 border-gray-500/30 bg-gray-500/10",
};

// ── Component ─────────────────────────────────────────────────────────────
export default function MaterialTakeoff({
  deckLength,
  deckWidth,
  deckSqft,
  heightTier,
  materialType,
  railingType,
  stairCount,
  jobType,
}: Props) {
  const [open, setOpen] = useState(false);

  const canCalculate =
    deckLength && deckLength > 0 &&
    deckWidth && deckWidth > 0 &&
    deckSqft && deckSqft > 0;

  const items = canCalculate
    ? calcTakeoff(
        deckLength!,
        deckWidth!,
        deckSqft!,
        heightTier ?? "standard",
        materialType ?? "pressure-treated",
        railingType ?? "none",
        stairCount ?? 0,
        jobType ?? "new_build"
      )
    : [];

  const categories = Array.from(new Set(items.map((i) => i.category)));

  return (
    <div className="rounded-xl border border-white/10 bg-white/5">

      {/* ── Toggle header ── */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl font-semibold text-white">Material Takeoff</span>
          <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-xs text-blue-400">
            {items.length} line items
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/40">
            {open ? "Click to collapse" : "Click to expand"}
          </span>
          <span className={`text-white/60 transition-transform ${open ? "rotate-180" : ""}`}>
            ▼
          </span>
        </div>
      </button>

      {/* ── Content ── */}
      {open && (
        <div className="border-t border-white/10 px-5 pb-6 pt-5">

          {!canCalculate ? (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-300">
              Enter deck dimensions (length and width) in the edit form to generate the material takeoff.
            </div>
          ) : (
            <>
              {categories.map((cat) => {
                const catItems = items.filter((i) => i.category === cat);
                const colorClass = CATEGORY_COLORS[cat] ?? "text-white border-white/20 bg-white/5";
                return (
                  <div key={cat} className="mb-6">
                    <div className={`mb-3 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${colorClass}`}>
                      {cat}
                    </div>
                    <div className="overflow-hidden rounded-xl border border-white/10">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/10 bg-white/5">
                            <th className="px-4 py-2.5 text-left text-xs font-medium text-white/50">Item</th>
                            <th className="px-4 py-2.5 text-right text-xs font-medium text-white/50">Qty</th>
                            <th className="px-4 py-2.5 text-left text-xs font-medium text-white/50">Unit</th>
                            <th className="px-4 py-2.5 text-left text-xs font-medium text-white/50 hidden md:table-cell">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {catItems.map((item, i) => (
                            <tr key={i} className="border-b border-white/5 last:border-0">
                              <td className="px-4 py-3 font-medium text-white">{item.item}</td>
                              <td className="px-4 py-3 text-right font-semibold text-white">{item.quantity}</td>
                              <td className="px-4 py-3 text-white/60">{item.unit}</td>
                              <td className="px-4 py-3 text-white/40 hidden md:table-cell">{item.notes}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}

              {/* ── Disclaimer ── */}
              <div className="mt-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-amber-400">
                  ⚠ Estimating Disclaimer
                </div>
                <p className="text-xs leading-5 text-amber-200/70">
                  This material list is an estimate based on standard building practices and the job inputs entered.
                  Actual quantities may vary based on site conditions, local building codes, cuts, waste, and contractor
                  preference. Always verify quantities with your supplier and review with your build crew before ordering.
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}