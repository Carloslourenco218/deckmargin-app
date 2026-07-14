'use client';

// app/settings/team/page.tsx
// Team management screen — owner only.
// Lists all org members with status/role badges, invite modal, deactivate/reactivate.

import { useState, useEffect, useCallback } from 'react';
import type { OrgMember, OrgRole } from '@/lib/org/types';

// ── Status & role badge colors ────────────────────────────────────────

const STATUS_STYLES: Record<string, React.CSSProperties> = {
  active:      { background: '#D1FAE5', color: '#065F46' },
  pending:     { background: '#FEF3C7', color: '#92400E' },
  deactivated: { background: '#F1F0EA', color: '#6B6860' },
};

const ROLE_LABEL: Record<OrgRole, string> = {
  owner:      'Owner',
  field_user: 'Field User',
};

// ─────────────────────────────────────────────────────────────────────

export default function TeamPage() {
  const [members, setMembers]       = useState<OrgMember[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [isOwner, setIsOwner]       = useState(false);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/org/members');
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? 'Failed to load team');
    } else {
      setMembers(json.members ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMembers().then(() => {
      setIsOwner(true);
    });
  }, [fetchMembers]);

  const updateMember = async (
    id: string,
    updates: { role?: OrgRole; status?: 'active' | 'deactivated' }
  ) => {
    const res = await fetch(`/api/org/members/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    if (!res.ok) {
      alert(json.error ?? 'Update failed');
      return;
    }
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...json.member } : m));
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <p style={{ color: '#9B9890', padding: 24 }}>Loading team…</p>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div>
          <h1 style={h1Style}>Team</h1>
          <p style={subtitleStyle}>Manage who has access to your DeckMargin account.</p>
        </div>
        {isOwner && (
          <button style={primaryBtn} onClick={() => setShowInvite(true)}>
            + Invite teammate
          </button>
        )}
      </div>

      {error && (
        <div style={errorBanner}>{error}</div>
      )}

      {/* Member table */}
      <div style={tableCard}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #E0DDD5' }}>
              {['Member', 'Role', 'Status', 'Joined', isOwner ? 'Actions' : ''].map((h) => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} style={{ borderBottom: '1px solid #F1EFE8' }}>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{m.email}</div>
                </td>
                <td style={tdStyle}>
                  {isOwner && m.status === 'active' ? (
                    <select
                      value={m.role}
                      onChange={(e) => updateMember(m.id, { role: e.target.value as OrgRole })}
                      style={inlineSelect}
                    >
                      <option value="owner">Owner</option>
                      <option value="field_user">Field User</option>
                    </select>
                  ) : (
                    <span style={{ fontSize: 12 }}>{ROLE_LABEL[m.role]}</span>
                  )}
                </td>
                <td style={tdStyle}>
                  <span style={{ ...badge, ...STATUS_STYLES[m.status] }}>
                    {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                  </span>
                </td>
                <td style={tdStyle}>
                  <span style={{ fontSize: 12, color: '#9B9890' }}>
                    {m.activated_at
                      ? new Date(m.activated_at).toLocaleDateString()
                      : m.status === 'pending' ? 'Invite pending' : '—'}
                  </span>
                </td>
                {isOwner && (
                  <td style={tdStyle}>
                    {m.status === 'active' && (
                      <button
                        style={dangerLink}
                        onClick={() => {
                          if (confirm(`Deactivate ${m.email}? They will lose access immediately.`)) {
                            updateMember(m.id, { status: 'deactivated' });
                          }
                        }}
                      >
                        Deactivate
                      </button>
                    )}
                    {m.status === 'deactivated' && (
                      <button
                        style={linkBtn}
                        onClick={() => updateMember(m.id, { status: 'active' })}
                      >
                        Reactivate
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {members.length === 0 && (
          <p style={{ padding: 24, color: '#9B9890', textAlign: 'center', fontSize: 13 }}>
            No team members yet. Invite someone to get started.
          </p>
        )}
      </div>

      {/* Invite modal */}
      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onSuccess={(member) => {
            setMembers(prev => [...prev, member]);
            setShowInvite(false);
          }}
        />
      )}
    </div>
  );
}

// ── Invite modal ─────────────────────────────────────────────────────

function InviteModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (member: OrgMember) => void;
}) {
  const [email, setEmail]     = useState('');
  const [role, setRole]       = useState<OrgRole>('field_user');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const submit = async () => {
    if (!email.trim()) { setError('Email is required'); return; }
    setLoading(true);
    setError(null);
    const res = await fetch('/api/org/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), role }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) { setError(json.error ?? 'Invite failed'); return; }
    onSuccess(json.member);
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <h2 style={{ ...h1Style, fontSize: 16, marginBottom: 4 }}>Invite teammate</h2>
        <p style={{ ...subtitleStyle, marginBottom: 20 }}>
          They&apos;ll receive an email to set their password and join your team.
        </p>

        <label style={labelStyle}>Email address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="field.rep@company.com"
          style={inputStyle}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />

        <label style={{ ...labelStyle, marginTop: 12 }}>Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value as OrgRole)} style={inputStyle}>
          <option value="field_user">Field User — can create and price jobs</option>
          <option value="owner">Owner — full access + guardrail control</option>
        </select>

        <div style={{ fontSize: 11, color: '#9B9890', marginTop: 8, lineHeight: 1.5 }}>
          {role === 'field_user'
            ? 'Field users can create and price jobs but cannot send quotes that fall below margin guardrails without owner approval.'
            : 'Owners have full access to all team jobs and can set guardrails, approve quotes, and manage the team.'}
        </div>

        {error && <div style={{ ...errorBanner, marginTop: 12 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
          <button style={secondaryBtn} onClick={onClose} disabled={loading}>Cancel</button>
          <button style={primaryBtn} onClick={submit} disabled={loading}>
            {loading ? 'Sending…' : 'Send invite'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────

const pageStyle: React.CSSProperties = {
  maxWidth: 860,
  margin: '0 auto',
  padding: '32px 24px',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: 28,
  flexWrap: 'wrap',
  gap: 12,
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
  margin: '4px 0 0',
};

const tableCard: React.CSSProperties = {
  background: '#FFFFFF',
  border: '1px solid #E0DDD5',
  borderRadius: 8,
  overflow: 'hidden',
};

const thStyle: React.CSSProperties = {
  padding: '10px 16px',
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 600,
  color: '#9B9890',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
};

const tdStyle: React.CSSProperties = {
  padding: '12px 16px',
  verticalAlign: 'middle',
};

const badge: React.CSSProperties = {
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 600,
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

const secondaryBtn: React.CSSProperties = {
  background: '#FFFFFF',
  color: '#1A1915',
  border: '1px solid #D3D1C7',
  borderRadius: 6,
  padding: '8px 16px',
  fontSize: 13,
  cursor: 'pointer',
};

const dangerLink: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#C0392B',
  fontSize: 12,
  cursor: 'pointer',
  padding: 0,
};

const linkBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#185FA5',
  fontSize: 12,
  cursor: 'pointer',
  padding: 0,
};

const inlineSelect: React.CSSProperties = {
  fontSize: 12,
  border: '1px solid #D3D1C7',
  borderRadius: 4,
  padding: '3px 6px',
  background: '#FFFFFF',
  cursor: 'pointer',
};

const errorBanner: React.CSSProperties = {
  background: '#FEE2E2',
  color: '#991B1B',
  padding: '8px 12px',
  borderRadius: 6,
  fontSize: 12,
};

const overlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modal: React.CSSProperties = {
  background: '#FFFFFF',
  borderRadius: 10,
  padding: '28px 28px 24px',
  width: 420,
  maxWidth: '90vw',
  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#6B6860',
  marginBottom: 4,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  fontSize: 13,
  border: '1px solid #D3D1C7',
  borderRadius: 6,
  outline: 'none',
  boxSizing: 'border-box',
  background: '#FFFFFF',
  color: '#1A1915',
};
