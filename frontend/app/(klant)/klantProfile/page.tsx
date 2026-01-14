"use client";

import Image from "next/image";
import backgroundImage from "@/public/loginAssets/FloraHollandGebouw.svg";
import {
  Typography,
  Chip,
  Box as BoxMui,
} from "@mui/material";
import { useEffect, useState } from "react";

// Components
import { FloraLogo } from "@/components/FloraLogo";
import AppNavBar from "@/features/(NavBar)/AppNavBar";
import RequireAuth from "@/components/(oud)/RequireAuth";
import { useAuth } from "@/components/AuthProvider";
import { Background } from "@/components/Background"; // Important: ensure this is used if needed, or BoxMui background.

import PersonalDataForm from "./PersonalDataForm";
import BusinessDataForm from "./BusinessDataForm";

export default function KlantProfile() {
  const { user, refreshUser } = useAuth();
  const [isVerkoper, setIsVerkoper] = useState(false);

  useEffect(() => {
    if (user) {
      setIsVerkoper(user.role === "VERKOPER");
    }
  }, [user]);

  const roleLabel = user?.role ?? "Onbekend";

  return (
    <RequireAuth>
      <Background>
        <AppNavBar />

        {/* Decoratieve achtergrondlaag */}
        <BoxMui sx={{ position: "fixed", inset: 0, zIndex: -1, opacity: 0.15 }}>
          <Image src={backgroundImage} alt="Background" fill style={{ objectFit: "cover" }} priority />
        </BoxMui>

        <BoxMui sx={{ maxWidth: 1200, mx: "auto", px: 3, py: 6 }}>
          {/* Header met Logo en Rol */}
          <BoxMui sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
            <BoxMui sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              <FloraLogo mode="medium" />
              <BoxMui>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>Klantprofiel</Typography>
                <Typography variant="body2" color="text.secondary">Beheer hier uw persoonlijke en zakelijke instellingen</Typography>
              </BoxMui>
            </BoxMui>
            <Chip
              label={`Huidige rol: ${roleLabel}`}
              color={isVerkoper ? "success" : "primary"}
              sx={{ fontWeight: 700, borderRadius: "8px" }}
            />
          </BoxMui>

          {/* Persoonlijke Gegevens */}
          <PersonalDataForm user={user} refreshUser={refreshUser} />

          {/* Zakelijke Gegevens - Always visible but disabled/enabled by flow inside component */}
          <BusinessDataForm user={user} refreshUser={refreshUser} isVerkoper={isVerkoper} />

        </BoxMui>
      </Background>
    </RequireAuth>
  );
}