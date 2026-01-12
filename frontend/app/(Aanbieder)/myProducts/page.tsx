"use client";

import React, { useEffect, useState, useCallback } from "react";
import { 
  Typography, 
  Grid, 
  CircularProgress, 
  Container, 
  Stack, 
  Alert, 
  Box as BoxMui 
} from "@mui/material";

// Eigen componenten
import AppNavBar from "@/features/(NavBar)/AppNavBar";
import { Background } from "@/components/Background";
import ProductCard from "@/features/ProductCard";
import { useAuth } from "@/components/AuthProvider";

// Mock of Import van je fetch helper
// Zorg dat deze import klopt met jouw projectstructuur
import { authFetch } from "@/services/authService"; 

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function Landing() {
  // 1. Hooks voor Auth en State
  const { user } = useAuth();
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 2. De fetch functie direct in de component of via useCallback
  const fetchProducts = useCallback(async (userId: number) => {
    try {
      setLoading(true);
      setError(null);

      // We roepen exact de route aan die je in C# hebt gemaakt:
      // [HttpGet("verkoper/{verkoperId}")]
      const response = await authFetch(`${API_BASE}/api/ProductGegevens/verkoper/${userId}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Server fout: ${response.status}`);
      }

      const data = await response.json();
      setMyProducts(data);
    } catch (err: any) {
      console.error("Fout bij ophalen:", err);
      setError("Kon je producten niet laden. Controleer of de backend draait.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. Effect hook die reageert op de user status
  useEffect(() => {
    if (user?.gebruikerId) {
      fetchProducts(Number(user.gebruikerId));
    } else {
      // Als er na 2 seconden nog geen user is, stoppen we de loading spinner
      const timer = setTimeout(() => setLoading(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [user, fetchProducts]);

  return (
    <Background>
      <AppNavBar />

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Header met MUI Stack */}
        <Stack spacing={1} sx={{ mb: 6, alignItems: "center", textAlign: "center" }}>
          <Typography 
            variant="h3" 
            sx={{ fontWeight: 900, color: "primary.main", letterSpacing: -1 }}
          >
            Mijn Producten
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500 }}>
            Ingelogd als: <strong>{user?.naam || "Laden..."}</strong> (ID: {user?.gebruikerId || "?"})
          </Typography>
        </Stack>

        {/* Status indicator: Laden */}
        {loading && (
          <BoxMui sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress color="success" size={50} />
          </BoxMui>
        )}

        {/* Status indicator: Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Producten Grid */}
        {!loading && !error && (
          <>
            {myProducts.length > 0 ? (
              <Grid container spacing={4}>
                {myProducts.map((product) => (
                  <Grid item key={product.productId} xs={12} sm={6} md={4}>
                    <ProductCard
                      product={product}
                      mode="display" // Gebruikt de 'display' mode uit je ProductCard component
                      onAction={(val) => console.log("Actie uitgevoerd:", val)}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <BoxMui 
                sx={{ 
                  p: 6, 
                  textAlign: "center", 
                  bgcolor: "background.paper", 
                  borderRadius: 4,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                  border: "1px solid",
                  borderColor: "divider"
                }}
              >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Geen producten gevonden
                </Typography>
                <Typography variant="body2">
                  Zodra je producten toevoegt, verschijnen ze hier in je overzicht.
                </Typography>
              </BoxMui>
            )}
          </>
        )}
      </Container>
    </Background>
  );
}