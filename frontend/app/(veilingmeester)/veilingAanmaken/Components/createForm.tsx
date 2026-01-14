"use client";
import React from "react";


import { Paper, Typography, Box as BoxMui } from "@mui/material";
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

export default function CreateForm({ auctionData, setAuctionData, onNext, locations }: CreateFormProps) {
  const [errors, setErrors] = React.useState<Record<string, string>>({});

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

    if (!auctionData.endTime) {
      newErrors.endTime = "Eindtijd is verplicht";
      isValid = false;
    }

    if (auctionData.startTime && auctionData.endTime) {
      if (new Date(auctionData.endTime) <= new Date(auctionData.startTime)) {
        newErrors.endTime = "Eindtijd moet na starttijd liggen";
        isValid = false;
      }
    }

    if (auctionData.description && auctionData.description.length > 2000) {
      newErrors.description = "Beschrijving mag maximaal 2000 tekens bevatten";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

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
          error={!!errors.title}
          helperText={errors.title}
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
            error={!!errors.startTime}
            helperText={errors.startTime}
          />
          <TextField
            fullWidth
            label="Eindtijd"
            type="datetime-local"
            margin="normal"
            value={auctionData.endTime || ""}
            onChange={(e: any) => setAuctionData({ ...auctionData, endTime: e.target.value })}
            InputLabelProps={{ shrink: true }}
            error={!!errors.endTime}
            helperText={errors.endTime}
          />
        </BoxMui>

        <Typography variant="subtitle2" sx={{ mt: 2 }}>Veiling Locatie</Typography>
        <UniversalSelector
          mode="location"
          valueIds={auctionData.locationId ? [Number(auctionData.locationId)] : []}
          onSelect={(ids) => {
            // Omdat locatie enkelvoudig is, pakken we de eerste ID
            setAuctionData({ ...auctionData, locationId: ids[0]?.toString() || "" });
          }}
        />

        {/* Image Upload Section */}
        <BoxMui sx={{ mt: 2, mb: 1 }}>
          <Typography variant="subtitle2" gutterBottom>Veiling Afbeelding</Typography>
          <Button
            variant="contained"
            component="label"
            sx={{ width: 'fit-content', mb: 1 }}
          >
            Afbeelding Uploaden
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={async (e) => {
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
                  // Optionally set an error state here, assuming setErrors is available or use a toast
                  alert("Uploaden mislukt");
                }
              }}
            />
          </Button>

          {/* Preview */}
          <BoxMui sx={{
            width: '100%',
            height: 200,
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid #ccc',
            bgcolor: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {auctionData.imageUrl ? (
              <img
                src={auctionData.imageUrl}
                alt="Preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">Geen afbeelding geselecteerd</Typography>
            )}
          </BoxMui>
        </BoxMui>

        <TextField
          fullWidth
          label="Beschrijving"
          multiline
          rows={3}
          margin="normal"
          value={auctionData.description || ""}
          onChange={(e: any) => setAuctionData({ ...auctionData, description: e.target.value })}
          InputLabelProps={{ shrink: true }}
          error={!!errors.description}
          helperText={errors.description}
        />

        <Button
          type="button"
          variant="contained"
          fullWidth
          sx={{ mt: 3, py: 1.5, fontWeight: 'bold' }}
          onClick={handleNext}
        >
          Veiling Aanmaken & Producten Kiezen
        </Button>
      </Paper>
    </BoxMui>
  );
}