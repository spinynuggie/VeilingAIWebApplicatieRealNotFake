"use client";

import type { Veiling } from "@/types/veiling";

type Props = {
  title: string;
  items: Veiling[];
};

export default function VeilingListSimple({ title, items }: Props) {
  return (
    <div style={{ border: "1px solid #e0e0e0", borderRadius: 8, padding: 16, background: "#fff" }}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      {items.length === 0 ? (
        <div style={{ color: "#666" }}>Geen veilingen gevonden.</div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
          {items.map((v) => (
            <li
              key={v.veilingId}
              style={{
                border: "1px solid #e5e5e5",
                borderRadius: 6,
                padding: 12,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <strong>{v.naam}</strong>
              <span style={{ color: "#555" }}>{v.beschrijving}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

