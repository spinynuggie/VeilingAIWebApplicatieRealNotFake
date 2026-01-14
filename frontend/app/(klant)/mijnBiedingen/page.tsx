"use client";

import RequireAuth from "@/components/(oud)/RequireAuth";
import { useEffect, useState } from "react";
import { Background } from "@/components/Background";
import AppNavbar from "@/features/(NavBar)/AppNavBar";
import BiedingenOverzicht from "@/components/BiedingenOverzicht";
import { getMijnAankopen, GebruikerAankoop } from "@/services/aankoopService";
import { Container, CircularProgress, Alert, Box } from "@mui/material";

export default function MijnBiedingenPage() {
  const [aankopen, setAankopen] = useState<GebruikerAankoop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMijnAankopen()
      .then((data) => {
        setAankopen(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Kon biedingen niet ophalen.");
        setLoading(false);
      });
  }, []);

  return (
    <RequireAuth>
      <Background>
        <AppNavbar />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {!loading && !error && <BiedingenOverzicht aankopen={aankopen} />}
        </Container>
      </Background>
    </RequireAuth>
  );
}

