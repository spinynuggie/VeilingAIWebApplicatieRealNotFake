"use client";

import RequireAuth from "@/components/(oud)/RequireAuth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getVeilingen } from "@/services/veilingService";
import type { Veiling } from "@/types/veiling";
import VeilingDisplay from "../../../components/(oud)/VeilingDisplay";
import Navbar from "@/features/(NavBar)/AppNavBar";


export default function Landing() {
  const router = useRouter();
  const [veilingen, setVeilingen] = useState<Veiling[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getVeilingen()
      .then(setVeilingen)
      .catch((err) => setError(err.message || "Kon veilingen niet ophalen."));
  }, []);

  return (
    <RequireAuth roles={["ADMIN", "VERKOPER"]}>
      <div style={{ backgroundColor: "white" }}>
              <Navbar/>
              {/* Rij voor huidige veilingen*/}
              <div style={{ padding: "30px" }}>
                <h2 style={{ marginBottom: "10px", marginTop:"0" }}>Produkten die geveld kunnen worden</h2>
                <VeilingDisplay veilingen={veilingen} mode = "veilingAanmaken" />
              </div>

              {/* opkomende veilingen */}
              <div style={{ padding: "30px" }}>
                <h2 style={{ marginBottom: "20px", marginTop: "-10px"}}>Toekomstige veilingen - tijdelijk copie van huidige veilingen</h2>
                <VeilingDisplay veilingen={veilingen} mode = "veilingAanmaken" />
              </div>
            </div>
    </RequireAuth>
  );
}
