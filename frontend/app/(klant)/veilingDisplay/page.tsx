"use client";

import { useEffect, useState } from "react";
import VeilingDisplay from "../../../components/VeilingDisplay";
import { getVeilingen } from "../../../services/veilingService";
import { NavBar } from "@/features/(NavBar)/NavBar";
import RequireAuth from "@/components/(oud)/RequireAuth";
import { Button } from "@mui/material";

export default function VeilingList() {
  const [veilingen, setVeilingen] = useState<any[]>([]);
  const [showEnded, setShowEnded] = useState(false);

  useEffect(() => {
    getVeilingen()
      .then(setVeilingen)
      .catch(console.error);
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
    <RequireAuth>
      <div style={{ backgroundColor: "white", minHeight: "100vh" }}>
        <NavBar mode='customer' />

        {/* Live Auctions */}
        <div style={{ padding: "30px" }}>
          <h2 style={{ marginBottom: "10px", marginTop: "0", color: "#10b981" }}>Huidige veilingen</h2>
          {liveVeilingen.length > 0 ? (
            <VeilingDisplay veilingen={liveVeilingen} />
          ) : (
            <p style={{ color: "#666" }}>Er zijn momenteel geen live veilingen.</p>
          )}
        </div>

        {/* Upcoming Auctions */}
        <div style={{ padding: "30px", paddingTop: "0" }}>
          <h2 style={{ marginBottom: "10px", color: "#3b82f6" }}>Toekomstige veilingen</h2>
          {upcomingVeilingen.length > 0 ? (
            <VeilingDisplay veilingen={upcomingVeilingen} />
          ) : (
            <p style={{ color: "#666" }}>Er zijn geen geplande veilingen.</p>
          )}
        </div>

        {/* Ended Auctions Toggle */}
        <div style={{ padding: "30px", paddingTop: "0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <h2 style={{ margin: 0, color: "#6b7280" }}>Afgelopen veilingen</h2>
            <Button variant="outlined" onClick={() => setShowEnded(!showEnded)}>
              {showEnded ? "Verbergen" : "Tonen"}
            </Button>
          </div>

          {showEnded && (
            endedVeilingen.length > 0 ? (
              <VeilingDisplay veilingen={endedVeilingen} />
            ) : (
              <p style={{ color: "#666" }}>Geen afgelopen veilingen gevonden.</p>
            )
          )}
        </div>
      </div>
    </RequireAuth>
  );
}
