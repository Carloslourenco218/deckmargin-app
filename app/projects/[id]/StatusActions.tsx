"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

export default function StatusActions({
  id,
  currentStatus,
}: {
  id: string;
  currentStatus: string;
}) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [loading, setLoading] = useState("");

  async function setStatus(status: string) {
    setLoading(status);

    const { error } = await supabase
      .from("projects")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    setLoading("");

    if (error) {
      alert(error.message);
      return;
    }

    router.refresh();
  }

  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {["sent", "approved", "won", "lost"].map((status) => (
        <button
          key={status}
          type="button"
          onClick={() => setStatus(status)}
          disabled={loading === status || currentStatus === status}
          className="rounded border border-white/20 px-3 py-2 text-sm hover:bg-white/10 disabled:opacity-50"
        >
          {loading === status ? "Updating…" : `Mark as ${status}`}
        </button>
      ))}
    </div>
  );
}

