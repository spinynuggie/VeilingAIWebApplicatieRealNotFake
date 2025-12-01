"use client";

import { useEffect, useState } from "react";
import VeilingDisplay from "../../components/VeilingDisplay";
import { getVeilingen } from "../../services/veilingService";
import Navbar from "@/components/NavBar";
import SearchBar from "@/components/SearchBar"
import royalLogo from "@/public/loginAssets/royalLogo.svg";
import RequireAuth from "@/components/RequireAuth";
import Profile from "@/components/Profile";

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
        <Navbar
          style={{ backgroundColor: "#C8FFD6"}}
          left={
            <img src={royalLogo.src} alt="Logo Royal Flora Holland" width={100}/>
          }
          center={
            <SearchBar/>
          }
          right={
            <Profile></Profile>
          }
        />

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
