import type { DesignComponent, Position } from './types';

export const PX_PER_FT = 20;
export const CANVAS_WIDTH_FT = 60;
export const CANVAS_HEIGHT_FT = 50;

export function ftToPx(ft: number, scale = PX_PER_FT): number {
  return ft * scale;
}

export function pxToFt(px: number, scale = PX_PER_FT): number {
  return px / scale;
}

export function snapToGrid(value_ft: number, snap_ft: number): number {
  return Math.round(value_ft / snap_ft) * snap_ft;
}

export function snapPosition(pos: Position, snap_ft: number): Position {
  return {
    x: Math.max(0, snapToGrid(pos.x, snap_ft)),
    y: Math.max(0, snapToGrid(pos.y, snap_ft)),
  };
}

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

export interface ComponentColors {
  fill: string;
  stroke: string;
  textColor: string;
}

export function componentColor(type: DesignComponent['type']): ComponentColors {
  switch (type) {
    case 'deck_section':
      return { fill: '#B5D4F4', stroke: '#185FA5', textColor: '#0C447C' };
    case 'landing':
      return { fill: '#FAC775', stroke: '#854F0B', textColor: '#633806' };
    case 'stair':
      return { fill: '#C0DD97', stroke: '#3B6D11', textColor: '#27500A' };
  }
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function componentLabel(comp: DesignComponent): string {
  switch (comp.type) {
    case 'deck_section':
      return `${comp.width_ft}×${comp.length_ft} ft\n${comp.material.toUpperCase()}`;
    case 'stair':
      return `${comp.stair_count} steps\n${comp.width_ft}ft wide`;
    case 'landing':
      return `${comp.width_ft}×${comp.length_ft}\nlanding`;
  }
}
