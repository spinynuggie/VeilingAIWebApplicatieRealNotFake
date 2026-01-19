"use client";
import React from "react";
import { Typography, Box as BoxMui, Grid, CircularProgress, Stack } from "@mui/material";
import { Button } from "@/components/Buttons/Button";
import { TextField } from "@/components/TextField";
import UniversalSelector from "@/features/UniversalSelect";
import { Locatie } from "@/services/locatieService";

interface CreateFormProps {
  auctionData: any;
  setAuctionData: (data: any) => void;
  onNext: () => void;
  locations: Locatie[];
}

import { Box } from "@/components/Box";

export default function CreateForm({ auctionData, setAuctionData, onNext, locations }: CreateFormProps) {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Ensure we have a default location if none is selected
  React.useEffect(() => {
    if (locations.length > 0 && !auctionData.locationId) {
      setAuctionData({ ...auctionData, locationId: locations[0].locatieId });
    }
  }, [locations]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!auctionData.title?.trim()) {
      newErrors.title = "Naam is verplicht";
      isValid = false;
    } else if (auctionData.title.length > 100) {
      newErrors.title = "Naam mag maximaal 100 tekens bevatten";
      isValid = false;
    }

    if (!auctionData.startTime) {
      newErrors.startTime = "Starttijd is verplicht";
      isValid = false;
    }

    if (!auctionData.imageUrl) {
      newErrors.image = "Afbeelding is verplicht";
      isValid = false;
    }

    if (auctionData.description && auctionData.description.length > 2000) {
      newErrors.description = "Beschrijving mag maximaal 2000 tekens bevatten";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setAuctionData({ ...auctionData, imageUrl: objectUrl });

    // Upload to backend
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("folder", "auctions");

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_LINK;
      const res = await fetch(`${backendUrl}/api/Upload?folder=auctions`, {
        method: 'POST',
        body: uploadData,
      });

      if (!res.ok) throw new Error("Upload mislukt");
      const data = await res.json();
      // Update with the real URL from backend
      setAuctionData((prev: any) => ({ ...prev, imageUrl: data.url }));

    } catch (err) {
      console.error(err);
      alert("Uploaden mislukt");
    }
  };

  const handleNextClick = async () => {
    if (validate()) {
      setIsSubmitting(true);
      try {
        await onNext();
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Box component="form" sx={{ width: '100%', maxWidth: '900px' }}>
      <Typography variant="h5" gutterBottom>Veiling Aanmaken</Typography>

      <Grid container spacing={4}>
        {/* LINKER KOLOM: Inputs */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Naam Veiling"
              value={auctionData.title || ""}
              onChange={(e: any) => setAuctionData({ ...auctionData, title: e.target.value })}
              error={!!errors.title}
              helperText={errors.title}
              required
            />

            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ py: 1.5, borderStyle: 'dashed' }}
            >
              {auctionData.imageUrl ? "Afbeelding Wijzigen" : "Poster / Afbeelding Uploaden"}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageUpload}
              />
            </Button>
            {errors.image && <Typography color="error" variant="caption">{errors.image}</Typography>}

            <BoxMui sx={{
              height: 200, // Slightly shorter to keep it compact
              width: '100%',
              border: '1px solid #e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              borderRadius: 1,
              bgcolor: '#f9f9f9'
            }}>
              {auctionData.imageUrl ? (
                <img src={auctionData.imageUrl} alt="Preview" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
              ) : (
                <Typography color="text.secondary">Poster Preview</Typography>
              )}
            </BoxMui>

            <TextField
              fullWidth
              label="Starttijd"
              type="datetime-local"
              value={auctionData.startTime || ""}
              onChange={(e: any) => setAuctionData({ ...auctionData, startTime: e.target.value })}
              InputLabelProps={{ shrink: true }}
              error={!!errors.startTime}
              helperText={errors.startTime}
              required
            />

            <TextField
              select
              fullWidth
              label="Locatie"
              value={auctionData.locationId}
              onChange={(e: any) => setAuctionData({ ...auctionData, locationId: e.target.value })}
              required
              InputLabelProps={{ shrink: true }}
              slotProps={{
                select: {
                  native: true,
                },
              }}
            >
              {locations.map((loc) => (
                <option key={loc.locatieId} value={loc.locatieId}>
                  {loc.locatieNaam}
                </option>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Veilingduur per product (sec)"
              type="number"
              value={auctionData.duration || 10}
              onKeyDown={(e: any) => { if (["e", "E", "+", "-", ".", ","].includes(e.key)) e.preventDefault(); }}
              onChange={(e: any) => setAuctionData({ ...auctionData, duration: e.target.value })}
              helperText="Tijd in seconden (1-30)"
            />
          </Stack>
        </Grid>

        {/* RECHTER KOLOM: Beschrijving & Submit */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={3} sx={{ height: '100%' }}>
            <TextField
              fullWidth
              label="Beschrijving"
              multiline
              rows={6} // Matched ProductForm
              value={auctionData.description || ""}
              onChange={(e: any) => setAuctionData({ ...auctionData, description: e.target.value })}
              error={!!errors.description}
              helperText={errors.description}
            />

            <BoxMui sx={{ mt: 'auto', textAlign: 'center' }}>
              <Button
                type="button"
                variant="contained"
                size="large"
                fullWidth
                disabled={isSubmitting}
                startIcon={isSubmitting && <CircularProgress size={20} color="inherit" />}
                onClick={handleNextClick}
                sx={{ py: 2, fontSize: '1.1rem' }}
              >
                Veiling Aanmaken & Producten Kiezen
              </Button>
            </BoxMui>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}