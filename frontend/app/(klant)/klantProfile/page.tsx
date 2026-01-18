"use client";

import Image from "next/image";
import backgroundImage from "@/public/loginAssets/FloraHollandGebouw.svg";
import {
  Typography,
  Chip,
  Box as BoxMui,
  Button,
  AlertTitle,
  Alert,
  Paper,
  Divider
} from "@mui/material";
import { useEffect, useState } from "react";

// Components
import { FloraLogo } from "@/components/FloraLogo";
import AppNavBar from "@/features/(NavBar)/AppNavBar";
import RequireAuth from "@/components/(oud)/RequireAuth";
import { useAuth } from "@/components/AuthProvider";
import { Background } from "@/components/Background"; // Important: ensure this is used if needed, or BoxMui background.
import { useRouter } from "next/navigation";
import PersonalDataForm from "./PersonalDataForm";
import BusinessDataForm from "./BusinessDataForm";
import { deleteCurrentAccount } from "@/services/gebruikerService";

export default function KlantProfile() {
  const router = useRouter();
  const { user, refreshUser, logout } = useAuth();
  const [isVerkoper, setIsVerkoper] = useState(false);
  
  useEffect(() => {
    if (user) {
      setIsVerkoper(user.role === "VERKOPER");
    }
  }, [user]);

  const roleLabel = user?.role ?? "Onbekend";

  const handleDeleteAccount = async () => {
    if (!user?.gebruikerId) return;

    const confirmDelete = confirm(
      "Weet u zeker dat u uw account wilt verwijderen? Dit is definitief en voldoet aan uw recht om vergeten te worden (AVG)."
    );

    if (confirmDelete) {
      try {
        // 1. Verwijder in de database via API
        await deleteCurrentAccount(user.gebruikerId);
        
        // 2. Log lokaal uit (cookies/state wissen)
        if (logout) {
          await logout();
        }
        
        // 3. Stuur gebruiker naar home
        alert("Account succesvol verwijderd.");
        router.push("/");
      } catch (error) {
        console.error("Fout bij verwijderen:", error);
        alert("Er is een fout opgetreden bij het verwijderen van uw account.");
      }
    }
  };

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
          <Alert 
  severity="info" 
  sx={{ 
    my: 4, 
    borderRadius: 2, 
    color: 'primary.main',
    '& .MuiAlert-icon': { color: 'primary.main' },
    bgcolor: 'custom.color6', // Ultra Light Mint uit jouw palette
    border: '1px solid',
    borderColor: 'primary.light'
  }}
>
  <AlertTitle sx={{ fontWeight: 800 }}>Privacy & Dataopslag</AlertTitle>
  Wanneer u extra gegevens toevoegt of de rol van <strong>Verkoper</strong> aanneemt, bewaren wij deze zakelijke informatie veilig. 
  Conform de <strong>AVG</strong> worden deze gegevens uitsluitend gebruikt voor het veilingproces. 
  Wij bewaren uw data totdat u besluit uw account te verwijderen.
</Alert>

          {/* Persoonlijke Gegevens */}
          <PersonalDataForm user={user} refreshUser={refreshUser} />
          {/* Zakelijke Gegevens - Always visible but disabled/enabled by flow inside component */}
          <BusinessDataForm user={user} refreshUser={refreshUser} isVerkoper={isVerkoper} />
<Paper 
  elevation={0} 
  sx={{ 
    mt: 8, 
    p: 4, 
    borderRadius: 2, 
    border: "1px solid", 
    borderColor: "error.light", 
    bgcolor: "background.paper",
    textAlign: 'center'
  }}
>
  <Typography variant="h6" sx={{ color: "error.main", fontWeight: 800, mb: 1 }}>
    ACCOUNT OPZEGGEN
  </Typography>
  
  <Divider sx={{ mb: 3, mx: 'auto', width: '200px', bgcolor: 'error.light' }} />

  <Typography variant="body2" sx={{ color: "text.secondary", mb: 4, maxWidth: 700, mx: "auto" }}>
    Wilt u geen gebruik meer maken van onze diensten? Via de onderstaande knop kunt u gebruik maken van uw 
    <strong> recht om vergeten te worden (AVG)</strong>. Al uw persoonlijke en zakelijke data worden direct en permanent uit onze database gewist.
  </Typography>

  <Button 
    variant="contained" 
    color="error" 
    onClick={handleDeleteAccount}
    sx={{ 
      px: 6, 
      '&:hover': { bgcolor: 'error.dark' } 
    }}
  >
    Account definitief verwijderen
  </Button>
</Paper>
        </BoxMui>
      </Background>
    </RequireAuth>
  );
}