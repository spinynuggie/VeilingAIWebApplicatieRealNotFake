"use client";

import React from "react";
import { TextField, Autocomplete, CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import { SearchResult } from "@/types/search";
import { useSearch } from "@/hooks/useSearch";
import { globalSearch } from "@/services/searchService";

interface SearchBarProps {
  mode: "redirect" | "callback";
  onSearch?: (term: string) => void;
  // Optioneel gemaakt om crashes in NavBar te voorkomen
  searchControl?: {
    options: SearchResult[];
    loading: boolean;
    inputValue: string;
    setInputValue: (val: string) => void;
  };
  sx?: any;
}

export default function SearchBar({ mode, onSearch, searchControl, sx }: SearchBarProps) {
  const router = useRouter();

  // Initialiseer een interne search voor als er geen searchControl wordt meegegeven (bijv. in de NavBar)
  const internalSearch = useSearch<SearchResult>(globalSearch);
  
  // Gebruik de externe control indien aanwezig, anders de interne fallback
  const { options, loading, setInputValue } = searchControl ?? internalSearch;

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
      sx={{ ...sx }}
      fullWidth
      freeSolo
      options={options || []}
      loading={loading}
      getOptionLabel={(option) => (typeof option === "string" ? option : option.naam)}
      filterOptions={(x) => x}
      onInputChange={(_, newValue) => setInputValue(newValue)}
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
      renderOption={(props, option) => {
        const { key, ...restProps } = props;
        return (
          <li key={key} {...restProps}>
            <div style={{ display: "flex", alignItems: "center", width: "100%", gap: "12px" }}>
              {option.image ? (
                <img src={option.image} alt="" style={{ width: 32, height: 32, borderRadius: 4, objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 32, height: 32, borderRadius: 4, backgroundColor: '#eee' }} />
              )}
              <span style={{ fontWeight: 500, fontSize: '14px' }}>{option.naam}</span>
              <div style={{ flexGrow: 1 }} />
              <span style={{ fontSize: "11px", color: "#999", textTransform: "uppercase" }}>
                {option.type}
              </span>
            </div>
          </li>
        );
      }}
    />
  );
}