// components/SpecifcatiesCard.tsx
"use client";

import { Typography, Stack, Box as BoxMui, Alert } from "@mui/material";
import { TextField } from "@/components/TextField";
import { Button } from "@/components/Buttons/Button";
import SearchBar from "@/components/SearchBar";
import { useSearch } from "@/hooks/useSearch";
import { searchSpecificaties } from "@/services/searchService";
import { SearchResult } from "@/types/search";
import { useCreateSpecificatie } from "@/hooks/useCreateSpecificatie";

export default function SpecifcatiesCard() {
  const searchControl = useSearch<SearchResult>(searchSpecificaties);
  // We halen de logica uit de hook
  const { formData, isSubmitting, error, handleChange, submit } = useCreateSpecificatie(() => {
    // Optioneel: actie na succes, bijv. lijst verversen
    console.log("Specificatie aangemaakt!");
  });

  return (
    <Stack spacing={3}>
      <BoxMui>
        <Typography variant="h4" component="h1" gutterBottom>
          Specificaties
        </Typography>
        <Typography variant="body1">Huidige Specificaties:</Typography>
        <SearchBar 
        mode="callback"
        searchControl={searchControl} 
        onSearch={(term) => console.log("Gekozen:", term)}
        />
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