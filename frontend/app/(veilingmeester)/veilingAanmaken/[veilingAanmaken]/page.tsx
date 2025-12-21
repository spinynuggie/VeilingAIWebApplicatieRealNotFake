"use client";

import AppNavbar from "@/features/(NavBar)/AppNavBar";
import { useVeilingAanmaken } from "../hooks/useVeilingAanmaken";
import { AvailableColumn } from "../Components/availableColumn";
import DetailColumn from "../Components/detailColumn";
import AuctionColumn from "../Components/auctionColumn";
import { Alert, Snackbar } from "@mui/material";
import RequireAuth from "@/components/(oud)/RequireAuth";

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
    <main >
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

      <div>  

        {/* KOLOM 1: Nu schoon en leesbaar */}
        <AvailableColumn
            loading={loading}
            products={filteredAvailable}
            selectedId={selectedProduct?.productId}
            onSearch={handleSearchAvailable}
            onSelect={setSelectedProduct}
        />

        {/* KOLOM 2 */}
        <DetailColumn
            product={selectedProduct}
            onAdd={handleAddToAuction}
        />

        {/* KOLOM 3 */}
        <AuctionColumn
            products={filteredAuction}
            onSearch={handleSearchAuction}
            onRemove={handleRemoveFromAuction}
        />

      </div>
    </main>
    </RequireAuth>
  );
};

export default VeilingAanmakenPage;
