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

  // "Upcoming" also includes active auctions (started but not ended)
  // Logic: Is active IF (start < now) AND (hasUnfinishedProducts OR end > now)
  // Logic: Is upcoming IF (start > now)
  const upcomingVeilingen = veilingen.filter(v => {
    const start = new Date(v.starttijd).getTime();
    const end = v.eindtijd ? new Date(v.eindtijd).getTime() : Infinity;

    // Future start time
    if (start > now) return true;

    // Started, but effectively still running?
    if (v.hasUnfinishedProducts === true) return true;
    if (end > now) return true;

    return false;
  });

  // "Ended" = (end < now) AND (no unfinished products or explicitly handled)
  // Simplified: If it's not in the "upcoming/active" list, it's ended.
  const endedVeilingen = veilingen.filter(v => !upcomingVeilingen.includes(v));

  // For display purposes, we might want to separate "Live" (active now) from "Future" (active later)
  // But for now, let's stick to the user's filtered lists or a simple split.
  // Let's split upcomingVeilingen into Live (started) and Future (not started)
  const liveVeilingen = upcomingVeilingen.filter(v => new Date(v.starttijd).getTime() <= now);
  const futureVeilingen = upcomingVeilingen.filter(v => new Date(v.starttijd).getTime() > now);

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
          {futureVeilingen.length > 0 ? (
            <VeilingDisplay veilingen={futureVeilingen} mode="veilingAanmaken" />
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
