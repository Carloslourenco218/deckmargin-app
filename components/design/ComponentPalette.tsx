'use client';

import type { DesignAction } from '@/lib/design/types';

interface Props {
  dispatch: React.Dispatch<DesignAction>;
  canUndo: boolean;
  canRedo: boolean;
  snapFt: number;
  isDirty: boolean;
  onSave: () => void;
  onExport: () => void;
  /** True when viewport is mobile — renders a horizontal tap-to-add strip instead of sidebar */
  isMobile?: boolean;
  /** Called when the user taps an add button on mobile */
  onAdd?: (type: 'deck_section' | 'stair' | 'landing') => void;
}

interface PaletteItem {
  type: 'deck_section' | 'stair' | 'landing';
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
}

const PALETTE_ITEMS: PaletteItem[] = [
  {
    type: 'deck_section',
    label: 'Deck Section',
    description: 'Main platform area',
    color: '#B5D4F4',
    borderColor: '#185FA5',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="4" width="24" height="24" rx="2" fill="#B5D4F4" stroke="#185FA5" strokeWidth="1.5" />
        <line x1="4" y1="12" x2="28" y2="12" stroke="#185FA5" strokeWidth="0.75" />
        <line x1="4" y1="20" x2="28" y2="20" stroke="#185FA5" strokeWidth="0.75" />
        <line x1="12" y1="4" x2="12" y2="28" stroke="#185FA5" strokeWidth="0.75" />
        <line x1="20" y1="4" x2="20" y2="28" stroke="#185FA5" strokeWidth="0.75" />
      </svg>
    ),
  },
  {
    type: 'stair',
    label: 'Stairs',
    description: 'Step-down module',
    color: '#C0DD97',
    borderColor: '#3B6D11',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="20" width="8" height="8" rx="1" fill="#C0DD97" stroke="#3B6D11" strokeWidth="1.5" />
        <rect x="12" y="14" width="8" height="14" rx="1" fill="#C0DD97" stroke="#3B6D11" strokeWidth="1.5" />
        <rect x="20" y="8" width="8" height="20" rx="1" fill="#C0DD97" stroke="#3B6D11" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    type: 'landing',
    label: 'Landing',
    description: 'Transition platform',
    color: '#FAC775',
    borderColor: '#854F0B',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="8" y="8" width="16" height="16" rx="2" fill="#FAC775" stroke="#854F0B" strokeWidth="1.5" />
        <circle cx="16" cy="16" r="3" fill="#854F0B" opacity="0.4" />
      </svg>
    ),
  },
];

const SNAP_OPTIONS: Array<{ value: 0.5 | 1 | 2; label: string }> = [
  { value: 0.5, label: '6"' },
  { value: 1, label: '1 ft' },
  { value: 2, label: '2 ft' },
];

export default function ComponentPalette({
  dispatch,
  canUndo,
  canRedo,
  snapFt,
  isDirty,
  onSave,
  onExport,
  isMobile = false,
  onAdd,
}: Props) {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, type: string) => {
    e.dataTransfer.setData('componentType', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  // ── Mobile: horizontal scrollable strip ───────────────────────────────────────
  if (isMobile) {
    return (
      <div
        style={{
          background: '#FAFAF8',
          borderBottom: '1px solid #E0DDD5',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          overflowX: 'auto',
          flexShrink: 0,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Add-component tap buttons */}
        {PALETTE_ITEMS.map((item) => (
          <button
            key={item.type}
            onClick={() => onAdd?.(item.type)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 12px',
              borderRadius: 8,
              border: `1.5px solid ${item.borderColor}`,
              background: item.color,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontSize: 12,
              fontWeight: 600,
              color: '#1A1915',
              flexShrink: 0,
              userSelect: 'none',
            }}
          >
            + {item.label}
          </button>
        ))}

        {/* Divider */}
        <div style={{ width: 1, height: 26, background: '#D3D1C7', flexShrink: 0 }} />

        {/* Snap grid buttons */}
        {SNAP_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => dispatch({ type: 'SET_SNAP', snap_ft: opt.value })}
            style={{
              padding: '5px 9px',
              fontSize: 11,
              border: `1px solid ${snapFt === opt.value ? '#185FA5' : '#D3D1C7'}`,
              borderRadius: 5,
              background: snapFt === opt.value ? '#185FA5' : '#FFFFFF',
              color: snapFt === opt.value ? '#FFFFFF' : '#4A4840',
              cursor: 'pointer',
              flexShrink: 0,
              fontWeight: snapFt === opt.value ? 700 : 400,
            }}
          >
            {opt.label}
          </button>
        ))}

        {/* Divider */}
        <div style={{ width: 1, height: 26, background: '#D3D1C7', flexShrink: 0 }} />

        {/* Undo / Redo */}
        <button
          onClick={() => dispatch({ type: 'UNDO' })}
          disabled={!canUndo}
          style={mobileToolBtn(!canUndo)}
        >
          ↩
        </button>
        <button
          onClick={() => dispatch({ type: 'REDO' })}
          disabled={!canRedo}
          style={mobileToolBtn(!canRedo)}
        >
          ↪
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 26, background: '#D3D1C7', flexShrink: 0 }} />

        {/* Save */}
        <button
          onClick={onSave}
          style={{
            padding: '6px 12px',
            fontSize: 11,
            fontWeight: 600,
            border: 'none',
            borderRadius: 6,
            background: isDirty ? '#185FA5' : '#D3D1C7',
            color: '#FFFFFF',
            cursor: isDirty ? 'pointer' : 'default',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          {isDirty ? '● Save' : '✓ Saved'}
        </button>

        {/* Export */}
        <button
          onClick={onExport}
          style={{
            padding: '6px 12px',
            fontSize: 11,
            fontWeight: 500,
            border: '1px solid #D3D1C7',
            borderRadius: 6,
            background: '#FFFFFF',
            color: '#4A4840',
            cursor: 'pointer',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          Export CSV
        </button>
      </div>
    );
  }

  // ── Desktop: vertical sidebar ─────────────────────────────────────────────────
  return (
    <aside
      style={{
        width: 200,
        background: '#FAFAF8',
        borderRight: '1px solid #E0DDD5',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 0',
        gap: 0,
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div style={{ padding: '0 16px 12px', borderBottom: '1px solid #E0DDD5' }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#6B6860', letterSpacing: '0.06em', margin: 0 }}>
          COMPONENTS
        </p>
      </div>

      {/* Palette items — draggable */}
      <div style={{ padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {PALETTE_ITEMS.map((item) => (
          <div
            key={item.type}
            draggable
            onDragStart={(e) => handleDragStart(e, item.type)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 10px',
              borderRadius: 8,
              border: `1.5px solid ${item.borderColor}`,
              background: item.color,
              cursor: 'grab',
              userSelect: 'none',
              transition: 'opacity 0.15s, transform 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.opacity = '0.85';
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.opacity = '1';
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
            }}
          >
            <div style={{ flexShrink: 0 }}>{item.icon}</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#1A1915', lineHeight: 1.3 }}>
                {item.label}
              </div>
              <div style={{ fontSize: 10, color: '#6B6860', lineHeight: 1.3 }}>{item.description}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Snap control */}
      <div
        style={{ padding: '12px 16px', borderTop: '1px solid #E0DDD5', borderBottom: '1px solid #E0DDD5' }}
      >
        <p style={{ fontSize: 11, fontWeight: 600, color: '#6B6860', letterSpacing: '0.06em', margin: '0 0 8px' }}>
          SNAP GRID
        </p>
        <div style={{ display: 'flex', gap: 4 }}>
          {SNAP_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => dispatch({ type: 'SET_SNAP', snap_ft: opt.value })}
              style={{
                flex: 1,
                padding: '5px 2px',
                fontSize: 11,
                fontWeight: snapFt === opt.value ? 700 : 400,
                border: `1px solid ${snapFt === opt.value ? '#185FA5' : '#D3D1C7'}`,
                borderRadius: 5,
                background: snapFt === opt.value ? '#185FA5' : '#FFFFFF',
                color: snapFt === opt.value ? '#FFFFFF' : '#4A4840',
                cursor: 'pointer',
                transition: 'all 0.12s',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Undo / Redo */}
      <div style={{ padding: '12px 16px', display: 'flex', gap: 6 }}>
        <button
          onClick={() => dispatch({ type: 'UNDO' })}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          style={toolBtn(!canUndo)}
        >
          ↩ Undo
        </button>
        <button
          onClick={() => dispatch({ type: 'REDO' })}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          style={toolBtn(!canRedo)}
        >
          Redo ↪
        </button>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Save / Export */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #E0DDD5', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button
          onClick={onSave}
          style={{
            padding: '8px 0',
            fontSize: 12,
            fontWeight: 600,
            border: 'none',
            borderRadius: 6,
            background: isDirty ? '#185FA5' : '#D3D1C7',
            color: '#FFFFFF',
            cursor: isDirty ? 'pointer' : 'default',
            transition: 'background 0.15s',
          }}
        >
          {isDirty ? '● Save Design' : '✓ Saved'}
        </button>
        <button
          onClick={onExport}
          style={{
            padding: '8px 0',
            fontSize: 12,
            fontWeight: 500,
            border: '1px solid #D3D1C7',
            borderRadius: 6,
            background: '#FFFFFF',
            color: '#4A4840',
            cursor: 'pointer',
          }}
        >
          Export Takeoff
        </button>
      </div>
    </aside>
  );
}

function toolBtn(disabled: boolean): React.CSSProperties {
  return {
    flex: 1,
    padding: '6px 0',
    fontSize: 11,
    fontWeight: 500,
    border: `1px solid ${disabled ? '#E0DDD5' : '#D3D1C7'}`,
    borderRadius: 5,
    background: '#FFFFFF',
    color: disabled ? '#C4C2B8' : '#4A4840',
    cursor: disabled ? 'not-allowed' : 'pointer',
  };
}

function mobileToolBtn(disabled: boolean): React.CSSProperties {
  return {
    padding: '6px 10px',
    fontSize: 13,
    border: `1px solid ${disabled ? '#E0DDD5' : '#D3D1C7'}`,
    borderRadius: 5,
    background: '#FFFFFF',
    color: disabled ? '#C4C2B8' : '#4A4840',
    cursor: disabled ? 'not-allowed' : 'pointer',
    flexShrink: 0,
  };
}
