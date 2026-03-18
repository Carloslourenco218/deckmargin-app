"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

export default function NewQuoteWizardPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [siteAddress, setSiteAddress] = useState("");

  async function createQuote() {
    setSaving(true);
    setErr("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setErr("You must be logged in to create a quote.");
      setSaving(false);
      return;
    }

    const finalName = name.trim() || "Untitled Quote";

    const { data, error } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        name: finalName,
        client_name: clientName || null,
        client_email: clientEmail || null,
        client_phone: clientPhone || null,
        site_address: siteAddress || null,
        deck_sqft: 0,
        height_tier: "standard",
        material_type: "pressure-treated",
        railing_type: "none",
        status: "open",
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error || !data?.id) {
      setErr(error?.message ?? "Could not create quote");
      setSaving(false);
      return;
    }

    router.push(`/projects/${data.id}/edit`);
  }

  return (
    <main className="min-h-screen bg-[#0e0e10] p-10 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">New Quote Wizard</h1>
          <p className="text-gray-400">
            Start with the basics. Then DeckMargin will take you into the estimator.
          </p>
        </div>

        {err ? (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {err}
          </div>
        ) : null}

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs text-white/60">Quote Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Smith Residence Deck"
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-white/60">Client Name</label>
              <input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-white/60">Client Phone</label>
              <input
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-white/60">Client Email</label>
              <input
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-white/60">Site Address</label>
              <input
                value={siteAddress}
                onChange={(e) => setSiteAddress(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#111827] px-3 py-2"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={createQuote}
              disabled={saving}
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-60"
            >
              {saving ? "Creating..." : "Create Quote"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

