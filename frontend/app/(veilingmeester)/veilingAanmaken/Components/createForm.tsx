"use client";


import { Paper, Typography, Box as BoxMui } from "@mui/material";
import { Button } from "@/components/Buttons/Button";
import { TextField } from "@/components/TextField";
import UniversalSelector from "@/features/UniversalSelect";

interface CreateFormProps {
  auctionData: any;
  setAuctionData: (data: any) => void;
  onNext: () => void;
}

export default function CreateForm({ auctionData, setAuctionData, onNext }: CreateFormProps) {
  return (
    <BoxMui sx={{ display: 'flex', justifyContent: 'center', mt: 5, mb: 5 }}>
      <Paper sx={{ p: 4, width: '100%', maxWidth: 500, backgroundColor: 'primary', borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary' }}>
          Stap 1: Veiling Details
        </Typography>
        
        <TextField
          fullWidth
          label="Veiling Naam"
          margin="normal"
          value={auctionData.title || ""}
          onChange={(e: any) => setAuctionData({ ...auctionData, title: e.target.value })}
          InputLabelProps={{ shrink: true }}
          placeholder="Bijv. Antiek Veiling 2026"
        />

        <BoxMui sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            label="Starttijd"
            type="datetime-local"
            margin="normal"
            value={auctionData.startTime || ""}
            onChange={(e: any) => setAuctionData({ ...auctionData, startTime: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Eindtijd"
            type="datetime-local"
            margin="normal"
            value={auctionData.endTime || ""}
            onChange={(e: any) => setAuctionData({ ...auctionData, endTime: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </BoxMui>

<Typography variant="subtitle2">Veiling Locatie</Typography>
  <UniversalSelector 
    mode="location" 
    onSelect={(ids) => {
      // Omdat locatie enkelvoudig is, pakken we de eerste ID
      setAuctionData({ ...auctionData, locationId: ids[0]?.toString() || "" });
    }}
  />

        <TextField
          fullWidth
          label="Afbeelding URL"
          margin="normal"
          value={auctionData.imageUrl || ""}
          onChange={(e: any) => setAuctionData({ ...auctionData, imageUrl: e.target.value })}
          InputLabelProps={{ shrink: true }}
          placeholder="https://link-naar-foto.jpg"
        />

        <TextField
          fullWidth
          label="Beschrijving"
          multiline
          rows={3}
          margin="normal"
          value={auctionData.description || ""}
          onChange={(e: any) => setAuctionData({ ...auctionData, description: e.target.value })}
          InputLabelProps={{ shrink: true }}
        />

        <Button
          type="button"
          variant="contained"
          fullWidth
          sx={{ mt: 3, py: 1.5, fontWeight: 'bold' }}
          onClick={onNext}
        >
          Veiling Aanmaken & Producten Kiezen
        </Button>
      </Paper>
    </BoxMui>
  );
}