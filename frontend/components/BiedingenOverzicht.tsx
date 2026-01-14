"use client";

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
  Divider,
  Alert
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';

interface Aankoop {
  aankoopId: number;
  productId: number;
  productNaam: string;
  datum: string;
  isBetaald: boolean;
  aankoopHoeveelheid: number;
  prijs: number;
  totaalBedrag: number;
}

interface BiedingenOverzichtProps {
  aankopen: Aankoop[];
}

/**
 * Component voor het weergeven van gebruikersbiedingen/aankopen.
 * Toont datum, betaalstatus, hoeveelheid en prijs per aankoop.
 */
export default function BiedingenOverzicht({ aankopen }: BiedingenOverzichtProps) {
  if (!aankopen || aankopen.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        U heeft nog geen biedingen gedaan.
      </Alert>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Mijn Biedingen
      </Typography>

      <Stack spacing={2}>
        {aankopen.map((aankoop) => (
          <Card
            key={aankoop.aankoopId}
            sx={{
              '&:hover': {
                boxShadow: 4,
                transition: 'box-shadow 0.3s'
              }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {aankoop.productNaam}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(aankoop.datum)}
                  </Typography>
                </Box>

                <Chip
                  icon={aankoop.isBetaald ? <CheckCircleIcon /> : <PendingIcon />}
                  label={aankoop.isBetaald ? 'Betaald' : 'In afwachting'}
                  color={aankoop.isBetaald ? 'success' : 'warning'}
                  size="small"
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Hoeveelheid
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {aankoop.aankoopHoeveelheid} stuks
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Prijs per stuk
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {formatCurrency(aankoop.prijs)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Totaalbedrag
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                    {formatCurrency(aankoop.totaalBedrag)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Totaal aantal biedingen: <strong>{aankopen.length}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Totaal besteed: <strong>{formatCurrency(aankopen.reduce((sum, a) => sum + a.totaalBedrag, 0))}</strong>
        </Typography>
      </Box>
    </Box>
  );
}
