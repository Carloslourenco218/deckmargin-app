'use client';

import type { DesignComponent, DesignAction, MaterialType, JoistSpacing, DeckingDirection, BoardWidth, HeightTier, RailingType, Edge } from '@/lib/design/types';

interface Props {
  component: DesignComponent | null;
  dispatch: React.Dispatch<DesignAction>;
  /** Optional style overrides for the root aside — useful for mobile full-width layout */
  style?: React.CSSProperties;
}

const MATERIAL_OPTIONS: Array<{ value: MaterialType; label: string }> = [
  { value: 'pt', label: 'Pressure Treated' },
  { value: 'trex', label: 'Trex Composite' },
  { value: 'cedar', label: 'Cedar' },
];

const JOIST_SPACING_OPTIONS: Array<{ value: JoistSpacing; label: string }> = [
  { value: 12, label: '12" OC' },
  { value: 16, label: '16" OC' },
  { value: 24, label: '24" OC' },
];

const DECKING_DIR_OPTIONS: Array<{ value: DeckingDirection; label: string }> = [
  { value: 'perpendicular', label: 'Perpendicular' },
  { value: 'parallel', label: 'Parallel' },
  { value: 'diagonal', label: 'Diagonal (+10% waste)' },
];

const BOARD_WIDTH_OPTIONS: Array<{ value: BoardWidth; label: string }> = [
  { value: 3.5, label: '4" board (3.5")' },
  { value: 5.5, label: '6" board (5.5")' },
];

const HEIGHT_TIER_OPTIONS: Array<{ value: HeightTier; label: string }> = [
  { value: 'ground', label: 'Ground level (≤12")' },
  { value: 'standard', label: 'Standard (1–3 ft)' },
  { value: 'elevated', label: 'Elevated (3–8 ft)' },
];

const RAILING_TYPES: Array<{ value: RailingType; label: string }> = [
  { value: 'none', label: 'None' },
  { value: 'wood', label: 'Wood' },
  { value: 'composite', label: 'Composite' },
  { value: 'cable', label: 'Cable' },
  { value: 'glass', label: 'Glass' },
];

const EDGES: Array<{ value: Edge; label: string }> = [
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
];

export default function PropertiesPanel({ component, dispatch, style }: Props) {
  const mergedStyle = { ...panelStyle, ...style };

  if (!component) {
    return (
      <aside style={mergedStyle}>
        <div style={{ padding: '16px', borderBottom: '1px solid #E0DDD5' }}>
          <p style={sectionLabel}>PROPERTIES</p>
        </div>
        <div style={{ padding: 20, color: '#9B9890', fontSize: 12, textAlign: 'center', lineHeight: 1.6 }}>
          Select a component on the canvas to edit its properties.
        </div>
      </aside>
    );
  }

  const update = (changes: Partial<DesignComponent>) => {
    dispatch({ type: 'UPDATE_COMPONENT', id: component.id, changes });
  };

  const deleteComponent = () => {
    dispatch({ type: 'DELETE_COMPONENT', id: component.id });
  };

  return (
    <aside style={mergedStyle}>
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #E0DDD5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <p style={sectionLabel}>
          {component.type === 'deck_section'
            ? 'DECK SECTION'
            : component.type === 'stair'
            ? 'STAIRS'
            : 'LANDING'}
        </p>
        <button
          onClick={deleteComponent}
          title="Delete component"
          style={{
            background: 'none',
            border: '1px solid #E0DDD5',
            borderRadius: 4,
            color: '#C0392B',
            cursor: 'pointer',
            fontSize: 11,
            padding: '2px 7px',
          }}
        >
          ✕ Delete
        </button>
      </div>

      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', flex: 1 }}>

        {/* Position (read-only display) */}
        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>Position</legend>
          <div style={{ display: 'flex', gap: 8 }}>
            <LabelInput label="X (ft)" value={component.position.x} readOnly />
            <LabelInput label="Y (ft)" value={component.position.y} readOnly />
          </div>
        </fieldset>

        {/* Deck Section fields */}
        {component.type === 'deck_section' && (
          <>
            <fieldset style={fieldsetStyle}>
              <legend style={legendStyle}>Dimensions</legend>
              <div style={{ display: 'flex', gap: 8 }}>
                <LabelInput
                  label="Width (ft)"
                  type="number"
                  value={component.width_ft}
                  min={2}
                  max={60}
                  onChange={(v) => update({ width_ft: Number(v) })}
                />
                <LabelInput
                  label="Length (ft)"
                  type="number"
                  value={component.length_ft}
                  min={2}
                  max={50}
                  onChange={(v) => update({ length_ft: Number(v) })}
                />
              </div>
            </fieldset>

            <fieldset style={fieldsetStyle}>
              <legend style={legendStyle}>Material</legend>
              <Select
                value={component.material}
                options={MATERIAL_OPTIONS}
                onChange={(v) => update({ material: v as MaterialType })}
              />
            </fieldset>

            <fieldset style={fieldsetStyle}>
              <legend style={legendStyle}>Framing</legend>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div>
                  <label style={inputLabel}>Joist Spacing</label>
                  <Select
                    value={String(component.joist_spacing)}
                    options={JOIST_SPACING_OPTIONS.map((o) => ({ ...o, value: String(o.value) }))}
                    onChange={(v) => update({ joist_spacing: Number(v) as JoistSpacing })}
                  />
                </div>
                <div>
                  <label style={inputLabel}>Decking Direction</label>
                  <Select
                    value={component.decking_direction}
                    options={DECKING_DIR_OPTIONS}
                    onChange={(v) => update({ decking_direction: v as DeckingDirection })}
                  />
                </div>
                <div>
                  <label style={inputLabel}>Board Width</label>
                  <Select
                    value={String(component.board_width_in)}
                    options={BOARD_WIDTH_OPTIONS.map((o) => ({ ...o, value: String(o.value) }))}
                    onChange={(v) => update({ board_width_in: Number(v) as BoardWidth })}
                  />
                </div>
              </div>
            </fieldset>

            <fieldset style={fieldsetStyle}>
              <legend style={legendStyle}>Height</legend>
              <Select
                value={component.height_tier}
                options={HEIGHT_TIER_OPTIONS}
                onChange={(v) => update({ height_tier: v as HeightTier })}
              />
            </fieldset>

            <fieldset style={fieldsetStyle}>
              <legend style={legendStyle}>Railings</legend>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {EDGES.map(({ value: edge, label }) => {
                  const existing = component.railings.find((r) => r.edge === edge);
                  const currentType: RailingType = existing?.railing_type ?? 'none';
                  return (
                    <div key={edge} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 42, fontSize: 11, color: '#6B6860', flexShrink: 0 }}>{label}</span>
                      <Select
                        value={currentType}
                        options={RAILING_TYPES}
                        onChange={(v) => {
                          const type = v as RailingType;
                          const newRailings = component.railings.filter((r) => r.edge !== edge);
                          if (type !== 'none') newRailings.push({ edge: edge as Edge, railing_type: type });
                          update({ railings: newRailings });
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </fieldset>
          </>
        )}

        {/* Stair fields */}
        {component.type === 'stair' && (
          <>
            <fieldset style={fieldsetStyle}>
              <legend style={legendStyle}>Stair Config</legend>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <LabelInput
                  label="Step Count"
                  type="number"
                  value={component.stair_count}
                  min={1}
                  max={20}
                  onChange={(v) => update({ stair_count: Number(v) })}
                />
                <LabelInput
                  label="Width (ft)"
                  type="number"
                  value={component.width_ft}
                  min={2}
                  max={20}
                  onChange={(v) => update({ width_ft: Number(v) })}
                />
                <LabelInput
                  label='Rise (in)'
                  type="number"
                  value={component.rise_in}
                  min={5}
                  max={9}
                  step={0.25}
                  onChange={(v) => update({ rise_in: Number(v) })}
                />
                <LabelInput
                  label='Run (in)'
                  type="number"
                  value={component.run_in}
                  min={9}
                  max={14}
                  step={0.25}
                  onChange={(v) => update({ run_in: Number(v) })}
                />
              </div>
            </fieldset>

            <fieldset style={fieldsetStyle}>
              <legend style={legendStyle}>Material</legend>
              <Select
                value={component.material}
                options={MATERIAL_OPTIONS}
                onChange={(v) => update({ material: v as MaterialType })}
              />
            </fieldset>

            <fieldset style={fieldsetStyle}>
              <legend style={legendStyle}>Options</legend>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={component.include_railing}
                  onChange={(e) => update({ include_railing: e.target.checked })}
                />
                Include railing on stairs
              </label>
            </fieldset>
          </>
        )}

        {/* Landing fields */}
        {component.type === 'landing' && (
          <>
            <fieldset style={fieldsetStyle}>
              <legend style={legendStyle}>Dimensions</legend>
              <div style={{ display: 'flex', gap: 8 }}>
                <LabelInput
                  label="Width (ft)"
                  type="number"
                  value={component.width_ft}
                  min={2}
                  max={20}
                  onChange={(v) => update({ width_ft: Number(v) })}
                />
                <LabelInput
                  label="Length (ft)"
                  type="number"
                  value={component.length_ft}
                  min={2}
                  max={20}
                  onChange={(v) => update({ length_ft: Number(v) })}
                />
              </div>
            </fieldset>

            <fieldset style={fieldsetStyle}>
              <legend style={legendStyle}>Material</legend>
              <Select
                value={component.material}
                options={MATERIAL_OPTIONS}
                onChange={(v) => update({ material: v as MaterialType })}
              />
            </fieldset>

            <fieldset style={fieldsetStyle}>
              <legend style={legendStyle}>Height</legend>
              <Select
                value={component.height_tier}
                options={HEIGHT_TIER_OPTIONS}
                onChange={(v) => update({ height_tier: v as HeightTier })}
              />
            </fieldset>

            <fieldset style={fieldsetStyle}>
              <legend style={legendStyle}>Joist Spacing</legend>
              <Select
                value={String(component.joist_spacing)}
                options={JOIST_SPACING_OPTIONS.map((o) => ({ ...o, value: String(o.value) }))}
                onChange={(v) => update({ joist_spacing: Number(v) as JoistSpacing })}
              />
            </fieldset>
          </>
        )}
      </div>
    </aside>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function LabelInput({
  label,
  value,
  type = 'number',
  min,
  max,
  step,
  readOnly,
  onChange,
}: {
  label: string;
  value: number;
  type?: string;
  min?: number;
  max?: number;
  step?: number;
  readOnly?: boolean;
  onChange?: (v: string) => void;
}) {
  return (
    <div style={{ flex: 1 }}>
      <label style={inputLabel}>{label}</label>
      <input
        type={type}
        value={value}
        min={min}
        max={max}
        step={step ?? 1}
        readOnly={readOnly}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        style={{
          width: '100%',
          padding: '5px 8px',
          fontSize: 12,
          border: '1px solid #D3D1C7',
          borderRadius: 5,
          background: readOnly ? '#F1EFE8' : '#FFFFFF',
          color: '#1A1915',
          boxSizing: 'border-box',
          outline: 'none',
        }}
      />
    </div>
  );
}

function Select({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        padding: '5px 8px',
        fontSize: 12,
        border: '1px solid #D3D1C7',
        borderRadius: 5,
        background: '#FFFFFF',
        color: '#1A1915',
        cursor: 'pointer',
        outline: 'none',
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const panelStyle: React.CSSProperties = {
  width: 240,
  background: '#FAFAF8',
  borderLeft: '1px solid #E0DDD5',
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  overflow: 'hidden',
};

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: '#6B6860',
  letterSpacing: '0.06em',
  margin: 0,
};

const fieldsetStyle: React.CSSProperties = {
  border: '1px solid #E0DDD5',
  borderRadius: 6,
  padding: '8px 10px 10px',
  margin: 0,
};

const legendStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  color: '#9B9890',
  letterSpacing: '0.05em',
  padding: '0 4px',
};

const inputLabel: React.CSSProperties = {
  display: 'block',
  fontSize: 10,
  fontWeight: 600,
  color: '#9B9890',
  marginBottom: 3,
  letterSpacing: '0.04em',
};
