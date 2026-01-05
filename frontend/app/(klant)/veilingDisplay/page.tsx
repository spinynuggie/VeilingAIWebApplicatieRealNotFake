"use client";

import { useEffect, useState } from "react";
import VeilingDisplay from "../../../components/(oud)/VeilingDisplay";
import { getVeilingen } from "../../../services/veilingService";
import { NavBar } from "@/features/(NavBar)/NavBar";
import RequireAuth from "@/components/(oud)/RequireAuth";

export default function VeilingList() {
  const [veilingen, setVeilingen] = useState<any[]>([]);

  useEffect(() => {
    getVeilingen()
      .then(setVeilingen)
      .catch(console.error);
  }, []);

  return (
    <RequireAuth>
      <div style={{ backgroundColor: "white" }}>
        <NavBar mode='customer'/>

        {/* Rij voor huidige veilingen*/}
        <div style={{ padding: "30px" }}>
          <h2 style={{ marginBottom: "10px", marginTop:"0" }}>Huidige veilingen</h2>
          <VeilingDisplay veilingen={veilingen} />
        </div>

        {/* opkomende veilingen */}
        <div style={{ padding: "30px" }}>
          <h2 style={{ marginBottom: "20px", marginTop: "-10px"}}>Toekomstige veilingen - tijdelijk copie van huidige veilingen</h2>
          <VeilingDisplay veilingen={veilingen} />
        </div>
      </div>
    </RequireAuth>
  );
}
