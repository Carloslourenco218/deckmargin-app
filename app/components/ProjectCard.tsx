// app/projects/components/ProjectCard.tsx
"use client";

import Link from "next/link";

type Props = {
  project: {
    id: string;
    name: string | null;
    client: string | null;
    status: string | null;
    final_price?: number | null;
    expected_profit?: number | null;
  };
  onDelete?: () => void;
};

function money(n: number | null | undefined) {
  const v = Number(n ?? 0);
  return v.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export default function ProjectCard({ project, onDelete }: Props) {
  const status = (project.status ?? "open").toLowerCase();
  const isLocked = status === "won" || status === "closed";

  return (
    <div
      style={{
        border: "1px solid #e6e6e6",
        borderRadius: 12,
        padding: 14,
        background: "#fff",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>
            {project.name ?? "Untitled"}
          </div>
          <div style={{ color: "#666", marginTop: 4 }}>
            {project.client ?? "—"} •{" "}
            <span style={{ textTransform: "capitalize" }}>
              {project.status ?? "Open"}
            </span>
            {isLocked ? " • Locked" : ""}
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 700 }}>{money(project.final_price)}</div>
          <div style={{ color: "#666", fontSize: 13 }}>
            Profit {money(project.expected_profit)}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <Link
          href={`/projects/${project.id}`}
          style={{
            padding: "8px 10px",
            border: "1px solid #ddd",
            borderRadius: 8,
            textDecoration: "none",
            color: "#111",
          }}
        >
          Edit
        </Link>

        <a
          href={`/api/proposal/${project.id}`}
          target="_blank"
          rel="noreferrer"
          style={{
            padding: "8px 10px",
            border: "1px solid #ddd",
            borderRadius: 8,
            textDecoration: "none",
            color: "#111",
          }}
        >
          Export Proposal (PDF)
        </a>

        {onDelete ? (
          <button
            onClick={onDelete}
            style={{
              marginLeft: "auto",
              padding: "8px 10px",
              border: "1px solid #f2b8b5",
              borderRadius: 8,
              background: "white",
              color: "#b42318",
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        ) : null}
      </div>
    </div>
  );
}

