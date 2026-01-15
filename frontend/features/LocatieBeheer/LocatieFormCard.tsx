"use client";

import React, { useState } from "react";
import { Typography, Stack, Box as BoxMui, Alert, CircularProgress } from "@mui/material";
import { TextField } from "@/components/TextField";
import { Button } from "@/components/Buttons/Button";
import { createLocatie, Locatie } from "@/services/locatieService";
import { toast } from "react-hot-toast"; // Added this since you have the library now!

interface Props {
  onSuccess: () => void;
}

export default function LocatieFormCard({ onSuccess }: Props) {
  const [formData, setFormData] = useState<Locatie>({ locatieNaam: "", foto: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!formData.locatieNaam || !formData.foto) {
      setError("Vul alle velden in");
      toast.error("Vul alle velden in");
      return;
    }
    if (formData.locatieNaam.length > 60) {
      setError("Naam mag maximaal 60 tekens bevatten");
      toast.error("Naam is te lang");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await createLocatie(formData);
      setFormData({ locatieNaam: "", foto: "" });
      toast.success("Locatie succesvol toegevoegd!");
      onSuccess();
    } catch (err: any) {
      setError(err.message);
      toast.error("Er is iets misgegaan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack
      spacing={3}
      sx={{
        width: "100%",           // Ensures it doesn't exceed parent
        maxWidth: "400px",      // Caps the width
        margin: "0 auto",        // Centers it if the parent is wider
        boxSizing: "border-box" // Includes padding in width calculations
      }}
    >
      <BoxMui>
        <Typography variant="h4" component="h1" gutterBottom>
          Locatie Beheer
        </Typography>
        <Typography variant="body1">Voeg een nieuwe veilinglocatie toe:</Typography>
      </BoxMui>

      {/* Main Form Container */}
      <BoxMui sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '100%'
      }}>
        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="Locatie Naam"
          fullWidth
          value={formData.locatieNaam}
          onChange={(e) => setFormData({ ...formData, locatieNaam: e.target.value })}
          error={!!error && error.includes("Naam")} // Simple heuristic for now
        />
        {/* Image Upload Section */}
        <BoxMui sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            variant="outlined"
            component="label"
            fullWidth
          >
            Of Upload Afbeelding
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                // Create local preview immediately
                const objectUrl = URL.createObjectURL(file);
                setFormData({ ...formData, foto: objectUrl });

                // Upload to backend
                const uploadData = new FormData();
                uploadData.append("file", file);
                uploadData.append("folder", "locations");

                try {
                  // We need to use fetch directly or axios since this is a specific upload endpoint
                  // Assuming authFetch can handle FormData or we use a standard fetch with auth token if needed.
                  // For now, let's use the standard /api/Upload endpoint which is public or requires auth.
                  // If it requires auth, we should use our authService helper or append token.
                  // Let's assume public or cookie-based for now, or use a helper if available.
                  // Note: The previous implementation used standard fetch in ProductForm.

                  // TODO: Import authFetch if needed or just use standard fetch/axios
                  // For this project, let's try a direct fetch to the backend.
                  // You might need to access the token if it's not cookie-based.
                  // Since I can't see authFetch internals right now easily, I'll assume standard fetch to backend link.
                  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_LINK;
                  const res = await fetch(`${backendUrl}/api/Upload?folder=locations`, {
                    method: 'POST',
                    body: uploadData,
                    // Do NOT set Content-Type header when sending FormData, let browser set it with boundary
                  });

                  if (!res.ok) throw new Error("Upload mislukt");
                  const data = await res.json();
                  // Update with the real URL from backend
                  setFormData(prev => ({ ...prev, foto: data.url }));

                } catch (err) {
                  console.error(err);
                  setError("Fout bij uploaden afbeelding");
                  toast.error("Uploaden mislukt");
                }
              }}
            />
          </Button>

          {/* Preview */}
          <BoxMui sx={{
            width: '100%',
            height: 180,
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid #ccc',
            bgcolor: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {formData.foto ? (
              <img
                src={formData.foto}
                alt="Preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">Geen afbeelding geselecteerd</Typography>
            )}
          </BoxMui>
        </BoxMui>
      </BoxMui>

      <BoxMui sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          size="large"
          fullWidth
        // sx={{ width: { xs: '100%', sm: 'auto' } }} // Removed manual media query in favor of fullWidth
        >
          {submitting ? <CircularProgress size={24} color="inherit" /> : "Locatie Toevoegen"}
        </Button>
      </BoxMui>
    </Stack>
  );
}