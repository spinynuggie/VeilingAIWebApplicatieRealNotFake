"use client";

import React from "react";
import { TextField, Autocomplete, CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import { useSearch } from "@/hooks/useSearch";
import { SearchResult } from "@/types/search";

interface SearchBarProps {
  mode: "redirect" | "callback";
  onSearch?: (term: string) => void; // Used for 'callback' mode
}

export default function SearchBar({ mode, onSearch }: SearchBarProps) {
  const router = useRouter();
  const { options, loading, inputValue, setInputValue } = useSearch();

  const handleChange = (event: any, value: SearchResult | string | null) => {
    if (!value) return;

    if (mode === "redirect" && typeof value !== "string") {
      const path = value.type === "Product" ? `/product/${value.id}` : `/veiling/${value.id}`;
      router.push(path);
    } else if (mode === "callback") {
      const term = typeof value === "string" ? value : value.naam;
      onSearch?.(term);
    }
  };

  return (
    <Autocomplete
    sx={{ width: "30vw" }}
      freeSolo // Allows typing without selecting an option
      options={options}
      loading={loading}
      getOptionLabel={(option) => (typeof option === "string" ? option : option.naam)}
      filterOptions={(x) => x} // Server-side does the filtering
      onInputChange={(e, newVale) => setInputValue(newVale)}
      onChange={handleChange}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="standard"
          placeholder="Zoeken..."
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      // Simple clean list rendering
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          {option.naam} ({option.type})
        </li>
      )}
    />
  );
}