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
        <TextField
          label="Foto URL"
          fullWidth
          placeholder="https://..."
          value={formData.foto}
          onChange={(e) => setFormData({ ...formData, foto: e.target.value })}
        // No specific error binding for URL yet, generic alert handles it
        />

        {formData.foto && (
          <BoxMui sx={{
            width: '100%',
            height: 180,
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid #ccc'
          }}>
            <img
              src={formData.foto}
              alt="Preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </BoxMui>
        )}
      </BoxMui>

      <BoxMui sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          sx={{ width: { xs: '100%', sm: 'auto' } }} // Full width button on mobile
        >
          {submitting ? <CircularProgress size={24} color="inherit" /> : "Locatie Toevoegen"}
        </Button>
      </BoxMui>
    </Stack>
  );
}