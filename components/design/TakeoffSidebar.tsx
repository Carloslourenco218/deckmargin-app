'use client';

import { useMemo } from 'react';
import { calculateMaterials } from '@/lib/design/calculateMaterials';
import type { DesignComponent, MaterialLine } from '@/lib/design/types';

interface Props {
  components: DesignComponent[];
  /** Optional style overrides for the root aside — useful for mobile full-width layout */
  style?: React.CSSProperties;
}

const CATEGORY_ORDER = ['decking', 'framing', 'posts', 'concrete', 'hardware', 'railing'] as const;
const CATEGORY_LABELS: Record<string, string> = {
  decking: 'Decking',
  framing: 'Framing',
  posts: 'Posts & Beams',
  concrete: 'Concrete',
  hardware: 'Hardware',
  railing: 'Railings',
};
const CATEGORY_COLORS: Record<string, string> = {
  decking: '#185FA5',
  framing: '#3B6D11',
  posts: '#854F0B',
  concrete: '#6B5B2E',
  hardware: '#5A3E8C',
  railing: '#B5274F',
};

export default function TakeoffSidebar({ components, style }: Props) {
  const takeoff = useMemo(() => calculateMaterials(components), [components]);

  // Group lines by category
  const grouped = useMemo(() => {
    const map: Record<string, MaterialLine[]> = {};
    for (const line of takeoff.lines) {
      if (!map[line.category]) map[line.category] = [];
      map[line.category].push(line);
    }
    return map;
  }, [takeoff.lines]);

  const orderedCategories = CATEGORY_ORDER.filter((c) => grouped[c]?.length);

  const mergedStyle: React.CSSProperties = { ...sidebarStyle, ...style };

  return (
    <aside style={mergedStyle}>
      {/* Header */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #E0DDD5' }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#6B6860',
            letterSpacing: '0.06em',
            margin: 0,
          }}
        >
          MATERIAL TAKEOFF
        </p>
      </div>

      {/* Summary bar */}
      {components.length > 0 && (
        <div
          style={{
            padding: '10px 16px',
            borderBottom: '1px solid #E0DDD5',
            display: 'flex',
            gap: 12,
            background: '#F5F3EC',
          }}
        >
          <SumStat label="Deck sq ft" value={takeoff.summary.total_deck_sqft} />
          {takeoff.summary.total_stair_count > 0 && (
            <SumStat label="Steps" value={takeoff.summary.total_stair_count} />
          )}
          {takeoff.summary.total_linear_ft_railing > 0 && (
            <SumStat label="Railing ft" value={takeoff.summary.total_linear_ft_railing} />
          )}
        </div>
      )}

      {/* Empty state */}
      {components.length === 0 && (
        <div
          style={{
            padding: 24,
            color: '#9B9890',
            fontSize: 12,
            textAlign: 'center',
            lineHeight: 1.7,
          }}
        >
          Add components to the canvas to generate a material takeoff.
        </div>
      )}

      {/* Warnings */}
      {takeoff.warnings.length > 0 && components.length > 0 && (
        <div style={{ padding: '8px 12px', background: '#FEF3CD', borderBottom: '1px solid #F0C040' }}>
          {takeoff.warnings.map((w, i) => (
            <div key={i} style={{ fontSize: 11, color: '#7A5500', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
              <span>⚠</span>
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* Line items by category */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {orderedCategories.map((category) => (
          <div key={category}>
            {/* Category header */}
            <div
              style={{
                padding: '6px 16px',
                background: '#F1EFE8',
                borderBottom: '1px solid #E0DDD5',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: CATEGORY_COLORS[category] ?? '#888',
                  flexShrink: 0,
                  display: 'inline-block',
                }}
              />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#4A4840',
                  letterSpacing: '0.05em',
                }}
              >
                {CATEGORY_LABELS[category] ?? category.toUpperCase()}
              </span>
            </div>

            {/* Lines in category */}
            {grouped[category].map((line, i) => (
              <div
                key={i}
                style={{
                  padding: '7px 16px',
                  borderBottom: '1px solid #F0EDE4',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 11,
                      color: '#1A1915',
                      lineHeight: 1.4,
                      wordBreak: 'break-word',
                    }}
                  >
                    {line.item}
                  </div>
                </div>
                <div
                  style={{
                    flexShrink: 0,
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#1A1915',
                    textAlign: 'right',
                    minWidth: 44,
                  }}
                >
                  {line.quantity} {line.unit}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Footer — generated_at */}
      {takeoff.lines.length > 0 && (
        <div
          style={{
            padding: '8px 16px',
            borderTop: '1px solid #E0DDD5',
            fontSize: 10,
            color: '#9B9890',
          }}
        >
          Updated {new Date(takeoff.generated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
    </aside>
  );
}

function SumStat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#185FA5', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 9, color: '#9B9890', marginTop: 2, letterSpacing: '0.03em' }}>{label}</div>
    </div>
  );
}

const sidebarStyle: React.CSSProperties = {
  width: 260,
  background: '#FAFAF8',
  borderLeft: '1px solid #E0DDD5',
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  overflow: 'hidden',
};
