"use client";

import { Box, TextField, InputAdornment} from "@mui/material"
import { Search as SearchIcon } from "@mui/icons-material";

interface SearchBarProps {
  onSearch: (term: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  return (
    <Box sx={{ mb: 2.5 }}> {/* 20px -> 2.5 in MUI spacing (2.5 * 8px) */}
    <TextField
      fullWidth
      placeholder="Zoeken..."
      variant="outlined"
      onChange={(e) => onSearch(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: 'custom.color2' }} />
          </InputAdornment>
        ),
      }}
      sx={{
        // This targets the background of the input field
        '& .MuiOutlinedInput-root': {
          backgroundColor: 'custom.color6', // Using your Ultra Light Mint
          borderRadius: '8px',
          '& fieldset': {
            borderColor: 'primary.main', // Using your Color2
          },
          '&:hover fieldset': {
            borderColor: 'custom.color1', // Deep Forest Green on hover
          },
        },
        '& .MuiInputBase-input': {
          fontSize: '14px',
          color: 'text.primary', // Your Color9 (Near Black)
        }
      }}
    />
  </Box>
  );
}
