"use client";

import AppNavbar from "@/features/(NavBar)/AppNavBar";
import { useVeilingAanmaken } from "../hooks/useVeilingAanmaken";
import { AvailableColumn } from "../Components/availableColumn";
import DetailColumn from "../Components/detailColumn";
import AuctionColumn from "../Components/auctionColumn";
import { Alert, Snackbar, Box as BoxMui, Grid } from "@mui/material";
import RequireAuth from "@/components/(oud)/RequireAuth";
import { Background } from "@/components/Background";
import { Box } from "@/components/Box";

const VeilingAanmakenPage = () => {
  const {
    loading,
    filteredAvailable,      // Gefilterde lijst links
    filteredAuction,
    selectedProduct,
    setSelectedProduct,
    error,
    setError,
    handleAddToAuction,
    handleRemoveFromAuction,
    handleSearchAvailable,
    handleSearchAuction,
  } = useVeilingAanmaken();

  return (
    <RequireAuth roles={["ADMIN", "VERKOPER"]}>
      <Background>
      {error && (
        <Snackbar
          open={true}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setError(null)} 
            severity="error" 
            sx={{ width: '100%' }}
          >
            {error}
          </Alert>
        </Snackbar>
      )}
      <AppNavbar />


      <Grid container spacing={2} sx={{ p: 2, width: '100vw', display: 'flex', justifyContent: 'center' }}>
        {/* KOLOM 1: Nu schoon en leesbaar */}
        <Box>
        <AvailableColumn
            loading={loading}
            products={filteredAvailable}
            selectedId={selectedProduct?.productId}
            onSearch={handleSearchAvailable}
            onSelect={setSelectedProduct}
        />
        </Box>

        {/* KOLOM 2 */}
        <BoxMui>
        <DetailColumn
            product={selectedProduct}
            onAdd={handleAddToAuction}
        />
        </BoxMui>
        
        {/* KOLOM 3 */}
        <Box>
        <AuctionColumn
            products={filteredAuction}
            onSearch={handleSearchAuction}
            onRemove={handleRemoveFromAuction}
        />
        </Box>
      </Grid>
      </Background>
    </RequireAuth>
  );
};

export default VeilingAanmakenPage;
