"use client";

import RequireAuth from "@/components/(oud)/RequireAuth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getVeilingen } from "@/services/veilingService";
import type { Veiling } from "@/types/veiling";
import VeilingDisplay from "../../../components/VeilingDisplay";
import Navbar from "@/features/(NavBar)/AppNavBar";
import { Button } from "@mui/material";


export default function Landing() {
  const router = useRouter();
  const [veilingen, setVeilingen] = useState<Veiling[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showEnded, setShowEnded] = useState(false);

  useEffect(() => {
    getVeilingen()
      .then(setVeilingen)
      .catch((err) => setError(err.message || "Kon veilingen niet ophalen."));
  }, []);

  const now = new Date().getTime();

  const liveVeilingen = veilingen.filter(v => {
    const start = new Date(v.starttijd).getTime();
    const end = new Date(v.eindtijd).getTime();
    return now >= start && now < end;
  });

  const upcomingVeilingen = veilingen.filter(v => {
    const start = new Date(v.starttijd).getTime();
    return now < start;
  });

  const endedVeilingen = veilingen.filter(v => {
    const end = new Date(v.eindtijd).getTime();
    return now >= end;
  });

  return (
    <RequireAuth roles={["ADMIN", "VEILINGMEESTER"]}>
      <div style={{ backgroundColor: "white", minHeight: "100vh" }}>
        <Navbar />

        {/* Live Auctions */}
        <div style={{ padding: "30px" }}>
          <h2 style={{ marginBottom: "10px", marginTop: "0", color: "#10b981" }}>Live Veilingen</h2>
          {liveVeilingen.length > 0 ? (
            <VeilingDisplay veilingen={liveVeilingen} mode="veilingAanmaken" />
          ) : (
            <p style={{ color: "#666" }}>Er zijn momenteel geen live veilingen.</p>
          )}
        </div>

        {/* Upcoming Auctions */}
        <div style={{ padding: "30px", paddingTop: "0" }}>
          <h2 style={{ marginBottom: "10px", color: "#3b82f6" }}>Toekomstige Veilingen</h2>
          {upcomingVeilingen.length > 0 ? (
            <VeilingDisplay veilingen={upcomingVeilingen} mode="veilingAanmaken" />
          ) : (
            <p style={{ color: "#666" }}>Er zijn geen geplande veilingen.</p>
          )}
        </div>

        {/* Ended Auctions Toggle */}
        <div style={{ padding: "30px", paddingTop: "0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <h2 style={{ margin: 0, color: "#6b7280" }}>Afgelopen Veilingen</h2>
            <Button variant="outlined" onClick={() => setShowEnded(!showEnded)}>
              {showEnded ? "Verbergen" : "Tonen"}
            </Button>
          </div>

          {showEnded && (
            endedVeilingen.length > 0 ? (
              <VeilingDisplay veilingen={endedVeilingen} mode="veilingAanmaken" />
            ) : (
              <p style={{ color: "#666" }}>Geen afgelopen veilingen gevonden.</p>
            )
          )}
        </div>
      </div>
    </RequireAuth>
  );
}
