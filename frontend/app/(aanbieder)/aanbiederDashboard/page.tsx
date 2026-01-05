"use client";

import Navbar from "@/components/(oud)/NavBar";
import SearchBar from "@/components/(oud)/SearchBar";
import royalLogo from "@/public/loginAssets/royalLogo.svg";
import RequireAuth from "@/components/(oud)/RequireAuth";
import Profile from "@/components/(oud)/Profile";

export default function AanbiederDashboard() {
  return (
    <RequireAuth>
      <div style={{ backgroundColor: "white" }}>
        <Navbar
          style={{ backgroundColor: "#C8FFD6" }}
          left={
            <img src={royalLogo.src} alt="Logo Royal Flora Holland" width={100} />
          }
          center={
            <SearchBar />
          }
          right={
            <Profile />
          }
        />

        <h1>Aanbieder Dashboard</h1>
        <p>Welkom op het aanbiederdashboard!</p>
      </div>
    </RequireAuth>
  );
}

