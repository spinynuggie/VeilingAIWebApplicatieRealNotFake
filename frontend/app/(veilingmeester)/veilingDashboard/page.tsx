"use client";

import RequireAuth from "@/components/RequireAuth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getVeilingen } from "@/services/veilingService";
import type { Veiling } from "@/types/veiling";

import VeilingDisplay from "../../../components/VeilingDisplay";
import Navbar from "@/components/NavBar";
import SearchBar from "@/components/SearchBar"
import royalLogo from "@/public/loginAssets/royalLogo.svg";

import Profile from "@/components/Profile";

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
    //<RequireAuth roles={["ADMIN", "VERKOPER"]}>
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
                      onClick={() => {
                        try {
                          router.push("/veilingAanmaken");
                        } catch (e) {
                          console.log("Navigate to create page", e);
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
    //</RequireAuth>
  );
}
