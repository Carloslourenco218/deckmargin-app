import { describe, it, expect } from 'vitest';

import {
  calculateMaterials,
  calcDeckSection,
  calcStairs,
  calcRailing,
  optimalLength,
  beamCountForWidth,
  postsPerBeam,
  consolidateLines,
} from '../calculateMaterials';

import type { DeckSection, StairModule, EdgeRailing } from '../types';

const simpleDeck: DeckSection = {
  id: 'test-section-1',
  type: 'deck_section',
  position: { x: 0, y: 0 },
  width_ft: 20,
  length_ft: 16,
  material: 'pt',
  joist_spacing: 16,
  decking_direction: 'perpendicular',
  board_width_in: 5.5,
  height_tier: 'standard',
  railings: [],
};

const stairModule: StairModule = {
  id: 'test-stair-1',
  type: 'stair',
  position: { x: 8, y: 16 },
  stair_count: 4,
  width_ft: 4,
  rise_in: 7.5,
  run_in: 11,
  material: 'pt',
  include_railing: false,
};

describe('optimalLength', () => {
  it('returns the shortest standard length >= required', () => {
    expect(optimalLength(7)).toBe(8);
    expect(optimalLength(8)).toBe(8);
    expect(optimalLength(9)).toBe(10);
    expect(optimalLength(16)).toBe(16);
    expect(optimalLength(17)).toBe(20);
  });
  it('caps at 20ft for spans beyond standard lengths', () => {
    expect(optimalLength(21)).toBe(20);
    expect(optimalLength(100)).toBe(20);
  });
});

describe('beamCountForWidth', () => {
  it('returns 0 beams for decks <= 8ft wide', () => {
    expect(beamCountForWidth(8)).toBe(0);
    expect(beamCountForWidth(6)).toBe(0);
  });
  it('returns 1 beam for 8-16ft wide decks', () => {
    expect(beamCountForWidth(9)).toBe(1);
    expect(beamCountForWidth(16)).toBe(1);
  });
  it('returns 2 beams for decks wider than 16ft', () => {
    expect(beamCountForWidth(17)).toBe(2);
    expect(beamCountForWidth(24)).toBe(2);
  });
});

describe('postsPerBeam', () => {
  it('adds one post at each end plus intermediates at max 8ft spacing', () => {
    expect(postsPerBeam(8)).toBe(2);
    expect(postsPerBeam(9)).toBe(3);
    expect(postsPerBeam(16)).toBe(3);
    expect(postsPerBeam(17)).toBe(4);
  });
});

describe('consolidateLines', () => {
  it('merges duplicate items by summing quantities', () => {
    const lines = [
      { category: 'framing' as const, item: '2×10×16 PT Joist', quantity: 10, unit: 'ea' as const },
      { category: 'framing' as const, item: '2×10×16 PT Joist', quantity: 5,  unit: 'ea' as const },
      { category: 'framing' as const, item: '2×10×20 PT Joist', quantity: 3,  unit: 'ea' as const },
    ];
    const result = consolidateLines(lines);
    expect(result).toHaveLength(2);
    expect(result.find((l) => l.item === '2×10×16 PT Joist')?.quantity).toBe(15);
    expect(result.find((l) => l.item === '2×10×20 PT Joist')?.quantity).toBe(3);
  });
});

describe('calcDeckSection — simple 20×16 PT deck', () => {
  const lines = calcDeckSection(simpleDeck);
  it('produces line items', () => { expect(lines.length).toBeGreaterThan(0); });
  it('includes decking boards', () => { expect(lines.filter((l) => l.category === 'decking').length).toBeGreaterThan(0); });
  it('calculates reasonable board count', () => {
    const deckingLine = lines.find((l) => l.category === 'decking');
    expect(deckingLine).toBeDefined();
    expect(deckingLine!.quantity).toBeGreaterThan(25);
    expect(deckingLine!.quantity).toBeLessThan(50);
  });
  it('uses 16ft board length', () => { expect(lines.find((l) => l.category === 'decking')?.item).toContain('16'); });
  it('includes joists', () => {
    const joists = lines.filter((l) => l.category === 'framing' && l.item.includes('Joist') && !l.item.includes('Rim'));
    expect(joists[0].quantity).toBeGreaterThanOrEqual(12);
    expect(joists[0].quantity).toBeLessThanOrEqual(15);
  });
  it('includes rim joists', () => { expect(lines.find((l) => l.item.includes('Rim'))).toBeDefined(); });
  it('includes a beam for 20ft width', () => { expect(lines.find((l) => l.item.includes('Beam'))!.quantity).toBeGreaterThan(0); });
  it('includes posts for standard height', () => { expect(lines.find((l) => l.category === 'posts')!.quantity).toBeGreaterThan(0); });
  it('includes concrete', () => { expect(lines.find((l) => l.category === 'concrete')!.unit).toBe('bag'); });
  it('includes joist hangers', () => { expect(lines.find((l) => l.item.includes('Joist Hanger'))).toBeDefined(); });
  it('includes post bases', () => { expect(lines.find((l) => l.item.includes('Post Base'))).toBeDefined(); });
  it('no railing lines when railings array is empty', () => { expect(lines.filter((l) => l.category === 'railing')).toHaveLength(0); });
});

describe('calcDeckSection — ground-level deck', () => {
  const groundDeck: DeckSection = { ...simpleDeck, id: 'ground-deck', height_tier: 'ground' };
  it('no posts for ground-level', () => { expect(calcDeckSection(groundDeck).filter((l) => l.category === 'posts')).toHaveLength(0); });
  it('no concrete for ground-level', () => { expect(calcDeckSection(groundDeck).filter((l) => l.category === 'concrete')).toHaveLength(0); });
});

describe('calcDeckSection — with railings', () => {
  const deckWithRailing: DeckSection = {
    ...simpleDeck, id: 'railing-deck',
    railings: [{ edge: 'top', railing_type: 'wood' }, { edge: 'left', railing_type: 'composite' }],
  };
  it('generates railing materials', () => { expect(calcDeckSection(deckWithRailing).filter((l) => l.category === 'railing').length).toBeGreaterThan(0); });
  it('includes both wood and composite items', () => {
    const lines = calcDeckSection(deckWithRailing);
    expect(lines.find((l) => l.item.includes('PT Railing Post'))).toBeDefined();
    expect(lines.find((l) => l.item.includes('Composite Rail Post'))).toBeDefined();
  });
});

describe('calcDeckSection — diagonal decking', () => {
  const diagonalDeck: DeckSection = { ...simpleDeck, id: 'diagonal-deck', decking_direction: 'diagonal' };
  it('diagonal uses more boards than perpendicular', () => {
    const perp = calcDeckSection(simpleDeck).find((l) => l.category === 'decking')!.quantity;
    const diag = calcDeckSection(diagonalDeck).find((l) => l.category === 'decking')!.quantity;
    expect(diag).toBeGreaterThan(perp);
  });
  it('warns about diagonal waste', () => {
    expect(calculateMaterials([diagonalDeck]).warnings[0]).toContain('Diagonal');
  });
});

describe('calcStairs — 4-step module', () => {
  const lines = calcStairs(stairModule);
  it('includes stringers', () => { expect(lines.find((l) => l.item.includes('Stringer'))!.quantity).toBeGreaterThanOrEqual(2); });
  it('includes treads', () => { expect(lines.find((l) => l.item.includes('Decking') || l.item.includes('Tread'))).toBeDefined(); });
  it('includes angle brackets', () => { expect(lines.find((l) => l.item.includes('Angle Bracket'))).toBeDefined(); });
  it('no railing when include_railing is false', () => { expect(lines.filter((l) => l.category === 'railing')).toHaveLength(0); });
  it('includes railing when include_railing is true', () => {
    expect(calcStairs({ ...stairModule, include_railing: true }).filter((l) => l.category === 'railing').length).toBeGreaterThan(0);
  });
});

describe('calcRailing — by type', () => {
  it('returns empty for railing_type none', () => { expect(calcRailing({ edge: 'top', railing_type: 'none' }, 16)).toHaveLength(0); });
  it('generates wood railing for 16ft edge', () => {
    const lines = calcRailing({ edge: 'top', railing_type: 'wood' }, 16);
    expect(lines.find((l) => l.item.includes('PT Railing Post'))).toBeDefined();
    expect(lines.find((l) => l.item.includes('Baluster'))).toBeDefined();
  });
  it('generates cable railing', () => {
    const lines = calcRailing({ edge: 'top', railing_type: 'cable' }, 16);
    expect(lines.find((l) => l.item.includes('Cable'))).toBeDefined();
    expect(lines.find((l) => l.item.includes('Tensioner'))).toBeDefined();
  });
  it('generates glass railing', () => {
    expect(calcRailing({ edge: 'top', railing_type: 'glass' }, 16).find((l) => l.item.includes('Glass Panel'))).toBeDefined();
  });
  it('correct baluster count for 10ft edge', () => {
    const balusters = calcRailing({ edge: 'top', railing_type: 'wood' }, 10).find((l) => l.item.includes('Baluster'));
    expect(balusters!.quantity).toBeCloseTo(27, 0);
  });
});

describe('calculateMaterials — full deck with stairs', () => {
  const result = calculateMaterials([simpleDeck, stairModule]);
  it('returns lines', () => { expect(result.lines.length).toBeGreaterThan(0); });
  it('summary has correct sqft', () => { expect(result.summary.total_deck_sqft).toBe(320); });
  it('summary counts stairs', () => { expect(result.summary.total_stair_count).toBe(4); });
  it('no duplicates after consolidation', () => {
    const items = result.lines.map((l) => l.item);
    expect(new Set(items).size).toBe(items.length);
  });
  it('no warnings for standard deck', () => { expect(result.warnings).toHaveLength(0); });
  it('has generated_at timestamp', () => { expect(new Date(result.generated_at).getFullYear()).toBe(new Date().getFullYear()); });
});

describe('calculateMaterials — empty design', () => {
  const result = calculateMaterials([]);
  it('returns empty lines', () => { expect(result.lines).toHaveLength(0); });
  it('warns no components', () => { expect(result.warnings[0]).toContain('No components'); });
});

describe('calculateMaterials — large elevated deck (24×20)', () => {
  const largeDeck: DeckSection = {
    ...simpleDeck, id: 'large-deck', width_ft: 24, length_ft: 20,
    height_tier: 'elevated', joist_spacing: 12,
    railings: [
      { edge: 'top', railing_type: 'composite' },
      { edge: 'left', railing_type: 'composite' },
      { edge: 'right', railing_type: 'composite' },
    ],
  };
  const result = calculateMaterials([largeDeck]);
  it('more concrete than standard deck', () => {
    const elevated = result.lines.find((l) => l.category === 'concrete')!.quantity;
    const standard = calculateMaterials([simpleDeck]).lines.find((l) => l.category === 'concrete')!.quantity;
    expect(elevated).toBeGreaterThan(standard);
  });
  it('summary reports 480 sqft', () => { expect(result.summary.total_deck_sqft).toBe(480); });
  it('includes railing lines', () => { expect(result.lines.filter((l) => l.category === 'railing').length).toBeGreaterThan(0); });
});