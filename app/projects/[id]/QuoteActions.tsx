"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function QuoteActions({
  projectId,
  clientEmail,
  proposalTokenActive,
  initialStatus,
}: {
  projectId: string;
  clientEmail: string | null;
  proposalTokenActive: boolean | null;
  initialStatus: string | null;
}) {
  const router = useRouter();

  // Share link state
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkActive, setLinkActive] = useState(proposalTokenActive ?? false);

  // Email state
  const [emailing, setEmailing] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailErr, setEmailErr] = useState("");

  // Duplicate state
  const [duplicating, setDuplicating] = useState(false);
  const [dupErr, setDupErr] = useState("");

  async function handleShare() {
    setSharing(true);
    const res = await fetch(`/api/projects/${projectId}/share`, { method: "POST" });
    const body = await res.json();
    if (res.ok && body.url) {
      setShareUrl(body.url);
      setLinkActive(true);
    }
    setSharing(false);
  }

  async function handleRevokeLink() {
    await fetch(`/api/projects/${projectId}/share`, { method: "DELETE" });
    setShareUrl(null);
    setLinkActive(false);
  }

  async function handleCopy() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleEmail() {
    if (!clientEmail) return;
    setEmailing(true);
    setEmailErr("");
    const res = await fetch("/api/email/send-proposal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId }),
    });
    const body = await res.json();
    if (!res.ok) {
      setEmailErr(body.error ?? "Failed to send email");
    } else {
      setEmailSent(true);
      router.refresh(); // re-fetch status change (open → sent)
    }
    setEmailing(false);
  }

  async function handleDuplicate() {
    setDuplicating(true);
    setDupErr("");
    const res = await fetch(`/api/projects/${projectId}/duplicate`, { method: "POST" });
    const body = await res.json();
    if (!res.ok) {
      setDupErr(body.error ?? "Duplicate failed");
      setDuplicating(false);
    } else {
      router.push(`/projects/${body.id}/edit`);
    }
  }

  return (
    <div className="space-y-3">

      {/* ── Share link section ── */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="mb-2 text-xs font-medium text-white/55">Shareable Client Link</div>
        {linkActive || shareUrl ? (
          <div className="space-y-2">
            {shareUrl ? (
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={shareUrl}
                  className="flex-1 rounded-lg border border-white/10 bg-[#0b1220] px-3 py-2 text-xs text-white/80 outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-lg border border-white/20 px-3 py-2 text-xs text-white/70 hover:bg-white/10 whitespace-nowrap"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            ) : (
              <p className="text-xs text-white/50">Link is active. Generate it again to copy.</p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleShare}
                disabled={sharing}
                className="rounded-lg bg-blue-500 px-3 py-2 text-xs font-medium text-white hover:bg-blue-600 disabled:opacity-60"
              >
                {sharing ? "Generating…" : shareUrl ? "Regenerate Link" : "Get Link"}
              </button>
              <button
                type="button"
                onClick={handleRevokeLink}
                className="rounded-lg border border-red-500/30 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10"
              >
                Revoke
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleShare}
            disabled={sharing}
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-60"
          >
            {sharing ? "Generating…" : "🔗 Generate Shareable Link"}
          </button>
        )}
      </div>

      {/* ── Email section ── */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="mb-2 text-xs font-medium text-white/55">Email Proposal to Client</div>
        {emailSent ? (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            ✓ Proposal emailed to {clientEmail}. Status updated to "sent".
          </div>
        ) : clientEmail ? (
          <div className="space-y-2">
            <p className="text-xs text-white/50">Sends to: <span className="text-white/80">{clientEmail}</span></p>
            {emailErr && <p className="text-xs text-red-400">{emailErr}</p>}
            <button
              type="button"
              onClick={handleEmail}
              disabled={emailing}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
            >
              {emailing ? "Sending…" : "✉ Send Email to Client"}
            </button>
          </div>
        ) : (
          <p className="text-xs text-white/40">Add a client email on the edit page to enable email delivery.</p>
        )}
      </div>

      {/* ── Duplicate ── */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="mb-2 text-xs font-medium text-white/55">Duplicate Quote</div>
        {dupErr && <p className="text-xs text-red-400 mb-2">{dupErr}</p>}
        <button
          type="button"
          onClick={handleDuplicate}
          disabled={duplicating}
          className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/70 hover:bg-white/10 disabled:opacity-60"
        >
          {duplicating ? "Duplicating…" : "⧉ Duplicate Quote"}
        </button>
        <p className="mt-1.5 text-xs text-white/30">Creates a draft copy with all settings preserved.</p>
      </div>

    </div>
  );
}
