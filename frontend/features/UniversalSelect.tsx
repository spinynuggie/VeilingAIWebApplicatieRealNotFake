"use client";

import React, { useEffect, useState } from "react";
import { 
  Autocomplete, 
  TextField, 
  CircularProgress, 
  Chip, 
  Box as BoxMui, 
  Typography 
} from "@mui/material";
import { getSpecificaties, Specificaties } from "@/services/specificatiesService";
// Let op: vervang dit door je daadwerkelijke locatie service/fetcher
// Voor nu simuleer ik de fetch of gebruik de getVeilingen logica indien relevant
import { authFetch } from "@/services/authService";

interface UniversalSelectorProps {
  mode: "location" | "specification";
  onSelect: (selectedIds: number[], selectedNames: string[]) => void;
  valueIds?: number[]; // Om de state van buitenaf te kunnen resetten/sturen
}

export default function UniversalSelector({ mode, onSelect, valueIds = [] }: UniversalSelectorProps) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const apiBase = process.env.NEXT_PUBLIC_BACKEND_LINK;

  useEffect(() => {
    let active = true;

    if (!open) return;

    (async () => {
      setLoading(true);
      try {
        if (mode === "specification") {
          const data = await getSpecificaties();
          if (active) setOptions(data);
        } else {
          // Fetch locaties (gebaseerd op je DTO/Model)
          const res = await authFetch(`${apiBase}/api/Locatie`);
          if (res.ok) {
            const data = await res.json();
            if (active) setOptions(data);
          }
        }
      } catch (error) {
        console.error("Fout bij ophalen opties:", error);
      } finally {
        setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [open, mode, apiBase]);

  return (
    <Autocomplete
      multiple={mode === "specification"} // Alleen meerder bij specificaties
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={options}
      loading={loading}
      // Bepaal welke tekst getoond wordt in de lijst
      getOptionLabel={(option) => 
        mode === "specification" ? option.naam : option.locatieNaam
      }
      // Match op basis van ID
      isOptionEqualToValue={(option, value) => 
        mode === "specification" 
          ? option.specificatieId === value.specificatieId 
          : option.locatieId === value.locatieId
      }
      onChange={(_, newValue) => {
        if (mode === "specification") {
          const vals = newValue as Specificaties[];
          onSelect(vals.map(v => v.specificatieId), vals.map(v => v.naam));
        } else {
          const val = newValue as any;
          onSelect(val ? [val.locatieId] : [], val ? [val.locatieNaam] : []);
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={mode === "specification" ? "Zoek Specificaties" : "Zoek Locatie"}
          variant="outlined"
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <React.Fragment>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </React.Fragment>
              ),
            },
          }}
        />
      )}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;
        return (
          <BoxMui component="li" key={key} {...optionProps} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Typography variant="body1">
              {mode === "specification" ? option.naam : option.locatieNaam}
            </Typography>
            {mode === "specification" && (
              <Typography variant="caption" color="text.secondary">
                {option.beschrijving}
              </Typography>
            )}
          </BoxMui>
        );
      }}
    />
  );
}