"use client";

import RequireAuth from "@/components/RequireAuth";
import { useEffect, useState } from "react";
import { getVeilingen } from "@/services/veilingService";
import type { Veiling } from "@/types/veiling";

export default function Landing() {
  const [veilingen, setVeilingen] = useState<Veiling[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getVeilingen()
      .then(setVeilingen)
      .catch((err) => setError(err.message || "Kon veilingen niet ophalen."));
  }, []);

  return (
    <RequireAuth roles={["ADMIN", "VERKOPER"]}>
      <div style={{ padding: "20px", display: "grid", gap: 12 }}>
        <h1 style={{ margin: 0 }}>Dashboard voor veilingmeester</h1>
        {error ? (
          <div style={{ color: "red" }}>{error}</div>
        ) : (
          <div style={{ fontWeight: 600 }}>Totaal aantal veilingen: {veilingen.length}</div>
        )}
      </div>
    </RequireAuth>
  );
}
