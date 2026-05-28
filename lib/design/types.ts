// lib/design/types.ts
// All TypeScript types for the DeckMargin visual designer feature.
// These types define the shape of canvas_data stored in deck_designs.canvas_data (jsonb).

// ─── Enumerations ────────────────────────────────────────────────────────────

export type MaterialType = 'pt' | 'trex' | 'timbertech' | 'pvc' | 'cedar';
export type DeckingDirection = 'perpendicular' | 'parallel' | 'diagonal';
export type JoistSpacing = 12 | 16 | 24; // inches on center
export type BoardWidth = 3.5 | 5.5;       // actual face width in inches (5/4x4 or 5/4x6)
export type HeightTier = 'ground' | 'standard' | 'elevated'; // <1ft | 1-4ft | >4ft
export type RailingType = 'wood' | 'composite' | 'cable' | 'glass' | 'none';
export type Edge = 'top' | 'right' | 'bottom' | 'left';
export type ComponentType = 'deck_section' | 'stair' | 'landing';
export type MaterialCategory = 'decking' | 'framing' | 'posts' | 'hardware' | 'concrete' | 'railing' | 'stairs';
export type Unit = 'ea' | 'lf' | 'bf' | 'bag' | 'lb';

// ─── Design Components ────────────────────────────────────────────────────────

/** Canvas position in feet (not pixels — conversion happens in the renderer) */
export interface Position {
  x: number; // feet from canvas origin
  y: number; // feet from canvas origin
}

/** Railing applied to one edge of a deck section */
export interface EdgeRailing {
  edge: Edge;
  railing_type: RailingType;
  post_spacing_ft?: number; // default 6ft (code max)
}

/** Main deck platform — the core component */
export interface DeckSection {
  id: string;
  type: 'deck_section';
  position: Position;
  width_ft: number;            // left-right dimension on canvas
  length_ft: number;           // top-bottom dimension on canvas
  material: MaterialType;
  joist_spacing: JoistSpacing;
  decking_direction: DeckingDirection;
  board_width_in: BoardWidth;
  height_tier: HeightTier;
  railings: EdgeRailing[];
  label?: string;              // optional user label ("Main Deck", "Upper Level")
}

/** Stair module — attaches to a deck section edge */
export interface StairModule {
  id: string;
  type: 'stair';
  position: Position;
  attached_to_id?: string;     // id of parent DeckSection (optional — can be freestanding)
  attached_edge?: Edge;        // which edge of the parent it attaches to
  stair_count: number;         // number of steps
  width_ft: number;            // stair width
  rise_in: number;             // rise per step in inches (default 7.5)
  run_in: number;              // run per step in inches (default 11)
  material: MaterialType;
  include_railing: boolean;    // railing on both sides of stairs
}

/** Landing platform — typically at base of stairs */
export interface LandingModule {
  id: string;
  type: 'landing';
  position: Position;
  width_ft: number;
  length_ft: number;
  material: MaterialType;
  joist_spacing: JoistSpacing;
  height_tier: HeightTier;
}

export type DesignComponent = DeckSection | StairModule | LandingModule;

// ─── Canvas Settings ─────────────────────────────────────────────────────────

export interface CanvasSettings {
  snap_ft: 0.5 | 1 | 2;       // snap increment in feet
  canvas_width_ft: number;     // total canvas width in feet
  canvas_height_ft: number;    // total canvas height in feet
  px_per_ft: number;           // rendering scale (default: 20)
}

// ─── Full Canvas Data (stored in deck_designs.canvas_data) ──────────────────

export interface CanvasData {
  schema_version: '1.0';
  components: DesignComponent[];
  settings: CanvasSettings;
}

// ─── Material Takeoff Output ─────────────────────────────────────────────────

export interface MaterialLine {
  category: MaterialCategory;
  item: string;                // e.g. "5/4×6×16 Trex Transcend Decking Board"
  quantity: number;
  unit: Unit;
  unit_cost?: number;          // from user_settings if available
  total_cost?: number;
  source_component_id?: string; // which design component generated this line
  notes?: string;              // e.g. "15% waste included"
}

export interface TakeoffSummary {
  total_deck_sqft: number;
  total_board_feet: number;
  total_linear_ft_railing: number;
  total_stair_count: number;
  estimated_material_cost: number;
  component_count: number;
}

export interface MaterialTakeoff {
  lines: MaterialLine[];
  summary: TakeoffSummary;
  generated_at: string;        // ISO timestamp
  warnings: string[];          // e.g. "Diagonal decking uses estimated waste of 20%"
}

// ─── User Settings (subset needed for cost calculation) ──────────────────────

export interface DesignUserSettings {
  pt_material_rate: number;        // $/sqft — from user_settings table
  trex_material_rate: number;
  timbertech_material_rate: number;
  pvc_material_rate: number;
  labor_rate_per_sqft?: number;    // optional — not used in material calc
}

// ─── Design State (client-side only — not persisted) ─────────────────────────

export interface DesignState {
  components: DesignComponent[];
  selected_id: string | null;
  snap_ft: 0.5 | 1 | 2;
  is_dirty: boolean;             // unsaved changes
  history: DesignComponent[][];  // undo stack
  history_index: number;
}

export type DesignAction =
  | { type: 'ADD_COMPONENT'; component: DesignComponent }
  | { type: 'UPDATE_COMPONENT'; id: string; changes: Partial<DesignComponent> }
  | { type: 'DELETE_COMPONENT'; id: string }
  | { type: 'MOVE_COMPONENT'; id: string; position: Position }
  | { type: 'SELECT_COMPONENT'; id: string | null }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SET_SNAP'; snap_ft: 0.5 | 1 | 2 }
  | { type: 'LOAD_DESIGN'; components: DesignComponent[] }
  | { type: 'MARK_SAVED' };