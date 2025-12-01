"use client";

import RequireAuth from "@/components/RequireAuth";
import { useEffect, useState } from "react";
import { getGebruiker } from "@/services/gebruikerService";
import UserInfoCard from "@/components/UserInfoCard";
import type { User } from "@/types/user";

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getGebruiker()
      .then(setUsers)
      .catch((err) => setError(err.message || "Kon gebruikers niet ophalen."));
  }, []);

  return (
    <RequireAuth roles={["ADMIN"]}>
      <div style={{ padding: "20px", display: "grid", gap: 16 }}>
        <h1 style={{ margin: 0 }}>Admin</h1>
        {error ? (
          <div style={{ color: "red" }}>{error}</div>
        ) : users.length === 0 ? (
          <div>Geen gebruikers gevonden.</div>
        ) : (
          users.map((u) => <UserInfoCard key={u.gebruikerId} user={u} title={`Gebruiker #${u.gebruikerId}`} />)
        )}
      </div>
    </RequireAuth>
  );
}
