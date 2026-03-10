"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";

type Props = {
  onClose: () => void;
  onCreated: () => void;
};

export default function CreateProjectModal({ onClose, onCreated }: Props) {
  const supabase = createClient();

  const [client, setClient] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("Open");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function handleCreate() {
    setErr("");

    const trimmedClient = client.trim();
    const trimmedName = name.trim();

    if (!trimmedClient) return setErr("Client is required.");
    if (!trimmedName) return setErr("Project name is required.");

    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setLoading(false);
      return setErr("You are not logged in. Please log in again.");
    }

    const { error: insertError } = await supabase.from("projects").insert({
      user_id: user.id,
      client: trimmedClient,
      name: trimmedName,
      status,
    });

    if (insertError) {
      setLoading(false);
      return setErr(insertError.message);
    }

    setLoading(false);
    onCreated();
  }

  return (
    <div
      onMouseDown={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 16,
      }}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          padding: 18,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Create Project</h2>
          <button onClick={onClose} style={{ border: "none", background: "transparent", fontSize: 18, cursor: "pointer" }}>
            ✕
          </button>
        </div>

        <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
          <div>
            <label style={{ fontSize: 12, color: "#444" }}>Client</label>
            <input
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="e.g. Test"
              style={{
                width: "100%",
                marginTop: 6,
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #ccc",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: "#444" }}>Project name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Test Deck 1"
              style={{
                width: "100%",
                marginTop: 6,
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #ccc",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: "#444" }}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{
                width: "100%",
                marginTop: 6,
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #ccc",
                background: "#fff",
              }}
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          {err && <div style={{ color: "#b00020", fontSize: 13 }}>{err}</div>}
        </div>

        <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #ccc",
              background: "#fff",
              cursor: "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleCreate}
            disabled={loading}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "none",
              background: "#111",
              color: "#fff",
              cursor: "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}