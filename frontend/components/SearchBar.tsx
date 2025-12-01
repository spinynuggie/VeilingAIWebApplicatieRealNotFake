"use client";

import React, { useState, useEffect, useRef } from "react";
import { TextField, Autocomplete, CircularProgress, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useRouter } from "next/navigation";

interface SearchResult {
  id: number;
  naam: string;
  type: "Product" | "Veiling";
  image?: string;
}

const apiBase = process.env.NEXT_PUBLIC_BACKEND_LINK;

export default function SearchBar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Ref to keep track of the current request so we can cancel it
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // 1. If empty, clear and stop
    if (inputValue.length === 0) {
      setOptions([]);
      setLoading(false);
      return;
    }

    // 2. CANCEL previous request if it's still running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 3. Create new controller for this specific keystroke
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // 4. Short delay
    const timer = setTimeout(async () => {
      setLoading(true);

      try {
        const res = await fetch(`${apiBase}/api/Search?query=${encodeURIComponent(inputValue)}`, {
          signal: controller.signal, // <--- This connects the abort controller
        });

        if (!res.ok) throw new Error("Error");

        const data = await res.json();
        setOptions(data);
        setLoading(false);
      } catch (error: any) {
        // Only log error if it wasn't cancelled on purpose
        if (error.name !== "AbortError") {
          console.error("Search failed", error);
          setLoading(false);
        }
      }
    }, 150);

    return () => {
      clearTimeout(timer);
    };
  }, [inputValue]);

  const handleSelect = (event: any, value: SearchResult | null) => {
    if (!value) return;
    setInputValue(""); // Clear input
    setOptions([]); // Clear dropdown

    const path = value.type === "Product" ? `/product/${value.id}` : `/veiling/${value.id}`;
    router.push(path);
  };

  return (
    <Autocomplete
      id="server-search"
      sx={{ width: "40vw" }}
      open={open}
      onOpen={() => { if (inputValue.length > 0) setOpen(true); }}
      onClose={() => setOpen(false)}

      // Standard Server-Side setup
      getOptionLabel={(option) => option.naam}
      filterOptions={(x) => x} // Disable client filtering
      options={options}
      loading={loading}

      // Typing handler
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
        setOpen(newInputValue.length > 0);
      }}

      onChange={handleSelect}

      // Your existing styling...
      renderOption={(props, option) => {
        const { key, ...restProps } = props;
        return (
            <li key={key} {...restProps}>
            <div style={{ display: "flex", alignItems: 'center', gap: '10px', width: '100%' }}>
                {option.image && <img src={option.image} style={{width: 30, height: 30, borderRadius: 4}} />}
                <div>
                    <span style={{ fontWeight: "500", display: "block" }}>{option.naam}</span>
                    <span style={{ fontSize: "12px", color: "#888" }}>{option.type}</span>
                </div>
            </div>
            </li>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          size="small"
          placeholder="Zoeken..."
          InputProps={{
            ...params.InputProps,
            startAdornment: (
                <InputAdornment position="start"><SearchIcon sx={{ color: '#aaa' }} /></InputAdornment>
            ),
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
          sx={{ backgroundColor: "#f5f5f5", borderRadius: "50px", "& fieldset": { borderRadius: "50px" } }}
        />
      )}
    />
  );
}
