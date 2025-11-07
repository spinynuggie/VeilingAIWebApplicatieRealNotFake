"use client";

import { useEffect, useState } from "react";
import  VeilingDisplay  from "../../components/VeilingDisplay";
import { getVeilingen } from "../../services/veilingService";

export default function VeilingList() {
  const [veilingen, setVeilingen] = useState<any[]>([]);

  useEffect(() => {
    getVeilingen()
      .then(setVeilingen)
      .catch(console.error);
  }, []);

  return (
    <div>
      <h2>Veilingen</h2>
      {veilingen.length === 0 ? (
        <p>Geen veilingen gevonden...</p>
      ) : (
        veilingen.map((v) => (
          <VeilingDisplay key={v.id} id={v.id} naam={v.naam} />
        ))
      )}
    </div>
  );
}
