import type { DesignComponent, Position, DeckSection, LandingModule, DeckLevel } from './types';

export const PX_PER_FT = 20;
export const CANVAS_WIDTH_FT = 60;
export const CANVAS_HEIGHT_FT = 50;

// ─── Unit conversion ──────────────────────────────────────────────────────────

export function ftToPx(ft: number): number {
  return ft * PX_PER_FT;
}

export function pxToFt(px: number): number {
  return px / PX_PER_FT;
}

// ─── Grid snapping ────────────────────────────────────────────────────────────

export function snapToGrid(value_ft: number, snap_ft: number): number {
  return Math.round(value_ft / snap_ft) * snap_ft;
}

export function snapPosition(pos: Position, snap_ft: number): Position {
  return {
    x: Math.max(0, snapToGrid(pos.x, snap_ft)),
    y: Math.max(0, snapToGrid(pos.y, snap_ft)),
  };
}

// ─── Edge snapping ────────────────────────────────────────────────────────────

/** Snap threshold in feet — within this distance, a dragged component snaps to a neighbor's edge */
export const EDGE_SNAP_THRESHOLD_FT = 1.5;

/**
 * Given a dragged component at rawPos, check all other components for nearby edges and snap.
 * Handles both abutting (left-edge-to-right-edge) and aligning (left-to-left).
 * Falls back to rawPos if no snap candidate is within threshold.
 */
export function snapToEdges(
  dragged: DesignComponent,
  rawPos: Position,
  others: DesignComponent[],
  threshold = EDGE_SNAP_THRESHOLD_FT
): Position {
  const bounds = getComponentBounds(dragged);
  const w = bounds.width;
  const h = bounds.height;

  let snapX = rawPos.x;
  let snapY = rawPos.y;
  let minDistX = threshold;
  let minDistY = threshold;

  for (const other of others) {
    if (other.id === dragged.id) continue;

    const ob = getComponentBounds(other);
    const ox = ob.x;
    const oy = ob.y;
    const ow = ob.width;
    const oh = ob.height;

    // ── X-axis candidates ──
    // Abut: dragged left edge → other right edge
    let d = Math.abs(rawPos.x - (ox + ow));
    if (d < minDistX) { minDistX = d; snapX = ox + ow; }

    // Abut: dragged right edge → other left edge
    d = Math.abs((rawPos.x + w) - ox);
    if (d < minDistX) { minDistX = d; snapX = ox - w; }

    // Align: left edges
    d = Math.abs(rawPos.x - ox);
    if (d < minDistX) { minDistX = d; snapX = ox; }

    // Align: right edges
    d = Math.abs((rawPos.x + w) - (ox + ow));
    if (d < minDistX) { minDistX = d; snapX = ox + ow - w; }

    // ── Y-axis candidates ──
    // Abut: dragged top → other bottom
    d = Math.abs(rawPos.y - (oy + oh));
    if (d < minDistY) { minDistY = d; snapY = oy + oh; }

    // Abut: dragged bottom → other top
    d = Math.abs((rawPos.y + h) - oy);
    if (d < minDistY) { minDistY = d; snapY = oy - h; }

    // Align: top edges
    d = Math.abs(rawPos.y - oy);
    if (d < minDistY) { minDistY = d; snapY = oy; }

    // Align: bottom edges
    d = Math.abs((rawPos.y + h) - (oy + oh));
    if (d < minDistY) { minDistY = d; snapY = oy + oh - h; }
  }

  // Clamp to canvas bounds
  return {
    x: Math.max(0, Math.min(CANVAS_WIDTH_FT - w, snapX)),
    y: Math.max(0, Math.min(CANVAS_HEIGHT_FT - h, snapY)),
  };
}

// ─── Component bounds ─────────────────────────────────────────────────────────

export interface ComponentBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function getComponentBounds(comp: DesignComponent): ComponentBounds {
  switch (comp.type) {
    case 'deck_section':
    case 'landing':
      return {
        x: comp.position.x,
        y: comp.position.y,
        width: comp.width_ft,
        height: comp.length_ft,
      };
    case 'stair':
      return {
        x: comp.position.x,
        y: comp.position.y,
        width: comp.width_ft,
        height: (comp.stair_count * comp.run_in) / 12,
      };
  }
}

// ─── Outer boundary segments ──────────────────────────────────────────────────

export interface BoundarySegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/**
 * Compute the exterior boundary segments for all deck sections and landings at a given level.
 * Adjacent sections at the same level have their shared edges removed — the result is the
 * outer silhouette of the combined shape, enabling L-shape, U-shape, and wrap-around decks
 * to render as one connected outline instead of individual boxes.
 *
 * Uses 0.5ft segment resolution matching the minimum snap grid.
 */
export function getOuterBoundarySegments(
  components: DesignComponent[],
  level: DeckLevel
): BoundarySegment[] {
  // Only consider deck sections and landings at this level
  const sections = components.filter((c): c is DeckSection | LandingModule => {
    if (c.type === 'stair') return false;
    const compLevel = (c as DeckSection | LandingModule).level ?? 1;
    return compLevel === level;
  });

  if (sections.length === 0) return [];

  const RESOLUTION = 0.5; // feet — matches minimum snap increment
  // Use integer keys to avoid float precision issues: multiply by 10
  const K = (v: number) => Math.round(v * 10);

  const hEdges = new Map<string, number>(); // "x1|x2|y" → count
  const vEdges = new Map<string, number>(); // "x|y1|y2" → count

  for (const s of sections) {
    const bounds = getComponentBounds(s);
    const { x, y, width, height } = bounds;
    const x2 = x + width;
    const y2 = y + height;

    // Horizontal edges (top and bottom of each section)
    for (let xi = x; xi < x2 - RESOLUTION * 0.01; xi += RESOLUTION) {
      const xe = Math.min(xi + RESOLUTION, x2);
      const kTop = `${K(xi)}|${K(xe)}|${K(y)}`;
      const kBot = `${K(xi)}|${K(xe)}|${K(y2)}`;
      hEdges.set(kTop, (hEdges.get(kTop) ?? 0) + 1);
      hEdges.set(kBot, (hEdges.get(kBot) ?? 0) + 1);
    }

    // Vertical edges (left and right of each section)
    for (let yi = y; yi < y2 - RESOLUTION * 0.01; yi += RESOLUTION) {
      const ye = Math.min(yi + RESOLUTION, y2);
      const kLeft  = `${K(x)}|${K(yi)}|${K(ye)}`;
      const kRight = `${K(x2)}|${K(yi)}|${K(ye)}`;
      vEdges.set(kLeft,  (vEdges.get(kLeft)  ?? 0) + 1);
      vEdges.set(kRight, (vEdges.get(kRight) ?? 0) + 1);
    }
  }

  const result: BoundarySegment[] = [];

  // Exterior segments appear exactly once (shared segments cancel out — count=2)
  for (const [key, count] of hEdges.entries()) {
    if (count === 1) {
      const [x1k, x2k, yk] = key.split('|').map(Number);
      result.push({ x1: x1k / 10, y1: yk / 10, x2: x2k / 10, y2: yk / 10 });
    }
  }
  for (const [key, count] of vEdges.entries()) {
    if (count === 1) {
      const [xk, y1k, y2k] = key.split('|').map(Number);
      result.push({ x1: xk / 10, y1: y1k / 10, x2: xk / 10, y2: y2k / 10 });
    }
  }

  return result;
}

// ─── Colors ───────────────────────────────────────────────────────────────────

export interface ComponentColors {
  fill: string;
  stroke: string;
  textColor: string;
}

/** Level-differentiated colors for deck sections */
const DECK_COLORS: Record<DeckLevel, ComponentColors> = {
  1: { fill: '#B5D4F4', stroke: '#185FA5', textColor: '#0C447C' }, // light blue — ground
  2: { fill: '#6FA3CC', stroke: '#0D4080', textColor: '#FFFFFF' }, // medium blue — upper
  3: { fill: '#2F6DA3', stroke: '#07295C', textColor: '#FFFFFF' }, // dark blue — top
};

/** Level-differentiated colors for landings */
const LANDING_COLORS: Record<DeckLevel, ComponentColors> = {
  1: { fill: '#FAC775', stroke: '#854F0B', textColor: '#633806' },
  2: { fill: '#F0A030', stroke: '#6B3D07', textColor: '#3E2103' },
  3: { fill: '#C07808', stroke: '#4A2A04', textColor: '#FFFFFF' },
};

/** Boundary stroke color per level (used by the outer-outline renderer) */
export const BOUNDARY_STROKE: Record<DeckLevel, string> = {
  1: '#185FA5',
  2: '#0D4080',
  3: '#07295C',
};

export function componentColor(comp: DesignComponent): ComponentColors {
  switch (comp.type) {
    case 'deck_section': {
      const level = (comp.level ?? 1) as DeckLevel;
      return DECK_COLORS[level];
    }
    case 'landing': {
      const level = (comp.level ?? 1) as DeckLevel;
      return LANDING_COLORS[level];
    }
    case 'stair':
      return { fill: '#C0DD97', stroke: '#3B6D11', textColor: '#27500A' };
  }
}

// ─── Labels ───────────────────────────────────────────────────────────────────

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function componentLabel(comp: DesignComponent): string {
  switch (comp.type) {
    case 'deck_section': {
      const levelTag = comp.level && comp.level > 1 ? ` L${comp.level}` : '';
      return `${comp.width_ft}×${comp.length_ft} ft${levelTag}\n${comp.material.toUpperCase()}`;
    }
    case 'stair':
      return `${comp.stair_count} steps\n${comp.width_ft}ft wide`;
    case 'landing': {
      const levelTag = comp.level && comp.level > 1 ? ` L${comp.level}` : '';
      return `${comp.width_ft}×${comp.length_ft}${levelTag}\nlanding`;
    }
  }
}
