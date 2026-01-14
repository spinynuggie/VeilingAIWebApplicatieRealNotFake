"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useParams } from "next/navigation";
import AppNavbar from "@/features/(NavBar)/AppNavBar";
import { useVeilingAanmaken } from "../hooks/useVeilingAanmaken";
import { AvailableColumn } from "../Components/availableColumn";
import DetailColumn from "../Components/detailColumn";
import AuctionColumn from "../Components/auctionColumn";
import { Alert, Snackbar, Grid, Typography, Box as BoxMui } from "@mui/material";
import RequireAuth from "@/components/(oud)/RequireAuth";
import { Background } from "@/components/Background";
import { Box } from "@/components/Box";
import CreateForm from "../Components/createForm";

const VeilingAanmakenPage = () => {
  const searchParams = useSearchParams();
  const params = useParams();
  const veilingId = params?.veilingAanmaken ? parseInt(params.veilingAanmaken as string) : null;

  // Lees de stap uit de URL (?step=1), anders begin op stap 0
  const [step, setStep] = useState(0);

  const [auctionData, setAuctionData] = useState({
    title: "",
    startTime: "",
    endTime: "",
    description: "",
    locationId: "",
    imageUrl: ""
  });

  const {
    loading, filteredAvailable, filteredAuction, selectedProduct, setSelectedProduct,
    error, setError, handleCreateVeiling, handleAddToAuction, handleRemoveFromAuction,
    handleSearchAvailable, handleSearchAuction, locations
  } = useVeilingAanmaken(veilingId);

  // Effect om de stap te zetten als de URL parameter verandert
  useEffect(() => {
    const stepParam = searchParams.get('step');
    if (stepParam === '1') {
      setStep(1);
    }
  }, [searchParams]);

  const processToProducts = async () => {
    const successId = await handleCreateVeiling(auctionData);
    if (successId) {
      setStep(1);
    }
  };

  return (
    <RequireAuth roles={["ADMIN", "VERKOPER", "VEILINGMEESTER"]}>
      <Background>
        {error && (
          <Snackbar open={true} autoHideDuration={6000} onClose={() => setError(null)}>
            <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          </Snackbar>
        )}
        <AppNavbar />

        {step === 0 && (
          <CreateForm
            auctionData={auctionData}
            setAuctionData={setAuctionData}
            onNext={processToProducts}
            locations={locations}
          />
        )}

        {step === 1 && (
          <>
            <BoxMui sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h5" sx={{ color: 'primary', fontWeight: 'bold' }}>
                {auctionData.title ? `Items toevoegen aan: ${auctionData.title}` : "Producten beheren"}
              </Typography>
              <Typography variant="body2" sx={{ color: 'primary' }}>
                Selecteer producten aan de linkerkant om ze aan deze veiling toe te voegen.
              </Typography>
            </BoxMui>

            <Grid container spacing={2} sx={{ p: 2, width: '100vw', display: 'flex', justifyContent: 'center' }}>
              <Box>
                <AvailableColumn
                  loading={loading}
                  products={filteredAvailable}
                  selectedId={selectedProduct?.productId}
                  onSearch={handleSearchAvailable}
                  onSelect={setSelectedProduct}
                />
              </Box>
              <BoxMui>
                <DetailColumn
                  product={selectedProduct}
                  onAdd={handleAddToAuction}
                />
              </BoxMui>
              <Box>
                <AuctionColumn
                  products={filteredAuction}
                  onSearch={handleSearchAuction}
                  onRemove={handleRemoveFromAuction}
                />
              </Box>
            </Grid>
          </>
        )}
      </Background>
    </RequireAuth>
  );
};

export default VeilingAanmakenPage;