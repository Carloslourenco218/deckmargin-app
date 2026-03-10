import Link from "next/link";
import { createClient } from "@/lib/supabaseServer";

type ProjectRow = {
  id: string;
  name: string | null;
  status: string | null;
  deck_sqft: number | null;
  deck_length: number | null;
  deck_width: number | null;
  height_tier: string | null;
  material_type: string | null;
  railing_type: string | null;
  stair_count: number | null;
  final_price: number | null;
  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
  site_address: string | null;
  notes: string | null;
};

function money(n: number | null) {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const supabase = await createClient();

  const { data: project, error } = await supabase
    .from("projects")
    .select(`
      id,
      name,
      status,
      deck_sqft,
      deck_length,
      deck_width,
      height_tier,
      material_type,
      railing_type,
      stair_count,
      final_price,
      client_name,
      client_email,
      client_phone,
      site_address,
      notes
    `)
    .eq("id", resolvedParams.id)
    .single<ProjectRow>();

  if (error || !project) {
    return (
      <main className="min-h-screen bg-[#0b0f19] px-6 py-8 text-white">
        <div className="mx-auto max-w-4xl rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-200">
          Could not load preview.
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb] px-6 py-8 text-[#111827]">
      <div className="mx-auto max-w-5xl rounded-2xl border border-gray-200 bg-white p-10 shadow-sm">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="text-3xl font-bold">DeckMargin</div>
            <div className="mt-1 text-sm text-gray-500">Client Proposal Preview</div>
          </div>

          <div className="flex gap-2">
            <Link
              href={`/projects/${project.id}`}
              className="rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100"
            >
              Back
            </Link>

            <a
              href={`/api/proposal/${project.id}`}
              target="_blank"
              rel="noreferrer"
              className="rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100"
            >
              Download PDF
            </a>
          </div>
        </div>

        <div className="mb-8 border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-semibold">{project.name ?? "Untitled Quote"}</h1>
          <p className="mt-2 text-gray-500">
            Prepared for {project.client_name || "Client"}
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 p-5">
            <div className="text-xs uppercase tracking-wide text-gray-500">Client</div>
            <div className="mt-2 font-medium">{project.client_name || "—"}</div>
            <div className="text-sm text-gray-500">{project.client_email || "—"}</div>
            <div className="text-sm text-gray-500">{project.client_phone || "—"}</div>
          </div>

          <div className="rounded-xl border border-gray-200 p-5">
            <div className="text-xs uppercase tracking-wide text-gray-500">Job Site</div>
            <div className="mt-2 font-medium">{project.site_address || "—"}</div>
          </div>

          <div className="rounded-xl border border-gray-200 p-5">
            <div className="text-xs uppercase tracking-wide text-gray-500">Quoted Price</div>
            <div className="mt-2 text-2xl font-bold">{money(project.final_price)}</div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">Deck Details</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-gray-200 p-4">
              <div className="text-xs uppercase tracking-wide text-gray-500">Length</div>
              <div className="mt-1 font-medium">{project.deck_length ?? "—"} ft</div>
            </div>

            <div className="rounded-xl border border-gray-200 p-4">
              <div className="text-xs uppercase tracking-wide text-gray-500">Width</div>
              <div className="mt-1 font-medium">{project.deck_width ?? "—"} ft</div>
            </div>

            <div className="rounded-xl border border-gray-200 p-4">
              <div className="text-xs uppercase tracking-wide text-gray-500">Sq Ft</div>
              <div className="mt-1 font-medium">{project.deck_sqft ?? "—"}</div>
            </div>

            <div className="rounded-xl border border-gray-200 p-4">
              <div className="text-xs uppercase tracking-wide text-gray-500">Height Tier</div>
              <div className="mt-1 font-medium">{project.height_tier || "—"}</div>
            </div>

            <div className="rounded-xl border border-gray-200 p-4">
              <div className="text-xs uppercase tracking-wide text-gray-500">Material</div>
              <div className="mt-1 font-medium">{project.material_type || "—"}</div>
            </div>

            <div className="rounded-xl border border-gray-200 p-4">
              <div className="text-xs uppercase tracking-wide text-gray-500">Railing</div>
              <div className="mt-1 font-medium">{project.railing_type || "—"}</div>
            </div>

            <div className="rounded-xl border border-gray-200 p-4">
              <div className="text-xs uppercase tracking-wide text-gray-500">Stairs</div>
              <div className="mt-1 font-medium">{project.stair_count ?? "—"}</div>
            </div>

            <div className="rounded-xl border border-gray-200 p-4">
              <div className="text-xs uppercase tracking-wide text-gray-500">Status</div>
              <div className="mt-1 font-medium">{project.status || "open"}</div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold">Notes</h2>
          <div className="rounded-xl border border-gray-200 p-4 text-sm text-gray-700">
            {project.notes || "No notes added."}
          </div>
        </div>
      </div>
    </main>
  );
}

