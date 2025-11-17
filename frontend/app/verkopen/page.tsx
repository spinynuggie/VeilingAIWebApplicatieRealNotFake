"use client";

import RequireAuth from "@/components/RequireAuth";
import { useEffect, useState } from "react";
import { getVeilingen } from "@/services/veilingService";
import VeilingListSimple from "@/components/VeilingListSimple";
import type { Veiling } from "@/types/veiling";

export default function VerkopenPage() {
  const [veilingen, setVeilingen] = useState<Veiling[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getVeilingen()
      .then(setVeilingen)
      .catch((err) => setError(err.message || "Kon verkopen niet ophalen."));
  }, []);

  return (
    <RequireAuth>
      <div style={{ padding: "20px", display: "grid", gap: 16 }}>
        <h1 style={{ margin: 0 }}>Verkopen</h1>
        {error ? (
          <div style={{ color: "red" }}>{error}</div>
        ) : (
          <VeilingListSimple title="Jouw veilingen" items={veilingen} />
        )}
      </div>
    </RequireAuth>
  );
}
