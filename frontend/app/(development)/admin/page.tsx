"use client";

import RequireAuth from "@/components/(oud)/RequireAuth";
import { useEffect, useState } from "react";
import { getGebruiker } from "@/services/gebruikerService";
import UserInfoCard from "@/features/UserInfoCard";
import type { User } from "@/types/user";
import AppNavBar from "@/features/(NavBar)/AppNavBar";
import { Background } from "@/components/Background";
import { Container, Typography, Grid} from "@mui/material"

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getGebruiker()
      .then(setUsers)
      .catch((err) => setError(err.message || "Kon gebruikers niet ophalen."));
  }, []);

  return (
    <RequireAuth roles={["ADMIN"]}>
      <Background>
      <AppNavBar/>
      <Container maxWidth="lg" sx={{ mt: 4, pb: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Admin Dashboard
        </Typography>

        {error ? (
          <Typography color="error">{error}</Typography>
        ) : users.length === 0 ? (
          <Typography>Geen gebruikers gevonden.</Typography>
        ) : (
          <Grid container spacing={3}>
            {users.map((u) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={u.gebruikerId}>
                <UserInfoCard 
                  user={u} 
                  title={`Gebruiker #${u.gebruikerId}`} 
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
      </Background>
    </RequireAuth>
  );
}
