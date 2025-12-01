"use client";

import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/components/AuthProvider";
import { useEffect, useState } from "react";
import { getVeilingen } from "@/services/veilingService";
import type { Veiling } from "@/types/veiling";
import UserInfoCard from "@/components/UserInfoCard";
import VeilingListSimple from "@/components/VeilingListSimple";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [veilingen, setVeilingen] = useState<Veiling[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getVeilingen()
      .then(setVeilingen)
      .catch((err) => setError(err.message || "Kon veilingen niet ophalen."));
  }, []);

  return (
    <RequireAuth>
      <div style={{ padding: "20px", display: "grid", gap: 24 }}>
        <h1 style={{ margin: 0 }}>Dashboard</h1>
        {user && !loading && <UserInfoCard user={user} title="Jouw gegevens" />}
        {error ? (
          <div style={{ color: "red" }}>{error}</div>
        ) : (
          <VeilingListSimple title="Beschikbare veilingen" items={veilingen} />
        )}
      </div>
    </RequireAuth>
  );
}
