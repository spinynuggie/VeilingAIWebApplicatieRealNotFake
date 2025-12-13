"use client";

import { Veiling, VeilingDisplayProps } from '@/types/veiling';
import { useRouter } from "next/navigation";
import { Box } from '@mui/material';

// We definiëren hier de types voor de modus
interface ExtendedVeilingDisplayProps extends VeilingDisplayProps {
  mode?: 'veilingKlant' | 'veilingAanmaken';
}

export default function VeilingDisplay({
  veilingen,
  mode = 'veilingKlant' // Standaardwaarde is 'veilingKlant'
}: ExtendedVeilingDisplayProps) {

  const router = useRouter();

  if (!veilingen || veilingen.length === 0) {
      return <p>Geen veilingen gevonden</p>;
  }

  const handleVeilingClick = (veiling: Veiling) => {
    if (!veiling.veilingId) {
      console.error("Geen veilingId gevonden:", veiling);
      return;
    }

    // Hier bepalen we de route op basis van de gekozen modus
    if (mode === 'veilingAanmaken') {
      // Modus 2: Admin/Aanmaken
      router.push(`/veilingAanmaken/${veiling.veilingId}`);
    } else {
      // Modus 1: Klant (standaard)
      router.push(`/veiling/${veiling.veilingId}`);
    }
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          gap: "16px",
          overflowX: "auto",
          overflowY: "hidden",
          padding: "16px 0",
          width: "100%",
          "&::-webkit-scrollbar": { height: "8px" },
          "&::-webkit-scrollbar-track": { background: "#f1f1f1", borderRadius: "4px" },
          "&::-webkit-scrollbar-thumb": { background: "#888", borderRadius: "4px" },
          "&::-webkit-scrollbar-thumb:hover": { background: "#555" },
        }}
      >
        {veilingen.map((v, idx) => (
          <Box
            key={v.veilingId ?? idx}
            onClick={() => handleVeilingClick(v)}
            sx={{
              display: "flex",
              border: "1px solid #ccc",
              borderRadius: "8px",
              width: "300px",
              height: "200px",
              overflow: "hidden",
              backgroundColor: "#f5f5f5",
              flexShrink: 0,
              transition: "transform 0.2s ease-in-out, background-color 0.2s ease-in-out",
              "&:hover": {
                backgroundColor: "#e9e9e9",
                cursor: "pointer",
                transform: "scale(1.02)",
              },
            }}
          >
            <Box sx={{ width: "50%", height: "100%", overflow: "hidden", flexShrink: 0 }}>
              <img
                src={v.image}
                alt={`afbeelding van ${v.naam}`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Box>

            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", padding: "16px", gap: "8px" }}>
              <Box sx={{ minHeight: "40px" }}>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "bold", lineHeight: "1.3" }}>
                  {v.naam}
                </h3>
              </Box>

              <Box sx={{ flex: 1, overflow: "hidden" }}>
                <p style={{
                    margin: 0, fontSize: "14px", lineHeight: "1.4", color: "#666",
                    overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box",
                    WebkitLineClamp: 6, WebkitBoxOrient: "vertical",
                  }}
                >
                  {v.beschrijving}
                </p>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </>
  );
}
