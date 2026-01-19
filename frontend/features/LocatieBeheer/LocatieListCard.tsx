// features/LocatieBeheer/LocatieListCard.tsx
"use client";

import React from "react";
import { Typography, Stack, Card, CardMedia, CardContent, CircularProgress } from "@mui/material";
import { Locatie } from "@/services/locatieService";

interface Props {
  locaties: Locatie[];
  loading: boolean;
}

export default function LocatieListCard({ locaties, loading }: Props) {
  return (
    <Stack spacing={2} sx={{ width: "100%", maxHeight: "70vh", overflowY: "auto", pr: 1 }}>
      <Typography variant="h6">Huidige Locaties ({locaties.length})</Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <Stack spacing={2}>
          {locaties.map((loc) => (
            <Card key={loc.locatieId} sx={{ display: 'flex', boxShadow: 2 }}>
              <CardMedia
                component="img"
                sx={{ width: 80, height: 80 }}
                image={loc.foto || "https://via.placeholder.com/80"}
                alt={loc.locatieNaam}
              />
              <CardContent sx={{ display: 'flex', alignItems: 'center', py: "0 !important" }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {loc.locatieNaam}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}