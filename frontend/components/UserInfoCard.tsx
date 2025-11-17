"use client";

import type { User } from "@/types/user";

type Props = {
  user: User;
  title?: string;
};

export default function UserInfoCard({ user, title = "Gebruiker" }: Props) {
  return (
    <div style={{ border: "1px solid #e0e0e0", borderRadius: 8, padding: 16, background: "#fafafa" }}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <InfoRow label="Naam" value={user.naam ?? "-"} />
        <InfoRow label="Email" value={user.emailadres} />
        <InfoRow label="Rol" value={user.role} />
        <InfoRow label="Straat" value={user.straat ?? "-"} />
        <InfoRow label="Huisnummer" value={user.huisnummer ?? "-"} />
        <InfoRow label="Postcode" value={user.postcode ?? "-"} />
        <InfoRow label="Woonplaats" value={user.woonplaats ?? "-"} />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "#666" }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{value}</div>
    </div>
  );
}

