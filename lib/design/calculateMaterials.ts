import type {
  DesignComponent,
  DeckSection,
  StairModule,
  LandingModule,
  MaterialLine,
  MaterialTakeoff,
  TakeoffSummary,
  DesignUserSettings,
  EdgeRailing,
  MaterialType,
  BoardWidth,
  HeightTier,
} from './types';

const STANDARD_LENGTHS_FT = [8, 10, 12, 14, 16, 20] as const;
const BOARD_GAP_IN = 0.25;
const WASTE_FACTOR: Record<string, number> = {
  perpendicular: 1.10,
  parallel:      1.10,
  diagonal:      1.20,
};
const MAX_JOIST_SPAN_FT = 8;
const MAX_POST_SPACING_FT = 8;
const BALUSTER_SPACING_IN = 4.5;
const CONCRETE_BAGS_PER_POST = 3;

export function optimalLength(required_ft: number): number {
  return STANDARD_LENGTHS_FT.find((l) => l >= required_ft) ?? 20;
}

export function heightTierToFt(tier: HeightTier): number {
  switch (tier) {
    case 'ground':   return 1;
    case 'standard': return 3;
    case 'elevated': return 6;
  }
}

export function beamCountForWidth(width_ft: number): number {
  if (width_ft <= MAX_JOIST_SPAN_FT) return 0;
  if (width_ft <= MAX_JOIST_SPAN_FT * 2) return 1;
  return Math.ceil(width_ft / MAX_JOIST_SPAN_FT) - 1;
}

export function postsPerBeam(length_ft: number): number {
  return Math.ceil(length_ft / MAX_POST_SPACING_FT) + 1;
}

export function deckingLabel(material: MaterialType, board_width_in: BoardWidth, length_ft: number): string {
  const nominalWidth = board_width_in === 5.5 ? '6' : '4';
  const labels: Record<MaterialType, string> = {
    pt:         `5/4×${nominalWidth}×${length_ft} Pressure Treated Decking`,
    trex:       `5/4×${nominalWidth}×${length_ft} Trex Transcend Decking`,
    timbertech: `5/4×${nominalWidth}×${length_ft} TimberTech Decking`,
    pvc:        `5/4×${nominalWidth}×${length_ft} PVC Decking`,
    cedar:      `5/4×${nominalWidth}×${length_ft} Western Red Cedar Decking`,
  };
  return labels[material];
}

export function consolidateLines(lines: MaterialLine[]): MaterialLine[] {
  const map = new Map<string, MaterialLine>();
  for (const line of lines) {
    const existing = map.get(line.item);
    if (existing) {
      existing.quantity += line.quantity;
      if (existing.total_cost !== undefined && line.total_cost !== undefined) {
        existing.total_cost += line.total_cost;
      }
    } else {
      map.set(line.item, { ...line });
    }
  }
  return Array.from(map.values());
}

export function calcDeckSection(
  section: DeckSection,
  settings?: DesignUserSettings
): MaterialLine[] {
  const { width_ft, length_ft, material, joist_spacing, decking_direction, board_width_in, height_tier } = section;
  const lines: MaterialLine[] = [];
  const src = section.id;
  const waste = WASTE_FACTOR[decking_direction] ?? 1.10;

  const board_width_ft = board_width_in / 12;
  const gap_ft = BOARD_GAP_IN / 12;
  const effective_coverage_ft = board_width_ft + gap_ft;
  const span_ft = decking_direction === 'parallel' ? width_ft : length_ft;
  const coverage_span_ft = decking_direction === 'parallel' ? length_ft : width_ft;
  const raw_board_count = coverage_span_ft / effective_coverage_ft;
  const board_count = Math.ceil(raw_board_count * waste);
  const board_length = optimalLength(span_ft);

  lines.push({
    category: 'decking',
    item: deckingLabel(material, board_width_in, board_length),
    quantity: board_count,
    unit: 'ea',
    source_component_id: src,
    notes: `${Math.round((waste - 1) * 100)}% waste included${decking_direction === 'diagonal' ? ' (diagonal)' : ''}`,
  });

  const joist_spacing_ft = joist_spacing / 12;
  const joist_count = Math.ceil(length_ft / joist_spacing_ft) + 1;
  const joist_length = optimalLength(width_ft);

  lines.push({
    category: 'framing',
    item: `2×10×${joist_length} PT Joist`,
    quantity: joist_count,
    unit: 'ea',
    source_component_id: src,
  });

  const perimeter_lf = 2 * width_ft + 2 * length_ft;
  const rim_boards_needed = Math.ceil(perimeter_lf / 16);
  lines.push({
    category: 'framing',
    item: `2×10×16 PT Rim Joist / Band Board`,
    quantity: rim_boards_needed,
    unit: 'ea',
    source_component_id: src,
  });

  const ledger_length = optimalLength(length_ft);
  lines.push({
    category: 'framing',
    item: `2×10×${ledger_length} PT Ledger Board`,
    quantity: Math.ceil(length_ft / ledger_length),
    unit: 'ea',
    source_component_id: src,
  });

  const beam_count = beamCountForWidth(width_ft);
  if (beam_count > 0) {
    const beam_board_length = optimalLength(length_ft);
    lines.push({
      category: 'framing',
      item: `2×10×${beam_board_length} PT Beam Board (triple beam)`,
      quantity: beam_count * 3 * Math.ceil(length_ft / beam_board_length),
      unit: 'ea',
      source_component_id: src,
      notes: `${beam_count} beam(s), tripled 2×10`,
    });
  }

  const post_height_ft = heightTierToFt(height_tier);
  const post_length = optimalLength(post_height_ft + 2);
  const num_beams = Math.max(beam_count, 1);
  const post_count = num_beams * postsPerBeam(length_ft);

  if (height_tier !== 'ground') {
    lines.push({
      category: 'posts',
      item: `6×6×${post_length} PT Post`,
      quantity: post_count,
      unit: 'ea',
      source_component_id: src,
    });
  }

  lines.push(
    {
      category: 'hardware',
      item: 'Joist Hanger — LUS210 (Simpson)',
      quantity: joist_count * 2,
      unit: 'ea',
      source_component_id: src,
    },
    {
      category: 'hardware',
      item: 'Post Base — ABA66 (Simpson)',
      quantity: post_count,
      unit: 'ea',
      source_component_id: src,
    },
    {
      category: 'hardware',
      item: 'Structural Screws — 3" (5lb box)',
      quantity: Math.ceil((width_ft * length_ft) / 100),
      unit: 'ea',
      source_component_id: src,
    },
    {
      category: 'hardware',
      item: 'Deck Screws — 2.5" (5lb box)',
      quantity: Math.ceil((width_ft * length_ft) / 60),
      unit: 'ea',
      source_component_id: src,
    },
    {
      category: 'hardware',
      item: 'Joist Tape (waterproofing)',
      quantity: Math.ceil((joist_count * width_ft) / 50),
      unit: 'ea',
      source_component_id: src,
    }
  );

  if (height_tier !== 'ground') {
    lines.push({
      category: 'concrete',
      item: 'Concrete — 80lb bag (Quikrete)',
      quantity: post_count * CONCRETE_BAGS_PER_POST,
      unit: 'bag',
      source_component_id: src,
      notes: `${CONCRETE_BAGS_PER_POST} bags per footing × ${post_count} posts`,
    });
  }

  for (const railing of section.railings) {
    const edge_lf =
      railing.edge === 'top' || railing.edge === 'bottom' ? length_ft : width_ft;
    lines.push(...calcRailing(railing, edge_lf, section.id));
  }

  return lines;
}

export function calcRailing(
  railing: EdgeRailing,
  edge_lf: number,
  source_component_id?: string
): MaterialLine[] {
  if (railing.railing_type === 'none') return [];

  const lines: MaterialLine[] = [];
  const post_spacing = railing.post_spacing_ft ?? 6;
  const post_count = Math.ceil(edge_lf / post_spacing) + 1;
  const baluster_count = Math.ceil((edge_lf * 12) / BALUSTER_SPACING_IN);
  const src = source_component_id;

  switch (railing.railing_type) {
    case 'wood':
      lines.push(
        { category: 'railing', item: `4×4×8 PT Railing Post`, quantity: post_count, unit: 'ea', source_component_id: src },
        { category: 'railing', item: `2×4×${optimalLength(edge_lf)} PT Top Rail`, quantity: Math.ceil(edge_lf / optimalLength(edge_lf)) * 2, unit: 'ea', source_component_id: src },
        { category: 'railing', item: `2×2×42" PT Baluster`, quantity: baluster_count, unit: 'ea', source_component_id: src },
        { category: 'railing', item: `Post Cap (decorative)`, quantity: post_count, unit: 'ea', source_component_id: src }
      );
      break;
    case 'composite':
      lines.push(
        { category: 'railing', item: `Composite Rail Post (4×4)`, quantity: post_count, unit: 'ea', source_component_id: src },
        { category: 'railing', item: `Composite Top Rail Section`, quantity: Math.ceil(edge_lf / 8), unit: 'ea', source_component_id: src, notes: '8ft sections' },
        { category: 'railing', item: `Composite Baluster`, quantity: baluster_count, unit: 'ea', source_component_id: src },
        { category: 'railing', item: `Rail Bracket Kit`, quantity: Math.ceil(edge_lf / 8), unit: 'ea', source_component_id: src }
      );
      break;
    case 'cable':
      lines.push(
        { category: 'railing', item: `Steel Cable Rail Post`, quantity: post_count, unit: 'ea', source_component_id: src },
        { category: 'railing', item: `Cable Rail (1/8" stainless, 100ft coil)`, quantity: Math.ceil((edge_lf * 12) / 100), unit: 'ea', source_component_id: src },
        { category: 'railing', item: `Cable Tensioner / End Fitting`, quantity: post_count * 2, unit: 'ea', source_component_id: src }
      );
      break;
    case 'glass':
      lines.push(
        { category: 'railing', item: `Glass Panel Post`, quantity: post_count, unit: 'ea', source_component_id: src },
        { category: 'railing', item: `Tempered Glass Panel (36"×72")`, quantity: Math.ceil(edge_lf / 6), unit: 'ea', source_component_id: src },
        { category: 'railing', item: `Glass Panel Clip / Bracket`, quantity: Math.ceil(edge_lf / 6) * 4, unit: 'ea', source_component_id: src }
      );
      break;
  }

  return lines;
}

export function calcStairs(stair: StairModule): MaterialLine[] {
  const { stair_count, width_ft, rise_in, run_in, material, include_railing } = stair;
  const lines: MaterialLine[] = [];
  const src = stair.id;

  const total_rise_ft = (stair_count * rise_in) / 12;
  const total_run_ft  = (stair_count * run_in)  / 12;
  const raw_stringer_ft = Math.sqrt(total_rise_ft ** 2 + total_run_ft ** 2) * 1.10;
  const stringer_board_length = optimalLength(raw_stringer_ft);
  const stringer_count = width_ft > 3 ? 3 : 2;

  lines.push(
    {
      category: 'stairs',
      item: `2×12×${stringer_board_length} PT Stair Stringer`,
      quantity: stringer_count,
      unit: 'ea',
      source_component_id: src,
      notes: `${stair_count} risers, ${rise_in}" rise × ${run_in}" run`,
    },
    {
      category: 'stairs',
      item: deckingLabel(material, 5.5, optimalLength(width_ft)),
      quantity: stair_count * Math.ceil(width_ft / (5.5 / 12 + BOARD_GAP_IN / 12)),
      unit: 'ea',
      source_component_id: src,
      notes: 'Stair treads (2 boards per tread)',
    },
    {
      category: 'stairs',
      item: `Stair Angle Bracket — L70 (Simpson)`,
      quantity: stair_count * stringer_count,
      unit: 'ea',
      source_component_id: src,
    }
  );

  if (include_railing) {
    const stair_railing_lf = raw_stringer_ft * 1.05;
    lines.push(
      { category: 'railing', item: `4×4×${optimalLength(total_rise_ft + 0.5)} PT Stair Rail Post`, quantity: 4, unit: 'ea', source_component_id: src },
      { category: 'railing', item: `2×4 PT Stair Graspable Rail`, quantity: Math.ceil(stair_railing_lf / 8) * 2, unit: 'ea', source_component_id: src, notes: 'Both sides' }
    );
  }

  return lines;
}

export function calcLanding(landing: LandingModule): MaterialLine[] {
  const asDeckSection: DeckSection = {
    ...landing,
    type: 'deck_section',
    decking_direction: 'perpendicular',
    board_width_in: 5.5,
    material: landing.material,
    railings: [],
    label: 'Landing',
  };
  return calcDeckSection(asDeckSection).filter((l) => !l.item.includes('Ledger'));
}

function buildSummary(
  components: DesignComponent[],
  lines: MaterialLine[],
  settings?: DesignUserSettings
): TakeoffSummary {
  let total_deck_sqft = 0;
  let total_stair_count = 0;
  let total_railing_lf = 0;

  for (const comp of components) {
    if (comp.type === 'deck_section' || comp.type === 'landing') {
      total_deck_sqft += comp.width_ft * comp.length_ft;
    }
    if (comp.type === 'stair') {
      total_stair_count += comp.stair_count;
    }
    if (comp.type === 'deck_section') {
      for (const r of comp.railings) {
        if (r.railing_type !== 'none') {
          total_railing_lf +=
            r.edge === 'top' || r.edge === 'bottom' ? comp.length_ft : comp.width_ft;
        }
      }
    }
  }

  const total_board_feet = lines
    .filter((l) => l.category === 'decking')
    .reduce((sum, l) => {
      const match = l.item.match(/×(\d+)\s/);
      const length_ft = match ? parseInt(match[1]) : 16;
      const width_in = l.item.includes('×6×') ? 6 : 4;
      return sum + (l.quantity * (1.25 * width_in * length_ft)) / 12;
    }, 0);

  const estimated_material_cost = settings
    ? lines.reduce((sum, l) => sum + (l.total_cost ?? 0), 0)
    : 0;

  return {
    total_deck_sqft: Math.round(total_deck_sqft),
    total_board_feet: Math.round(total_board_feet),
    total_linear_ft_railing: Math.round(total_railing_lf),
    total_stair_count,
    estimated_material_cost: Math.round(estimated_material_cost * 100) / 100,
    component_count: components.length,
  };
}

export function calculateMaterials(
  components: DesignComponent[],
  settings?: DesignUserSettings
): MaterialTakeoff {
  const warnings: string[] = [];
  const allLines: MaterialLine[] = [];

  if (components.length === 0) {
    return {
      lines: [],
      summary: buildSummary([], [], settings),
      generated_at: new Date().toISOString(),
      warnings: ['No components in design'],
    };
  }

  for (const comp of components) {
    switch (comp.type) {
      case 'deck_section':
        allLines.push(...calcDeckSection(comp, settings));
        if (comp.decking_direction === 'diagonal') {
          warnings.push(`Section "${comp.label ?? comp.id}": Diagonal decking uses 20% waste estimate — verify with supplier.`);
        }
        break;
      case 'stair':
        allLines.push(...calcStairs(comp));
        break;
      case 'landing':
        allLines.push(...calcLanding(comp));
        break;
    }
  }

  const consolidated = consolidateLines(allLines);

  return {
    lines: consolidated,
    summary: buildSummary(components, consolidated, settings),
    generated_at: new Date().toISOString(),
    warnings,
  };
}