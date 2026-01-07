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
      // We voegen ?step=1 toe zodat de pagina weet dat het formulier (stap 0) overgeslagen mag worden
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
        <Card
          key={v.veilingId ?? idx}
          sx={{
            minWidth: 300,
            maxWidth: 300,
            height: 200,
            flexShrink: 0,
            display: 'flex',
            transition: "transform 0.2s ease-in-out",
            "&:hover": {
              transform: "scale(1.02)",
            },
          }}
        >
          <CardActionArea 
            onClick={() => handleVeilingClick(v)}
            sx={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch' }}
          >
            {/* Linkerkant: Afbeelding */}
            <CardMedia
              component="img"
              image={v.image || '/placeholder-auction.jpg'}
              alt={v.naam}
              sx={{ width: "50%", height: "100%", objectFit: "cover" }}
            />

            {/* Rechterkant: Content */}
            <CardContent 
              sx={{ 
                width: "50%", 
                display: "flex", 
                flexDirection: "column", 
                height: "100%",
                p: 2 
              }}
            >
              <Typography 
                variant="h6" 
                component="h3" 
                sx={{ 
                  fontWeight: 'bold', 
                  fontSize: '1.1rem',
                  lineHeight: 1.2,
                  mb: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {v.naam}
              </Typography>

              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontSize: "0.85rem"
                }}
              >
                {v.beschrijving}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
    </Stack>
  );
}
