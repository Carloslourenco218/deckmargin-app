'use client';

import { useRef, useCallback } from 'react';
import { Stage, Layer, Rect, Text, Group, Line } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { DesignComponent, DesignAction, DesignState } from '@/lib/design/types';
import {
  ftToPx,
  pxToFt,
  snapPosition,
  getComponentBounds,
  componentColor,
  componentLabel,
  generateId,
  PX_PER_FT,
  CANVAS_WIDTH_FT,
  CANVAS_HEIGHT_FT,
} from '@/lib/design/canvasUtils';

interface Props {
  state: DesignState;
  dispatch: React.Dispatch<DesignAction>;
}

const CANVAS_W_PX = ftToPx(CANVAS_WIDTH_FT);
const CANVAS_H_PX = ftToPx(CANVAS_HEIGHT_FT);

export default function DesignCanvas({ state, dispatch }: Props) {
  const stageRef = useRef<any>(null);

  // Build grid lines — major every 5ft, minor every 1ft
  const gridLines = [];
  for (let x = 0; x <= CANVAS_WIDTH_FT; x++) {
    gridLines.push(
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
    gridLines.push(
      <Line
        key={`h${y}`}
        points={[0, ftToPx(y), CANVAS_W_PX, ftToPx(y)]}
        stroke={y % 5 === 0 ? '#B4B2A9' : '#D3D1C7'}
        strokeWidth={y % 5 === 0 ? 0.5 : 0.25}
        listening={false}
      />
    );
  }

  const handleDragEnd = useCallback(
    (comp: DesignComponent, e: KonvaEventObject<DragEvent>) => {
      const rawX = pxToFt(e.target.x());
      const rawY = pxToFt(e.target.y());
      const snapped = snapPosition({ x: rawX, y: rawY }, state.snap_ft);
      dispatch({ type: 'MOVE_COMPONENT', id: comp.id, position: snapped });
      // Snap the visual position too
      e.target.x(ftToPx(snapped.x));
      e.target.y(ftToPx(snapped.y));
    },
    [state.snap_ft, dispatch]
  );

  const handleStageClick = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (e.target === e.target.getStage() || e.target.name() === 'grid') {
        dispatch({ type: 'SELECT_COMPONENT', id: null });
      }
    },
    [dispatch]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const componentType = e.dataTransfer.getData('componentType');
      if (!componentType) return;

      const stage = stageRef.current;
      if (!stage) return;

      const stageBox = stage.container().getBoundingClientRect();
      const rawX = pxToFt(e.clientX - stageBox.left);
      const rawY = pxToFt(e.clientY - stageBox.top);
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
        };
      }

      dispatch({ type: 'ADD_COMPONENT', component });
    },
    [state.snap_ft, dispatch]
  );

  return (
    <div
      style={{ flex: 1, overflow: 'auto', background: '#F1EFE8' }}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <Stage
        ref={stageRef}
        width={CANVAS_W_PX}
        height={CANVAS_H_PX}
        onClick={handleStageClick}
      >
        {/* Grid layer — non-interactive */}
        <Layer listening={false}>
          <Rect width={CANVAS_W_PX} height={CANVAS_H_PX} fill="#F1EFE8" name="grid" />
          {gridLines}
        </Layer>

        {/* Components layer */}
        <Layer>
          {state.components.map((comp) => {
            const bounds = getComponentBounds(comp);
            const colors = componentColor(comp.type);
            const isSelected = state.selected_id === comp.id;
            const x = ftToPx(comp.position.x);
            const y = ftToPx(comp.position.y);
            const w = ftToPx(bounds.width);
            const h = ftToPx(bounds.height);
            const label = componentLabel(comp);

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
                onDragEnd={(e) => handleDragEnd(comp, e)}
              >
                <Rect
                  width={w}
                  height={h}
                  fill={colors.fill}
                  stroke={isSelected ? '#185FA5' : colors.stroke}
                  strokeWidth={isSelected ? 2 : 1}
                  cornerRadius={3}
                />
                <Text
                  text={label}
                  width={w}
                  height={h}
                  align="center"
                  verticalAlign="middle"
                  fontSize={Math.max(9, Math.min(12, w / 8))}
                  fill={colors.textColor}
                  lineHeight={1.4}
                  listening={false}
                />
                {/* Selection indicator */}
                {isSelected && (
                  <Rect
                    width={w}
                    height={h}
                    stroke="#185FA5"
                    strokeWidth={1.5}
                    dash={[5, 3]}
                    fill="transparent"
                    cornerRadius={3}
                    listening={false}
                  />
                )}
              </Group>
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
}
