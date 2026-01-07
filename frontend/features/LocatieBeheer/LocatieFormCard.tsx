// features/LocatieBeheer/LocatieFormCard.tsx
"use client";

import React, { useState } from "react";
import { Typography, Stack, Box as BoxMui, Alert, CircularProgress } from "@mui/material";
import { TextField } from "@/components/TextField";
import { Button } from "@/components/Buttons/Button";
import { createLocatie, Locatie } from "@/services/locatieService";

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
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await createLocatie(formData);
      setFormData({ locatieNaam: "", foto: "" });
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack spacing={3} sx={{ minWidth: { md: "400px" } }}>
      <BoxMui>
        <Typography variant="h4" component="h1" gutterBottom>
          Locatie Beheer
        </Typography>
        <Typography variant="body1">Voeg een nieuwe veilinglocatie toe:</Typography>
      </BoxMui>

      <BoxMui sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}
        
        <TextField 
          label="Locatie Naam" 
          fullWidth
          value={formData.locatieNaam}
          onChange={(e) => setFormData({ ...formData, locatieNaam: e.target.value })}
        />
        <TextField 
          label="Foto URL" 
          fullWidth
          placeholder="https://..."
          value={formData.foto}
          onChange={(e) => setFormData({ ...formData, foto: e.target.value })}
        />

        {formData.foto && (
          <BoxMui sx={{ width: '100%', height: 180, borderRadius: 2, overflow: 'hidden', border: '1px solid #ccc' }}>
            <img src={formData.foto} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </BoxMui>
        )}
      </BoxMui>

      <BoxMui sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? <CircularProgress size={24} /> : "Locatie Toevoegen"}
        </Button>
      </BoxMui>
    </Stack>
  );
}