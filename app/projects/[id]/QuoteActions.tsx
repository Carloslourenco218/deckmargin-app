"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function QuoteActions({
  projectId,
  proposalTokenActive,
}: {
  projectId: string;
  clientEmail: string | null;   // kept in props signature for compat, unused now
  proposalTokenActive: boolean | null;
  initialStatus: string | null; // kept for compat
}) {
  const router = useRouter();

  // Share link state
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkActive, setLinkActive] = useState(proposalTokenActive ?? false);

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
              <p className="text-xs text-white/50">Link is active. Click below to copy it.</p>
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
        <p className="mt-2 text-xs text-white/30">
          Client opens the link, reviews the proposal, and can accept online. Copy and send it yourself via text or your own email.
        </p>
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
