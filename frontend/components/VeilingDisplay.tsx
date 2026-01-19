"use client";

import { Veiling, VeilingDisplayProps } from '@/types/veiling';
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Stack
} from '@mui/material';

import VeilingCard from './VeilingCard';

// Types voor de modus
interface ExtendedVeilingDisplayProps extends VeilingDisplayProps {
  mode?: 'veilingKlant' | 'veilingAanmaken';
}

export default function VeilingDisplay({
  veilingen,
  mode = 'veilingKlant'
}: ExtendedVeilingDisplayProps) {
  const router = useRouter();

  if (!veilingen || veilingen.length === 0) {
    return (
      <Typography variant="body1" sx={{ p: 2, color: 'text.secondary' }}>
        Geen veilingen gevonden
      </Typography>
    );
  }

  const handleVeilingClick = (veiling: Veiling) => {
    if (!veiling.veilingId) {
      console.error("Geen veilingId gevonden:", veiling);
      return;
    }

    if (mode === 'veilingAanmaken') {
      // Modus: Admin/Beheerder
      router.push(`/veilingAanmaken/${veiling.veilingId}?step=1`);
    } else {
      // Modus: Klant
      router.push(`/veiling/${veiling.veilingId}`);
    }
  };

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        overflowX: "auto",
        pb: 2,
        pt: 1,
        width: "100%",
        "&::-webkit-scrollbar": { height: "8px" },
        "&::-webkit-scrollbar-track": { background: "#f1f1f1", borderRadius: "4px" },
        "&::-webkit-scrollbar-thumb": { background: "#888", borderRadius: "4px" },
        "&::-webkit-scrollbar-thumb:hover": { background: "#555" },
      }}
    >
      {veilingen.map((v, idx) => (
        <VeilingCard
          key={v.veilingId ?? idx}
          veiling={v}
          onClick={handleVeilingClick}
        />
      ))}
    </Stack>
  );
}
