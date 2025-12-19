"use client";

import RequireAuth from "@/components/(oud)/RequireAuth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getVeilingen } from "@/services/veilingService";
import type { Veiling } from "@/types/veiling";
import VeilingDisplay from "../../../components/(oud)/VeilingDisplay";
import Navbar from "@/features/(NavBar)/AppNavBar";
import SearchBar from "@/components/(oud)/SearchBar"
import royalLogo from "@/public/loginAssets/royalLogo.svg";
import Profile from "@/components/(oud)/Profile";


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
              <Navbar
                style={{ backgroundColor: "#C8FFD6"}}
                left={
                  <img src={royalLogo.src} alt="Logo Royal Flora Holland" width={100}/>
                }
                center={
                  <SearchBar/>
                }
                right={
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

                    <Profile />
                  </div>
                }
              />
               <button
                      onClick={async () => {
                        try {
                          const veilingen = await getVeilingen();
                          const existingIds = veilingen.map((v: Veiling) => Number(v.veilingId));
                          const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
                          router.push(`/veilingAanmaken/${nextId}`);
                        } catch (e) {
                          console.error("Navigate to create page", e);
                        }
                      }}
                      style={{
                        backgroundColor: "#1eee7cff",
                        color: "white",
                        padding: "12px 20px",
                        borderRadius: 6,
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 600,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                        margin: "20px",
                        float: "right",
                      }}
                    >
                      Veilingen aanmaken
                    </button>
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
