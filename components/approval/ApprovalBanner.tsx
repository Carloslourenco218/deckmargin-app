'use client';

// components/approval/ApprovalBanner.tsx
// Renders a status banner on the project detail page depending on approval_status.
// Safe to import from server components — renders as a client island.
// Calls router.refresh() internally on resolve (no need to pass onResolved from a server component).

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ApprovalStatus, OrgRole } from '@/lib/org/types';

interface Props {
  projectId: string;
  approvalStatus: ApprovalStatus | null;
  approvalNotes?: string | null;
  orgRole: OrgRole | null;
  onResolved?: () => void;
}

export default function ApprovalBanner({
  projectId,
  approvalStatus,
  approvalNotes,
  orgRole,
  onResolved,
}: Props) {
  const router = useRouter();
  const [notes, setNotes]           = useState('');
  const [acting, setActing]         = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [showReject, setShowReject] = useState(false);

  if (!approvalStatus) return null;

  const act = async (action: 'approve' | 'reject') => {
    setActing(true);
    setError(null);
    const res = await fetch(`/api/projects/${projectId}/approval`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, notes: notes.trim() || undefined }),
    });
    const json = await res.json();
    setActing(false);
    if (!res.ok) { setError(json.error ?? 'Action failed'); return; }
    if (onResolved) {
      onResolved();
    } else {
      router.refresh();
    }
  };

  // ── Pending: different UI for owner vs field user ─────────────────
  if (approvalStatus === 'pending_approval') {
    return (
      <div style={{ ...banner, background: '#FEF3C7', borderColor: '#F59E0B' }}>
        <div style={bannerLeft}>
          <span style={{ fontSize: 16 }}>⚠️</span>
          <div>
            <p style={bannerTitle}>Quote Pending Approval</p>
            <p style={bannerText}>
              {orgRole === 'field_user'
                ? "This quote falls below your team's margin guardrail and cannot be sent to the customer until an owner reviews and approves it. No action needed on your end."
                : 'This quote was priced below the minimum margin guardrail by a field user. Review it and approve or reject below.'}
            </p>
          </div>
        </div>

        {/* Owner sees approve / reject buttons */}
        {orgRole === 'owner' && (
          <div style={actionArea}>
            {!showReject ? (
              <>
                <button
                  style={{ ...actionBtn, background: '#065F46', color: '#fff' }}
                  disabled={acting}
                  onClick={() => act('approve')}
                >
                  {acting ? 'Approving…' : '✓ Approve'}
                </button>
                <button
                  style={{ ...actionBtn, background: '#fff', color: '#991B1B', border: '1px solid #FCA5A5' }}
                  disabled={acting}
                  onClick={() => setShowReject(true)}
                >
                  ✕ Reject
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 260 }}>
                <textarea
                  placeholder="Rejection reason (shown to field user)…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  style={textarea}
                />
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    style={{ ...actionBtn, background: '#991B1B', color: '#fff', flex: 1 }}
                    disabled={acting}
                    onClick={() => act('reject')}
                  >
                    {acting ? 'Rejecting…' : 'Confirm Reject'}
                  </button>
                  <button
                    style={{ ...actionBtn, background: '#fff', border: '1px solid #D3D1C7' }}
                    onClick={() => setShowReject(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {error && <p style={{ fontSize: 11, color: '#991B1B', margin: 0 }}>{error}</p>}
          </div>
        )}
      </div>
    );
  }

  // ── Approved ──────────────────────────────────────────────────────
  if (approvalStatus === 'approved') {
    return (
      <div style={{ ...banner, background: '#D1FAE5', borderColor: '#6EE7B7' }}>
        <span style={{ fontSize: 16 }}>✅</span>
        <div>
          <p style={bannerTitle}>Quote Approved</p>
          <p style={bannerText}>An owner has approved this quote. It can now be sent to the customer.</p>
        </div>
      </div>
    );
  }

  // ── Rejected ──────────────────────────────────────────────────────
  if (approvalStatus === 'rejected') {
    return (
      <div style={{ ...banner, background: '#FEE2E2', borderColor: '#FCA5A5' }}>
        <span style={{ fontSize: 16 }}>❌</span>
        <div>
          <p style={bannerTitle}>Quote Rejected</p>
          <p style={bannerText}>
            An owner rejected this quote.
            {approvalNotes ? ` Reason: "${approvalNotes}"` : ' Please revise the pricing and resubmit.'}
          </p>
        </div>
      </div>
    );
  }

  return null;
}

// ── Styles ────────────────────────────────────────────────────────────

const banner: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 12,
  padding: '14px 16px',
  borderRadius: 8,
  border: '1px solid',
  marginBottom: 20,
  flexWrap: 'wrap',
};

const bannerLeft: React.CSSProperties = {
  display: 'flex',
  gap: 10,
  alignItems: 'flex-start',
  flex: 1,
};

const bannerTitle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: '#1A1915',
  margin: '0 0 3px',
};

const bannerText: React.CSSProperties = {
  fontSize: 12,
  color: '#4B5563',
  margin: 0,
  lineHeight: 1.5,
};

const actionArea: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  alignItems: 'flex-end',
  flexShrink: 0,
};

const actionBtn: React.CSSProperties = {
  padding: '6px 14px',
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  border: 'none',
};

const textarea: React.CSSProperties = {
  width: '100%',
  padding: '6px 8px',
  fontSize: 12,
  border: '1px solid #D3D1C7',
  borderRadius: 5,
  resize: 'vertical',
  outline: 'none',
  boxSizing: 'border-box',
};
