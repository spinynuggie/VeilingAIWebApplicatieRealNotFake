"use client"

import { useEffect, useState } from "react";
import VeilingDisplay from "../../components/VeilingDisplay";
import { getVeilingen } from "../../services/veilingService";
import Navbar from "@/components/NavBar";
import SearchBar from "@/components/SearchBar"
import royalLogo from "@/public/loginAssets/royalLogo.svg";

export default function VeilingList() {
  const [veilingen, setVeilingen] = useState<any[]>([]);

  useEffect(() => {
    getVeilingen()
      .then(setVeilingen)
      .catch(console.error);
  }, []);

  return (
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
        <span>tijdelijke text</span>
      }
    />

      {/* Rij voor huidige veilingen*/}
      <div style={{ padding: "40px" }}>
        <h2 style={{ marginBottom: "20px" }}>Huidige veilingen</h2>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "nowrap",
            gap: "20px",
            overflowX: "auto",
          }}
        >
          {veilingen.length === 0 ? (
            <p>Geen veilingen gevonden...</p>
          ) : (
            veilingen.map((v) => (
              <VeilingDisplay
                key={v.id}
                id={v.id}
                naam={v.naam}
              ></VeilingDisplay>
            ))
          )}
        </div>
      </div>

      {/* opkomende veilingen */}
      <div style={{ padding: "40px" }}>
        <h2 style={{ marginBottom: "20px" }}>Toekomstige veilingen - tijdelijk copie van huidige veilingen</h2>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "nowrap",
            gap: "20px",
            overflowX: "auto",
          }}
        >
          {/* Deze kan later nog vervangen worden als we meer veilingen hebben */}
          {veilingen.length === 0 ? (
            <p>Geen veilingen gevonden...</p>
          ) : (
            veilingen.map((v) => (
              <VeilingDisplay
                key={`${v.id}-2`}
                id={v.id}
                naam={v.naam}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
