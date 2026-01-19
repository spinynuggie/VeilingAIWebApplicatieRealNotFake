"use client";

import { Typography, Stack, Box as BoxMui } from "@mui/material";
import { TextField } from "@/components/TextField";
import { Button } from "@/components/Buttons/Button";
import { useCreateSpecificatie } from "@/hooks/useCreateSpecificatie";

export default function SpecifcatiesCard() {
  const { formData, isSubmitting, error, handleChange, submit } = useCreateSpecificatie();

  return (
    <Stack spacing={3}>
      <BoxMui>
        <Typography variant="h4" component="h1" gutterBottom>
          Specificaties
        </Typography>
      </BoxMui>

      <BoxMui sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          required
          label="Naam"
          value={formData.naam}
          onChange={handleChange("naam")}
          error={!!error} // Highlight the field in red if there's an error
          helperText={error} // Display the error message below the field
        />
        <TextField
          required
          label="Beschrijving"
          value={formData.beschrijving}
          onChange={handleChange("beschrijving")}
          error={!!error} // Highlight the field in red if there's an error
          helperText={error} // Display the error message below the field
        />
      </BoxMui>

      <BoxMui sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button
          onClick={submit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Bezig..." : "Aanmaken"}
        </Button>
      </BoxMui>
    </Stack>
  );
}