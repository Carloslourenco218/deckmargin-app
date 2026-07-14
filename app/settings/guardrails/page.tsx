'use client';

// app/settings/guardrails/page.tsx
// Pricing guardrail settings — owner only.
// Sets minimum margin % and maximum discount % that field users cannot bypass.

import { useState, useEffect } from 'react';

interface OrgSettings {
  id: string;
  name: string;
  min_margin_pct: number | null;
  max_discount_pct: number | null;
}

export default function GuardrailsPage() {
  const [org, setOrg]             = useState<OrgSettings | null>(null);
  const [minMargin, setMinMargin]     = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [saved, setSaved]         = useState(false);

  useEffect(() => {
    fetch('/api/org/settings')
      .then(r => r.json())
      .then(({ org: o }: { org: OrgSettings }) => {
        setOrg(o);
        setMinMargin(o.min_margin_pct !== null ? String(o.min_margin_pct) : '');
        setMaxDiscount(o.max_discount_pct !== null ? String(o.max_discount_pct) : '');
      })
      .catch(() => setError('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);

    const body: Record<string, number | null> = {
      min_margin_pct:   minMargin   === '' ? null : parseFloat(minMargin),
      max_discount_pct: maxDiscount === '' ? null : parseFloat(maxDiscount),
    };

    const res = await fetch('/api/org/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) { setError(json.error ?? 'Save failed'); return; }
    setOrg(json.org);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return <div style={pageStyle}><p style={{ color: '#9B9890' }}>Loading…</p></div>;
  }

  return (
    <div style={pageStyle}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={h1Style}>Pricing Guardrails</h1>
        <p style={subtitleStyle}>
          Set limits that field users cannot exceed without owner approval. Leave a field
          blank to disable that guardrail.
        </p>
      </div>

      <div style={card}>
        <div style={section}>
          <div style={sectionHeader}>
            <span style={sectionTitle}>Minimum Margin</span>
            <span style={sectionDesc}>
              Quotes priced below this margin will be held for your approval before they can be sent.
            </span>
          </div>
          <div style={fieldRow}>
            <div style={inputWrap}>
              <input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={minMargin}
                onChange={(e) => setMinMargin(e.target.value)}
                placeholder="e.g. 25"
                style={inputStyle}
              />
              <span style={unitSuffix}>%</span>
            </div>
            <p style={hint}>
              {minMargin
                ? `Field users must price at ≥ ${minMargin}% margin or the quote is flagged for your review.`
                : 'No minimum margin set — field users can price at any margin.'}
            </p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #E0DDD5' }} />

        <div style={section}>
          <div style={sectionHeader}>
            <span style={sectionTitle}>Maximum Discount</span>
            <span style={sectionDesc}>
              Quotes offering a discount beyond this percentage will require your approval.
            </span>
          </div>
          <div style={fieldRow}>
            <div style={inputWrap}>
              <input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                placeholder="e.g. 10"
                style={inputStyle}
              />
              <span style={unitSuffix}>%</span>
            </div>
            <p style={hint}>
              {maxDiscount
                ? `Field users cannot offer more than ${maxDiscount}% off without your sign-off.`
                : 'No discount limit set.'}
            </p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #E0DDD5', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button style={primaryBtn} onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save guardrails'}
          </button>
          {saved && <span style={{ fontSize: 13, color: '#065F46' }}>✓ Saved</span>}
          {error && <span style={{ fontSize: 13, color: '#991B1B' }}>{error}</span>}
        </div>
      </div>

      {/* How it works */}
      <div style={infoBox}>
        <p style={{ fontWeight: 600, fontSize: 13, margin: '0 0 6px' }}>How approval works</p>
        <p style={{ fontSize: 12, color: '#6B6860', margin: 0, lineHeight: 1.6 }}>
          When a field user saves a quote that violates a guardrail, the quote is flagged as
          <strong> Pending Approval</strong> and cannot be sent to the customer. You&apos;ll see flagged quotes
          in your project list. Approve or reject from the project detail page. Field users see a clear
          message explaining why the quote is held.
        </p>
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────

const pageStyle: React.CSSProperties = {
  maxWidth: 640,
  margin: '0 auto',
  padding: '32px 24px',
};

const h1Style: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  color: '#1A1915',
  margin: 0,
};

const subtitleStyle: React.CSSProperties = {
  fontSize: 13,
  color: '#9B9890',
  margin: '6px 0 0',
  lineHeight: 1.5,
};

const card: React.CSSProperties = {
  background: '#FFFFFF',
  border: '1px solid #E0DDD5',
  borderRadius: 8,
  overflow: 'hidden',
  marginBottom: 20,
};

const section: React.CSSProperties = {
  padding: '20px 20px 16px',
};

const sectionHeader: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  marginBottom: 14,
};

const sectionTitle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: '#1A1915',
};

const sectionDesc: React.CSSProperties = {
  fontSize: 12,
  color: '#9B9890',
};

const fieldRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  flexWrap: 'wrap',
};

const inputWrap: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  border: '1px solid #D3D1C7',
  borderRadius: 6,
  overflow: 'hidden',
  width: 120,
  flexShrink: 0,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  fontSize: 14,
  border: 'none',
  outline: 'none',
  background: '#FFFFFF',
  color: '#1A1915',
};

const unitSuffix: React.CSSProperties = {
  padding: '0 10px',
  fontSize: 13,
  color: '#9B9890',
  background: '#F7F6F2',
  borderLeft: '1px solid #D3D1C7',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
};

const hint: React.CSSProperties = {
  fontSize: 12,
  color: '#9B9890',
  margin: 0,
  lineHeight: 1.5,
  flex: 1,
};

const primaryBtn: React.CSSProperties = {
  background: '#185FA5',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: 6,
  padding: '8px 16px',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
};

const infoBox: React.CSSProperties = {
  background: '#EFF6FF',
  border: '1px solid #BFDBFE',
  borderRadius: 8,
  padding: '14px 16px',
};
