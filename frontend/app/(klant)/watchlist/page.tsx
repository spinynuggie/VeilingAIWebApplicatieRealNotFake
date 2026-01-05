"use client";

import RequireAuth from "@/components/(oud)/RequireAuth";
import { useEffect, useState } from "react";
import { getVeilingen } from "@/services/veilingService";
import VeilingListSimple from "@/components/(oud)/VeilingListSimple";
import type { Veiling } from "@/types/veiling";

export default function WatchlistPage() {
  const [veilingen, setVeilingen] = useState<Veiling[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getVeilingen()
      .then(setVeilingen)
      .catch((err) => setError(err.message || "Kon watchlist niet ophalen."));
  }, []);

  return (
    <RequireAuth>
      <div style={{ padding: "20px", display: "grid", gap: 16 }}>
        <h1 style={{ margin: 0 }}>Watchlist</h1>
        {error ? (
          <div style={{ color: "red" }}>{error}</div>
        ) : (
          <VeilingListSimple title="Opgeslagen veilingen" items={veilingen} />
        )}
      </div>
    </RequireAuth>
  );
}
