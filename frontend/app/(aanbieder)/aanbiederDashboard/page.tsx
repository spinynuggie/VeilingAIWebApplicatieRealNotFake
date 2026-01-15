"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Stack,
  Grid,
  Divider
} from "@mui/material";
import { Inventory, AttachMoney, Storefront } from "@mui/icons-material";

// Components
import Navbar from "@/features/(NavBar)/AppNavBar";
import RequireAuth from "@/components/(oud)/RequireAuth";
import ProductCard from "@/features/ProductCard";
import { useAuth } from "@/components/AuthProvider";
import { authFetch } from "@/services/authService";

// Interfaces
interface Sale {
  productId: number;
  productNaam: string;
  verkoopprijs: number;
  aantal: number;
  datum: string;
  koperNaam: string;
}

export default function AanbiederDashboard() {
  const { user } = useAuth();

  // State
  const [sales, setSales] = useState<Sale[]>([]);
  const [myProducts, setMyProducts] = useState<any[]>([]);

  const [loadingSales, setLoadingSales] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [errorSales, setErrorSales] = useState("");
  const [errorProducts, setErrorProducts] = useState("");

  const API_BASE = process.env.NEXT_PUBLIC_BACKEND_LINK || "http://localhost:5000";

  // 1. Fetch Sales
  const fetchSales = useCallback(async () => {
    try {
      setLoadingSales(true);
      const res = await authFetch(`${API_BASE}/api/Verkoper/me/sales`);
      if (!res.ok) throw new Error("Kon verkoopgegevens niet ophalen.");
      const data = await res.json();
      setSales(data);
    } catch (err: any) {
      console.error("Sales fetch error:", err);
      setErrorSales(err.message || "Fout bij ophalen verkopen.");
    } finally {
      setLoadingSales(false);
    }
  }, [API_BASE]);

  // 2. Fetch Products
  const fetchProducts = useCallback(async (userId: number) => {
    try {
      setLoadingProducts(true);
      const response = await authFetch(`${API_BASE}/api/ProductGegevens/verkoper/${userId}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Server fout bij producten: ${response.status}`);
      }

      const data = await response.json();
      setMyProducts(data);
    } catch (err: any) {
      console.error("Products fetch error:", err);
      setErrorProducts("Kon producten niet laden.");
    } finally {
      setLoadingProducts(false);
    }
  }, [API_BASE]);

  // Initial Load
  useEffect(() => {
    if (user?.gebruikerId) {
      fetchSales();
      fetchProducts(Number(user.gebruikerId));
    }
  }, [user, fetchSales, fetchProducts]);

  // Calculated stats
  const totalRevenue = sales.reduce((acc, curr) => acc + (curr.verkoopprijs * curr.aantal), 0);
  const totalSalesCount = sales.length;
  const totalActiveProducts = myProducts.length;

  return (
    <RequireAuth>
      <div style={{ backgroundColor: "#f9fafb", minHeight: "100vh" }}>
        <Navbar />
        <Container maxWidth="xl" sx={{ py: 4 }}>

          {/* Header */}
          <Box mb={4}>
            <Typography variant="h4" fontWeight={800} color="text.primary">
              Aanbieder Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welkom terug, <strong>{user?.naam}</strong>. Hier is je overzicht.
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 6 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 3 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={700}>
                    TOTALE OMZET
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="success.main">
                    € {totalRevenue.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, bgcolor: 'success.light', borderRadius: '50%', color: 'success.dark', opacity: 0.8 }}>
                  <AttachMoney fontSize="large" />
                </Box>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 3 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={700}>
                    AANTAL VERKOPEN
                  </Typography>
                  <Typography variant="h4" fontWeight={800}>
                    {totalSalesCount}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, bgcolor: 'primary.light', borderRadius: '50%', color: 'primary.dark', opacity: 0.8 }}>
                  <Inventory fontSize="large" />
                </Box>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 3 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={700}>
                    ACTIEVE PRODUCTEN
                  </Typography>
                  <Typography variant="h4" fontWeight={800}>
                    {totalActiveProducts}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, bgcolor: 'warning.light', borderRadius: '50%', color: 'warning.dark', opacity: 0.8 }}>
                  <Storefront fontSize="large" />
                </Box>
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={4}>
            {/* Left Column: Sales Table */}
            {/* Left Column: Sales Table */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Box sx={{ p: 2, bgcolor: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
                  <Typography variant="h6" fontWeight={700}>
                    Recente Verkopen
                  </Typography>
                </Box>

                {loadingSales ? (
                  <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
                ) : errorSales ? (
                  <Alert severity="error" sx={{ m: 2 }}>{errorSales}</Alert>
                ) : (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Datum</strong></TableCell>
                        <TableCell><strong>Product</strong></TableCell>
                        <TableCell><strong>Koper</strong></TableCell>
                        <TableCell align="right"><strong>Bedrag</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sales.length > 0 ? (
                        sales.slice(0, 5).map((sale, i) => (
                          <TableRow key={i} hover>
                            <TableCell>
                              {new Date(sale.datum).toLocaleDateString("nl-NL", {
                                day: 'numeric', month: 'short'
                              })}
                            </TableCell>
                            <TableCell>{sale.productNaam}</TableCell>
                            <TableCell>{sale.koperNaam}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                              € {(sale.verkoopprijs * sale.aantal).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                            Nog geen verkopen gevonden.
                          </TableCell>
                        </TableRow>
                      )}
                      {sales.length > 5 && (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            <Typography variant="caption" color="primary" sx={{ cursor: 'pointer' }}>
                              Bekijk alle {sales.length} verkopen (Coming Soon)
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </Paper>
            </Grid>

            {/* Right Column: Quick Product List (or Grid) */}
            {/* Right Column: Quick Product List (or Grid) */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h5" fontWeight={700}>
                  Mijn Producten
                </Typography>
              </Box>

              {loadingProducts ? (
                <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
              ) : errorProducts ? (
                <Alert severity="error">{errorProducts}</Alert>
              ) : (
                <Stack spacing={2}>
                  {myProducts.length > 0 ? (
                    myProducts.map((product) => (
                      <Box key={product.productId} sx={{ transform: 'scale(0.95)', transformOrigin: 'top center' }}>
                        <ProductCard
                          product={product}
                          mode="display"
                          onAction={(val) => console.log("Actie:", val)}
                        />
                      </Box>
                    ))
                  ) : (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                      <Typography color="text.secondary">Geen producten online.</Typography>
                    </Paper>
                  )}
                </Stack>
              )}
            </Grid>
          </Grid>

        </Container>
      </div>
    </RequireAuth>
  );
}
