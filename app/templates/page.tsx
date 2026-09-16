"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

const TEMPLATE_PREVIEWS = [
  { name: "Standard PT Deck", desc: "Pressure-treated ground-level or low-elevation deck with standard framing. Best for: simple rectangular builds.", tags: ["PT", "Standard", "Rectangle"], color: "border-amber-500/30 bg-amber-500/5" },
  { name: "Composite Deck", desc: "Trex or TimberTech decking with composite railing. Professional finish for mid-range jobs.", tags: ["Composite", "Railing", "Mid-range"], color: "border-blue-500/30 bg-blue-500/5" },
  { name: "Premium Composite + Railing", desc: "High-end composite decking, cable or glass railing, picture-frame border. Ideal for premium clients.", tags: ["Premium", "Cable Railing", "Picture Frame"], color: "border-violet-500/30 bg-violet-500/5" },
  { name: "Deck + Stairs", desc: "Standard build with straight stairs and stair railing. Common configuration for elevated decks.", tags: ["Stairs", "Attached", "Elevated"], color: "border-emerald-500/30 bg-emerald-500/5" },
  { name: "Deck + Aluminum Railing", desc: "Pressure-treated or composite decking with aluminum picket railing. Low maintenance, long-lasting.", tags: ["Aluminum Railing", "PT or Composite"], color: "border-cyan-500/30 bg-cyan-500/5" },
  { name: "Resurface / Replace Decking", desc: "Existing framing reused. New decking boards only. Demolition of old decking included.", tags: ["Resurface", "No New Framing"], color: "border-orange-500/30 bg-orange-500/5" },
  { name: "Railing Only", desc: "Replace or install railing on an existing deck. No decking or framing work.", tags: ["Railing Only", "No Decking"], color: "border-pink-500/30 bg-pink-500/5" },
  { name: "Rebuild", desc: "Full tear-down and rebuild. Demo, haul-away, new footings, framing, decking, and railing.", tags: ["Rebuild", "Demo", "Full Scope"], color: "border-red-500/30 bg-red-500/5" },
];

export default function TemplatesPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#0b0f19] px-6 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Templates</h1>
            <p className="mt-1 text-sm text-white/70">
              Start a quote from a pre-configured job type
            </p>
          </div>
          <Link href="/dashboard" className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10">
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-4 text-sm text-amber-300">
          <span className="font-medium">Coming soon —</span> Custom company templates are on the roadmap. For now, use the templates below to pre-fill your quote wizard with sensible defaults.
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {TEMPLATE_PREVIEWS.map((t) => (
            <div key={t.name} className={`rounded-2xl border p-5 ${t.color}`}>
              <h3 className="mb-2 font-semibold">{t.name}</h3>
              <p className="mb-4 text-sm text-white/60">{t.desc}</p>
              <div className="mb-4 flex flex-wrap gap-1.5">
                {t.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/50">
                    {tag}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => router.push("/projects/new")}
                className="w-full rounded-lg border border-white/20 py-2 text-sm hover:bg-white/10"
              >
                Start Quote
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
