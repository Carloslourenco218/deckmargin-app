'use client';

import { useRef, useCallback, useMemo } from 'react';
import { Stage, Layer, Rect, Text, Group, Line } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { DesignComponent, DesignAction, DesignState, DeckLevel, DeckSection, LandingModule } from '@/lib/design/types';
import {
  ftToPx,
  pxToFt,
  snapPosition,
  snapToEdges,
  getComponentBounds,
  getOuterBoundarySegments,
  componentColor,
  componentLabel,
  generateId,
  BOUNDARY_STROKE,
  CANVAS_WIDTH_FT,
  CANVAS_HEIGHT_FT,
} from '@/lib/design/canvasUtils';

interface Props {
  state: DesignState;
  dispatch: React.Dispatch<DesignAction>;
  /** Canvas scale factor — 1 on desktop, <1 on mobile to fit screen width */
  scale?: number;
}

const CANVAS_W_PX = ftToPx(CANVAS_WIDTH_FT);
const CANVAS_H_PX = ftToPx(CANVAS_HEIGHT_FT);

const ALL_LEVELS: DeckLevel[] = [1, 2, 3];

export default function DesignCanvas({ state, dispatch, scale = 1 }: Props) {
  const stageRef = useRef<any>(null);

  // ─── Grid lines ────────────────────────────────────────────────────────────
  const gridLines = useMemo(() => {
    const lines = [];
    for (let x = 0; x <= CANVAS_WIDTH_FT; x++) {
      lines.push(
        <Line
          key={`v${x}`}
          points={[ftToPx(x), 0, ftToPx(x), CANVAS_H_PX]}
          stroke={x % 5 === 0 ? '#B4B2A9' : '#D3D1C7'}
          strokeWidth={x % 5 === 0 ? 0.5 : 0.25}
          listening={false}
        />
      );
    }
    for (let y = 0; y <= CANVAS_HEIGHT_FT; y++) {
      lines.push(
        <Line
          key={`h${y}`}
          points={[0, ftToPx(y), CANVAS_W_PX, ftToPx(y)]}
          stroke={y % 5 === 0 ? '#B4B2A9' : '#D3D1C7'}
          strokeWidth={y % 5 === 0 ? 0.5 : 0.25}
          listening={false}
        />
      );
    }
    return lines;
  }, []);

  // ─── Outer boundary segments per level ────────────────────────────────────
  // Which levels actually have components (to skip empty levels)
  const activeLevels = useMemo<DeckLevel[]>(() => {
    const seen = new Set<DeckLevel>();
    for (const c of state.components) {
      if (c.type === 'stair') continue;
      seen.add(((c as DeckSection | LandingModule).level ?? 1) as DeckLevel);
    }
    return ALL_LEVELS.filter(l => seen.has(l));
  }, [state.components]);

  const boundarySegmentsByLevel = useMemo(() => {
    return Object.fromEntries(
      activeLevels.map(level => [level, getOuterBoundarySegments(state.components, level)])
    ) as Record<DeckLevel, ReturnType<typeof getOuterBoundarySegments>>;
  }, [state.components, activeLevels]);

  // ─── Drag handlers ────────────────────────────────────────────────────────

  /** Live snap during drag — updates visual position but not state */
  const handleDragMove = useCallback(
    (comp: DesignComponent, e: KonvaEventObject<DragEvent>) => {
      const rawX = pxToFt(e.target.x());
      const rawY = pxToFt(e.target.y());
      const gridSnapped = snapPosition({ x: rawX, y: rawY }, state.snap_ft);
      const edgeSnapped = snapToEdges(comp, gridSnapped, state.components);
      e.target.x(ftToPx(edgeSnapped.x));
      e.target.y(ftToPx(edgeSnapped.y));
    },
    [state.snap_ft, state.components]
  );

  /** Commit position on drag end */
  const handleDragEnd = useCallback(
    (comp: DesignComponent, e: KonvaEventObject<DragEvent>) => {
      const rawX = pxToFt(e.target.x());
      const rawY = pxToFt(e.target.y());
      const gridSnapped = snapPosition({ x: rawX, y: rawY }, state.snap_ft);
      const edgeSnapped = snapToEdges(comp, gridSnapped, state.components);
      dispatch({ type: 'MOVE_COMPONENT', id: comp.id, position: edgeSnapped });
      e.target.x(ftToPx(edgeSnapped.x));
      e.target.y(ftToPx(edgeSnapped.y));
    },
    [state.snap_ft, state.components, dispatch]
  );

  const handleStageClick = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (e.target === e.target.getStage() || e.target.name() === 'grid') {
        dispatch({ type: 'SELECT_COMPONENT', id: null });
      }
    },
    [dispatch]
  );

  // ─── HTML5 drop handler (desktop only) ────────────────────────────────────
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const componentType = e.dataTransfer.getData('componentType');
      if (!componentType) return;

      const stage = stageRef.current;
      if (!stage) return;

      const stageBox = stage.container().getBoundingClientRect();
      const rawX = pxToFt((e.clientX - stageBox.left) / scale);
      const rawY = pxToFt((e.clientY - stageBox.top) / scale);
      const pos = snapPosition({ x: rawX, y: rawY }, state.snap_ft);

      let component: DesignComponent;

      if (componentType === 'deck_section') {
        component = {
          id: generateId('deck'),
          type: 'deck_section',
          position: pos,
          width_ft: 12,
          length_ft: 16,
          material: 'trex',
          joist_spacing: 16,
          decking_direction: 'perpendicular',
          board_width_in: 5.5,
          height_tier: 'standard',
          railings: [],
          level: 1,
        };
      } else if (componentType === 'stair') {
        component = {
          id: generateId('stair'),
          type: 'stair',
          position: pos,
          stair_count: 3,
          width_ft: 4,
          rise_in: 7.5,
          run_in: 11,
          material: 'pt',
          include_railing: false,
        };
      } else {
        component = {
          id: generateId('landing'),
          type: 'landing',
          position: pos,
          width_ft: 5,
          length_ft: 5,
          material: 'trex',
          joist_spacing: 16,
          height_tier: 'ground',
          level: 1,
        };
      }

      dispatch({ type: 'ADD_COMPONENT', component });
    },
    [state.snap_ft, dispatch, scale]
  );

  return (
    <div
      style={{ flex: 1, overflow: 'auto', background: '#F1EFE8' }}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <Stage
        ref={stageRef}
        width={CANVAS_W_PX * scale}
        height={CANVAS_H_PX * scale}
        scaleX={scale}
        scaleY={scale}
        onClick={handleStageClick}
      >
        {/* Grid layer */}
        <Layer listening={false}>
          <Rect width={CANVAS_W_PX} height={CANVAS_H_PX} fill="#F1EFE8" name="grid" />
          {gridLines}
        </Layer>

        {/*
          Components layer:
          - Sections render as fill-only (no stroke) so shared edges are invisible
          - The boundary layer below draws the outer silhouette instead
          - This makes adjacent sections look like one connected shape
        */}
        <Layer>
          {state.components.map((comp) => {
            const bounds = getComponentBounds(comp);
            const colors = componentColor(comp);
            const isSelected = state.selected_id === comp.id;
            const x = ftToPx(comp.position.x);
            const y = ftToPx(comp.position.y);
            const w = ftToPx(bounds.width);
            const h = ftToPx(bounds.height);
            const label = componentLabel(comp);

            // Scale-corrected font: keep text legible at all zoom levels
            const fontSize = Math.min(w / 5, Math.max(9, 11 / Math.max(scale, 0.25)));

            return (
              <Group
                key={comp.id}
                x={x}
                y={y}
                draggable
                onClick={(e) => {
                  e.cancelBubble = true;
                  dispatch({ type: 'SELECT_COMPONENT', id: comp.id });
                }}
                onTap={(e) => {
                  e.cancelBubble = true;
                  dispatch({ type: 'SELECT_COMPONENT', id: comp.id });
                }}
                onDragMove={(e) => handleDragMove(comp, e)}
                onDragEnd={(e) => handleDragEnd(comp, e)}
              >
                {/* Fill only — no stroke so adjacent sections visually merge */}
                <Rect
                  width={w}
                  height={h}
                  fill={colors.fill}
                  strokeEnabled={false}
                />
                <Text
                  text={label}
                  width={w}
                  height={h}
                  align="center"
                  verticalAlign="middle"
                  fontSize={fontSize}
                  fill={colors.textColor}
                  lineHeight={1.4}
                  listening={false}
                />
                {/* Selection indicator — dashed border around selected component */}
                {isSelected && (
                  <Rect
                    width={w}
                    height={h}
                    stroke="#185FA5"
                    strokeWidth={2 / scale}
                    dash={[5 / scale, 3 / scale]}
                    fill="rgba(24, 95, 165, 0.08)"
                    cornerRadius={2}
                    listening={false}
                  />
                )}
              </Group>
            );
          })}
        </Layer>

        {/*
          Boundary layer — draws the outer silhouette of connected sections per level.
          Shared edges between touching sections are removed by the algorithm, so
          L-shapes, U-shapes, and wrap-arounds render as one unified outline.
        */}
        <Layer listening={false}>
          {activeLevels.map((level) =>
            (boundarySegmentsByLevel[level] ?? []).map((seg, i) => (
              <Line
                key={`boundary-${level}-${i}`}
                points={[
                  ftToPx(seg.x1), ftToPx(seg.y1),
                  ftToPx(seg.x2), ftToPx(seg.y2),
                ]}
                stroke={BOUNDARY_STROKE[level]}
                strokeWidth={2 / scale}
                listening={false}
              />
            ))
          )}

          {/* Stair outlines — stairs keep their own individual stroke */}
          {state.components
            .filter(c => c.type === 'stair')
            .map(comp => {
              const bounds = getComponentBounds(comp);
              const colors = componentColor(comp);
              return (
                <Rect
                  key={`stair-border-${comp.id}`}
                  x={ftToPx(comp.position.x)}
                  y={ftToPx(comp.position.y)}
                  width={ftToPx(bounds.width)}
                  height={ftToPx(bounds.height)}
                  stroke={colors.stroke}
                  strokeWidth={1.5 / scale}
                  fill="transparent"
                  cornerRadius={3}
                  listening={false}
                />
              );
            })}
        </Layer>
      </Stage>
    </div>
  );
}
