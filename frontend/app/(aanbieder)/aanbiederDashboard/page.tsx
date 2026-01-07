"use client";

import Navbar from "@/features/(NavBar)/AppNavBar";
import RequireAuth from "@/components/(oud)/RequireAuth";

export default function AanbiederDashboard() {
  return (
    <RequireAuth>
      <div style={{ backgroundColor: "white" }}>
        <Navbar />
        <div style={{ padding: "20px" }}>
          <h1>Aanbieder Dashboard</h1>
          <p>Welkom op het aanbiederdashboard!</p>
        </div>
      </div>
    </RequireAuth>
  );
}
