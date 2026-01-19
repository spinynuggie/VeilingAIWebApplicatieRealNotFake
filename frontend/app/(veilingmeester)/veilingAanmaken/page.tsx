"use client";

import React, { useState } from "react";
import AppNavbar from "@/features/(NavBar)/AppNavBar";
import { useVeilingAanmaken } from "./hooks/useVeilingAanmaken";
import RequireAuth from "@/components/(oud)/RequireAuth";
import CreateForm from "./Components/createForm";
import { Background } from "@/components/Background";
import { Alert, Snackbar } from "@mui/material";

import { Box as BoxMui } from "@mui/material";
import VeilingCard from "@/components/VeilingCard";

const VeilingAanmakenPage = () => {
  // Initial state for creation step
  const [auctionData, setAuctionData] = useState({
    title: "",
    startTime: "",
    description: "",
    locationId: "",
    imageUrl: "",
    duration: 10
  });

  const {
    error, setError, handleCreateVeiling, locations
  } = useVeilingAanmaken();

  const handleCreate = async () => {
    const successId = await handleCreateVeiling(auctionData);
    if (successId) {
      // Redirect to Step 1 (Product Selection)
      window.location.href = `/veilingAanmaken/${successId}?step=1`;
    }
  };

  // Mock veiling object for preview
  const previewVeiling = {
    veilingId: 0,
    naam: auctionData.title || "Naam Veiling",
    beschrijving: auctionData.description,
    image: auctionData.imageUrl,
    starttijd: auctionData.startTime,
    eindtijd: null,
    locatieId: Number(auctionData.locationId),
    veilingMeesterId: 0,
    veilingDuurInSeconden: auctionData.duration
  };

  return (
    <RequireAuth roles={["ADMIN", "VEILINGMEESTER"]}>
      <Background>
        <AppNavbar />
        {error && (
          <Snackbar open={true} autoHideDuration={6000} onClose={() => setError(null)}>
            <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          </Snackbar>
        )}

        <BoxMui
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: "60px",
            padding: "60px 40px",
            maxWidth: "1400px",
            margin: "0 auto",
            flexWrap: "wrap",
          }}
        >
          <CreateForm
            auctionData={auctionData}
            setAuctionData={setAuctionData}
            onNext={handleCreate}
            locations={locations}
          />
        </BoxMui>
      </Background>
    </RequireAuth>
  );
};

export default VeilingAanmakenPage;
